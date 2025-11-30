import mongoose from 'mongoose';
import Car from '../models/Car.js';
import Category from '../models/Category.js';
import { computeSeasonalPrice } from '../utils/seasonPricing.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateCategoryExists = async (categoryId) => {
  if (!isValidObjectId(categoryId)) {
    throw new Error('Invalid category ID');
  }
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }
  return category;
};

const createCar = async (data) => {
  // Validate category exists
  await validateCategoryExists(data.category);

  // preserve original price then apply seasonal pricing
  if (data.prixParJour) data.originalPrixParJour = data.prixParJour;
  const car = new Car(data);

  // apply seasonal price before save
  try {
    if (car.originalPrixParJour) {
      car.prixParJour = computeSeasonalPrice(car.originalPrixParJour);
    }
  } catch (e) {
    // ignore and save provided price
  }

  await car.save();
  return car.populate('category');
};

const getCars = async (query = {}) => {
  // Pagination
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  // Filters
  const filters = { isDeleted: false };
  if (query.category) {
    if (!isValidObjectId(query.category)) {
      throw new Error('Invalid category ID');
    }
    filters.category = query.category;
  }
  if (query.marque) filters.marque = query.marque;
  if (query.disponibilite !== undefined) filters.disponibilite = query.disponibilite === 'true';
  if (query.search) {
    filters.$or = [
      { nom: new RegExp(query.search, 'i') },
      { modele: new RegExp(query.search, 'i') },
      { marque: new RegExp(query.search, 'i') },
      { matricule: new RegExp(query.search, 'i') },
    ];
  }

  const [total, items] = await Promise.all([
    Car.countDocuments(filters),
    Car.find(filters)
      .populate('category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  return {
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
    items,
  };
};

const searchCars = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filters = { isDeleted: false };
  if (query.category) {
    if (!isValidObjectId(query.category)) {
      throw new Error('Invalid category ID');
    }
    filters.category = query.category;
  }
  if (query.marque) filters.marque = query.marque;
  if (query.disponibilite !== undefined) filters.disponibilite = query.disponibilite === 'true';
  if (query.prixMax !== undefined) filters.prixParJour = { $lte: Number(query.prixMax) };

  const [total, items] = await Promise.all([
    Car.countDocuments(filters),
    Car.find(filters)
      .populate('category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  return { meta: { total, page, limit, pages: Math.ceil(total / limit) }, items };
};

const getCarById = async (id) => {
  if (!isValidObjectId(id)) return null;
  return Car.findOne({ _id: id, isDeleted: false }).populate('category');
};

const updateCar = async (id, payload) => {
  if (!isValidObjectId(id)) throw new Error('Invalid id');

  // Validate category if provided
  if (payload.category) {
    await validateCategoryExists(payload.category);
  }

  const car = await Car.findOne({ _id: id, isDeleted: false });
  if (!car) return null;

  // If prixParJour provided in payload, update originalPrixParJour if not set
  if (payload.prixParJour) {
    if (!car.originalPrixParJour) car.originalPrixParJour = car.prixParJour;
    // update originalPrixParJour to the new base price
    car.originalPrixParJour = payload.prixParJour;
  }

  Object.assign(car, payload);

  // after merging payload, reapply seasonal pricing from originalPrixParJour
  try {
    if (car.originalPrixParJour) {
      car.prixParJour = computeSeasonalPrice(car.originalPrixParJour);
    }
  } catch (e) {
    // ignore
  }

  await car.save();
  return car.populate('category');
};

const softDeleteCar = async (id) => {
  if (!isValidObjectId(id)) throw new Error('Invalid id');
  const car = await Car.findById(id);
  if (!car) return null;
  car.isDeleted = true;
  car.disponibilite = false;
  await car.save();
  return car;
};

const checkMaintenance = async () => {
  // Cars needing maintenance: dernierMaintenance older than 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const cars = await Car.find({ isDeleted: false });
  const toUpdate = [];
  const result = [];

  for (const c of cars) {
    const needs = c.dernierMaintenance < sixMonthsAgo;
    if (needs && !c.needsMaintenance) {
      c.needsMaintenance = true;
      toUpdate.push(c.save());
    }
    if (!needs && c.needsMaintenance) {
      c.needsMaintenance = false;
      toUpdate.push(c.save());
    }
    if (needs) result.push(c);
  }

  if (toUpdate.length) await Promise.all(toUpdate);
  return result;
};

const getMaintenanceDue = async () => {
  return Car.find({ isDeleted: false, needsMaintenance: true });
};

const checkAvailability = async ({ startDate, endDate, carIds = [] } = {}) => {
  // Try reservation microservice first
  const reservationUrl = process.env.RESERVATION_SERVICE_URL || process.env.RESERVATION_URL;
  try {
    if (reservationUrl) {
      const res = await fetch(`${reservationUrl}/api/reservations/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate, carIds }),
      });
      if (res.ok) {
        const json = await res.json();
        return { source: 'reservation-service', data: json };
      }
    }
  } catch (err) {
    // proceed to fallback
  }

  // Fallback: simple simulation — return all cars not soft-deleted and available
  const filters = { isDeleted: false, disponibilite: true };
  if (carIds && carIds.length) filters._id = { $in: carIds };
  const available = await Car.find(filters).select('_id nom matricule disponibilite prixParJour');
  return { source: 'fallback', data: available };
};

const applySeasonPricing = async () => {
  // July (6) and August (7) — JS months are 0-based
  const m = new Date().getMonth();
  const inSeason = m === 6 || m === 7;

  const cars = await Car.find({ isDeleted: false });
  const ops = [];

  for (const c of cars) {
    if (!c.originalPrixParJour) c.originalPrixParJour = c.prixParJour;
    if (inSeason) {
      const newPrice = Math.round((c.originalPrixParJour * 1.25) * 100) / 100;
      if (c.prixParJour !== newPrice) {
        c.prixParJour = newPrice;
        ops.push(c.save());
      }
    } else {
      // revert to original if it exists
      if (c.originalPrixParJour && c.prixParJour !== c.originalPrixParJour) {
        c.prixParJour = c.originalPrixParJour;
        ops.push(c.save());
      }
    }
  }

  if (ops.length) await Promise.all(ops);
  return { inSeason, updated: ops.length };
};

export default {
  createCar,
  getCars,
  searchCars,
  getCarById,
  updateCar,
  softDeleteCar,
  checkMaintenance,
  getMaintenanceDue,
  checkAvailability,
  applySeasonPricing,
};

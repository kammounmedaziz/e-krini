import mongoose from 'mongoose';
import carService from '../services/carService.js';
import { createCarSchema, updateCarSchema } from '../validation/carValidation.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createCar = async (req, res, next) => {
  try {
    const { error, value } = createCarSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    const car = await carService.createCar(value);
    return res.status(201).json({ success: true, message: 'Car created', data: car });
  } catch (err) {
    next(err);
  }
};

const getCars = async (req, res, next) => {
  try {
    const result = await carService.getCars(req.query);
    return res.json({ success: true, message: 'Cars fetched', data: result });
  } catch (err) {
    next(err);
  }
};

const getCarById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });
    const car = await carService.getCarById(id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    return res.json({ success: true, message: 'Car fetched', data: car });
  } catch (err) {
    next(err);
  }
};

const updateCar = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const { error, value } = updateCarSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    const car = await carService.updateCar(id, value);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    return res.json({ success: true, message: 'Car updated', data: car });
  } catch (err) {
    next(err);
  }
};

const deleteCar = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });
    const car = await carService.softDeleteCar(id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    return res.json({ success: true, message: 'Car soft-deleted', data: car });
  } catch (err) {
    next(err);
  }
};

const checkMaintenance = async (req, res, next) => {
  try {
    const list = await carService.checkMaintenance();
    return res.json({ success: true, message: 'Maintenance check complete', data: list });
  } catch (err) {
    next(err);
  }
};

const checkAvailability = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const result = await carService.checkAvailability(payload);
    return res.json({ success: true, message: 'Availability result', data: result });
  } catch (err) {
    next(err);
  }
};

const updateSeasonPricing = async (req, res, next) => {
  try {
    const result = await carService.applySeasonPricing();
    return res.json({ success: true, message: 'Season pricing updated', data: result });
  } catch (err) {
    next(err);
  }
};

const maintenanceDue = async (req, res, next) => {
  try {
    const list = await carService.getMaintenanceDue();
    return res.json({ success: true, message: 'Cars needing maintenance', data: list });
  } catch (err) {
    next(err);
  }
};

const searchCars = async (req, res, next) => {
  try {
    const result = await carService.searchCars(req.query || {});
    return res.json({ success: true, message: 'Search results', data: result });
  } catch (err) {
    next(err);
  }
};

export {
  createCar,
  getCars,
  getCarById,
  updateCar,
  deleteCar,
  checkMaintenance,
  checkAvailability,
  updateSeasonPricing,
  maintenanceDue,
  searchCars,
};

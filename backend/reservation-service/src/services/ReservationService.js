import Reservation from '../models/Reservation.js';
//import Promo from '../models/Promo.js';
import { v4 as uuidv4 } from 'uuid';

export class ReservationService {
  static async createReservation(data) {
    try {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (endDate <= startDate) {
        throw new Error('La date de fin doit être après la date de début');
      }

      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const dailyRate = data.dailyRate || 100;

      let insuranceAmount = 0;
      if (data.insuranceType === 'basic') {
        insuranceAmount = totalDays * 10;
      } else if (data.insuranceType === 'standard') {
        insuranceAmount = totalDays * 20;
      } else if (data.insuranceType === 'premium') {
        insuranceAmount = totalDays * 35;
      } else if (data.insuranceType === 'comprehensive') {
        insuranceAmount = totalDays * 50;
      }

      // Calcul du sous-total
      const subtotal = dailyRate * totalDays + insuranceAmount;
      const discountAmount = 0;

      // Logique promo commentée pour usage futur
      /*
      const promoCode = data.promoCode || null;
      if (promoCode) {
        const promo = await Promo.findOne({ 
          code: promoCode.toUpperCase(), 
          active: true 
        });
        
        if (promo) {
          if (promo.expiresAt && promo.expiresAt < new Date()) {
            // expired
          } else if (promo.maxUses && promo.uses >= promo.maxUses) {
            // exhausted
          } else {
            discountAmount = Math.round((subtotal * (promo.discountPercent / 100)) * 100) / 100;
            promo.uses += 1;
            await promo.save();
          }
        }
      }
      */

      const totalAmount = Math.max(0, subtotal - discountAmount);

      const reservation = new Reservation({
        reservationId: uuidv4(),
        clientId: data.clientId,
        carId: data.carId,
        carModel: data.carModel,
        carBrand: data.carBrand,
        startDate,
        endDate,
        insuranceType: data.insuranceType || 'standard',
        totalDays,
        dailyRate,
        insuranceAmount,
        totalAmount,
        // promoCode: promoCode, // À décommenter quand les promos seront activés
        discountAmount,
        depositAmount: data.depositAmount || totalAmount * 0.2,
        notes: data.notes || '',
      });

      const HOLD_HOURS = parseInt(process.env.RESERVATION_HOLD_HOURS || '24', 10);

      if (!data.depositPaid) {
        reservation.status = 'pending';
        reservation.holdExpiresAt = new Date(Date.now() + HOLD_HOURS * 3600 * 1000);
      } else {
        reservation.status = 'confirmed';
        reservation.depositPaid = true;
      }

      await reservation.save();
      return reservation;
    } catch (error) {
      throw new Error(`Erreur lors de la création de la réservation: ${error.message}`);
    }
  }

  static async getReservationById(reservationId) {
    try {
      const reservation = await Reservation.findOne({ reservationId }).populate('contractId');
      if (!reservation) {
        throw new Error('Réservation non trouvée');
      }
      return reservation;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de la réservation: ${error.message}`);
    }
  }

  static async getReservationsByClient(clientId) {
    try {
      const reservations = await Reservation.find({ clientId })
        .populate('contractId')
        .sort({ createdAt: -1 });
      return reservations;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des réservations: ${error.message}`);
    }
  }

  static async searchByCarModel(carModel) {
    try {
      const reservations = await Reservation.find({ carModel })
        .populate('contractId')
        .sort({ startDate: 1 });
      return reservations;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche par modèle: ${error.message}`);
    }
  }

  static async getReservationsByStatus(status) {
    try {
      const reservations = await Reservation.find({ status })
        .populate('contractId')
        .sort({ createdAt: -1 });
      return reservations;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des réservations par statut: ${error.message}`);
    }
  }

  static async updateReservation(reservationId, data) {
    try {
      const reservation = await Reservation.findOneAndUpdate(
        { reservationId },
        { ...data },
        { new: true }
      ).populate('contractId');

      if (!reservation) {
        throw new Error('Réservation non trouvée');
      }
      return reservation;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la réservation: ${error.message}`);
    }
  }

  static async cancelReservation(reservationId, reason) {
    try {
      const reservation = await Reservation.findOneAndUpdate(
        { reservationId },
        {
          status: 'cancelled',
          notes: `Annulée: ${reason}`,
        },
        { new: true }
      );

      if (!reservation) {
        throw new Error('Réservation non trouvée');
      }
      return reservation;
    } catch (error) {
      throw new Error(`Erreur lors de l'annulation de la réservation: ${error.message}`);
    }
  }

  static async confirmReservation(reservationId) {
    try {
      const reservation = await Reservation.findOneAndUpdate(
        { reservationId, status: 'pending' },
        {
          status: 'confirmed',
          depositPaid: true,
          holdExpiresAt: null,
        },
        { new: true }
      );

      if (!reservation) {
        throw new Error('Réservation non trouvée');
      }
      return reservation;
    } catch (error) {
      throw new Error(`Erreur lors de la confirmation de la réservation: ${error.message}`);
    }
  }

  static async releaseHold(reservationId, reason = 'Hold released') {
    try {
      const reservation = await Reservation.findOneAndUpdate(
        { reservationId, status: 'pending' },
        {
          status: 'cancelled',
          notes: `${reservationId} - ${reason}`
        },
        { new: true }
      );

      if (!reservation) {
        throw new Error('Hold non trouvé ou déjà traité');
      }
      return reservation;
    } catch (error) {
      throw new Error(`Erreur lors de la libération du hold: ${error.message}`);
    }
  }

  static async getReservationsByDateRange(startDate, endDate) {
    try {
      const reservations = await Reservation.find({
        $or: [
          {
            startDate: { $gte: startDate, $lte: endDate },
          },
          {
            endDate: { $gte: startDate, $lte: endDate },
          },
          {
            startDate: { $lte: startDate },
            endDate: { $gte: endDate },
          },
        ],
      })
        .populate('contractId')
        .sort({ startDate: 1 });

      return reservations;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des réservations: ${error.message}`);
    }
  }

  static async getReservationStats() {
    try {
      const stats = await Reservation.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
          },
        },
      ]);

      const insuranceStats = await Reservation.aggregate([
        {
          $group: {
            _id: '$insuranceType',
            count: { $sum: 1 },
          },
        },
      ]);

      return {
        byStatus: stats,
        byInsurance: insuranceStats,
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  static async checkCarAvailability(carId, startDate, endDate) {
    try {
      const conflictingReservations = await Reservation.countDocuments({
        carId,
        status: { $nin: ['cancelled'] },
        $or: [
          {
            startDate: { $lte: new Date(endDate) },
            endDate: { $gte: new Date(startDate) },
          },
        ],
      });

      return conflictingReservations === 0;
    } catch (error) {
      throw new Error(`Erreur lors de la vérification de la disponibilité: ${error.message}`);
    }
  }

  static async deleteReservation(reservationId) {
    try {
      const reservation = await Reservation.findOneAndDelete({ reservationId });
      return reservation; // Retourne null si non trouvé
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de la réservation: ${error.message}`);
    }
  }
}

export default ReservationService;
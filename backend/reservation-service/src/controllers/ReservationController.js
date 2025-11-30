import ReservationService from '../services/ReservationService.js';
import { validationResult } from 'express-validator';
import { sendReservationEmail } from '../services/emailService.js';

export class ReservationController {
  /**
   * Créer une nouvelle réservation
   * POST /api/reservations
   */
  static async createReservation(req, res) {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Erreurs de validation',
          errors: errors.array(),
        });
      }

      const reservation = await ReservationService.createReservation(req.body);

      // Envoi email au client
      if (req.body.email) {
        try {
          const subject = 'Confirmation de votre réservation';
          const text = `Bonjour,\n\nVotre réservation pour la voiture ${reservation.carBrand} ${reservation.carModel} du ${reservation.startDate.toLocaleDateString()} au ${reservation.endDate.toLocaleDateString()} a été créée avec succès.\n\nMerci.`;
          
          await sendReservationEmail(req.body.email, subject, text);
        } catch (emailError) {
          console.error('Erreur lors de l\'envoi de l\'email:', emailError.message);
          // On continue même si l'email échoue
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Réservation créée avec succès',
        data: reservation,
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de la réservation',
        error: error.message,
      });
    }
  }

  /**
   * Récupérer une réservation par ID
   * GET /api/reservations/:reservationId
   */
  static async getReservation(req, res) {
    try {
      const { reservationId } = req.params;

      const reservation = await ReservationService.getReservationById(reservationId);

      return res.status(200).json({
        success: true,
        data: reservation,
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
        error: error.message,
      });
    }
  }

  /**
   * Récupérer les réservations d'un client
   * GET /api/reservations/client/:clientId
   */
  static async getClientReservations(req, res) {
    try {
      const { clientId } = req.params;

      const reservations = await ReservationService.getReservationsByClient(clientId);

      return res.status(200).json({
        success: true,
        count: reservations.length,
        data: reservations,
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des réservations',
        error: error.message,
      });
    }
  }

  /**
   * Rechercher des réservations par modèle de voiture
   * GET /api/reservations/search/car-model
   */
  static async searchByCarModel(req, res) {
    try {
      const { carModel } = req.query;

      if (!carModel) {
        return res.status(400).json({
          success: false,
          message: 'Le modèle de voiture est requis',
        });
      }

      const reservations = await ReservationService.searchByCarModel(carModel);

      return res.status(200).json({
        success: true,
        count: reservations.length,
        data: reservations,
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche',
        error: error.message,
      });
    }
  }

  /**
   * Récupérer les réservations par statut
   * GET /api/reservations/status/:status
   */
  static async getByStatus(req, res) {
    try {
      const { status } = req.params;

      const validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Statut invalide. Valeurs acceptées: ${validStatuses.join(', ')}`,
        });
      }

      const reservations = await ReservationService.getReservationsByStatus(status);

      return res.status(200).json({
        success: true,
        count: reservations.length,
        data: reservations,
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des réservations',
        error: error.message,
      });
    }
  }

  /**
   * Mettre à jour une réservation
   * PUT /api/reservations/:reservationId
   */
  static async updateReservation(req, res) {
    try {
      const { reservationId } = req.params;
      const updates = req.body;

      const reservation = await ReservationService.updateReservation(reservationId, updates);

      return res.status(200).json({
        success: true,
        message: 'Réservation mise à jour avec succès',
        data: reservation,
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la réservation',
        error: error.message,
      });
    }
  }

  /**
   * Annuler une réservation
   * PUT /api/reservations/:reservationId/cancel
   */
  static async cancelReservation(req, res) {
    try {
      const { reservationId } = req.params;
      const { reason } = req.body;

      const reservation = await ReservationService.cancelReservation(reservationId, reason || 'Non spécifiée');

      return res.status(200).json({
        success: true,
        message: 'Réservation annulée avec succès',
        data: reservation,
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'annulation de la réservation',
        error: error.message,
      });
    }
  }

  /**
   * Libérer un hold (annulation automatique si non confirmée)
   * PUT /api/reservations/:reservationId/release-hold
   */
  static async releaseHold(req, res) {
    try {
      const { reservationId } = req.params;

      const reservation = await ReservationService.releaseHold(reservationId);

      return res.status(200).json({
        success: true,
        message: 'Hold libéré avec succès',
        data: reservation,
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la libération du hold',
        error: error.message,
      });
    }
  }

  /**
   * Confirmer une réservation (paiement)
   * PUT /api/reservations/:reservationId/confirm
   */
  static async confirmReservation(req, res) {
    try {
      const { reservationId } = req.params;

      const reservation = await ReservationService.confirmReservation(reservationId);

      return res.status(200).json({
        success: true,
        message: 'Réservation confirmée avec succès',
        data: reservation,
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la confirmation de la réservation',
        error: error.message,
      });
    }
  }

  /**
   * Récupérer les réservations pour une période
   * GET /api/reservations/period?startDate=&endDate=
   */
  static async getReservationsByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Les dates de début et de fin sont requises',
        });
      }

      const reservations = await ReservationService.getReservationsByDateRange(
        new Date(startDate),
        new Date(endDate)
      );

      return res.status(200).json({
        success: true,
        count: reservations.length,
        data: reservations,
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des réservations',
        error: error.message,
      });
    }
  }
/**
 * Supprimer une réservation
 * DELETE /api/reservations/:reservationId
 */
static async deleteReservation(req, res) {
  try {
    const { reservationId } = req.params;
    const reservation = await ReservationService.deleteReservation(reservationId);

    return res.status(200).json({
      success: true,
      message: 'Réservation supprimée avec succès',
      data: reservation,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

  /**
   * Obtenir les statistiques
   * GET /api/reservations/stats/overview
   */
  static async getStats(req, res) {
    try {
      const stats = await ReservationService.getReservationStats();

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: error.message,
      });
    }
  }

  /**
   * Vérifier la disponibilité d'une voiture
   * GET /api/reservations/availability/check
   */
  static async checkAvailability(req, res) {
    try {
      const { carId, startDate, endDate } = req.query;

      if (!carId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Les paramètres carId, startDate et endDate sont requis',
        });
      }

      const isAvailable = await ReservationService.checkCarAvailability(
        carId,
        new Date(startDate),
        new Date(endDate)
      );

      return res.status(200).json({
        success: true,
        available: isAvailable,
        carId,
        startDate,
        endDate,
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification de la disponibilité',
        error: error.message,
      });
    }
  }
}

export default ReservationController;
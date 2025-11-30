import express from 'express';
import { body, query } from 'express-validator';
import ReservationController from '../controllers/ReservationController.js';
import { sendMail } from '../utils/mailer.js';

const router = express.Router();

/**
 * POST /api/reservations
 * Créer une nouvelle réservation
 */
router.post(
  '/',
  [
    body('clientId').notEmpty().withMessage('clientId est requis'),
    body('carId').notEmpty().withMessage('carId est requis'),
    body('carModel').notEmpty().withMessage('carModel est requis'),
    body('carBrand').notEmpty().withMessage('carBrand est requis'),
    body('startDate').isISO8601().withMessage('startDate doit être une date valide'),
    body('endDate').isISO8601().withMessage('endDate doit être une date valide'),
    body('insuranceType')
      .isIn(['basic', 'standard', 'premium', 'comprehensive'])
      .withMessage('insuranceType invalide'),
    body('dailyRate').isNumeric().withMessage('dailyRate doit être un nombre'),
  ],
  ReservationController.createReservation
);
router.post('/send-email', async (req, res) => {
  const { to, subject, text, html } = req.body;

  if (!to || !subject) {
    return res.status(400).json({ success: false, message: 'to et subject sont requis' });
  }

  try {
    const info = await sendMail({ to, subject, text, html });
    res.json({
      success: true,
      message: 'Email envoyé',
      accepted: info.accepted || [],
      rejected: info.rejected || [],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/reservations/:reservationId
 * Récupérer une réservation
 */
router.get('/:reservationId', ReservationController.getReservation);

/**
 * GET /api/reservations/client/:clientId
 * Récupérer les réservations d'un client
 */
router.get('/client/:clientId', ReservationController.getClientReservations);

/**
 * GET /api/reservations/search/by-car-model
 * Rechercher par modèle de voiture
 */
router.get(
  '/search/by-car-model',
  [query('carModel').notEmpty().withMessage('carModel est requis')],
  ReservationController.searchByCarModel
);

/**
 * GET /api/reservations/by-status/:status
 * Récupérer par statut
 */
router.get('/by-status/:status', ReservationController.getByStatus);

/**
 * GET /api/reservations/period
 * Récupérer par période
 */
router.get(
  '/period',
  [
    query('startDate').isISO8601().withMessage('startDate doit être une date valide'),
    query('endDate').isISO8601().withMessage('endDate doit être une date valide'),
  ],
  ReservationController.getReservationsByDateRange
);

/**
 * GET /api/reservations/stats/overview
 * Obtenir les statistiques
 */
router.get('/stats/overview', ReservationController.getStats);

/**
 * GET /api/reservations/availability/check
 * Vérifier la disponibilité
 */
router.get(
  '/availability/check',
  [
    query('carId').notEmpty().withMessage('carId est requis'),
    query('startDate').isISO8601().withMessage('startDate doit être une date valide'),
    query('endDate').isISO8601().withMessage('endDate doit être une date valide'),
  ],
  ReservationController.checkAvailability
);

/**
 * PUT /api/reservations/:reservationId
 * Mettre à jour une réservation
 */
router.put('/:reservationId', ReservationController.updateReservation);

/**
 * PUT /api/reservations/:reservationId/cancel
 * Annuler une réservation
 */
router.put('/:reservationId/cancel', ReservationController.cancelReservation);

/**
 * PUT /api/reservations/:reservationId/confirm
 * Confirmer une réservation
 */
router.put('/:reservationId/confirm', ReservationController.confirmReservation);

/**++
 * PUT /api/reservations/:reservationId/release-hold
 * Libérer un hold (annulation si non confirmé)
 */
router.put('/:reservationId/release-hold', ReservationController.releaseHold);
router.delete('/:reservationId', ReservationController.deleteReservation);

export default router;

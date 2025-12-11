import express from 'express';
import { body, query } from 'express-validator';
import ReservationController from '../controllers/ReservationController.js';
import { sendMail } from '../utils/mailer.js';
import { authMiddleware, authorize } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * POST /api/reservations
 * Créer une nouvelle réservation (requires authentication)
 */
router.post(
  '/',
  authMiddleware,
  [
    body('clientId').notEmpty().withMessage('clientId est requis'),
    body('carId').notEmpty().withMessage('carId est requis'),
    body('carModel').optional(),
    body('carBrand').optional(),
    body('startDate').isISO8601().withMessage('startDate doit être une date valide'),
    body('endDate').isISO8601().withMessage('endDate doit être une date valide'),
    body('insuranceType')
      .isIn(['basic', 'standard', 'premium', 'comprehensive'])
      .withMessage('insuranceType invalide'),
    body('dailyRate').optional().isNumeric().withMessage('dailyRate doit être un nombre'),
    body('promoCode').optional(),
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
 * GET /api/reservations
 * Get all reservations (admin/agency only)
 */
router.get(
  '/',
  authMiddleware,
  authorize('admin', 'agency'),
  ReservationController.getAllReservations
);

/**
 * GET /api/reservations/:reservationId
 * Récupérer une réservation (requires authentication)
 */
router.get('/:reservationId', authMiddleware, ReservationController.getReservation);

/**
 * GET /api/reservations/client/:clientId
 * Récupérer les réservations d'un client (requires authentication)
 */
router.get('/client/:clientId', authMiddleware, ReservationController.getClientReservations);

/**
 * GET /api/reservations/search/by-car-model
 * Rechercher par modèle de voiture (admin/agency only)
 */
router.get(
  '/search/by-car-model',
  authMiddleware,
  authorize('admin', 'agency'),
  [query('carModel').notEmpty().withMessage('carModel est requis')],
  ReservationController.searchByCarModel
);

/**
 * GET /api/reservations/by-status/:status
 * Récupérer par statut (admin/agency only)
 */
router.get('/by-status/:status', authMiddleware, authorize('admin', 'agency'), ReservationController.getByStatus);

/**
 * GET /api/reservations/period
 * Récupérer par période (admin/agency only)
 */
router.get(
  '/period',
  authMiddleware,
  authorize('admin', 'agency'),
  [
    query('startDate').isISO8601().withMessage('startDate doit être une date valide'),
    query('endDate').isISO8601().withMessage('endDate doit être une date valide'),
  ],
  ReservationController.getReservationsByDateRange
);

/**
 * GET /api/reservations/stats/overview
 * Obtenir les statistiques (admin only)
 */
router.get('/stats/overview', authMiddleware, authorize('admin'), ReservationController.getStats);

/**
 * GET /api/reservations/availability/check
 * Vérifier la disponibilité (public access)
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
 * Mettre à jour une réservation (requires authentication)
 */
router.put('/:reservationId', authMiddleware, ReservationController.updateReservation);

/**
 * PUT /api/reservations/:reservationId/cancel
 * Annuler une réservation (requires authentication)
 */
router.put('/:reservationId/cancel', authMiddleware, ReservationController.cancelReservation);

/**
 * PUT /api/reservations/:reservationId/confirm
 * Confirmer une réservation (admin/agency only)
 */
router.put('/:reservationId/confirm', authMiddleware, authorize('admin', 'agency'), ReservationController.confirmReservation);

/**
 * PUT /api/reservations/:reservationId/release-hold
 * Libérer un hold (admin/agency only)
 */
router.put('/:reservationId/release-hold', authMiddleware, authorize('admin', 'agency'), ReservationController.releaseHold);

/**
 * DELETE /api/reservations/:reservationId
 * Supprimer une réservation (admin only)
 */
router.delete('/:reservationId', authMiddleware, authorize('admin'), ReservationController.deleteReservation);

export default router;

import express from 'express';
import { body } from 'express-validator';
import ContractController from '../controllers/ContractController.js';
import { authMiddleware, authorize } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * GET /api/contracts
 * Get all contracts (admin/agency only)
 */
router.get(
  '/',
  authMiddleware,
  authorize('admin', 'agency'),
  ContractController.getAllContracts
);

/**
 * POST /api/contracts
 * Créer un contrat pour une réservation
 */
router.post(
  '/',
  [body('reservationId').notEmpty().withMessage('reservationId est requis')],
  ContractController.createContract
);

/**
 * GET /api/contracts/stats/overview
 * Obtenir les statistiques (must be before /:contractId)
 */
router.get('/stats/overview', ContractController.getContractStats);

/**
 * GET /api/contracts/by-status/:status
 * Récupérer par statut (must be before /:contractId)
 */
router.get('/by-status/:status', ContractController.getContractsByStatus);

/**
 * GET /api/contracts/client/:clientId
 * Récupérer les contrats d'un client (must be before /:contractId)
 */
router.get('/client/:clientId', ContractController.getClientContracts);

/**
 * GET /api/contracts/:contractId
 * Récupérer un contrat
 */
router.get('/:contractId', ContractController.getContract);

/**
 * POST /api/contracts/:contractId/generate-pdf
 * Générer le PDF du contrat
 */
router.post('/:contractId/generate-pdf', ContractController.generateContractPDF);

/**
 * POST /api/contracts/:contractId/sign
 * Signer le contrat (e-signature)
 */
router.post('/:contractId/sign', ContractController.signContract);

/**
 * GET /api/contracts/:contractId/download-pdf
 * Télécharger le PDF du contrat
 */
router.get('/:contractId/download-pdf', ContractController.downloadContractPDF);

/**
 * PUT /api/contracts/:contractId/status
 * Mettre à jour le statut du contrat
 */
router.put(
  '/:contractId/status',
  [
    body('status')
      .isIn(['draft', 'signed', 'active', 'completed', 'terminated'])
      .withMessage('Status invalide'),
  ],
  ContractController.updateContractStatus
);

/**
 * PUT /api/contracts/:contractId/rules
 * Mettre à jour les règles du contrat
 */
router.put(
  '/:contractId/rules',
  [body('rules').isArray().withMessage('Les règles doivent être un tableau')],
  ContractController.updateContractRules
);

export default router;

import express from 'express';
import { body } from 'express-validator';
import ContractController from '../controllers/ContractController.js';
const router = express.Router();
router.delete('/:contractId', ContractController.deleteContract);



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
 * GET /api/contracts/:contractId
 * Récupérer un contrat
 */
router.get('/:contractId', ContractController.getContract);

/**
 * GET /api/contracts/client/:clientId
 * Récupérer les contrats d'un client
 */
router.get('/client/:clientId', ContractController.getClientContracts);

/**
 * GET /api/contracts/by-status/:status
 * Récupérer par statut
 */
router.get('/by-status/:status', ContractController.getContractsByStatus);

/**
 * GET /api/contracts/stats/overview
 * Obtenir les statistiques
 */
router.get('/stats/overview', ContractController.getContractStats);

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

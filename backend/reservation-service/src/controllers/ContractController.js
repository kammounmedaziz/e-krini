import Contract from '../models/Contract.js';
import Reservation from '../models/Reservation.js';
import ContractService from '../services/ContractService.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ContractController {
  /**
   * Créer un contrat pour une réservation
   * POST /api/contracts
   */
  static async createContract(req, res) {
    try {
      const { reservationId } = req.body;

      // Récupérer la réservation
      const reservation = await Reservation.findOne({ reservationId });
      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Réservation non trouvée',
        });
      }

      // Vérifier qu'un contrat n'existe pas déjà
      const existingContract = await Contract.findOne({ reservationId: reservation._id });
      if (existingContract) {
        return res.status(400).json({
          success: false,
          message: 'Un contrat existe déjà pour cette réservation',
        });
      }

      // Générer les règles et conditions
      const rules = ContractService.generateStandardRules(reservation.insuranceType);
      const terms = ContractService.generateTerms(reservation);

      // Créer le contrat
      const contract = new Contract({
        contractId: uuidv4(),
        reservationId: reservation._id,
        clientId: reservation.clientId,
        carId: reservation.carId,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        insuranceType: reservation.insuranceType,
        terms,
        rules,
        status: 'draft',
      });

      await contract.save();

      // Mettre à jour la réservation avec la référence du contrat
      reservation.contractId = contract._id;
      await reservation.save();

      return res.status(201).json({
        success: true,
        message: 'Contrat créé avec succès',
        data: contract,
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du contrat',
        error: error.message,
      });
    }
  }

  /**
   * Récupérer un contrat par ID
   * GET /api/contracts/:contractId
   */
  static async getContract(req, res) {
    try {
      const { contractId } = req.params;

      const contract = await Contract.findOne({ contractId }).populate('reservationId');
      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Contrat non trouvé',
        });
      }

      return res.status(200).json({
        success: true,
        data: contract,
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du contrat',
        error: error.message,
      });
    }
  }

  /**
   * Récupérer les contrats d'un client
   * GET /api/contracts/client/:clientId
   */
  static async getClientContracts(req, res) {
    try {
      const { clientId } = req.params;

      const contracts = await Contract.find({ clientId })
        .populate('reservationId')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: contracts.length,
        data: contracts,
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des contrats',
        error: error.message,
      });
    }
  }

  /**
   * Générer un PDF du contrat
   * POST /api/contracts/:contractId/generate-pdf
   */
  static async generateContractPDF(req, res) {
    try {
      const { contractId } = req.params;

      // Récupérer le contrat
      const contract = await Contract.findOne({ contractId }).populate('reservationId');
      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Contrat non trouvé',
        });
      }

      const reservation = contract.reservationId;

      // Récupérer les informations du client (depuis le service d'authentification)
      let client = {
        firstName: 'Client',
        lastName: 'E-krini',
        email: 'client@example.com',
        phone: 'N/A',
      };

      try {
        // Essayer de récupérer les données du client depuis le service d'auth
        const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
        const response = await axios.get(`${authServiceUrl}/api/users/${contract.clientId}`);
        if (response.data.success) {
          client = response.data.data;
        }
      } catch (err) {
        console.warn('Impossible de récupérer les données du client:', err.message);
      }

      // Générer le PDF
      const pdfInfo = await ContractService.generateContractPDF(contract, reservation, client);

      // Mettre à jour le contrat avec l'URL du PDF
      contract.pdfUrl = pdfInfo.url;
      contract.pdfFileName = pdfInfo.fileName;
      contract.status = 'signed';
      contract.signedAt = new Date();
      await contract.save();

      return res.status(200).json({
        success: true,
        message: 'PDF généré avec succès',
        data: {
          contractId: contract.contractId,
          pdfUrl: pdfInfo.url,
          pdfFileName: pdfInfo.fileName,
        },
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération du PDF',
        error: error.message,
      });
    }
  }

  /**
   * Télécharger le PDF du contrat
   * GET /api/contracts/:contractId/download-pdf
   */
  static async downloadContractPDF(req, res) {
    try {
      const { contractId } = req.params;

      const contract = await Contract.findOne({ contractId });
      if (!contract || !contract.pdfFileName) {
        return res.status(404).json({
          success: false,
          message: 'PDF non trouvé',
        });
      }

      const filePath = path.join(__dirname, '../../../uploads/contracts', contract.pdfFileName);

      res.download(filePath, contract.pdfFileName, (err) => {
        if (err) {
          console.error('Erreur lors du téléchargement:', err);
        }
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du téléchargement',
        error: error.message,
      });
    }
  }

  /**
   * Mettre à jour le statut du contrat
   * PUT /api/contracts/:contractId/status
   */
  static async updateContractStatus(req, res) {
    try {
      const { contractId } = req.params;
      const { status } = req.body;

      const validStatuses = ['draft', 'signed', 'active', 'completed', 'terminated'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Statut invalide. Valeurs acceptées: ${validStatuses.join(', ')}`,
        });
      }

      const contract = await Contract.findOneAndUpdate(
        { contractId },
        { status, signedAt: status === 'signed' ? new Date() : undefined },
        { new: true }
      ).populate('reservationId');

      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Contrat non trouvé',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Statut du contrat mis à jour',
        data: contract,
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du contrat',
        error: error.message,
      });
    }
  }

  /**
   * Ajouter les règles personnalisées au contrat
   * PUT /api/contracts/:contractId/rules
   */
  static async updateContractRules(req, res) {
    try {
      const { contractId } = req.params;
      const { rules } = req.body;

      if (!Array.isArray(rules)) {
        return res.status(400).json({
          success: false,
          message: 'Les règles doivent être un tableau',
        });
      }

      const contract = await Contract.findOneAndUpdate(
        { contractId },
        { rules },
        { new: true }
      ).populate('reservationId');

      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Contrat non trouvé',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Règles du contrat mises à jour',
        data: contract,
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour des règles',
        error: error.message,
      });
    }
  }

  /**
   * Signer un contrat (e-signature)
   * POST /api/contracts/:contractId/sign
   * body: { signer: 'client'|'agency', signature: '<base64 string>' }
   */
  static async signContract(req, res) {
    try {
      const { contractId } = req.params;
      const { signer, signature } = req.body;

      if (!signature || !signer) {
        return res.status(400).json({ 
          success: false, 
          message: 'signer and signature are required' 
        });
      }

      const contract = await Contract.findOne({ contractId }).populate('reservationId');
      if (!contract) {
        return res.status(404).json({ 
          success: false, 
          message: 'Contrat non trouvé' 
        });
      }

      // Validate contract business rules before signing
      try {
        ContractService.validateBeforeSign(contract);
      } catch (err) {
        return res.status(400).json({ 
          success: false, 
          message: `Contract validation failed: ${err.message}` 
        });
      }

      // Create a version snapshot
      ContractService.createVersionSnapshot(contract, `Signed by ${signer}`);

      const buf = Buffer.from(signature, 'base64');
      const now = new Date();

      if (signer === 'client') {
        contract.clientSignature = { data: buf, timestamp: now };
      } else if (signer === 'agency') {
        contract.agencySignature = { data: buf, timestamp: now };
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'signer must be client or agency' 
        });
      }

      contract.status = 'signed';
      contract.signedAt = now;
      await contract.save();

      return res.status(200).json({ 
        success: true, 
        message: 'Contrat signé avec succès', 
        data: { contractId: contract.contractId } 
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la signature du contrat', 
        error: error.message 
      });
    }
  }

  /**
   * Récupérer les contrats par statut
   * GET /api/contracts/status/:status
   */
  static async getContractsByStatus(req, res) {
    try {
      const { status } = req.params;

      const validStatuses = ['draft', 'signed', 'active', 'completed', 'terminated'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Statut invalide. Valeurs acceptées: ${validStatuses.join(', ')}`,
        });
      }

      const contracts = await Contract.find({ status })
        .populate('reservationId')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: contracts.length,
        data: contracts,
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des contrats',
        error: error.message,
      });
    }
  }

  /**
   * Obtenir les statistiques des contrats
   * GET /api/contracts/stats/overview
   */
  static async getContractStats(req, res) {
    try {
      const stats = await Contract.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

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
   * Supprimer un contrat
   * DELETE /api/contracts/:contractId
   */
  static async deleteContract(req, res) {
    try {
      const { contractId } = req.params;

      const deletedContract = await Contract.findOneAndDelete({ contractId });

      if (!deletedContract) {
        return res.status(404).json({
          success: false,
          message: "Contrat introuvable"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Contrat supprimé avec succès",
        data: deletedContract
      });

    } catch (error) {
      console.error('Erreur:', error.message);
      return res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la suppression",
        error: error.message
      });
    }
  }
}

export default ContractController;
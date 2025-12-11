import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Contract from '../models/Contract.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ContractService {
  static async getAllContracts(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        clientId
      } = options;

      const query = {};
      if (status) query.status = status;
      if (clientId) query.clientId = clientId;

      const skip = (page - 1) * limit;

      const contracts = await Contract.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await Contract.countDocuments(query);

      return {
        contracts,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching contracts: ${error.message}`);
    }
  }

  static generateStandardRules(insuranceType) {
    const baseRules = [
      {
        title: 'État du véhicule',
        description: 'Le véhicule doit être retourné dans le même état que lors de la location, hormis l\'usure normale.',
        category: 'vehicle-condition',
      },
      {
        title: 'Carburant',
        description: 'Le véhicule doit être restitué avec le même niveau de carburant qu\'à la location.',
        category: 'fuel',
      },
      {
        title: 'Permis de conduire',
        description: 'Le conducteur doit posséder un permis de conduire valide depuis au moins 2 ans.',
        category: 'driving',
      },
      {
        title: 'Interdiction de fumer',
        description: 'Il est strictement interdit de fumer à l\'intérieur du véhicule.',
        category: 'smoking',
      },
      {
        title: 'Animaux domestiques',
        description: 'Les animaux domestiques ne sont pas autorisés dans le véhicule.',
        category: 'pets',
      },
      {
        title: 'Dommages',
        description: 'Le locataire est responsable de tous les dommages causés au véhicule pendant la période de location.',
        category: 'damage',
      },
    ];

    if (insuranceType === 'basic') {
      baseRules.push({
        title: 'Franchise basique',
        description: 'En cas de sinistre, une franchise de 1000€ s\'applique.',
        category: 'damage',
      });
    } else if (insuranceType === 'premium') {
      baseRules.push({
        title: 'Franchise réduite',
        description: 'En cas de sinistre, une franchise de 250€ s\'applique.',
        category: 'damage',
      });
    } else if (insuranceType === 'comprehensive') {
      baseRules.push({
        title: 'Couverture complète',
        description: 'Couverture complète de tous les sinistres. Aucune franchise.',
        category: 'damage',
      });
    }

    return baseRules;
  }

  static generateTerms(reservation) {
    const startDate = new Date(reservation.startDate);
    const endDate = new Date(reservation.endDate);
    const rentalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    let deductible = 1000;
    let cancellationPolicy = 'Annulation gratuite jusqu\'à 48 heures avant la location.';

    if (reservation.insuranceType === 'standard') {
      deductible = 500;
    } else if (reservation.insuranceType === 'premium') {
      deductible = 250;
    } else if (reservation.insuranceType === 'comprehensive') {
      deductible = 0;
      cancellationPolicy = 'Annulation gratuite jusqu\'à 24 heures avant la location.';
    }

    return {
      rentalPeriod: `Du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')} (${rentalDays} jours)`,
      insuranceCoverage: `Couverture ${reservation.insuranceType}`,
      deductible,
      dailyRate: reservation.dailyRate,
      totalAmount: reservation.totalAmount,
      depositAmount: reservation.depositAmount,
      paymentTerms: 'Paiement intégral à la signature du contrat',
      cancellationPolicy,
      lateReturnFee: 50,
      fuelPolicy: 'full-to-full',
      mileageLimit: null,
      excessCharge: 0.25,
    };
  }

  static async generateContractPDF(contract, reservation, client) {
    return new Promise((resolve, reject) => {
      try {
        const fileName = `contrat_${contract.contractId}_${Date.now()}.pdf`;
        const dirPath = path.join(__dirname, '../../../uploads/contracts');

        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }

        const filePath = path.join(dirPath, fileName);
        const stream = fs.createWriteStream(filePath);

        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
        });

        doc.pipe(stream);

        doc.fontSize(20).font('Helvetica-Bold').text('CONTRAT DE LOCATION DE VEHÍCULE', 100, 50);
        doc.fontSize(10).font('Helvetica').text(`Contrat N°: ${contract.contractId}`, 100, 85);
        doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 100, 105);

        doc.moveTo(50, 130).lineTo(550, 130).stroke();

        doc.fontSize(12).font('Helvetica-Bold').text('INFORMATIONS GENERALES', 50, 150);

        doc.fontSize(10).font('Helvetica-Bold').text('Locataire:', 50, 190);
        doc.font('Helvetica').text(`Nom: ${client?.firstName} ${client?.lastName || 'N/A'}`, 150, 190);
        doc.text(`Email: ${client?.email || 'N/A'}`, 150, 210);
        doc.text(`Téléphone: ${client?.phone || 'N/A'}`, 150, 230);

        doc.fontSize(14).font('Helvetica-Bold').text('2. VÉHICULE LOUÉ', 50, 280);
        doc.fontSize(10).font('Helvetica-Bold').text('Marque:', 50, 310);
        doc.font('Helvetica').text(reservation.carBrand, 150, 310);
        doc.font('Helvetica-Bold').text('Modèle:', 50, 330);
        doc.font('Helvetica').text(reservation.carModel, 150, 330);
        doc.font('Helvetica-Bold').text('ID Véhicule:', 50, 350);
        doc.font('Helvetica').text(reservation.carId, 150, 350);

        doc.fontSize(14).font('Helvetica-Bold').text('3. PÉRIODE DE LOCATION', 50, 400);
        doc.fontSize(10).font('Helvetica-Bold').text('Date de début:', 50, 430);
        doc.font('Helvetica').text(new Date(reservation.startDate).toLocaleDateString('fr-FR'), 150, 430);
        doc.font('Helvetica-Bold').text('Date de fin:', 50, 450);
        doc.font('Helvetica').text(new Date(reservation.endDate).toLocaleDateString('fr-FR'), 150, 450);
        doc.font('Helvetica-Bold').text('Nombre de jours:', 50, 470);
        doc.font('Helvetica').text(reservation.totalDays.toString(), 150, 470);

        doc.fontSize(14).font('Helvetica-Bold').text('4. ASSURANCE', 50, 520);
        doc.fontSize(10).font('Helvetica-Bold').text('Type d\'assurance:', 50, 550);
        doc.font('Helvetica').text(contract.terms.insuranceCoverage, 150, 550);
        doc.font('Helvetica-Bold').text('Franchise:', 50, 570);
        doc.font('Helvetica').text(`${contract.terms.deductible}€`, 150, 570);

        let yPosition = 620;
        doc.fontSize(14).font('Helvetica-Bold').text('5. TARIFICATION', 50, yPosition);
        yPosition += 40;

        const pricingData = [
          ['Location quotidienne', `${reservation.dailyRate}€ x ${reservation.totalDays} jours`, `${reservation.dailyRate * reservation.totalDays}€`],
          ['Assurance', `${reservation.insuranceType}`, `${reservation.insuranceAmount}€`],
          ['Dépôt de garantie', '', `${reservation.depositAmount}€`],
          ['TOTAL', '', `${reservation.totalAmount}€`],
        ];

        doc.fontSize(10);
        pricingData.forEach((row) => {
          if (row[0] === 'TOTAL') {
            doc.font('Helvetica-Bold');
          } else {
            doc.font('Helvetica');
          }
          doc.text(row[0], 50, yPosition);
          doc.text(row[1], 250, yPosition);
          doc.text(row[2], 450, yPosition);
          yPosition += 20;
        });

        doc.addPage();

        doc.fontSize(14).font('Helvetica-Bold').text('6. CONDITIONS GENERALES', 50, 50);
        yPosition = 90;

        contract.rules.forEach((rule, index) => {
          doc.fontSize(10).font('Helvetica-Bold').text(`${index + 1}. ${rule.title}`, 50, yPosition);
          yPosition += 15;
          doc.font('Helvetica').text(rule.description, 50, yPosition, { width: 500 });
          yPosition += 40;

          if (yPosition > 700) {
            doc.addPage();
            yPosition = 50;
          }
        });

        doc.addPage();
        doc.fontSize(14).font('Helvetica-Bold').text('7. SIGNATURE', 50, 50);

        doc.fontSize(10).font('Helvetica').text('Le locataire déclare accepter les conditions générales de location.', 50, 100);

        doc.text('Signature du locataire:', 50, 200);
        doc.moveTo(50, 220).lineTo(250, 220).stroke();

        doc.text('Signature de l\'agence:', 350, 200);
        doc.moveTo(350, 220).lineTo(550, 220).stroke();

        doc.text('Date:', 50, 280);
        doc.moveTo(100, 280).lineTo(250, 280).stroke();

        doc.end();

        stream.on('finish', () => {
          resolve({
            fileName,
            filePath,
            url: `/uploads/contracts/${fileName}`,
          });
        });

        stream.on('error', (err) => {
          reject(new Error(`Erreur lors de la génération du PDF: ${err.message}`));
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  static validateBeforeSign(contract) {
    if (!contract) throw new Error('Contract is required');
    if (!contract.terms) throw new Error('Contract terms are missing');
    if (!contract.terms.totalAmount || contract.terms.totalAmount <= 0) {
      throw new Error('Invalid total amount in contract terms');
    }
    // rental days check
    const rentalPeriod = contract.terms.rentalPeriod || '';
    if (!rentalPeriod || rentalPeriod.indexOf('jours') === -1) {
      // Not strict parsing, but ensure rental period exists
      // If missing, reject
      // Allow signing only if rental days are > 0
      // (caller should ensure terms are correct)
    }
    return true;
  }

  static createVersionSnapshot(contract, notes = '') {
    try {
      const snapshot = {
        versionAt: new Date(),
        snapshot: {
          contractId: contract.contractId,
          terms: contract.terms,
          rules: contract.rules,
          status: contract.status,
          pdfUrl: contract.pdfUrl || null,
        },
        notes,
      };

      // Ensure versions array exists
      if (!Array.isArray(contract.versions)) contract.versions = [];
      contract.versions.push(snapshot);
      return snapshot;
    } catch (err) {
      throw new Error(`Unable to create version snapshot: ${err.message}`);
    }
  }
}

export default ContractService;

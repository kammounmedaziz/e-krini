import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import ContractService from '../src/services/ContractService.js';
import fs from 'fs';

async function main() {
  const reservation = {
    reservationId: 'R-TEST-001',
    clientId: 'CLI-TEST',
    carId: 'CAR-TEST-001',
    carModel: 'TestModel',
    carBrand: 'TestBrand',
    startDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    endDate: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    insuranceType: 'standard',
    totalDays: 3,
    dailyRate: 50,
    insuranceAmount: 60,
    depositAmount: 100,
    totalAmount: 210,
  };

  const contract = {
    contractId: 'C-TEST-001',
    terms: ContractService.generateTerms(reservation),
    rules: ContractService.generateStandardRules(reservation.insuranceType),
    status: 'draft',
  };

  const client = {
    firstName: 'Test',
    lastName: 'Client',
    email: 'test@example.com',
    phone: '+33000000000',
  };

  try {
    const result = await ContractService.generateContractPDF(contract, reservation, client);
    console.log('PDF généré:', result);
    if (result && result.filePath) {
      const exists = fs.existsSync(result.filePath);
      console.log('Fichier existe:', exists, '->', result.filePath);
    }
  } catch (err) {
    console.error('Erreur génération PDF:', err);
    process.exitCode = 2;
  }
}

await main();

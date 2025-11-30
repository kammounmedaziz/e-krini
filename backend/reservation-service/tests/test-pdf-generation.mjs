import ContractService from '../src/services/ContractService.js';

async function main() {
  const mockReservation = {
    reservationId: 'RES123456',
    carBrand: 'Honda',
    carModel: 'Civic',
    startDate: new Date('2025-12-01'),
    endDate: new Date('2025-12-04'),
    totalDays: 3,
    dailyRate: 50,
    insuranceAmount: 60,
    totalAmount: 210,
    insuranceType: 'standard',
    depositAmount: 42,
  };

  const mockContract = {
    contractId: 'CTR789',
    clientId: 'CLI001',
    carId: 'CAR001',
    terms: {
      rentalPeriod: '3 days',
      insuranceCoverage: 'Standard',
      deductible: 500,
      dailyRate: 50,
      totalAmount: 210,
      paymentTerms: 'Full payment required',
      cancellationPolicy: 'Free cancellation up to 48 hours',
      lateReturnFee: 50,
      fuelPolicy: 'Full tank return required',
      mileageLimit: 'Unlimited',
      excessCharge: 0.25,
    },
    rules: [
      {
        title: 'Vehicle Condition',
        description: 'Return vehicle in same condition as pickup.',
        category: 'vehicle-condition',
      },
      {
        title: 'Fuel Policy',
        description: 'Return with full tank of fuel.',
        category: 'fuel',
      },
    ],
  };

  const mockClient = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '+33612345678',
  };

  try {
    console.log('Generating PDF contract...');
    const pdfInfo = await ContractService.generateContractPDF(mockContract, mockReservation, mockClient);
    console.log('✅ PDF generated successfully');
    console.log(`   File name: ${pdfInfo.fileName}`);
    console.log(`   URL: ${pdfInfo.url}`);
    console.log(`   Full path: ${pdfInfo.filePath}`);
  } catch (err) {
    console.error('❌ PDF generation failed:', err.message);
    process.exit(1);
  }
}

await main();

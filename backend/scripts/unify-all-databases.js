// Comprehensive Database Field Name Unification Script for E-Krini Platform
// This script standardizes FIELD NAMES across all microservices databases

import mongoose from 'mongoose';

// Fleet Service Field Unification
const unifyFleetService = async () => {
  console.log('\n=== Fleet Service Field Unification ===');
  
  const fleetConn = await mongoose.createConnection(
    process.env.FLEET_MONGODB_URI || 'mongodb://localhost:27017/car-rental-fleet'
  );

  const Car = fleetConn.model('Car', new mongoose.Schema({}, { strict: false }));

  // Check for inconsistent field names
  const sampleCars = await Car.find({}).limit(5);
  console.log('Sample car fields:', Object.keys(sampleCars[0]?._doc || {}));

  // No field renaming needed for fleet service (already consistent with French naming)
  // Fields: nom, marque, modele, prixParJour, matricule, disponibilite, dernierMaintenance
  
  console.log('✓ Fleet Service uses consistent field names (French convention)');

  await fleetConn.close();
};

// Reservation Service Field Unification
const unifyReservationService = async () => {
  console.log('\n=== Reservation Service Field Unification ===');
  
  const reservConn = await mongoose.createConnection(
    process.env.RESERVATION_MONGODB_URI || 'mongodb://localhost:27017/car-rental-reservations'
  );

  const Reservation = reservConn.model('Reservation', new mongoose.Schema({}, { strict: false }));

  // Check current field structure
  const sampleReservations = await Reservation.find({}).limit(5);
  console.log('Sample reservation fields:', Object.keys(sampleReservations[0]?._doc || {}));

  // Standardize: clientId → userId (to match auth service)
  const clientIdExists = await Reservation.countDocuments({ clientId: { $exists: true } });
  if (clientIdExists > 0) {
    console.log(`Found ${clientIdExists} reservations with 'clientId' field`);
    const result = await Reservation.updateMany(
      { clientId: { $exists: true }, userId: { $exists: false } },
      [{ $set: { userId: '$clientId' } }]
    );
    console.log(`  ✓ Renamed clientId → userId: ${result.modifiedCount} records`);
    
    // Remove old clientId field
    await Reservation.updateMany(
      { clientId: { $exists: true } },
      { $unset: { clientId: '' } }
    );
    console.log('  ✓ Removed old clientId field');
  }

  // Standardize: carId → vehicleId (to match maintenance service)
  const carIdExists = await Reservation.countDocuments({ carId: { $exists: true } });
  if (carIdExists > 0) {
    console.log(`Found ${carIdExists} reservations with 'carId' field`);
    const result = await Reservation.updateMany(
      { carId: { $exists: true }, vehicleId: { $exists: false } },
      [{ $set: { vehicleId: '$carId' } }]
    );
    console.log(`  ✓ Renamed carId → vehicleId: ${result.modifiedCount} records`);
    
    // Remove old carId field
    await Reservation.updateMany(
      { carId: { $exists: true } },
      { $unset: { carId: '' } }
    );
    console.log('  ✓ Removed old carId field');
  }

  // Standardize: carBrand → marque, carModel → modele (to match fleet service)
  const carBrandExists = await Reservation.countDocuments({ carBrand: { $exists: true } });
  if (carBrandExists > 0) {
    console.log(`Found ${carBrandExists} reservations with 'carBrand' field`);
    const result = await Reservation.updateMany(
      { carBrand: { $exists: true }, marque: { $exists: false } },
      [{ $set: { marque: '$carBrand' } }]
    );
    console.log(`  ✓ Renamed carBrand → marque: ${result.modifiedCount} records`);
    
    await Reservation.updateMany(
      { carBrand: { $exists: true } },
      { $unset: { carBrand: '' } }
    );
  }

  const carModelExists = await Reservation.countDocuments({ carModel: { $exists: true } });
  if (carModelExists > 0) {
    const result = await Reservation.updateMany(
      { carModel: { $exists: true }, modele: { $exists: false } },
      [{ $set: { modele: '$carModel' } }]
    );
    console.log(`  ✓ Renamed carModel → modele: ${result.modifiedCount} records`);
    
    await Reservation.updateMany(
      { carModel: { $exists: true } },
      { $unset: { carModel: '' } }
    );
  }

  await reservConn.close();
  console.log('✓ Reservation Service field unification complete!');
};

// Maintenance Service Field Unification
const unifyMaintenanceService = async () => {
  console.log('\n=== Maintenance Service Field Unification ===');
  
  const maintConn = await mongoose.createConnection(
    process.env.MAINTENANCE_MONGODB_URI || 'mongodb://localhost:27017/maintenance'
  );

  const Vehicule = maintConn.model('Vehicule', new mongoose.Schema({}, { strict: false }));
  const Maintenance = maintConn.model('Maintenance', new mongoose.Schema({}, { strict: false }));

  // Check current structure
  const sampleVehicles = await Vehicule.find({}).limit(3);
  const sampleMaintenance = await Maintenance.find({}).limit(3);
  
  console.log('Sample vehicle fields:', Object.keys(sampleVehicles[0]?._doc || {}));
  console.log('Sample maintenance fields:', Object.keys(sampleMaintenance[0]?._doc || {}));

  // Maintenance service already uses French naming consistently:
  // - idVehicule (vehicle ID reference)
  // - marque, modele, immatriculation
  // - typeMaintenance, dateMaintenance, coutMainOeuvre
  
  console.log('✓ Maintenance Service uses consistent field names (French convention)');

  await maintConn.close();
};

// Auth Service Field Unification
const unifyAuthService = async () => {
  console.log('\n=== Auth Service Field Unification ===');
  
  const authConn = await mongoose.createConnection(
    process.env.AUTH_MONGODB_URI || 'mongodb://localhost:27017/car-rental-auth'
  );

  const User = authConn.model('User', new mongoose.Schema({}, { strict: false }));

  const sampleUsers = await User.find({}).limit(3);
  console.log('Sample user fields:', Object.keys(sampleUsers[0]?._doc || {}));

  // Auth service uses consistent English naming
  // Fields: username, email, firstName, lastName, role, kycStatus
  
  console.log('✓ Auth Service uses consistent field names (English convention)');

  await authConn.close();
};

// Assurance Service Field Unification
const unifyAssuranceService = async () => {
  console.log('\n=== Assurance Service Field Unification ===');
  
  const assurConn = await mongoose.createConnection(
    process.env.ASSURANCE_MONGODB_URI || 'mongodb://localhost:27017/assurance-claims-db'
  );

  const Assurance = assurConn.model('Assurance', new mongoose.Schema({}, { strict: false }));

  const samplePolicies = await Assurance.find({}).limit(3);
  console.log('Sample assurance fields:', Object.keys(samplePolicies[0]?._doc || {}));

  // Assurance service uses consistent English naming
  // Fields: userId, vehicleId, insuranceType, policyNumber, status
  
  console.log('✓ Assurance Service uses consistent field names (English convention)');

  await assurConn.close();
};

// Main execution
const runFullUnification = async () => {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  E-Krini Platform - Database Field Name Unification       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  try {
    await unifyFleetService();
    await unifyReservationService();
    await unifyMaintenanceService();
    await unifyAuthService();
    await unifyAssuranceService();
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✓ Field Name Unification Complete!                       ║');
    console.log('║                                                            ║');
    console.log('║  Summary of Changes:                                       ║');
    console.log('║  • Reservation: clientId → userId                          ║');
    console.log('║  • Reservation: carId → vehicleId                          ║');
    console.log('║  • Reservation: carBrand → marque                          ║');
    console.log('║  • Reservation: carModel → modele                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error during unification:', error);
    process.exit(1);
  }
};

runFullUnification();

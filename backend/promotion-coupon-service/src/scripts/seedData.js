import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Coupon from 'src/models/Coupon.js';
import Promotion from '../models/Promotion.js';

dotenv.config();

// Données de test pour les Coupons
const coupons = [
  {
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    date_debut: new Date('2025-01-01'),
    date_fin: new Date('2025-12-31'),
    max_utilisation: 100,
    max_utilisation_user: 1,
    actif: true,
  },
  {
    code: 'SAVE50',
    type: 'amount',
    value: 50,
    date_debut: new Date('2025-01-01'),
    date_fin: new Date('2025-06-30'),
    max_utilisation: 50,
    max_utilisation_user: 2,
    actif: true,
  },
  {
    code: 'PREMIUM20',
    type: 'percentage',
    value: 20,
    date_debut: new Date('2025-02-01'),
    date_fin: new Date('2025-03-31'),
    max_utilisation: 25,
    max_utilisation_user: 1,
    actif: true,
  },
  {
    code: 'FLASH100',
    type: 'amount',
    value: 100,
    date_debut: new Date('2025-01-15'),
    date_fin: new Date('2025-01-31'),
    max_utilisation: 10,
    max_utilisation_user: 1,
    actif: true,
  },
  {
    code: 'LOYALTY15',
    type: 'percentage',
    value: 15,
    date_debut: new Date('2025-01-01'),
    date_fin: new Date('2025-12-31'),
    max_utilisation: 0, // Illimité
    max_utilisation_user: 0, // Illimité
    actif: true,
  },
];

// Données de test pour les Promotions
const promotions = [
  {
    nom: 'Promo Week-end SUV',
    description: 'Réduction de 25% sur tous les SUV pendant les week-ends',
    type: 'percentage',
    value: 25,
    categorie_voiture: 'SUV',
    date_debut: new Date('2025-01-01'),
    date_fin: new Date('2025-12-31'),
    jour_specifique: 'Weekend',
    actif: true,
  },
  {
    nom: 'Promo Économique Janvier',
    description: 'Réduction de 30 TND sur les voitures économiques',
    type: 'amount',
    value: 30,
    categorie_voiture: 'Économique',
    date_debut: new Date('2025-01-01'),
    date_fin: new Date('2025-01-31'),
    jour_specifique: '',
    actif: true,
  },
  {
    nom: 'Spécial Luxe',
    description: 'Réduction de 15% sur les véhicules de luxe',
    type: 'percentage',
    value: 15,
    categorie_voiture: 'Luxe',
    date_debut: new Date('2025-01-15'),
    date_fin: new Date('2025-03-15'),
    jour_specifique: '',
    actif: true,
  },
  {
    nom: 'Promotion Lundi Matin',
    description: 'Réduction de 20% tous les lundis',
    type: 'percentage',
    value: 20,
    categorie_voiture: '',
    date_debut: new Date('2025-01-01'),
    date_fin: new Date('2025-06-30'),
    jour_specifique: 'Lundi',
    actif: true,
  },
  {
    nom: 'Voiture Spécifique #12',
    description: 'Réduction de 50 TND sur la voiture ID 12',
    type: 'amount',
    value: 50,
    categorie_voiture: '',
    id_voiture: 12,
    date_debut: new Date('2025-01-01'),
    date_fin: new Date('2025-02-28'),
    jour_specifique: '',
    actif: true,
  },
  {
    nom: 'Promo Générale Printemps',
    description: 'Réduction de 10% sur toutes les locations',
    type: 'percentage',
    value: 10,
    categorie_voiture: '',
    date_debut: new Date('2025-03-01'),
    date_fin: new Date('2025-05-31'),
    jour_specifique: '',
    actif: true,
  },
];

// Fonction pour insérer les données
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Coupon.deleteMany({});
    await Promotion.deleteMany({});
    console.log('✅ Existing data cleared');

    // Insert coupons
    console.log('📦 Inserting coupons...');
    const insertedCoupons = await Coupon.insertMany(coupons);
    console.log(`✅ ${insertedCoupons.length} coupons inserted`);

    // Insert promotions
    console.log('📦 Inserting promotions...');
    const insertedPromotions = await Promotion.insertMany(promotions);
    console.log(`✅ ${insertedPromotions.length} promotions inserted`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Coupons: ${insertedCoupons.length}`);
    console.log(`   - Promotions: ${insertedPromotions.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Fonction pour nettoyer la base de données
const clearDatabase = async () => {
  try {
    console.log('🗑️  Clearing database...');
    await connectDB();

    await Coupon.deleteMany({});
    await Promotion.deleteMany({});

    console.log('✅ Database cleared successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Clearing failed:', error);
    process.exit(1);
  }
};

// Execute based on command line argument
const command = process.argv[2];

if (command === 'clear') {
  clearDatabase();
} else {
  seedDatabase();
}

export { seedDatabase, clearDatabase };
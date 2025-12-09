import mongoose from 'mongoose';
import Car from './models/Car.js';

const scanAndUnifyNames = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/car-rental-fleet');

    console.log('Scanning cars for naming inconsistencies...');

    const cars = await Car.find({}, { marque: 1, modele: 1, nom: 1 });

    const brandMap = {};
    const modelMap = {};

    cars.forEach(car => {
      const brand = car.marque?.toLowerCase().trim();
      const model = car.modele?.toLowerCase().trim();
      const name = car.nom?.toLowerCase().trim();

      if (brand) {
        if (!brandMap[brand]) brandMap[brand] = new Set();
        brandMap[brand].add(car.marque);
      }

      if (model) {
        if (!modelMap[model]) modelMap[model] = new Set();
        modelMap[model].add(car.modele);
      }
    });

    console.log('Brand variations:');
    Object.keys(brandMap).forEach(key => {
      if (brandMap[key].size > 1) {
        console.log(`${key}: ${Array.from(brandMap[key]).join(', ')}`);
      }
    });

    console.log('\nModel variations:');
    Object.keys(modelMap).forEach(key => {
      if (modelMap[key].size > 1) {
        console.log(`${key}: ${Array.from(modelMap[key]).join(', ')}`);
      }
    });

    // Standardize brands
    const brandStandardization = {
      'tesla': 'Tesla',
      'toyota': 'Toyota',
      'ferari': 'Ferrari',
      'ferrari': 'Ferrari',
      'bmw': 'BMW',
      'mercedes': 'Mercedes-Benz',
      'audi': 'Audi',
      'honda': 'Honda',
      'ford': 'Ford',
      'chevrolet': 'Chevrolet',
      'nissan': 'Nissan',
      'volkswagen': 'Volkswagen',
      'porsche': 'Porsche',
      'lamborghini': 'Lamborghini',
      'resr': 'Ferrari', // assuming typo
      'test': 'Test' // placeholder
    };

    console.log('\nUpdating car brands...');
    for (const [lower, standard] of Object.entries(brandStandardization)) {
      const result = await Car.updateMany(
        { marque: new RegExp(`^${lower}$`, 'i') },
        { $set: { marque: standard } }
      );
      if (result.modifiedCount > 0) {
        console.log(`Updated ${result.modifiedCount} cars: ${lower} -> ${standard}`);
      }
    }

    // Standardize models - this is trickier, need to map per brand
    const modelStandardization = {
      'camry': 'Camry',
      'corolla': 'Corolla',
      'prius': 'Prius',
      'model s': 'Model S',
      'model 3': 'Model 3',
      'model x': 'Model X',
      'model y': 'Model Y',
      'ferrari 488': '488 Spider',
      'ferrari f8': 'F8 Tributo',
      'test': 'Test Model'
    };

    console.log('\nUpdating car models...');
    for (const [lower, standard] of Object.entries(modelStandardization)) {
      const result = await Car.updateMany(
        { modele: new RegExp(`^${lower}$`, 'i') },
        { $set: { modele: standard } }
      );
      if (result.modifiedCount > 0) {
        console.log(`Updated ${result.modifiedCount} models: ${lower} -> ${standard}`);
      }
    }

    console.log('\nUnification complete!');
    process.exit(0);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

scanAndUnifyNames();
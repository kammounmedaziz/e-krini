const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const assuranceRoutes = require('./routes/AssuranceRoutes');
const constatRoutes = require('./routes/constatRoutes');

// Utilisation des routes
app.use('/api/assurances', assuranceRoutes);
app.use('/api/constats', constatRoutes);

// Route de base pour tester l'API
app.get('/', (req, res) => {
    res.json({
        message: 'API Assurance et Constats - Serveur actif',
        version: '1.0.0',
        endpoints: {
            assurances: '/api/assurances',
            constats: '/api/constats'
        }
    });
});

// Route de santé pour vérifier le statut
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Gestion des routes non trouvées
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Route non trouvée',
        path: req.originalUrl,
        method: req.method
    });
});

// Gestion globale des erreurs
app.use((error, req, res, next) => {
    console.error('Erreur serveur:', error);

    if (error.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Erreur de validation des données',
            errors: Object.values(error.errors).map(err => err.message)
        });
    }

    if (error.name === 'CastError') {
        return res.status(400).json({
            message: 'ID invalide'
        });
    }

    res.status(500).json({
        message: 'Erreur interne du serveur',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Connexion à MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/assurance_reclamation_db';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connecté à MongoDB avec succès');
        console.log(`Base de données: ${mongoose.connection.name}`);
    })
    .catch((error) => {
        console.error('Erreur de connexion MongoDB:', error);
        process.exit(1);
    });

// Gestion de la déconnexion MongoDB
mongoose.connection.on('disconnected', () => {
    console.log('Déconnecté de MongoDB');
});

mongoose.connection.on('error', (error) => {
    console.error('Erreur MongoDB:', error);
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
});

// Gestion propre de l'arrêt du serveur
process.on('SIGINT', async () => {
    console.log('\nArrêt du serveur en cours...');

    try {
        await mongoose.connection.close();
        console.log('Connexion MongoDB fermée');

        server.close(() => {
            console.log('Serveur arrêté proprement');
            process.exit(0);
        });
    } catch (error) {
        console.error('Erreur lors de l\'arrêt:', error);
        process.exit(1);
    }
});

process.on('unhandledRejection', (error) => {
    console.error('Rejet non géré:', error);
    process.exit(1);
});

module.exports = app;
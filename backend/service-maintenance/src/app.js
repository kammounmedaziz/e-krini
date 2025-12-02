const http = require('http');
const express = require('express');
const mongo = require('mongoose');
const dbconnection = require('./config');

const maintenanceRouter = require('./routes/maintenanceRoutes');
const materielRouter = require('./routes/materielRoutes');
const vehiculeRouter = require('./routes/vehiculeRoutes');

mongo.connect(dbconnection.url)
    .then(() => console.log('✅ Base de données connectée avec succès'))
    .catch((err) => {
        console.error('❌ Erreur de connexion à la base de données:', err);
        process.exit(1);
    });

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.use('/maintenance', maintenanceRouter);
app.use('/materiel', materielRouter);
app.use('/vehicule', vehiculeRouter);

app.get('/', (req, res) => {
    res.json({
        message: 'API de gestion de maintenance',
        endpoints: {
            maintenance: '/maintenance',
            materiel: '/materiel',
            vehicule: '/vehicule'
        }
    });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur interne' });
});

const PORT = process.env.PORT || 3007;
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

module.exports = app;
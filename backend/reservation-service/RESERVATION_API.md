# Reservation & Contract Service API

Service de gestion des réservations et des contrats pour l'application de location de voitures **E-Krini**.

## 📋 Vue d'ensemble

Ce service gère:
- **Réservations**: Création, modification, recherche et gestion des réservations
- **Contrats**: Génération des contrats, gestion des règles et conditions, génération de PDFs

## 🚀 Démarrage

### Prérequis
- Node.js >= 18.0.0
- MongoDB en local ou en conteneur
- Redis en local ou en conteneur

### Installation

```bash
npm install
```

### Configuration

Créer un fichier `.env`:
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/reservation
REDIS_URL=redis://localhost:6379
PORT=3004
CORS_ORIGIN=http://localhost:5173
AUTH_SERVICE_URL=http://localhost:3001
```

### Démarrage du service

**Développement** (avec nodemon):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

### Tests

```bash
npm test
npm test -- --watch
```

## 📚 API Endpoints

### Réservations

#### 1. Créer une réservation
```http
POST /api/reservations
Content-Type: application/json

{
  "clientId": "client-123",
  "carId": "car-456",
  "carModel": "Tesla Model 3",
  "carBrand": "Tesla",
  "startDate": "2025-12-01T10:00:00Z",
  "endDate": "2025-12-05T18:00:00Z",
  "insuranceType": "standard",
  "dailyRate": 100,
  "depositAmount": 500,
  "notes": "Réservation pour weekend"
}
```

**Réponse (201)**:
```json
{
  "success": true,
  "message": "Réservation créée avec succès",
  "data": {
    "_id": "ObjectId",
    "reservationId": "uuid",
    "clientId": "client-123",
    "carId": "car-456",
    "carModel": "Tesla Model 3",
    "carBrand": "Tesla",
    "startDate": "2025-12-01T10:00:00Z",
    "endDate": "2025-12-05T18:00:00Z",
    "insuranceType": "standard",
    "totalDays": 5,
    "dailyRate": 100,
    "insuranceAmount": 100,
    "totalAmount": 600,
    "depositAmount": 500,
    "status": "pending",
    "createdAt": "2025-11-22T10:00:00Z"
  }
}
```

#### 2. Récupérer une réservation
```http
GET /api/reservations/:reservationId
```

#### 3. Récupérer les réservations d'un client
```http
GET /api/reservations/client/:clientId
```

#### 4. Rechercher par modèle de voiture
```http
GET /api/reservations/search/by-car-model?carModel=Tesla%20Model%203
```

#### 5. Récupérer par statut
```http
GET /api/reservations/by-status/:status
```
Statuts: `pending`, `confirmed`, `active`, `completed`, `cancelled`

#### 6. Récupérer par période
```http
GET /api/reservations/period?startDate=2025-12-01&endDate=2025-12-31
```

#### 7. Vérifier la disponibilité d'une voiture
```http
GET /api/reservations/availability/check?carId=car-456&startDate=2025-12-01&endDate=2025-12-05
```

**Réponse**:
```json
{
  "success": true,
  "available": true,
  "carId": "car-456",
  "startDate": "2025-12-01",
  "endDate": "2025-12-05"
}
```

#### 8. Mettre à jour une réservation
```http
PUT /api/reservations/:reservationId
Content-Type: application/json

{
  "insuranceType": "premium",
  "notes": "Mise à jour de l'assurance"
}
```

#### 9. Confirmer une réservation
```http
PUT /api/reservations/:reservationId/confirm
```

Marque la réservation comme confirmée et le dépôt comme payé.

#### 10. Annuler une réservation
```http
PUT /api/reservations/:reservationId/cancel
Content-Type: application/json

{
  "reason": "Changement de plans"
}
```

#### 11. Obtenir les statistiques
```http
GET /api/reservations/stats/overview
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "byStatus": [
      {
        "_id": "pending",
        "count": 5,
        "totalRevenue": 3000
      }
    ],
    "byInsurance": [
      {
        "_id": "standard",
        "count": 8
      }
    ]
  }
}
```

### Contrats

#### 1. Créer un contrat
```http
POST /api/contracts
Content-Type: application/json

{
  "reservationId": "uuid-de-la-réservation"
}
```

**Réponse (201)**:
```json
{
  "success": true,
  "message": "Contrat créé avec succès",
  "data": {
    "_id": "ObjectId",
    "contractId": "uuid",
    "reservationId": "ObjectId",
    "clientId": "client-123",
    "carId": "car-456",
    "startDate": "2025-12-01T10:00:00Z",
    "endDate": "2025-12-05T18:00:00Z",
    "insuranceType": "standard",
    "status": "draft",
    "terms": {
      "rentalPeriod": "Du 01/12/2025 au 05/12/2025 (5 jours)",
      "insuranceCoverage": "Couverture standard",
      "deductible": 500,
      "dailyRate": 100,
      "totalAmount": 600,
      "depositAmount": 500,
      "paymentTerms": "Paiement intégral à la signature du contrat",
      "cancellationPolicy": "Annulation gratuite jusqu'à 48 heures avant la location.",
      "lateReturnFee": 50,
      "fuelPolicy": "full-to-full",
      "mileageLimit": null,
      "excessCharge": 0.25
    },
    "rules": [
      {
        "title": "État du véhicule",
        "description": "Le véhicule doit être retourné dans le même état...",
        "category": "vehicle-condition"
      }
    ]
  }
}
```

#### 2. Récupérer un contrat
```http
GET /api/contracts/:contractId
```

#### 3. Récupérer les contrats d'un client
```http
GET /api/contracts/client/:clientId
```

#### 4. Récupérer par statut
```http
GET /api/contracts/by-status/:status
```
Statuts: `draft`, `signed`, `active`, `completed`, `terminated`

#### 5. Générer un PDF du contrat
```http
POST /api/contracts/:contractId/generate-pdf
```

**Réponse**:
```json
{
  "success": true,
  "message": "PDF généré avec succès",
  "data": {
    "contractId": "uuid",
    "pdfUrl": "/uploads/contracts/contrat_uuid_timestamp.pdf",
    "pdfFileName": "contrat_uuid_timestamp.pdf"
  }
}
```

#### 6. Télécharger un PDF du contrat
```http
GET /api/contracts/:contractId/download-pdf
```

Retourne le fichier PDF pour téléchargement.

#### 7. Mettre à jour le statut d'un contrat
```http
PUT /api/contracts/:contractId/status
Content-Type: application/json

{
  "status": "signed"
}
```

#### 8. Mettre à jour les règles d'un contrat
```http
PUT /api/contracts/:contractId/rules
Content-Type: application/json

{
  "rules": [
    {
      "title": "Règle personnalisée",
      "description": "Description de la règle",
      "category": "damage"
    }
  ]
}
```

#### 9. Obtenir les statistiques
```http
GET /api/contracts/stats/overview
```

## 📊 Types d'assurance

| Type | Franchise | Couverture | Prix/jour |
|------|-----------|-----------|-----------|
| **basic** | 1000€ | Minimale | 10€ |
| **standard** | 500€ | Standard | 20€ |
| **premium** | 250€ | Étendue | 35€ |
| **comprehensive** | 0€ | Complète | 50€ |

## 🏗️ Architecture

```
src/
├── models/
│   ├── Reservation.js      # Schéma des réservations
│   └── Contract.js          # Schéma des contrats
├── controllers/
│   ├── ReservationController.js
│   └── ContractController.js
├── services/
│   ├── ReservationService.js
│   └── ContractService.js
├── routes/
│   ├── reservations.js
│   └── contracts.js
├── middlewares/
├── utils/
├── app.js                   # Application Express
└── config/
    └── database.js          # Configuration MongoDB
```

## 📝 Schémas de données

### Reservation
```javascript
{
  reservationId: String (UUID),
  clientId: String,
  carId: String,
  carModel: String,
  carBrand: String,
  startDate: Date,
  endDate: Date,
  insuranceType: String (basic|standard|premium|comprehensive),
  totalDays: Number,
  dailyRate: Number,
  insuranceAmount: Number,
  totalAmount: Number,
  depositAmount: Number,
  depositPaid: Boolean,
  status: String (pending|confirmed|active|completed|cancelled),
  contractId: ObjectId (référence Contract),
  notes: String,
  timestamps: {createdAt, updatedAt}
}
```

### Contract
```javascript
{
  contractId: String (UUID),
  reservationId: ObjectId (référence Reservation),
  clientId: String,
  carId: String,
  startDate: Date,
  endDate: Date,
  insuranceType: String,
  terms: {
    rentalPeriod: String,
    insuranceCoverage: String,
    deductible: Number,
    dailyRate: Number,
    totalAmount: Number,
    depositAmount: Number,
    paymentTerms: String,
    cancellationPolicy: String,
    lateReturnFee: Number,
    fuelPolicy: String,
    mileageLimit: Number,
    excessCharge: Number
  },
  rules: [{
    title: String,
    description: String,
    category: String (vehicle-condition|fuel|mileage|driving|smoking|pets|damage|payment)
  }],
  status: String (draft|signed|active|completed|terminated),
  pdfUrl: String,
  pdfFileName: String,
  signedAt: Date,
  completedAt: Date,
  timestamps: {createdAt, updatedAt}
}
```

## 🔄 Flux de création

### Réservation → Contrat → PDF

```
1. POST /api/reservations
   ↓
   Création de la réservation avec statut "pending"

2. PUT /api/reservations/:id/confirm
   ↓
   Confirmation et marquage du dépôt comme payé

3. POST /api/contracts
   ↓
   Création du contrat avec règles et conditions par défaut
   Génération automatique des termes

4. POST /api/contracts/:id/generate-pdf
   ↓
   Génération du PDF et mise à jour du statut à "signed"

5. GET /api/contracts/:id/download-pdf
   ↓
   Téléchargement du PDF par le client
```

## ⚙️ Configuration Redis

Redis est utilisé pour:
- Les verrous distribués (distributed locks)
- La gestion des sessions
- Le cache des données de disponibilité

## 🧪 Tests

### Test de connexion à la base de données
```bash
node test-connection.js
```

### Linter et Formatage
```bash
npm run lint
npm run lint:fix
npm run format
```

## 📦 Dépendances principales

- **Express**: Framework web
- **Mongoose**: ODM MongoDB
- **Redis**: Cache et verrous distribués
- **PDFKit**: Génération de PDFs
- **express-validator**: Validation des données
- **Helmet**: Sécurité HTTP
- **CORS**: Partage des ressources
- **Winston**: Logging

## 🔐 Sécurité

- Validation de toutes les entrées avec express-validator
- CORS configuré pour le frontend
- Helmet pour les en-têtes HTTP sécurisés
- Gestion des erreurs centralisée
- Logging de toutes les erreurs

## 📞 Support

Pour des problèmes ou des questions, consultez la documentation du projet principal.

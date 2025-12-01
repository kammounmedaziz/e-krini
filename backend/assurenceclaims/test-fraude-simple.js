// const fetch = require('node-fetch'); // Native fetch in Node 18+

const API_BASE_URL = 'http://localhost:3000/api/constats';

// Scénarios de test
const timestamp = Date.now();
const scenarios = [
    {
        name: "Constat Suspect",
        data: {
            constatNumber: `FRAUDE-TEST-${timestamp}`,
            policyNumber: "POL123",
            clientName: "Client Suspect Simple",
            incidentType: "theft",
            incidentDate: "2024-01-01",
            incidentLocation: "Lieu inconnu",
            description: "Vol", // Description courte (< 50 chars)
            estimatedAmount: 15000, // Montant élevé (> 10000)
            status: "draft",
            isAmicable: false
        }
    },
    {
        name: "Constat Normal",
        data: {
            constatNumber: `NORMAL-TEST-${timestamp}`,
            policyNumber: "POL456",
            clientName: "Client Fiable Simple",
            incidentType: "accident",
            incidentDate: new Date().toISOString().split('T')[0], // Aujourd'hui
            incidentLocation: "Paris, France",
            description: "Accident de voiture sur l'autoroute A6. Collision arrière à faible vitesse. Dégâts sur le pare-chocs et le coffre. Constat amiable rempli avec l'autre conducteur.",
            estimatedAmount: 2500,
            status: "draft",
            documents: [
                {
                    name: "Constat amiable",
                    url: "/documents/constat.pdf",
                    type: "report"
                }
            ],
            isAmicable: true,
            involvedParties: [
                {
                    name: "Tiers",
                    contact: "0600000000",
                    role: "third_party"
                }
            ]
        }
    }
];

async function runTests() {
    console.log(' Démarrage des tests de détection de risque (Anciennement Fraude)...\n');

    for (const scenario of scenarios) {
        console.log(`\nTest du scénario : ${scenario.name}`);
        console.log('-----------------------------------');

        try {
            // 1. Création du constat
            console.log('Création du constat...');
            const createResponse = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scenario.data)
            });

            if (!createResponse.ok) {
                const errText = await createResponse.text();
                throw new Error(`Erreur lors de la création: ${createResponse.status} ${errText}`);
            }

            const constat = await createResponse.json();
            console.log(`Constat créé avec ID: ${constat._id}`);

            // 2. Analyse de risque
            console.log('Analyse de risque...');
            const analyseUrl = `${API_BASE_URL}/${constat._id}/analyse-risque`;
            const analyseResponse = await fetch(analyseUrl);

            if (!analyseResponse.ok) {
                const errText = await analyseResponse.text();
                throw new Error(`Erreur lors de l'analyse: ${analyseResponse.status} ${errText}`);
            }

            const resultat = await analyseResponse.json();
            console.log('Résultat de l\'analyse :');
            console.log(JSON.stringify(resultat, null, 2));

        } catch (error) {
            console.error(`Erreur pour le scénario ${scenario.name}:`, error.message);
        }
    }

    console.log('\n Tests terminés.');
}

runTests();

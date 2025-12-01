const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/assurances';

async function runTest() {
    try {
        console.log('1. Creating new assurance...');
        const newAssurance = {
            policyNumber: `TEST-${Date.now()}`,
            clientName: 'Jean Dupont',
            insuranceType: 'home',
            startDate: '2023-01-01',
            endDate: '2023-12-31',
            premiumAmount: 500,
            coverageDetails: 'Full coverage',
            status: 'active',
            clientAddress: '1600 Amphitheatre Parkway, Mountain View, CA',
            clientPhone: '+33612345678'
        };

        const createRes = await fetch(BASE_URL, {
            method: 'POST',
            body: JSON.stringify(newAssurance),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!createRes.ok) {
            const text = await createRes.text();
            throw new Error(`Failed to create assurance: ${createRes.status} ${text}`);
        }

        const createdAssurance = await createRes.json();
        console.log('Assurance created:', createdAssurance._id);

        console.log('2. Verifying address...');
        const verifyRes = await fetch(`${BASE_URL}/${createdAssurance._id}/verify-address`);

        if (!verifyRes.ok) {
            const text = await verifyRes.text();
            console.error(`Verification failed with status ${verifyRes.status}`);
            console.error('Response body:', text);
            // Don't throw, continue to phone verification
        } else {
            const verifyData = await verifyRes.json();
            console.log('Address Verification Result:', JSON.stringify(verifyData, null, 2));
        }

        console.log('3. Verifying phone...');
        const phoneRes = await fetch(`${BASE_URL}/${createdAssurance._id}/validate-phone`);

        if (!phoneRes.ok) {
            const text = await phoneRes.text();
            console.error(`Phone verification failed with status ${phoneRes.status}`);
            console.error('Response body:', text);
        } else {
            const phoneData = await phoneRes.json();
            console.log('Phone Verification Result:', JSON.stringify(phoneData, null, 2));
        }

        console.log('4. Cleaning up...');
        await fetch(`${BASE_URL}/${createdAssurance._id}`, { method: 'DELETE' });
        console.log('Assurance deleted.');

    } catch (error) {
        console.error('Test failed:', error);
    }
}

runTest();

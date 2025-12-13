const API_URL = 'http://localhost:3000/api/constats';

async function testConstatAPI() {
    try {
        console.log('Testing Constat API...');

        // 1. Create a new Constat
        const newConstat = {
            constatNumber: 'C-' + Date.now(),
            policyNumber: 'POL-123456',
            clientName: 'John Doe',
            incidentType: 'accident',
            incidentDate: new Date(),
            incidentLocation: 'Paris',
            description: 'Collision with another vehicle',
            estimatedAmount: 1500,
            status: 'draft',
            involvedParties: [{ name: 'Jane Smith', contact: '0600000000', role: 'third_party' }],
            isAmicable: true
        };

        console.log('Creating Constat...');
        const createRes = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newConstat)
        });

        if (!createRes.ok) {
            const err = await createRes.text();
            throw new Error(`Create failed: ${createRes.status} ${err}`);
        }

        const createdData = await createRes.json();
        console.log('Created:', createdData._id);
        const constatId = createdData._id;

        // 2. Get the Constat
        console.log('Fetching Constat...');
        const getRes = await fetch(`${API_URL}/${constatId}`);
        if (!getRes.ok) throw new Error('Get failed');
        const getData = await getRes.json();

        if (getData.constatNumber !== newConstat.constatNumber) {
            throw new Error('Constat data mismatch');
        }
        console.log('Fetched successfully');

        // 3. Run Risk Analysis
        console.log('Running Risk Analysis...');
        const riskRes = await fetch(`${API_URL}/${constatId}/analyse-risque`);
        if (!riskRes.ok) throw new Error('Risk Analysis failed');
        const riskData = await riskRes.json();
        console.log('Risk Score:', riskData.analyseRisque.scoreRisque);

        // 4. Run Preliminary Evaluation
        console.log('Running Preliminary Evaluation...');
        const evalRes = await fetch(`${API_URL}/${constatId}/evaluation-preliminaire`);
        if (!evalRes.ok) throw new Error('Evaluation failed');
        const evalData = await evalRes.json();
        console.log('Estimated Amount:', evalData.montantEstime);

        // 5. Update Constat
        console.log('Updating Constat...');
        const updateRes = await fetch(`${API_URL}/${constatId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'submitted' })
        });
        if (!updateRes.ok) throw new Error('Update failed');
        const updateData = await updateRes.json();

        if (updateData.status !== 'submitted') {
            throw new Error('Update failed check');
        }
        console.log('Updated successfully');

        // 6. Delete Constat
        console.log('Deleting Constat...');
        const deleteRes = await fetch(`${API_URL}/${constatId}`, { method: 'DELETE' });
        if (!deleteRes.ok) throw new Error('Delete failed');
        console.log('Deleted successfully');

        console.log('All tests passed!');
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testConstatAPI();

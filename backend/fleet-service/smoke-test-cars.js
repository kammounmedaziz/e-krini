import fetch from 'node-fetch';

const BASE = process.env.FLEET_URL || 'http://127.0.0.1:3002';
const waitForHealth = async (timeout = 15000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(`${BASE}/health`);
      if (res.ok) return true;
      console.log('health returned', res.status);
    } catch (err) {
      console.log('health check error:', err.message || err);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
};

const run = async () => {
  console.log('Waiting for fleet service health...');
  const ready = await waitForHealth(15000);
  if (!ready) {
    console.error('Fleet service not ready');
    process.exit(1);
  }
  console.log('Fleet service is healthy — running smoke test');

  // Create a car
  const payload = {
    nom: 'TestCar Smoke',
    categorie: 'citadine',
    prixParJour: 49.99,
    matricule: `SC-${Date.now().toString().slice(-6)}`,
    modele: 'Z-2025',
    marque: 'TestMotors',
    dernierMaintenance: new Date().toISOString()
  };

  const createRes = await fetch(`${BASE}/api/cars`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const createJson = await createRes.json();
  console.log('Create response status:', createRes.status, JSON.stringify(createJson));
  if (!createRes.ok) process.exit(1);

  const created = createJson.data;

  // List cars
  const listRes = await fetch(`${BASE}/api/cars`);
  const listJson = await listRes.json();
  console.log('List response status:', listRes.status, listJson.meta ? `${listJson.meta.total} total` : 'no meta');

  // Delete created car (soft delete)
  const delRes = await fetch(`${BASE}/api/cars/${created._id}`, { method: 'DELETE' });
  const delJson = await delRes.json();
  console.log('Delete response status:', delRes.status, JSON.stringify(delJson));

  // Test search endpoint
  const searchRes = await fetch(`${BASE}/api/cars/search?marque=TestMotors`);
  const searchJson = await searchRes.json();
  console.log('Search response status:', searchRes.status, JSON.stringify(searchJson));

  // Test maintenance due endpoint
  const mRes = await fetch(`${BASE}/api/cars/maintenance/due`);
  const mJson = await mRes.json();
  console.log('Maintenance due response status:', mRes.status, JSON.stringify(mJson));

  process.exit(0);
};

run().catch((err) => { console.error(err); process.exit(1); });

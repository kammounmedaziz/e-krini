const express = require('express');
const router = express.Router();
const Assurance = require('../models/assurance');
const fetch = require('node-fetch');

// GET all assurances
router.get('/', async (req, res) => {
  try {
    const assurances = await Assurance.find();
    res.json(assurances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single assurance
router.get('/:id', async (req, res) => {
  try {
    const assurance = await Assurance.findById(req.params.id);
    if (!assurance) {
      return res.status(404).json({ message: 'Assurance not found' });
    }
    res.json(assurance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route pour vérification d'adresse
router.get('/:id/verify-address', async (req, res) => {
  try {
    const assurance = await Assurance.findById(req.params.id);
    if (!assurance) {
      return res.status(404).json({ message: 'Assurance not found' });
    }

    // UTILISEZ VOTRE CLÉ API ICI
    const API_KEY = "3a991409bec79c3b1372445a67340679";

    const clientAddress = assurance.clientAddress || "Tour Eiffel, Paris, France";

    const response = await fetch(
      `http://api.positionstack.com/v1/forward?access_key=${API_KEY}&query=${encodeURIComponent(clientAddress)}`
    );

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({
        message: 'Erreur API PositionStack',
        error: data.error
      });
    }

    res.json({
      assurance: assurance.policyNumber,
      client: assurance.clientName,
      address: clientAddress,
      verification: {
        isValid: data.data && data.data.length > 0,
        coordinates: data.data && data.data[0] ? {
          latitude: data.data[0].latitude,
          longitude: data.data[0].longitude
        } : null,
        locationType: data.data && data.data[0] ? data.data[0].type : 'unknown',
        confidence: data.data && data.data[0] ? data.data[0].confidence : 0,
        fullAddress: data.data && data.data[0] ? data.data[0].label : null
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route pour validation téléphone
router.get('/:id/validate-phone', async (req, res) => {
  try {
    const assurance = await Assurance.findById(req.params.id);
    if (!assurance) {
      return res.status(404).json({ message: 'Assurance not found' });
    }

    const clientPhone = assurance.clientPhone || "+33123456789";

    // UTILISEZ VOTRE CLÉ API ICI
    const API_KEY = "968f1d7902a981ac4e644f1e7a1e4b9d";

    const response = await fetch(
      `http://apilayer.net/api/validate?access_key=${API_KEY}&number=${clientPhone}&country_code=FR&format=1`
    );

    const data = await response.json();

    // Vérifier les erreurs de l'API
    if (data.error) {
      return res.status(400).json({
        message: 'Erreur API NumVerify',
        error: data.error
      });
    }

    res.json({
      assurance: assurance.policyNumber,
      client: assurance.clientName,
      phone: clientPhone,
      validation: {
        isValid: data.valid,
        number: data.number,
        localFormat: data.local_format,
        internationalFormat: data.international_format,
        countryPrefix: data.country_prefix,
        countryCode: data.country_code,
        countryName: data.country_name,
        location: data.location,
        carrier: data.carrier,
        lineType: data.line_type
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Simulation function for NumVerify
function simulateNumVerifyResponse(phoneNumber) {
  return {
    isValid: true,
    number: phoneNumber,
    localFormat: phoneNumber.replace('+33', '0'),
    internationalFormat: phoneNumber,
    countryPrefix: "+33",
    countryCode: "FR",
    countryName: "France",
    location: "Paris",
    carrier: "Orange",
    lineType: "mobile"
  };
}

// GET phone validation with real NumVerify API
router.get('/:id/validate-phone-real', async (req, res) => {
  try {
    const assurance = await Assurance.findById(req.params.id);
    if (!assurance) {
      return res.status(404).json({ message: 'Assurance not found' });
    }

    const clientPhone = assurance.clientPhone || "+33612345678";
    const API_KEY = "968f1d7902a981ac4e644f1e7a1e4b9d";

    // Appel à l'API NumVerify réelle
    const response = await fetch(
      `http://apilayer.net/api/validate?access_key=${API_KEY}&number=${clientPhone}&country_code=FR&format=1`
    );

    const data = await response.json();

    //Si l'API fonctionne, utiliser ses données
    if (data.valid) {
      return res.json({
        assurance: assurance.policyNumber,
        client: assurance.clientName,
        phone: clientPhone,
        validation: {
          isValid: data.valid,
          number: data.number,
          localFormat: data.local_format,
          internationalFormat: data.international_format,
          countryPrefix: data.country_prefix,
          countryCode: data.country_code,
          countryName: data.country_name,
          location: data.location,
          carrier: data.carrier,
          lineType: data.line_type
        }
      });
    } else {
      // Fallback sur la simulation si l'API échoue
      const simulatedResponse = simulateNumVerifyResponse(clientPhone);
      return res.json({
        assurance: assurance.policyNumber,
        client: assurance.clientName,
        phone: clientPhone,
        validation: simulatedResponse,
        note: "Simulation (API non disponible)"
      });
    }
  } catch (error) {
    // En cas d'erreur, utiliser la simulation
    const simulatedResponse = simulateNumVerifyResponse(assurance.clientPhone || "+33612345678");
    res.json({
      assurance: assurance.policyNumber,
      client: assurance.clientName,
      phone: assurance.clientPhone || "+33612345678",
      validation: simulatedResponse,
      note: "Simulation (Erreur API: " + error.message + ")"
    });
  }
});

// ADD new assurance
router.post('/', async (req, res) => {
  const assurance = new Assurance({
    policyNumber: req.body.policyNumber,
    clientName: req.body.clientName,
    insuranceType: req.body.insuranceType,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    premiumAmount: req.body.premiumAmount,
    coverageDetails: req.body.coverageDetails,
    status: req.body.status,
    clientAddress: req.body.clientAddress,
    clientPhone: req.body.clientPhone
  });

  try {
    const newAssurance = await assurance.save();
    res.status(201).json(newAssurance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE assurance
router.put('/:id', async (req, res) => {
  try {
    const assurance = await Assurance.findById(req.params.id);
    if (!assurance) {
      return res.status(404).json({ message: 'Assurance not found' });
    }

    // Update fields
    if (req.body.policyNumber) assurance.policyNumber = req.body.policyNumber;
    if (req.body.clientName) assurance.clientName = req.body.clientName;
    if (req.body.insuranceType) assurance.insuranceType = req.body.insuranceType;
    if (req.body.startDate) assurance.startDate = req.body.startDate;
    if (req.body.endDate) assurance.endDate = req.body.endDate;
    if (req.body.premiumAmount) assurance.premiumAmount = req.body.premiumAmount;
    if (req.body.coverageDetails) assurance.coverageDetails = req.body.coverageDetails;
    if (req.body.status) assurance.status = req.body.status;
    if (req.body.clientAddress) assurance.clientAddress = req.body.clientAddress;
    if (req.body.clientPhone) assurance.clientPhone = req.body.clientPhone;

    const updatedAssurance = await assurance.save();
    res.json(updatedAssurance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE assurance
router.delete('/:id', async (req, res) => {
  try {
    const assurance = await Assurance.findById(req.params.id);
    if (!assurance) {
      return res.status(404).json({ message: 'Assurance not found' });
    }

    await Assurance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assurance deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
import express from "express";
const app = express();

app.use(express.json());

// ⭐ La liste complète des services
const services = {
  auth: "http://localhost:3001",            // auth-user-service
  fleet: "http://localhost:3002",           // fleet-service
  reservation: "http://localhost:3003",     // reservation-service
  promotion: "http://localhost:3006",       // promotion-coupon-service
  feedback: "http://localhost:3005",        // feedback-complaints-service
  assurance: "http://localhost:3004",       // assurence-claims-service
  maintenance: "http://localhost:3007"      // maintenance-service
};

// Endpoint pour renvoyer toutes les adresses
app.get("/services", (req, res) => {
  res.json(services);
});

app.listen(3000, () => {
  console.log("🧭 Discovery Service running on port 3000");
});
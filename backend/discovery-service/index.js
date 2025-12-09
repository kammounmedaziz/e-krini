import express from "express";
const app = express();

app.use(express.json());

// ⭐ La liste complète des services
const services = {
  auth: "http://auth-user-service:3001",            // auth-user-service
  fleet: "http://fleet-service:3002",           // fleet-service
  reservation: "http://reservation-service:3003",     // reservation-service
  promotion: "http://promotion-coupon-service:3006",       // promotion-coupon-service
  feedback: "http://feedback-complaints-service:3005",        // feedback-complaints-service
  assurance: "http://assurence-claims-service:3004",       // assurence-claims-service
  maintenance: "http://maintenance-service:3007"      // maintenance-service
};

// Endpoint pour renvoyer toutes les adresses
app.get("/services", (req, res) => {
  res.json(services);
});

app.listen(3000, () => {
  console.log("🧭 Discovery Service running on port 3000");
});
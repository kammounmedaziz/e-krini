import express from "express";
const app = express();

app.use(express.json());

// ⭐ La liste complète des services
const services = {
  auth: "http://localhost:3001",            // auth-user-service
  fleet: "http://localhost:3002",           // fleet-service
  reservation: "http://localhost:3004",     // reservation-service
  promotion: "http://localhost:3008",       // promotion-coupon-service
  assurance: "http://localhost:3012",       // ⭐ service assurance
  maintenance: "http://localhost:3007"      // ⭐ service maintenance
};

// Endpoint pour renvoyer toutes les adresses
app.get("/services", (req, res) => {
  res.json(services);
});

app.listen(3000, () => {
  console.log("🧭 Discovery Service running on port 3000");
});

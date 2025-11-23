import express from "express";
import {
    createOrUpdateInsuranceProfile,
    getInsuranceProfile,
    getInsuranceById,
    getAllInsuranceCompanies,
    uploadInsuranceDocuments,
    getInsuranceDashboardStats
} from "../controllers/insuranceController.js";
import { authMiddleware as authenticate } from "../middlewares/auth.js";

const router = express.Router();

// Protected routes (require authentication)
router.post("/profile", authenticate, createOrUpdateInsuranceProfile);
router.put("/profile", authenticate, createOrUpdateInsuranceProfile);
router.get("/profile", authenticate, getInsuranceProfile);
router.post("/documents", authenticate, uploadInsuranceDocuments);
router.get("/dashboard/stats", authenticate, getInsuranceDashboardStats);

// Public routes
router.get("/all", getAllInsuranceCompanies);
router.get("/:id", getInsuranceById);

export default router;

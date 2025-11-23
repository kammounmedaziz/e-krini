import express from "express";
import {
    createOrUpdateAgencyProfile,
    getAgencyProfile,
    getAgencyById,
    getAllAgencies,
    uploadAgencyDocuments,
    getAgencyDashboardStats
} from "../controllers/agencyController.js";
import { authMiddleware as authenticate } from "../middlewares/auth.js";

const router = express.Router();

// Protected routes (require authentication)
router.post("/profile", authenticate, createOrUpdateAgencyProfile);
router.put("/profile", authenticate, createOrUpdateAgencyProfile);
router.get("/profile", authenticate, getAgencyProfile);
router.post("/documents", authenticate, uploadAgencyDocuments);
router.get("/dashboard/stats", authenticate, getAgencyDashboardStats);

// Public routes
router.get("/all", getAllAgencies);
router.get("/:id", getAgencyById);

export default router;

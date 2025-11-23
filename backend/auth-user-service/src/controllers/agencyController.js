import Agency from "../models/Agency.js";
import User from "../models/User.js";

// Create/Update Agency Profile
export const createOrUpdateAgencyProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Check if user has agency role
        const user = await User.findById(userId);
        if (user.role !== "agency") {
            return res.status(403).json({
                success: false,
                message: "User must have agency role"
            });
        }

        const {
            companyName,
            companyRegistrationNumber,
            description,
            address,
            phone,
            email,
            logo,
            operatingHours,
            services,
            bankDetails
        } = req.body;

        let agency = await Agency.findOne({ userId });

        if (agency) {
            // Update existing agency
            agency.companyName = companyName || agency.companyName;
            agency.companyRegistrationNumber = companyRegistrationNumber || agency.companyRegistrationNumber;
            agency.description = description || agency.description;
            agency.address = address || agency.address;
            agency.phone = phone || agency.phone;
            agency.email = email || agency.email;
            agency.logo = logo || agency.logo;
            agency.operatingHours = operatingHours || agency.operatingHours;
            agency.services = services || agency.services;
            agency.bankDetails = bankDetails || agency.bankDetails;

            await agency.save();

            return res.status(200).json({
                success: true,
                message: "Agency profile updated successfully",
                data: agency
            });
        } else {
            // Create new agency
            agency = new Agency({
                userId,
                companyName,
                companyRegistrationNumber,
                description,
                address,
                phone,
                email,
                logo,
                operatingHours,
                services,
                bankDetails
            });

            await agency.save();

            return res.status(201).json({
                success: true,
                message: "Agency profile created successfully",
                data: agency
            });
        }
    } catch (error) {
        console.error("Error creating/updating agency profile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get Agency Profile
export const getAgencyProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const agency = await Agency.findOne({ userId }).populate("userId", "username email");

        if (!agency) {
            return res.status(404).json({
                success: false,
                message: "Agency profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: agency
        });
    } catch (error) {
        console.error("Error fetching agency profile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get Agency by ID (public)
export const getAgencyById = async (req, res) => {
    try {
        const { id } = req.params;

        const agency = await Agency.findById(id).populate("userId", "username email");

        if (!agency) {
            return res.status(404).json({
                success: false,
                message: "Agency not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: agency
        });
    } catch (error) {
        console.error("Error fetching agency:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get All Agencies (public)
export const getAllAgencies = async (req, res) => {
    try {
        const { city, status, page = 1, limit = 10, search } = req.query;

        const query = {};

        if (city) {
            query["address.city"] = city;
        }

        if (status) {
            query.status = status;
        } else {
            query.status = "approved"; // Only show approved agencies by default
        }

        if (search) {
            query.$text = { $search: search };
        }

        const agencies = await Agency.find(query)
            .populate("userId", "username email")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Agency.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: agencies,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        console.error("Error fetching agencies:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Upload Agency Documents
export const uploadAgencyDocuments = async (req, res) => {
    try {
        const userId = req.user._id;
        const { type, url } = req.body;

        const agency = await Agency.findOne({ userId });

        if (!agency) {
            return res.status(404).json({
                success: false,
                message: "Agency profile not found"
            });
        }

        agency.documents.push({
            type,
            url,
            verified: false
        });

        await agency.save();

        return res.status(200).json({
            success: true,
            message: "Document uploaded successfully",
            data: agency
        });
    } catch (error) {
        console.error("Error uploading document:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update Agency Statistics (internal use)
export const updateAgencyStatistics = async (agencyId, updateData) => {
    const agency = await Agency.findById(agencyId);
    if (!agency) {
        throw new Error("Agency not found");
    }

    if (updateData.totalBookings !== undefined) {
        agency.statistics.totalBookings += updateData.totalBookings;
    }
    if (updateData.totalRevenue !== undefined) {
        agency.statistics.totalRevenue += updateData.totalRevenue;
    }
    if (updateData.activeVehicles !== undefined) {
        agency.statistics.activeVehicles = updateData.activeVehicles;
    }
    if (updateData.completedBookings !== undefined) {
        agency.statistics.completedBookings += updateData.completedBookings;
    }

    await agency.save();
    return agency;
};

// Get Agency Dashboard Statistics
export const getAgencyDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const agency = await Agency.findOne({ userId });

        if (!agency) {
            return res.status(404).json({
                success: false,
                message: "Agency profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                statistics: agency.statistics,
                status: agency.status,
                rating: agency.rating,
                isVerified: agency.isVerified
            }
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

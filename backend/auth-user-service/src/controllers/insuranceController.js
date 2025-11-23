import Insurance from "../models/Insurance.js";
import User from "../models/User.js";

// Create/Update Insurance Profile
export const createOrUpdateInsuranceProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Check if user has insurance role
        const user = await User.findById(userId);
        if (user.role !== "insurance") {
            return res.status(403).json({
                success: false,
                message: "User must have insurance role"
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
            licenseNumber,
            operatingHours,
            coverageTypes,
            bankDetails
        } = req.body;

        let insurance = await Insurance.findOne({ userId });

        if (insurance) {
            // Update existing insurance
            insurance.companyName = companyName || insurance.companyName;
            insurance.companyRegistrationNumber = companyRegistrationNumber || insurance.companyRegistrationNumber;
            insurance.description = description || insurance.description;
            insurance.address = address || insurance.address;
            insurance.phone = phone || insurance.phone;
            insurance.email = email || insurance.email;
            insurance.logo = logo || insurance.logo;
            insurance.licenseNumber = licenseNumber || insurance.licenseNumber;
            insurance.operatingHours = operatingHours || insurance.operatingHours;
            insurance.coverageTypes = coverageTypes || insurance.coverageTypes;
            insurance.bankDetails = bankDetails || insurance.bankDetails;

            await insurance.save();

            return res.status(200).json({
                success: true,
                message: "Insurance profile updated successfully",
                data: insurance
            });
        } else {
            // Create new insurance
            insurance = new Insurance({
                userId,
                companyName,
                companyRegistrationNumber,
                description,
                address,
                phone,
                email,
                logo,
                licenseNumber,
                operatingHours,
                coverageTypes,
                bankDetails
            });

            await insurance.save();

            return res.status(201).json({
                success: true,
                message: "Insurance profile created successfully",
                data: insurance
            });
        }
    } catch (error) {
        console.error("Error creating/updating insurance profile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get Insurance Profile
export const getInsuranceProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const insurance = await Insurance.findOne({ userId }).populate("userId", "username email");

        if (!insurance) {
            return res.status(404).json({
                success: false,
                message: "Insurance profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: insurance
        });
    } catch (error) {
        console.error("Error fetching insurance profile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get Insurance by ID (public)
export const getInsuranceById = async (req, res) => {
    try {
        const { id } = req.params;

        const insurance = await Insurance.findById(id).populate("userId", "username email");

        if (!insurance) {
            return res.status(404).json({
                success: false,
                message: "Insurance company not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: insurance
        });
    } catch (error) {
        console.error("Error fetching insurance:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get All Insurance Companies (public)
export const getAllInsuranceCompanies = async (req, res) => {
    try {
        const { city, status, page = 1, limit = 10, search } = req.query;

        const query = {};

        if (city) {
            query["address.city"] = city;
        }

        if (status) {
            query.status = status;
        } else {
            query.status = "approved"; // Only show approved companies by default
        }

        if (search) {
            query.$text = { $search: search };
        }

        const insuranceCompanies = await Insurance.find(query)
            .populate("userId", "username email")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Insurance.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: insuranceCompanies,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        console.error("Error fetching insurance companies:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Upload Insurance Documents
export const uploadInsuranceDocuments = async (req, res) => {
    try {
        const userId = req.user._id;
        const { type, url } = req.body;

        const insurance = await Insurance.findOne({ userId });

        if (!insurance) {
            return res.status(404).json({
                success: false,
                message: "Insurance profile not found"
            });
        }

        insurance.documents.push({
            type,
            url,
            verified: false
        });

        await insurance.save();

        return res.status(200).json({
            success: true,
            message: "Document uploaded successfully",
            data: insurance
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

// Update Insurance Statistics (internal use)
export const updateInsuranceStatistics = async (insuranceId, updateData) => {
    const insurance = await Insurance.findById(insuranceId);
    if (!insurance) {
        throw new Error("Insurance company not found");
    }

    if (updateData.totalPolicies !== undefined) {
        insurance.statistics.totalPolicies += updateData.totalPolicies;
    }
    if (updateData.activePolicies !== undefined) {
        insurance.statistics.activePolicies = updateData.activePolicies;
    }
    if (updateData.totalClaims !== undefined) {
        insurance.statistics.totalClaims += updateData.totalClaims;
    }
    if (updateData.approvedClaims !== undefined) {
        insurance.statistics.approvedClaims += updateData.approvedClaims;
    }
    if (updateData.totalRevenue !== undefined) {
        insurance.statistics.totalRevenue += updateData.totalRevenue;
    }

    await insurance.save();
    return insurance;
};

// Get Insurance Dashboard Statistics
export const getInsuranceDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const insurance = await Insurance.findOne({ userId });

        if (!insurance) {
            return res.status(404).json({
                success: false,
                message: "Insurance profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                statistics: insurance.statistics,
                status: insurance.status,
                rating: insurance.rating,
                isVerified: insurance.isVerified
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

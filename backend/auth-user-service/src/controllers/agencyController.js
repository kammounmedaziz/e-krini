import Agency from "../models/Agency.js";
import User from "../models/User.js";

// Create/Update Agency Profile
export const createOrUpdateAgencyProfile = async (req, res) => {
    try {
        console.log('=== Agency Profile Request ===');
        console.log('req.user:', req.user);
        console.log('User ID from token:', req.user?.id);
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        
        const userId = req.user.id; // JWT payload uses 'id' not '_id'
        
        // Check if user has agency role
        const user = await User.findById(userId);
        console.log('User found:', user?.username, 'Role:', user?.role);
        
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
            console.log('Creating new agency with data:', {
                userId,
                companyName,
                companyRegistrationNumber,
                phone,
                email
            });
            
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

            console.log('About to save new agency...');
            await agency.save();
            console.log('Agency saved successfully:', agency._id);

            return res.status(201).json({
                success: true,
                message: "Agency profile created successfully",
                data: agency
            });
        }
    } catch (error) {
        console.error("Error creating/updating agency profile:", error);
        console.error("Error details:", {
            name: error.name,
            message: error.message,
            code: error.code,
            keyPattern: error.keyPattern
        });
        
        // Handle duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({
                success: false,
                message: `${field} already exists. Please use a different value.`,
                error: error.message
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors
            });
        }
        
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
        const userId = req.user.id; // JWT payload uses 'id' not '_id'

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

// Upload agency documents
export const uploadAgencyDocuments = async (req, res) => {
    try {
        const userId = req.user.id; // JWT payload uses 'id' not '_id'
        const files = req.files;

        if (!files || Object.keys(files).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded"
            });
        }

        const agency = await Agency.findOne({ userId });

        if (!agency) {
            return res.status(404).json({
                success: false,
                message: "Agency profile not found. Please create your profile first."
            });
        }

        // Process uploaded files
        const documentTypeMapping = {
            'businessLicense': 'license',
            'insuranceCertificate': 'insurance',
            'taxDocument': 'registration'
        };
        const uploadedDocs = [];

        Object.keys(files).forEach(fieldName => {
            if (files[fieldName] && files[fieldName][0]) {
                const file = files[fieldName][0];
                const docUrl = `uploads/agency/${file.filename}`;
                const validType = documentTypeMapping[fieldName] || 'other';
                
                agency.documents.push({
                    type: validType,
                    url: docUrl,
                    verified: false,
                    uploadedAt: new Date()
                });

                uploadedDocs.push(fieldName);
            }
        });

        await agency.save();

        return res.status(200).json({
            success: true,
            message: `Documents uploaded successfully: ${uploadedDocs.join(', ')}`,
            data: {
                uploadedDocuments: uploadedDocs,
                agency: agency
            }
        });
    } catch (error) {
        console.error("Error uploading documents:", error);
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

// Get Agency Dashboard Stats
export const getAgencyDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id; // JWT payload uses 'id' not '_id'

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

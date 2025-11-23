import User from '../models/User.js';
import Agency from '../models/Agency.js';

// Get all agency USERS (users with role='agency') 
// This shows all registered agencies even if they haven't completed profile
export const getAllAgencyUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            kycStatus = '',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query for users with agency role
        const query = { role: 'agency' };
        
        // Search by username or email
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by KYC status
        if (kycStatus && ['pending', 'approved', 'rejected'].includes(kycStatus)) {
            query.kycStatus = kycStatus;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query
        const users = await User.find(query)
            .select('-password -refreshTokens -faceEncoding')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        // For each user, check if they have an agency profile
        const usersWithProfiles = await Promise.all(
            users.map(async (user) => {
                const agency = await Agency.findOne({ userId: user._id });
                return {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    kycStatus: user.kycStatus,
                    isBanned: user.isBanned,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    hasProfile: !!agency,
                    profile: agency ? {
                        _id: agency._id,
                        companyName: agency.companyName,
                        companyRegistrationNumber: agency.companyRegistrationNumber,
                        status: agency.status,
                        phone: agency.phone,
                        email: agency.email,
                        address: agency.address,
                        rating: agency.rating,
                        isVerified: agency.isVerified
                    } : null
                };
            })
        );

        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / parseInt(limit));

        res.json({
            success: true,
            data: {
                agencies: usersWithProfiles,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalAgencies: totalUsers,
                    limit: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            },
            message: 'Agency users retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting agency users:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while retrieving agencies'
            }
        });
    }
};

// Get all insurance USERS (users with role='insurance')
export const getAllInsuranceUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            kycStatus = '',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query for users with insurance role
        const query = { role: 'insurance' };
        
        // Search by username or email
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by KYC status
        if (kycStatus && ['pending', 'approved', 'rejected'].includes(kycStatus)) {
            query.kycStatus = kycStatus;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query
        const users = await User.find(query)
            .select('-password -refreshTokens -faceEncoding')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        // For each user, check if they have an insurance profile
        const Insurance = (await import('../models/Insurance.js')).default;
        const usersWithProfiles = await Promise.all(
            users.map(async (user) => {
                const insurance = await Insurance.findOne({ userId: user._id });
                return {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    kycStatus: user.kycStatus,
                    isBanned: user.isBanned,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    hasProfile: !!insurance,
                    profile: insurance ? {
                        _id: insurance._id,
                        companyName: insurance.companyName,
                        companyRegistrationNumber: insurance.companyRegistrationNumber,
                        licenseNumber: insurance.licenseNumber,
                        status: insurance.status,
                        phone: insurance.phone,
                        email: insurance.email,
                        address: insurance.address,
                        rating: insurance.rating,
                        isVerified: insurance.isVerified
                    } : null
                };
            })
        );

        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / parseInt(limit));

        res.json({
            success: true,
            data: {
                companies: usersWithProfiles,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalCompanies: totalUsers,
                    limit: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            },
            message: 'Insurance users retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting insurance users:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while retrieving insurance companies'
            }
        });
    }
};

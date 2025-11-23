import Agency from '../models/Agency.js';
import User from '../models/User.js';

// Get all agencies with pagination and filtering
// This fetches users with role='agency' and includes their profile if it exists
export const getAllAgencies = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            status = '',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query for users with agency role
        const userQuery = { role: 'agency' };
        
        // Search by username or email
        if (search) {
            userQuery.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Get users with agency role
        const users = await User.find(userQuery)
            .select('-password -refreshTokens -faceEncoding')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        // For each user, get their agency profile if exists
        const agenciesWithUsers = await Promise.all(
            users.map(async (user) => {
                const agency = await Agency.findOne({ userId: user._id });
                
                // If filtering by status and no profile, skip
                if (status && !agency) {
                    return null;
                }
                
                // If filtering by status and profile status doesn't match, skip
                if (status && agency && agency.status !== status) {
                    return null;
                }
                
                // Return combined data
                return {
                    _id: agency?._id || user._id,
                    userId: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        kycStatus: user.kycStatus,
                        createdAt: user.createdAt
                    },
                    hasProfile: !!agency,
                    companyName: agency?.companyName || user.username,
                    companyRegistrationNumber: agency?.companyRegistrationNumber || 'N/A',
                    description: agency?.description || '',
                    address: agency?.address || {},
                    phone: agency?.phone || user.phone || '',
                    email: agency?.email || user.email,
                    logo: agency?.logo || user.profilePicture,
                    operatingHours: agency?.operatingHours || {},
                    status: agency?.status || 'pending',
                    statusNotes: agency?.statusNotes || '',
                    reviewedBy: agency?.reviewedBy || null,
                    reviewedAt: agency?.reviewedAt || null,
                    rating: agency?.rating || { average: 0, count: 0 },
                    services: agency?.services || [],
                    documents: agency?.documents || [],
                    bankDetails: agency?.bankDetails || {},
                    statistics: agency?.statistics || {
                        totalBookings: 0,
                        totalRevenue: 0,
                        activeVehicles: 0,
                        completedBookings: 0
                    },
                    isVerified: agency?.isVerified || false,
                    createdAt: agency?.createdAt || user.createdAt,
                    updatedAt: agency?.updatedAt || user.updatedAt
                };
            })
        );

        // Filter out nulls (from status filtering)
        const agencies = agenciesWithUsers.filter(a => a !== null);

        const totalUsers = await User.countDocuments(userQuery);
        const totalAgencies = status ? agencies.length : totalUsers;
        const totalPages = Math.ceil(totalAgencies / parseInt(limit));

        res.json({
            success: true,
            data: {
                agencies,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalAgencies,
                    limit: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            },
            message: 'Agencies retrieved successfully'
        });
    } catch (error) {
        console.error('Get all agencies error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while retrieving agencies'
            }
        });
    }
};

// Get agency by ID
export const getAgencyById = async (req, res) => {
    try {
        const { agencyId } = req.params;

        const agency = await Agency.findById(agencyId)
            .populate('userId', 'username email createdAt');

        if (!agency) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'AGENCY_NOT_FOUND',
                    message: 'Agency not found'
                }
            });
        }

        res.json({
            success: true,
            data: { agency },
            message: 'Agency retrieved successfully'
        });
    } catch (error) {
        console.error('Get agency by ID error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while retrieving agency'
            }
        });
    }
};

// Approve agency
export const approveAgency = async (req, res) => {
    try {
        const { agencyId } = req.params;
        const { notes } = req.body;

        const agency = await Agency.findById(agencyId);

        if (!agency) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'AGENCY_NOT_FOUND',
                    message: 'Agency not found'
                }
            });
        }

        agency.status = 'approved';
        agency.statusNotes = notes || 'Approved by admin';
        agency.reviewedAt = new Date();
        agency.reviewedBy = req.user.id;

        await agency.save();

        res.json({
            success: true,
            data: { agency },
            message: 'Agency approved successfully'
        });
    } catch (error) {
        console.error('Approve agency error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while approving agency'
            }
        });
    }
};

// Reject agency
export const rejectAgency = async (req, res) => {
    try {
        const { agencyId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'REASON_REQUIRED',
                    message: 'Rejection reason is required'
                }
            });
        }

        const agency = await Agency.findById(agencyId);

        if (!agency) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'AGENCY_NOT_FOUND',
                    message: 'Agency not found'
                }
            });
        }

        agency.status = 'rejected';
        agency.statusNotes = reason;
        agency.reviewedAt = new Date();
        agency.reviewedBy = req.user.id;

        await agency.save();

        res.json({
            success: true,
            data: { agency },
            message: 'Agency rejected successfully'
        });
    } catch (error) {
        console.error('Reject agency error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while rejecting agency'
            }
        });
    }
};

// Suspend agency
export const suspendAgency = async (req, res) => {
    try {
        const { agencyId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'REASON_REQUIRED',
                    message: 'Suspension reason is required'
                }
            });
        }

        const agency = await Agency.findById(agencyId);

        if (!agency) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'AGENCY_NOT_FOUND',
                    message: 'Agency not found'
                }
            });
        }

        agency.status = 'suspended';
        agency.statusNotes = reason;
        agency.reviewedAt = new Date();
        agency.reviewedBy = req.user.id;

        await agency.save();

        res.json({
            success: true,
            data: { agency },
            message: 'Agency suspended successfully'
        });
    } catch (error) {
        console.error('Suspend agency error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while suspending agency'
            }
        });
    }
};

// Delete agency
export const deleteAgency = async (req, res) => {
    try {
        const { agencyId } = req.params;

        const agency = await Agency.findById(agencyId);

        if (!agency) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'AGENCY_NOT_FOUND',
                    message: 'Agency not found'
                }
            });
        }

        await Agency.findByIdAndDelete(agencyId);

        res.json({
            success: true,
            message: 'Agency deleted successfully'
        });
    } catch (error) {
        console.error('Delete agency error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while deleting agency'
            }
        });
    }
};

// Get agency statistics
export const getAgencyStatistics = async (req, res) => {
    try {
        const totalAgencies = await Agency.countDocuments();
        const pendingAgencies = await Agency.countDocuments({ status: 'pending' });
        const approvedAgencies = await Agency.countDocuments({ status: 'approved' });
        const suspendedAgencies = await Agency.countDocuments({ status: 'suspended' });
        const rejectedAgencies = await Agency.countDocuments({ status: 'rejected' });

        // Get agencies registered in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newAgenciesLast30Days = await Agency.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.json({
            success: true,
            data: {
                totalAgencies,
                pendingAgencies,
                approvedAgencies,
                suspendedAgencies,
                rejectedAgencies,
                newAgenciesLast30Days
            },
            message: 'Agency statistics retrieved successfully'
        });
    } catch (error) {
        console.error('Get agency statistics error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while retrieving agency statistics'
            }
        });
    }
};

import Insurance from '../models/Insurance.js';
import User from '../models/User.js';

// Get all insurance companies with pagination and filtering
// This fetches users with role='insurance' and includes their profile if it exists
export const getAllInsuranceCompanies = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            status = '',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query for users with insurance role
        const userQuery = { role: 'insurance' };
        
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

        // Get users with insurance role
        const users = await User.find(userQuery)
            .select('-password -refreshTokens -faceEncoding')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        // For each user, get their insurance profile if exists
        const companiesWithUsers = await Promise.all(
            users.map(async (user) => {
                const insurance = await Insurance.findOne({ userId: user._id });
                
                // If filtering by status and no profile, skip
                if (status && !insurance) {
                    return null;
                }
                
                // If filtering by status and profile status doesn't match, skip
                if (status && insurance && insurance.status !== status) {
                    return null;
                }
                
                // Return combined data
                return {
                    _id: insurance?._id || user._id,
                    userId: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        kycStatus: user.kycStatus,
                        createdAt: user.createdAt
                    },
                    hasProfile: !!insurance,
                    companyName: insurance?.companyName || user.username,
                    companyRegistrationNumber: insurance?.companyRegistrationNumber || 'N/A',
                    licenseNumber: insurance?.licenseNumber || 'N/A',
                    description: insurance?.description || '',
                    address: insurance?.address || {},
                    phone: insurance?.phone || user.phone || '',
                    email: insurance?.email || user.email,
                    logo: insurance?.logo || user.profilePicture,
                    operatingHours: insurance?.operatingHours || {},
                    status: insurance?.status || 'pending',
                    statusNotes: insurance?.statusNotes || '',
                    reviewedBy: insurance?.reviewedBy || null,
                    reviewedAt: insurance?.reviewedAt || null,
                    rating: insurance?.rating || { average: 0, count: 0 },
                    coverageTypes: insurance?.coverageTypes || [],
                    documents: insurance?.documents || [],
                    bankDetails: insurance?.bankDetails || {},
                    statistics: insurance?.statistics || {
                        totalPolicies: 0,
                        activePolicies: 0,
                        totalClaims: 0,
                        settledClaims: 0
                    },
                    isVerified: insurance?.isVerified || false,
                    createdAt: insurance?.createdAt || user.createdAt,
                    updatedAt: insurance?.updatedAt || user.updatedAt
                };
            })
        );

        // Filter out nulls (from status filtering)
        const companies = companiesWithUsers.filter(c => c !== null);

        const totalUsers = await User.countDocuments(userQuery);
        const totalCompanies = status ? companies.length : totalUsers;
        const totalPages = Math.ceil(totalCompanies / parseInt(limit));

        res.json({
            success: true,
            data: {
                companies,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalCompanies,
                    limit: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            },
            message: 'Insurance companies retrieved successfully'
        });
    } catch (error) {
        console.error('Get all insurance companies error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while retrieving insurance companies'
            }
        });
    }
};

// Get insurance company by ID
export const getInsuranceById = async (req, res) => {
    try {
        const { insuranceId } = req.params;

        const company = await Insurance.findById(insuranceId)
            .populate('userId', 'username email createdAt');

        if (!company) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'INSURANCE_NOT_FOUND',
                    message: 'Insurance company not found'
                }
            });
        }

        res.json({
            success: true,
            data: { company },
            message: 'Insurance company retrieved successfully'
        });
    } catch (error) {
        console.error('Get insurance by ID error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while retrieving insurance company'
            }
        });
    }
};

// Approve insurance company
export const approveInsurance = async (req, res) => {
    try {
        const { insuranceId } = req.params;
        const { notes } = req.body;

        const company = await Insurance.findById(insuranceId);

        if (!company) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'INSURANCE_NOT_FOUND',
                    message: 'Insurance company not found'
                }
            });
        }

        company.status = 'approved';
        company.statusNotes = notes || 'Approved by admin';
        company.reviewedAt = new Date();
        company.reviewedBy = req.user.id;

        await company.save();

        res.json({
            success: true,
            data: { company },
            message: 'Insurance company approved successfully'
        });
    } catch (error) {
        console.error('Approve insurance error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while approving insurance company'
            }
        });
    }
};

// Reject insurance company
export const rejectInsurance = async (req, res) => {
    try {
        const { insuranceId } = req.params;
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

        const company = await Insurance.findById(insuranceId);

        if (!company) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'INSURANCE_NOT_FOUND',
                    message: 'Insurance company not found'
                }
            });
        }

        company.status = 'rejected';
        company.statusNotes = reason;
        company.reviewedAt = new Date();
        company.reviewedBy = req.user.id;

        await company.save();

        res.json({
            success: true,
            data: { company },
            message: 'Insurance company rejected successfully'
        });
    } catch (error) {
        console.error('Reject insurance error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while rejecting insurance company'
            }
        });
    }
};

// Suspend insurance company
export const suspendInsurance = async (req, res) => {
    try {
        const { insuranceId } = req.params;
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

        const company = await Insurance.findById(insuranceId);

        if (!company) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'INSURANCE_NOT_FOUND',
                    message: 'Insurance company not found'
                }
            });
        }

        company.status = 'suspended';
        company.statusNotes = reason;
        company.reviewedAt = new Date();
        company.reviewedBy = req.user.id;

        await company.save();

        res.json({
            success: true,
            data: { company },
            message: 'Insurance company suspended successfully'
        });
    } catch (error) {
        console.error('Suspend insurance error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while suspending insurance company'
            }
        });
    }
};

// Delete insurance company
export const deleteInsurance = async (req, res) => {
    try {
        const { insuranceId } = req.params;

        const company = await Insurance.findById(insuranceId);

        if (!company) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'INSURANCE_NOT_FOUND',
                    message: 'Insurance company not found'
                }
            });
        }

        await Insurance.findByIdAndDelete(insuranceId);

        res.json({
            success: true,
            message: 'Insurance company deleted successfully'
        });
    } catch (error) {
        console.error('Delete insurance error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while deleting insurance company'
            }
        });
    }
};

// Get insurance statistics
export const getInsuranceStatistics = async (req, res) => {
    try {
        const totalCompanies = await Insurance.countDocuments();
        const pendingCompanies = await Insurance.countDocuments({ status: 'pending' });
        const approvedCompanies = await Insurance.countDocuments({ status: 'approved' });
        const suspendedCompanies = await Insurance.countDocuments({ status: 'suspended' });
        const rejectedCompanies = await Insurance.countDocuments({ status: 'rejected' });

        // Get companies registered in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newCompaniesLast30Days = await Insurance.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.json({
            success: true,
            data: {
                totalCompanies,
                pendingCompanies,
                approvedCompanies,
                suspendedCompanies,
                rejectedCompanies,
                newCompaniesLast30Days
            },
            message: 'Insurance statistics retrieved successfully'
        });
    } catch (error) {
        console.error('Get insurance statistics error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while retrieving insurance statistics'
            }
        });
    }
};

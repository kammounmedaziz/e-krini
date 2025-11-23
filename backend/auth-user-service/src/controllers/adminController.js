import User from '../models/User.js';
import { Parser } from 'json2csv';

// Create audit log helper
const createAuditLog = async (adminId, action, targetUserId, details) => {
    // In a real application, store this in a separate AuditLog collection
    console.log(`[AUDIT] Admin ${adminId} performed ${action} on user ${targetUserId}`, details);
    // For now, we'll just log it. Later you can create an AuditLog model
};

// Get all users with pagination, filtering, sorting
export const getAllUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            role = '',
            kycStatus = '',
            isBanned = '',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = {};
        
        // Search by username or email
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by role
        if (role && ['client', 'admin', 'agency', 'insurance'].includes(role)) {
            query.role = role;
        }

        // Filter by KYC status
        if (kycStatus && ['pending', 'approved', 'rejected'].includes(kycStatus)) {
            query.kycStatus = kycStatus;
        }

        // Filter by banned status
        if (isBanned !== '') {
            query.isBanned = isBanned === 'true';
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query
        const users = await User.find(query)
            .select('-password -refreshTokens -faceImages -passwordResetToken -passwordResetTokenExpires')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / parseInt(limit));

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalUsers,
                    limit: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            },
            message: 'Users retrieved successfully'
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while retrieving users'
            }
        });
    }
};

// Get user by ID (detailed view)
export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .select('-password -refreshTokens -faceImages -passwordResetToken -passwordResetTokenExpires')
            .populate('bannedBy', 'username email');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
        }

        res.json({
            success: true,
            data: { user },
            message: 'User retrieved successfully'
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while retrieving user'
            }
        });
    }
};

// Update user (admin privilege)
export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { username, email, kycStatus, role } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
        }

        // Update allowed fields
        if (username) user.username = username;
        if (email) user.email = email;
        if (kycStatus && ['pending', 'approved', 'rejected'].includes(kycStatus)) {
            user.kycStatus = kycStatus;
        }
        if (role && ['client', 'admin', 'agency'].includes(role)) {
            user.role = role;
        }

        await user.save();

        // Create audit log
        await createAuditLog(req.user.id, 'UPDATE_USER', userId, { username, email, kycStatus, role });

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    kycStatus: user.kycStatus
                }
            },
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while updating user'
            }
        });
    }
};

// Delete user account
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Prevent admin from deleting themselves
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'CANNOT_DELETE_SELF',
                    message: 'You cannot delete your own account'
                }
            });
        }

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
        }

        // Create audit log
        await createAuditLog(req.user.id, 'DELETE_USER', userId, { username: user.username, email: user.email });

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while deleting user'
            }
        });
    }
};

// Ban user
export const banUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason = 'No reason provided' } = req.body;

        // Prevent admin from banning themselves
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'CANNOT_BAN_SELF',
                    message: 'You cannot ban your own account'
                }
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
        }

        if (user.isBanned) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'USER_ALREADY_BANNED',
                    message: 'User is already banned'
                }
            });
        }

        user.isBanned = true;
        user.banReason = reason;
        user.bannedAt = new Date();
        user.bannedBy = req.user.id;
        await user.save();

        // Create audit log
        await createAuditLog(req.user.id, 'BAN_USER', userId, { reason });

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    isBanned: user.isBanned,
                    banReason: user.banReason,
                    bannedAt: user.bannedAt
                }
            },
            message: 'User banned successfully'
        });
    } catch (error) {
        console.error('Ban user error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while banning user'
            }
        });
    }
};

// Unban user
export const unbanUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
        }

        if (!user.isBanned) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'USER_NOT_BANNED',
                    message: 'User is not banned'
                }
            });
        }

        user.isBanned = false;
        user.banReason = null;
        user.bannedAt = null;
        user.bannedBy = null;
        await user.save();

        // Create audit log
        await createAuditLog(req.user.id, 'UNBAN_USER', userId, {});

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    isBanned: user.isBanned
                }
            },
            message: 'User unbanned successfully'
        });
    } catch (error) {
        console.error('Unban user error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while unbanning user'
            }
        });
    }
};

// Change user role
export const changeUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!role || !['client', 'admin', 'agency'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_ROLE',
                    message: 'Invalid role. Must be one of: client, admin, agency'
                }
            });
        }

        // Prevent admin from changing their own role
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'CANNOT_CHANGE_OWN_ROLE',
                    message: 'You cannot change your own role'
                }
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
        }

        const oldRole = user.role;
        user.role = role;
        await user.save();

        // Create audit log
        await createAuditLog(req.user.id, 'CHANGE_ROLE', userId, { oldRole, newRole: role });

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role
                }
            },
            message: 'User role changed successfully'
        });
    } catch (error) {
        console.error('Change user role error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while changing user role'
            }
        });
    }
};

// Get user statistics
export const getUserStatistics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalClients = await User.countDocuments({ role: 'client' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalAgencies = await User.countDocuments({ role: 'agency' });
        const totalInsurance = await User.countDocuments({ role: 'insurance' });
        const bannedUsers = await User.countDocuments({ isBanned: true });
        const activeUsers = await User.countDocuments({ isActive: true });
        const pendingKYC = await User.countDocuments({ kycStatus: 'pending' });
        const approvedKYC = await User.countDocuments({ kycStatus: 'approved' });
        const rejectedKYC = await User.countDocuments({ kycStatus: 'rejected' });

        // Get users registered in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsersLast30Days = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Get registration trend (last 7 days)
        const registrationTrend = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            
            const count = await User.countDocuments({
                createdAt: {
                    $gte: date,
                    $lt: nextDate
                }
            });
            
            registrationTrend.push({
                date: date.toISOString().split('T')[0],
                count
            });
        }

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalClients,
                    totalAdmins,
                    totalAgencies,
                    totalInsurance,
                    bannedUsers,
                    activeUsers,
                    newUsersLast30Days
                },
                kyc: {
                    pending: pendingKYC,
                    approved: approvedKYC,
                    rejected: rejectedKYC
                },
                registrationTrend
            },
            message: 'Statistics retrieved successfully'
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while retrieving statistics'
            }
        });
    }
};

// Export users to CSV
export const exportUsersToCSV = async (req, res) => {
    try {
        const {
            role = '',
            kycStatus = '',
            isBanned = ''
        } = req.query;

        // Build query
        const query = {};
        if (role && ['client', 'admin', 'agency', 'insurance'].includes(role)) {
            query.role = role;
        }
        if (kycStatus && ['pending', 'approved', 'rejected'].includes(kycStatus)) {
            query.kycStatus = kycStatus;
        }
        if (isBanned !== '') {
            query.isBanned = isBanned === 'true';
        }

        const users = await User.find(query)
            .select('-password -refreshTokens -faceImages -passwordResetToken -passwordResetTokenExpires')
            .lean();

        // Prepare data for CSV
        const csvData = users.map(user => ({
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
            kycStatus: user.kycStatus,
            isBanned: user.isBanned,
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt || 'Never',
            loginCount: user.loginCount || 0
        }));

        // Convert to CSV
        const parser = new Parser({
            fields: ['id', 'username', 'email', 'role', 'kycStatus', 'isBanned', 'isActive', 'createdAt', 'lastLoginAt', 'loginCount']
        });
        const csv = parser.parse(csvData);

        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=users-export-${Date.now()}.csv`);
        res.send(csv);

        // Create audit log
        await createAuditLog(req.user.id, 'EXPORT_USERS', null, { count: users.length, filters: query });
    } catch (error) {
        console.error('Export users error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while exporting users'
            }
        });
    }
};

// Bulk operations
export const bulkDeleteUsers = async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: 'userIds must be a non-empty array'
                }
            });
        }

        // Prevent deleting self
        if (userIds.includes(req.user.id)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'CANNOT_DELETE_SELF',
                    message: 'Cannot delete your own account'
                }
            });
        }

        const result = await User.deleteMany({
            _id: { $in: userIds }
        });

        // Create audit log
        await createAuditLog(req.user.id, 'BULK_DELETE', null, { count: result.deletedCount, userIds });

        res.json({
            success: true,
            data: {
                deletedCount: result.deletedCount
            },
            message: `Successfully deleted ${result.deletedCount} user(s)`
        });
    } catch (error) {
        console.error('Bulk delete users error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred during bulk delete'
            }
        });
    }
};

export const bulkUpdateRole = async (req, res) => {
    try {
        const { userIds, role } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: 'userIds must be a non-empty array'
                }
            });
        }

        if (!role || !['client', 'admin', 'agency'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_ROLE',
                    message: 'Invalid role'
                }
            });
        }

        // Prevent changing own role
        if (userIds.includes(req.user.id)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'CANNOT_CHANGE_OWN_ROLE',
                    message: 'Cannot change your own role'
                }
            });
        }

        const result = await User.updateMany(
            { _id: { $in: userIds } },
            { $set: { role } }
        );

        // Create audit log
        await createAuditLog(req.user.id, 'BULK_UPDATE_ROLE', null, { count: result.modifiedCount, role, userIds });

        res.json({
            success: true,
            data: {
                updatedCount: result.modifiedCount
            },
            message: `Successfully updated ${result.modifiedCount} user(s)`
        });
    } catch (error) {
        console.error('Bulk update role error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred during bulk update'
            }
        });
    }
};

export const bulkBanUsers = async (req, res) => {
    try {
        const { userIds, reason = 'Bulk ban by admin' } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: 'userIds must be a non-empty array'
                }
            });
        }

        // Prevent banning self
        if (userIds.includes(req.user.id)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'CANNOT_BAN_SELF',
                    message: 'Cannot ban your own account'
                }
            });
        }

        const result = await User.updateMany(
            { _id: { $in: userIds }, isBanned: false },
            {
                $set: {
                    isBanned: true,
                    banReason: reason,
                    bannedAt: new Date(),
                    bannedBy: req.user.id
                }
            }
        );

        // Create audit log
        await createAuditLog(req.user.id, 'BULK_BAN', null, { count: result.modifiedCount, reason, userIds });

        res.json({
            success: true,
            data: {
                bannedCount: result.modifiedCount
            },
            message: `Successfully banned ${result.modifiedCount} user(s)`
        });
    } catch (error) {
        console.error('Bulk ban users error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred during bulk ban'
            }
        });
    }
};

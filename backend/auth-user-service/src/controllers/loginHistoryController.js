import LoginHistory from '../models/LoginHistory.js';
import User from '../models/User.js';
import { sendLoginNotificationEmail } from '../utils/emailService.js';

// Helper to parse user agent
const parseUserAgent = (userAgent) => {
    if (!userAgent) return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' };
    
    const device = /mobile|android|iphone|ipad|tablet/i.test(userAgent) ? 'Mobile' : 'Desktop';
    
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';
    
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';
    
    return { device, browser, os };
};

// Create login history entry
export const createLoginHistory = async (userId, req, status = 'success', loginType = 'password', failureReason = null) => {
    try {
        const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
        const userAgent = req.headers['user-agent'] || '';
        const { device, browser, os } = parseUserAgent(userAgent);

        const loginEntry = new LoginHistory({
            userId,
            loginType,
            status,
            ipAddress,
            userAgent,
            device,
            browser,
            os,
            failureReason,
            timestamp: new Date()
        });

        await loginEntry.save();

        // Send email notification for successful logins
        if (status === 'success') {
            try {
                const user = await User.findById(userId);
                if (user && user.email) {
                    await sendLoginNotificationEmail(user.email, user.username, {
                        ipAddress,
                        device,
                        location: 'Unknown', // Can be enhanced with IP geolocation
                        timestamp: new Date()
                    });
                }
            } catch (emailError) {
                console.error('Failed to send login notification email:', emailError);
            }
        }

        return loginEntry;
    } catch (error) {
        console.error('Error creating login history:', error);
        throw error;
    }
};

// Get user login history
export const getUserLoginHistory = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status = '',
            loginType = '',
            startDate = '',
            endDate = ''
        } = req.query;

        const userId = req.params.userId || req.user.id;

        // Admin can view any user's history, users can only view their own
        if (req.user.role !== 'admin' && userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to view this login history'
                }
            });
        }

        // Build query
        const query = { userId };

        if (status) {
            query.status = status;
        }

        if (loginType) {
            query.loginType = loginType;
        }

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        // Execute query
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const loginHistory = await LoginHistory.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v');

        const totalRecords = await LoginHistory.countDocuments(query);
        const totalPages = Math.ceil(totalRecords / parseInt(limit));

        // Get statistics
        const stats = await LoginHistory.aggregate([
            { $match: { userId: loginHistory[0]?.userId } },
            {
                $group: {
                    _id: null,
                    totalLogins: { $sum: 1 },
                    successfulLogins: {
                        $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
                    },
                    failedLogins: {
                        $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                    },
                    uniqueIPs: { $addToSet: '$ipAddress' },
                    uniqueDevices: { $addToSet: '$device' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                loginHistory,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalRecords,
                    limit: parseInt(limit)
                },
                statistics: stats[0] ? {
                    totalLogins: stats[0].totalLogins,
                    successfulLogins: stats[0].successfulLogins,
                    failedLogins: stats[0].failedLogins,
                    uniqueIPCount: stats[0].uniqueIPs.length,
                    uniqueDeviceCount: stats[0].uniqueDevices.length
                } : null
            },
            message: 'Login history retrieved successfully'
        });
    } catch (error) {
        console.error('Get login history error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while retrieving login history'
            }
        });
    }
};

// Get recent login activity
export const getRecentLoginActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;

        const recentLogins = await LoginHistory.find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .select('loginType status ipAddress device browser timestamp');

        res.json({
            success: true,
            data: {
                recentLogins
            },
            message: 'Recent login activity retrieved successfully'
        });
    } catch (error) {
        console.error('Get recent login activity error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while retrieving recent login activity'
            }
        });
    }
};

// Get login statistics for admin
export const getLoginStatistics = async (req, res) => {
    try {
        const {
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            endDate = new Date()
        } = req.query;

        const dateQuery = {
            timestamp: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        // Overall statistics
        const overallStats = await LoginHistory.aggregate([
            { $match: dateQuery },
            {
                $group: {
                    _id: null,
                    totalLogins: { $sum: 1 },
                    successfulLogins: {
                        $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
                    },
                    failedLogins: {
                        $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                    },
                    uniqueUsers: { $addToSet: '$userId' }
                }
            }
        ]);

        // Login trends by date
        const loginTrends = await LoginHistory.aggregate([
            { $match: dateQuery },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                    },
                    total: { $sum: 1 },
                    successful: {
                        $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
                    },
                    failed: {
                        $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Login by type
        const loginByType = await LoginHistory.aggregate([
            { $match: dateQuery },
            {
                $group: {
                    _id: '$loginType',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Top IP addresses
        const topIPs = await LoginHistory.aggregate([
            { $match: dateQuery },
            {
                $group: {
                    _id: '$ipAddress',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Device distribution
        const deviceDistribution = await LoginHistory.aggregate([
            { $match: dateQuery },
            {
                $group: {
                    _id: '$device',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                overview: overallStats[0] || {
                    totalLogins: 0,
                    successfulLogins: 0,
                    failedLogins: 0,
                    uniqueUsers: []
                },
                loginTrends,
                loginByType,
                topIPs,
                deviceDistribution,
                dateRange: {
                    start: startDate,
                    end: endDate
                }
            },
            message: 'Login statistics retrieved successfully'
        });
    } catch (error) {
        console.error('Get login statistics error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while retrieving login statistics'
            }
        });
    }
};

// Clear old login history (admin only)
export const clearOldLoginHistory = async (req, res) => {
    try {
        const { daysOld = 90 } = req.body;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));

        const result = await LoginHistory.deleteMany({
            timestamp: { $lt: cutoffDate }
        });

        res.json({
            success: true,
            data: {
                deletedCount: result.deletedCount
            },
            message: `Deleted ${result.deletedCount} login history records older than ${daysOld} days`
        });
    } catch (error) {
        console.error('Clear old login history error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while clearing old login history'
            }
        });
    }
};

export default {
    createLoginHistory,
    getUserLoginHistory,
    getRecentLoginActivity,
    getLoginStatistics,
    clearOldLoginHistory
};

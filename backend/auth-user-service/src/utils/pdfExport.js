import PDFDocument from 'pdfkit';
import User from '../models/User.js';
import LoginHistory from '../models/LoginHistory.js';
import Agency from '../models/Agency.js';
import Insurance from '../models/Insurance.js';

// Generate comprehensive statistics PDF report
export const generateStatisticsPDF = async (res) => {
    try {
        // Create a document
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=statistics-report-${Date.now()}.pdf`);

        // Pipe the PDF to the response
        doc.pipe(res);

        // Gather all statistics
        const stats = await gatherComprehensiveStatistics();

        // Add content to PDF
        await addPDFContent(doc, stats);

        // Finalize the PDF
        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};

// Gather all statistics from database
const gatherComprehensiveStatistics = async () => {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // User statistics
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const bannedUsers = await User.countDocuments({ isBanned: true });
    const activeUsers = await User.countDocuments({ isActive: true });
    const usersWithFaceAuth = await User.countDocuments({ faceAuthEnabled: true });
    const usersWith2FA = await User.countDocuments({ mfaEnabled: true });

    // KYC statistics
    const kycStats = await User.aggregate([
        { $group: { _id: '$kycStatus', count: { $sum: 1 } } }
    ]);

    // Registration trends
    const registrationTrend = await User.aggregate([
        {
            $match: {
                createdAt: { $gte: last30Days }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Login statistics
    const totalLogins = await LoginHistory.countDocuments();
    const successfulLogins = await LoginHistory.countDocuments({ status: 'success' });
    const failedLogins = await LoginHistory.countDocuments({ status: 'failed' });

    const recentLogins = await LoginHistory.aggregate([
        {
            $match: {
                timestamp: { $gte: last7Days }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const loginByType = await LoginHistory.aggregate([
        { $group: { _id: '$loginType', count: { $sum: 1 } } }
    ]);

    const deviceDistribution = await LoginHistory.aggregate([
        { $group: { _id: '$device', count: { $sum: 1 } } }
    ]);

    // Agency statistics
    const totalAgencies = await Agency.countDocuments();
    const agenciesByStatus = await Agency.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Insurance statistics
    const totalInsurance = await Insurance.countDocuments();
    const insuranceByStatus = await Insurance.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Top active users
    const topActiveUsers = await User.find()
        .sort({ loginCount: -1 })
        .limit(10)
        .select('username email loginCount lastLoginAt role');

    return {
        generatedAt: now,
        period: '30 Days',
        users: {
            total: totalUsers,
            byRole: usersByRole,
            banned: bannedUsers,
            active: activeUsers,
            faceAuth: usersWithFaceAuth,
            mfa2FA: usersWith2FA,
            kycStats,
            registrationTrend,
            topActive: topActiveUsers
        },
        logins: {
            total: totalLogins,
            successful: successfulLogins,
            failed: failedLogins,
            successRate: totalLogins > 0 ? ((successfulLogins / totalLogins) * 100).toFixed(2) : 0,
            recentTrend: recentLogins,
            byType: loginByType,
            deviceDistribution
        },
        agencies: {
            total: totalAgencies,
            byStatus: agenciesByStatus
        },
        insurance: {
            total: totalInsurance,
            byStatus: insuranceByStatus
        }
    };
};

// Add content to PDF document
const addPDFContent = async (doc, stats) => {
    let currentY = 50;

    // Helper function to add a section
    const addSection = (title, y) => {
        doc.fontSize(16)
           .fillColor('#333')
           .text(title, 50, y, { underline: true })
           .moveDown(0.5);
        return doc.y;
    };

    // Helper function to add a row
    const addRow = (label, value, y) => {
        doc.fontSize(11)
           .fillColor('#666')
           .text(label, 70, y)
           .fillColor('#000')
           .text(String(value), 350, y, { width: 150, align: 'right' });
        return y + 20;
    };

    // Header
    doc.fontSize(24)
       .fillColor('#2563eb')
       .text('Platform Statistics Report', 50, currentY, { align: 'center' })
       .moveDown();

    doc.fontSize(11)
       .fillColor('#666')
       .text(`Generated: ${stats.generatedAt.toLocaleString()}`, 50, doc.y, { align: 'center' })
       .text(`Period: Last ${stats.period}`, 50, doc.y, { align: 'center' })
       .moveDown(2);

    currentY = doc.y;

    // Executive Summary
    currentY = addSection('📊 Executive Summary', currentY);
    currentY = addRow('Total Users', stats.users.total, currentY);
    currentY = addRow('Active Users', stats.users.active, currentY);
    currentY = addRow('Total Logins (All Time)', stats.logins.total, currentY);
    currentY = addRow('Login Success Rate', `${stats.logins.successRate}%`, currentY);
    currentY = addRow('Total Agencies', stats.agencies.total, currentY);
    currentY = addRow('Total Insurance Companies', stats.insurance.total, currentY);
    
    doc.moveDown(2);
    currentY = doc.y;

    // User Statistics
    currentY = addSection('👥 User Statistics', currentY);
    currentY = addRow('Total Users', stats.users.total, currentY);
    currentY = addRow('Active Users', stats.users.active, currentY);
    currentY = addRow('Banned Users', stats.users.banned, currentY);
    currentY = addRow('Face Auth Enabled', stats.users.faceAuth, currentY);
    currentY = addRow('2FA Enabled', stats.users.mfa2FA, currentY);

    doc.moveDown(1);
    currentY = doc.y;

    // Users by Role
    doc.fontSize(13)
       .fillColor('#444')
       .text('Users by Role:', 70, currentY);
    currentY += 20;

    stats.users.byRole.forEach(roleData => {
        const roleName = roleData._id.charAt(0).toUpperCase() + roleData._id.slice(1);
        currentY = addRow(`  ${roleName}`, roleData.count, currentY);
    });

    doc.moveDown(1);
    currentY = doc.y;

    // KYC Statistics
    doc.fontSize(13)
       .fillColor('#444')
       .text('KYC Status:', 70, currentY);
    currentY += 20;

    stats.users.kycStats.forEach(kycData => {
        const statusName = kycData._id.charAt(0).toUpperCase() + kycData._id.slice(1);
        currentY = addRow(`  ${statusName}`, kycData.count, currentY);
    });

    // New page for login statistics
    doc.addPage();
    currentY = 50;

    // Login Statistics
    currentY = addSection('🔐 Login Statistics', currentY);
    currentY = addRow('Total Logins', stats.logins.total, currentY);
    currentY = addRow('Successful Logins', stats.logins.successful, currentY);
    currentY = addRow('Failed Logins', stats.logins.failed, currentY);
    currentY = addRow('Success Rate', `${stats.logins.successRate}%`, currentY);

    doc.moveDown(1);
    currentY = doc.y;

    // Login by Type
    doc.fontSize(13)
       .fillColor('#444')
       .text('Login Methods:', 70, currentY);
    currentY += 20;

    stats.logins.byType.forEach(typeData => {
        const typeName = typeData._id.charAt(0).toUpperCase() + typeData._id.slice(1);
        currentY = addRow(`  ${typeName}`, typeData.count, currentY);
    });

    doc.moveDown(1);
    currentY = doc.y;

    // Device Distribution
    doc.fontSize(13)
       .fillColor('#444')
       .text('Device Distribution:', 70, currentY);
    currentY += 20;

    stats.logins.deviceDistribution.forEach(deviceData => {
        currentY = addRow(`  ${deviceData._id || 'Unknown'}`, deviceData.count, currentY);
    });

    // Agency Statistics
    doc.moveDown(2);
    currentY = doc.y;

    currentY = addSection('🏢 Agency Statistics', currentY);
    currentY = addRow('Total Agencies', stats.agencies.total, currentY);

    doc.moveDown(1);
    currentY = doc.y;

    doc.fontSize(13)
       .fillColor('#444')
       .text('Agency Status:', 70, currentY);
    currentY += 20;

    stats.agencies.byStatus.forEach(statusData => {
        const statusName = statusData._id.charAt(0).toUpperCase() + statusData._id.slice(1);
        currentY = addRow(`  ${statusName}`, statusData.count, currentY);
    });

    // Insurance Statistics
    doc.moveDown(2);
    currentY = doc.y;

    currentY = addSection('🛡️ Insurance Statistics', currentY);
    currentY = addRow('Total Insurance Companies', stats.insurance.total, currentY);

    doc.moveDown(1);
    currentY = doc.y;

    doc.fontSize(13)
       .fillColor('#444')
       .text('Insurance Status:', 70, currentY);
    currentY += 20;

    stats.insurance.byStatus.forEach(statusData => {
        const statusName = statusData._id.charAt(0).toUpperCase() + statusData._id.slice(1);
        currentY = addRow(`  ${statusName}`, statusData.count, currentY);
    });

    // Top Active Users (new page if needed)
    if (currentY > 650) {
        doc.addPage();
        currentY = 50;
    } else {
        doc.moveDown(2);
        currentY = doc.y;
    }

    currentY = addSection('⭐ Top 10 Active Users', currentY);
    
    // Table header
    doc.fontSize(10)
       .fillColor('#666')
       .text('Username', 70, currentY)
       .text('Role', 200, currentY)
       .text('Login Count', 300, currentY)
       .text('Last Login', 400, currentY);
    
    currentY += 20;
    doc.strokeColor('#ccc')
       .lineWidth(0.5)
       .moveTo(70, currentY)
       .lineTo(550, currentY)
       .stroke();
    
    currentY += 10;

    // Table rows
    stats.users.topActive.forEach((user, index) => {
        if (currentY > 750) {
            doc.addPage();
            currentY = 50;
        }

        const lastLogin = user.lastLoginAt 
            ? new Date(user.lastLoginAt).toLocaleDateString() 
            : 'Never';

        doc.fontSize(9)
           .fillColor('#000')
           .text(`${user.username}`, 70, currentY, { width: 120, ellipsis: true })
           .text(user.role, 200, currentY)
           .text(user.loginCount, 300, currentY)
           .text(lastLogin, 400, currentY);

        currentY += 18;
    });

    // Registration Trend Chart (simplified text representation)
    if (stats.users.registrationTrend.length > 0) {
        doc.addPage();
        currentY = 50;

        currentY = addSection('📈 Registration Trend (Last 30 Days)', currentY);

        stats.users.registrationTrend.forEach(day => {
            const barWidth = day.count * 5; // Scale for visualization
            doc.fontSize(9)
               .fillColor('#000')
               .text(day._id, 70, currentY, { width: 100 });
            
            doc.rect(180, currentY, barWidth, 12)
               .fillColor('#2563eb')
               .fill();
            
            doc.fillColor('#000')
               .text(day.count, 180 + barWidth + 10, currentY);

            currentY += 20;
        });
    }

    // Footer on last page
    doc.fontSize(8)
       .fillColor('#999')
       .text(
           'This is an automated report generated by the Car Rental Platform Analytics System',
           50,
           doc.page.height - 50,
           { align: 'center', width: doc.page.width - 100 }
       );
};

// Export PDF endpoint controller
export const exportStatisticsPDF = async (req, res) => {
    try {
        await generateStatisticsPDF(res);
    } catch (error) {
        console.error('Error exporting statistics PDF:', error);
        
        // If headers not sent yet, send error response
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: {
                    code: 'PDF_GENERATION_FAILED',
                    message: 'Failed to generate statistics PDF'
                }
            });
        }
    }
};

export default {
    generateStatisticsPDF,
    exportStatisticsPDF
};

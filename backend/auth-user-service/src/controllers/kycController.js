import { submitKycDocuments, getKycStatus, reviewKycApplication, getPendingKycApplications, getKycDetailsForAdmin } from '../services/kycService.js';

/**
 * Submit KYC documents
 * POST /api/v1/kyc/submit
 */
export const submitKyc = async (req, res) => {
    try {
        const userId = req.user.id;
        const files = req.files;
        const { documentTypes } = req.body;

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'NO_FILES_UPLOADED',
                    message: 'No files were uploaded'
                }
            });
        }

        // Validate document types
        const allowedTypes = ['passport', 'drivers_license', 'national_id', 'utility_bill', 'bank_statement', 'selfie'];
        const typesArray = documentTypes ? JSON.parse(documentTypes) : [];

        if (typesArray.length !== files.length) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'TYPE_COUNT_MISMATCH',
                    message: 'Number of document types must match number of files'
                }
            });
        }

        // Validate each type
        for (const type of typesArray) {
            if (!allowedTypes.includes(type)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_DOCUMENT_TYPE',
                        message: `Invalid document type: ${type}. Allowed: ${allowedTypes.join(', ')}`
                    }
                });
            }
        }

        const result = await submitKycDocuments(userId, files, typesArray);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error in submitKyc:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'KYC_SUBMISSION_FAILED',
                message: 'Failed to submit KYC documents'
            }
        });
    }
};

/**
 * Get KYC status and documents
 * GET /api/v1/kyc/status
 */
export const getKycStatusController = async (req, res) => {
    try {
        const userId = req.user.id;
        const status = await getKycStatus(userId);

        res.status(200).json({
            success: true,
            data: status
        });

    } catch (error) {
        console.error('Error in getKycStatus:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'KYC_STATUS_RETRIEVAL_FAILED',
                message: 'Failed to retrieve KYC status'
            }
        });
    }
};

/**
 * Delete a KYC document
 * DELETE /api/v1/kyc/documents/:documentId
 */
export const deleteKycDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const { documentId } = req.params;

        // Find and delete the document (only if it belongs to the user)
        const KycDocument = (await import('../models/KycDocument.js')).default;
        const document = await KycDocument.findOneAndDelete({
            _id: documentId,
            userId: userId,
            adminReviewStatus: 'pending' // Only allow deletion of pending documents
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'DOCUMENT_NOT_FOUND',
                    message: 'Document not found or cannot be deleted'
                }
            });
        }

        // Delete the actual file
        const { deleteFile } = await import('../middlewares/upload.js');
        const filename = document.fileUrl.split('/').pop();
        deleteFile(filename);

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });

    } catch (error) {
        console.error('Error in deleteKycDocument:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'DOCUMENT_DELETION_FAILED',
                message: 'Failed to delete document'
            }
        });
    }
};

/**
 * Admin: Get pending KYC applications
 * GET /api/v1/admin/kyc/pending
 */
export const getPendingKyc = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await getPendingKycApplications(page, limit);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error in getPendingKyc:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'PENDING_KYC_RETRIEVAL_FAILED',
                message: 'Failed to retrieve pending KYC applications'
            }
        });
    }
};

/**
 * Admin: Get detailed KYC information
 * GET /api/v1/admin/kyc/:userId
 */
export const getKycDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const details = await getKycDetailsForAdmin(userId);

        res.status(200).json({
            success: true,
            data: details
        });

    } catch (error) {
        console.error('Error in getKycDetails:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'KYC_DETAILS_RETRIEVAL_FAILED',
                message: 'Failed to retrieve KYC details'
            }
        });
    }
};

/**
 * Admin: Review KYC application
 * POST /api/v1/admin/kyc/:userId/review
 */
export const reviewKyc = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user.id;
        const { action, notes, rejectionReason } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_ACTION',
                    message: 'Action must be either "approve" or "reject"'
                }
            });
        }

        if (action === 'reject' && !rejectionReason) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'REJECTION_REASON_REQUIRED',
                    message: 'Rejection reason is required when rejecting KYC'
                }
            });
        }

        const result = await reviewKycApplication(userId, adminId, action, notes, rejectionReason);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error in reviewKyc:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'KYC_REVIEW_FAILED',
                message: 'Failed to review KYC application'
            }
        });
    }
};

/**
 * Admin: Get KYC statistics
 * GET /api/v1/admin/kyc/stats
 */
export const getKycStats = async (req, res) => {
    try {
        const User = (await import('../models/User.js')).default;
        const KycDocument = (await import('../models/KycDocument.js')).default;

        // Get KYC status counts
        const statusCounts = await User.aggregate([
            {
                $group: {
                    _id: '$kycStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get total documents and verification stats
        const totalDocuments = await KycDocument.countDocuments();
        const verifiedDocuments = await KycDocument.countDocuments({ uploadStatus: 'verified' });
        const rejectedDocuments = await KycDocument.countDocuments({ uploadStatus: 'rejected' });

        // Get average AI confidence score
        const aiScoreResult = await User.aggregate([
            {
                $match: { kycAiVerificationScore: { $ne: null } }
            },
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: '$kycAiVerificationScore' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const avgAiScore = aiScoreResult.length > 0 ? Math.round(aiScoreResult[0].avgScore) : 0;

        // Get recent submissions (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentSubmissions = await User.countDocuments({
            kycSubmittedAt: { $gte: thirtyDaysAgo }
        });

        res.status(200).json({
            success: true,
            data: {
                statusBreakdown: statusCounts.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                documents: {
                    total: totalDocuments,
                    verified: verifiedDocuments,
                    rejected: rejectedDocuments,
                    verificationRate: totalDocuments > 0 ? Math.round((verifiedDocuments / totalDocuments) * 100) : 0
                },
                aiVerification: {
                    averageScore: avgAiScore,
                    usersWithAiScore: aiScoreResult.length > 0 ? aiScoreResult[0].count : 0
                },
                recentActivity: {
                    submissionsLast30Days: recentSubmissions
                }
            }
        });

    } catch (error) {
        console.error('Error in getKycStats:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'KYC_STATS_RETRIEVAL_FAILED',
                message: 'Failed to retrieve KYC statistics'
            }
        });
    }
};
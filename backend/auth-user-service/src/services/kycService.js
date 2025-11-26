import KycDocument from '../models/KycDocument.js';
import User from '../models/User.js';
import { sendKycStatusEmail, sendKycRejectionEmail, sendKycApprovalEmail } from '../utils/emailService.js';
import { getFileUrl, deleteFile } from '../middlewares/upload.js';

/**
 * Submit KYC documents for verification (Manual Review - No AI)
 */
export async function submitKycDocuments(userId, files, documentTypes) {
    try {
        const documents = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const documentType = documentTypes[i] || 'other';

            // Create KycDocument record
            const kycDoc = new KycDocument({
                userId,
                documentType,
                fileName: file.filename,
                fileUrl: getFileUrl(file.filename),
                fileSize: file.size,
                mimeType: file.mimetype,
                uploadStatus: 'uploaded', // Changed from 'processing' to 'uploaded'
                adminReviewStatus: 'pending'
            });

            await kycDoc.save();
            documents.push(kycDoc);
        }

        // Update user's KYC submission timestamp
        await User.findByIdAndUpdate(userId, {
            kycSubmittedAt: new Date(),
            kycStatus: 'pending'
        });

        // Send confirmation email (non-blocking - don't fail if email fails)
        const user = await User.findById(userId);
        sendKycStatusEmail(
            user.email, 
            user.username, 
            'submitted', 
            'Your KYC documents have been submitted successfully and are awaiting admin review.'
        ).catch(error => {
            console.error('Failed to send KYC confirmation email:', error.message);
        });

        console.log(`KYC documents submitted for user ${userId}: ${documents.length} documents`);

        return {
            success: true,
            message: 'KYC documents submitted successfully. Your submission is under review.',
            documents: documents.map(doc => ({
                id: doc._id,
                type: doc.documentType,
                status: doc.uploadStatus,
                fileName: doc.fileName
            }))
        };

    } catch (error) {
        console.error('Error submitting KYC documents:', error);
        throw new Error('Failed to submit KYC documents');
    }
}

/**
 * Get KYC status and documents for user
 */
export async function getKycStatus(userId) {
    try {
        const user = await User.findById(userId).select('kycStatus kycRejectionReason kycAiVerificationScore kycSubmittedAt');
        const documents = await KycDocument.find({ userId }).sort({ createdAt: -1 });

        return {
            status: user.kycStatus,
            aiScore: user.kycAiVerificationScore,
            submittedAt: user.kycSubmittedAt,
            rejectionReason: user.kycRejectionReason,
            documents: documents.map(doc => ({
                id: doc._id,
                type: doc.documentType,
                status: doc.uploadStatus,
                aiResult: doc.aiVerificationResult,
                adminStatus: doc.adminReviewStatus,
                uploadedAt: doc.createdAt
            }))
        };

    } catch (error) {
        console.error('Error getting KYC status:', error);
        throw new Error('Failed to retrieve KYC status');
    }
}

/**
 * Admin review of KYC application
 */
export async function reviewKycApplication(userId, adminId, action, notes, rejectionReason) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const updateData = {
            kycReviewedBy: adminId,
            kycReviewedAt: new Date()
        };

        if (action === 'approve') {
            updateData.kycStatus = 'approved';
            updateData.kycRejectionReason = null;
        } else if (action === 'reject') {
            updateData.kycStatus = 'rejected';
            updateData.kycRejectionReason = rejectionReason;
        }

        await User.findByIdAndUpdate(userId, updateData);

        // Update all documents
        await KycDocument.updateMany(
            { userId },
            {
                adminReviewStatus: action === 'approve' ? 'approved' : 'rejected',
                reviewedBy: adminId,
                reviewedAt: new Date(),
                adminReviewNotes: notes,
                rejectionReason: action === 'reject' ? rejectionReason : null
            }
        );

        // Send appropriate email (non-blocking - don't fail if email fails)
        if (action === 'approve') {
            sendKycApprovalEmail(user.email, user.username).catch(error => {
                console.error('Failed to send KYC approval email:', error.message);
            });
        } else {
            sendKycRejectionEmail(user.email, user.username, rejectionReason).catch(error => {
                console.error('Failed to send KYC rejection email:', error.message);
            });
        }

        return {
            success: true,
            message: `KYC application ${action}d successfully`
        };

    } catch (error) {
        console.error('Error reviewing KYC application:', error);
        throw new Error('Failed to review KYC application');
    }
}

/**
 * Get pending KYC applications for admin review
 */
export async function getPendingKycApplications(page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;

        const users = await User.find({
            kycStatus: 'pending',
            kycSubmittedAt: { $exists: true }
        })
        .select('username email kycSubmittedAt kycAiVerificationScore')
        .sort({ kycSubmittedAt: -1 })
        .skip(skip)
        .limit(limit);

        const total = await User.countDocuments({
            kycStatus: 'pending',
            kycSubmittedAt: { $exists: true }
        });

        // Get document counts for each user
        const usersWithDocs = await Promise.all(
            users.map(async (user) => {
                const docCount = await KycDocument.countDocuments({ userId: user._id });
                const verifiedCount = await KycDocument.countDocuments({
                    userId: user._id,
                    uploadStatus: 'verified'
                });

                return {
                    ...user.toObject(),
                    totalDocuments: docCount,
                    verifiedDocuments: verifiedCount
                };
            })
        );

        return {
            applications: usersWithDocs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };

    } catch (error) {
        console.error('Error getting pending KYC applications:', error);
        throw new Error('Failed to retrieve pending applications');
    }
}

/**
 * Get detailed KYC information for admin review
 */
export async function getKycDetailsForAdmin(userId) {
    try {
        const user = await User.findById(userId).select('username email kycStatus kycAiVerificationScore kycSubmittedAt kycRejectionReason');
        const documents = await KycDocument.find({ userId }).sort({ createdAt: -1 });

        return {
            user: user,
            documents: documents
        };

    } catch (error) {
        console.error('Error getting KYC details:', error);
        throw new Error('Failed to retrieve KYC details');
    }
}
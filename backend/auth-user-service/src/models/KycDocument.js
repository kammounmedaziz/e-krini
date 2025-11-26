import mongoose from "mongoose";

const kycDocumentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    documentType: {
        type: String,
        enum: ["passport", "drivers_license", "national_id", "utility_bill", "bank_statement", "selfie"],
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    fileUrl: {
        type: String,
        required: true,
    },
    fileSize: {
        type: Number,
        required: true,
    },
    mimeType: {
        type: String,
        required: true,
    },
    uploadStatus: {
        type: String,
        enum: ["uploaded", "processing", "verified", "rejected"],
        default: "uploaded",
    },
    // AI Verification Results
    aiVerificationResult: {
        isAuthentic: {
            type: Boolean,
            default: null,
        },
        authenticityConfidence: {
            type: Number,
            min: 0,
            max: 100,
            default: null,
        },
        extractedData: {
            fullName: String,
            documentNumber: String,
            dateOfBirth: Date,
            expiryDate: Date,
            address: String,
            nationality: String,
        },
        faceMatchConfidence: {
            type: Number,
            min: 0,
            max: 100,
            default: null,
        },
        dataValidationResult: {
            isValid: Boolean,
            issues: [String],
            crossCheckScore: Number,
        },
        verifiedAt: Date,
    },
    // Admin Review
    adminReviewStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    adminReviewNotes: {
        type: String,
        default: null,
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    reviewedAt: {
        type: Date,
        default: null,
    },
    rejectionReason: {
        type: String,
        default: null,
    },
}, {
    timestamps: true
});

// Indexes for performance
kycDocumentSchema.index({ userId: 1, documentType: 1 });
kycDocumentSchema.index({ uploadStatus: 1 });
kycDocumentSchema.index({ adminReviewStatus: 1 });
kycDocumentSchema.index({ createdAt: -1 });

const KycDocument = mongoose.model("KycDocument", kycDocumentSchema);

export default KycDocument;
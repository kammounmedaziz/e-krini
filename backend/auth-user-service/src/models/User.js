import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["client", "admin", "agency", "insurance"],
        default: "client"
    },
    kycStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    kycDocuments: [{
        type: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now,
        }
    }],
    // Enhanced KYC tracking fields
    kycRejectionReason: {
        type: String,
        default: null,
    },
    kycReviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    kycReviewedAt: {
        type: Date,
        default: null,
    },
    kycSubmittedAt: {
        type: Date,
        default: null,
    },
    kycAiVerificationScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
    },
    mfaEnabled: {
        type: Boolean,
        default: false,
    },
    mfaSecret: {
        type: String,
        default: null,
    },
    mfaBackupCodes: [{
        code: String,
        used: { type: Boolean, default: false }
    }],
    profilePicture: {
        type: String,
        default: null,
    },
    faceAuthEnabled: {
        type: Boolean,
        default: false,
    },
    faceEncoding: {
        type: [Number], // Array of numbers representing face embedding
        default: null,
    },
    emailVerificationToken: String,
    emailVerificationTokenExpires: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    refreshTokens: [
        {
            token: String,
            createdAt: {
                type: Date,
                default: Date.now,
            }
        }
    ],
    isBanned: {
        type: Boolean,
        default: false,
    },
    banReason: {
        type: String,
        default: null,
    },
    bannedAt: {
        type: Date,
        default: null,
    },
    bannedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastLoginAt: {
        type: Date,
        default: null,
    },
    loginCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

// Hash password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (error) {
        return next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
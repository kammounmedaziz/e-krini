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
        enum: ["client", "admin", "agency"],
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
    mfaEnabled: {
        type: Boolean,
        default: false,
    },
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
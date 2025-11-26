import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    loginType: {
        type: String,
        enum: ['password', 'face', '2fa', 'oauth'],
        default: 'password'
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'blocked'],
        default: 'success',
        index: true
    },
    ipAddress: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    },
    device: {
        type: String,
        default: null
    },
    browser: {
        type: String,
        default: null
    },
    os: {
        type: String,
        default: null
    },
    location: {
        country: String,
        region: String,
        city: String,
        latitude: Number,
        longitude: Number
    },
    failureReason: {
        type: String,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { timestamps: true });

// Indexes for performance
loginHistorySchema.index({ userId: 1, timestamp: -1 });
loginHistorySchema.index({ ipAddress: 1, timestamp: -1 });
loginHistorySchema.index({ status: 1, timestamp: -1 });

// Auto-delete old records after 90 days
loginHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

const LoginHistory = mongoose.model('LoginHistory', loginHistorySchema);

export default LoginHistory;

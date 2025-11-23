import mongoose from "mongoose";

const agencySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    companyRegistrationNumber: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: ""
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        default: null
    },
    operatingHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
    },
    status: {
        type: String,
        enum: ["pending", "approved", "suspended", "rejected"],
        default: "pending"
    },
    statusNotes: {
        type: String,
        default: ""
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    services: [{
        type: {
            type: String,
            enum: ["rental", "leasing", "chauffeur", "delivery", "maintenance"]
        },
        description: String,
        pricing: mongoose.Schema.Types.Mixed
    }],
    documents: [{
        type: {
            type: String,
            enum: ["license", "insurance", "registration", "certification", "other"]
        },
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        verified: {
            type: Boolean,
            default: false
        }
    }],
    bankDetails: {
        accountHolderName: String,
        accountNumber: String,
        bankName: String,
        routingNumber: String,
        swiftCode: String
    },
    statistics: {
        totalBookings: {
            type: Number,
            default: 0
        },
        totalRevenue: {
            type: Number,
            default: 0
        },
        activeVehicles: {
            type: Number,
            default: 0
        },
        completedBookings: {
            type: Number,
            default: 0
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for searching
agencySchema.index({ companyName: "text", description: "text" });
agencySchema.index({ "address.city": 1 });
agencySchema.index({ status: 1 });

const Agency = mongoose.model("Agency", agencySchema);

export default Agency;

import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userType: {
    type: String,
    enum: ['client', 'agency', 'insurance'],
    required: true
  },
  type: {
    type: String,
    enum: ['feedback', 'complaint', 'report', 'suggestion'],
    required: true
  },
  category: {
    type: String,
    enum: [
      'service_quality',
      'vehicle_issue',
      'payment_issue',
      'booking_issue',
      'insurance_issue',
      'customer_support',
      'technical_issue',
      'safety_concern',
      'other'
    ],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  relatedTo: {
    type: {
      type: String,
      enum: ['reservation', 'vehicle', 'agency', 'insurance', 'payment', 'user', 'none'],
      default: 'none'
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'closed', 'rejected'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  response: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  resolution: {
    message: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  attachments: [{
    fileUrl: String,
    fileName: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  internalNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  contactInfo: {
    email: String,
    phone: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, priority: -1 });
feedbackSchema.index({ type: 1, category: 1 });
feedbackSchema.index({ 'relatedTo.type': 1, 'relatedTo.referenceId': 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;

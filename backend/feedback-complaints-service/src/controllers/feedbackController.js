import Feedback from '../models/Feedback.js';
import logger from '../utils/logger.js';

// Create new feedback/complaint
export const createFeedback = async (req, res) => {
  try {
    const {
      type,
      category,
      priority,
      subject,
      description,
      relatedTo,
      isAnonymous,
      contactInfo
    } = req.body;

    const feedbackData = {
      userId: req.user.userId,
      userType: req.user.role,
      type,
      category,
      subject,
      description,
      isAnonymous: isAnonymous || false
    };

    if (priority) feedbackData.priority = priority;
    if (relatedTo) feedbackData.relatedTo = relatedTo;
    if (contactInfo) feedbackData.contactInfo = contactInfo;

    const feedback = await Feedback.create(feedbackData);

    logger.info(`Feedback created: ${feedback._id} by user: ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: { feedback }
    });
  } catch (error) {
    logger.error('Create feedback error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create feedback',
        code: 'CREATE_FEEDBACK_ERROR'
      }
    });
  }
};

// Get all feedback (with filters) - Admin only
export const getAllFeedback = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      category,
      priority,
      userType,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (userType) query.userType = userType;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [feedback, total] = await Promise.all([
      Feedback.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'username email')
        .populate('assignedTo', 'username email')
        .populate('response.respondedBy', 'username')
        .populate('resolution.resolvedBy', 'username')
        .lean(),
      Feedback.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get all feedback error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch feedback',
        code: 'FETCH_FEEDBACK_ERROR'
      }
    });
  }
};

// Get user's own feedback
export const getMyFeedback = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { userId: req.user.userId };
    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [feedback, total] = await Promise.all([
      Feedback.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('response.respondedBy', 'username')
        .populate('resolution.resolvedBy', 'username')
        .lean(),
      Feedback.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get my feedback error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch feedback',
        code: 'FETCH_FEEDBACK_ERROR'
      }
    });
  }
};

// Get single feedback by ID
export const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id)
      .populate('userId', 'username email')
      .populate('assignedTo', 'username email')
      .populate('response.respondedBy', 'username email')
      .populate('resolution.resolvedBy', 'username email')
      .populate('internalNotes.addedBy', 'username')
      .lean();

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Feedback not found',
          code: 'FEEDBACK_NOT_FOUND'
        }
      });
    }

    // Check access permissions
    if (req.user.role !== 'admin' && feedback.userId._id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          code: 'FORBIDDEN'
        }
      });
    }

    res.json({
      success: true,
      data: { feedback }
    });
  } catch (error) {
    logger.error('Get feedback by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch feedback',
        code: 'FETCH_FEEDBACK_ERROR'
      }
    });
  }
};

// Update feedback status/priority - Admin only
export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo) updateData.assignedTo = assignedTo;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'username email')
     .populate('assignedTo', 'username email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Feedback not found',
          code: 'FEEDBACK_NOT_FOUND'
        }
      });
    }

    logger.info(`Feedback ${id} updated by admin: ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      data: { feedback }
    });
  } catch (error) {
    logger.error('Update feedback error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update feedback',
        code: 'UPDATE_FEEDBACK_ERROR'
      }
    });
  }
};

// Respond to feedback - Admin only
export const respondToFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      {
        response: {
          message,
          respondedBy: req.user.userId,
          respondedAt: new Date()
        },
        status: 'in_progress'
      },
      { new: true, runValidators: true }
    ).populate('userId', 'username email')
     .populate('response.respondedBy', 'username email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Feedback not found',
          code: 'FEEDBACK_NOT_FOUND'
        }
      });
    }

    logger.info(`Response added to feedback ${id} by admin: ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Response added successfully',
      data: { feedback }
    });
  } catch (error) {
    logger.error('Respond to feedback error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to respond to feedback',
        code: 'RESPOND_FEEDBACK_ERROR'
      }
    });
  }
};

// Resolve feedback - Admin only
export const resolveFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      {
        resolution: {
          message,
          resolvedBy: req.user.userId,
          resolvedAt: new Date()
        },
        status: 'resolved'
      },
      { new: true, runValidators: true }
    ).populate('userId', 'username email')
     .populate('resolution.resolvedBy', 'username email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Feedback not found',
          code: 'FEEDBACK_NOT_FOUND'
        }
      });
    }

    logger.info(`Feedback ${id} resolved by admin: ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Feedback resolved successfully',
      data: { feedback }
    });
  } catch (error) {
    logger.error('Resolve feedback error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to resolve feedback',
        code: 'RESOLVE_FEEDBACK_ERROR'
      }
    });
  }
};

// Add internal note - Admin only
export const addInternalNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      {
        $push: {
          internalNotes: {
            note,
            addedBy: req.user.userId,
            addedAt: new Date()
          }
        }
      },
      { new: true, runValidators: true }
    ).populate('internalNotes.addedBy', 'username');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Feedback not found',
          code: 'FEEDBACK_NOT_FOUND'
        }
      });
    }

    logger.info(`Internal note added to feedback ${id} by admin: ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Internal note added successfully',
      data: { feedback }
    });
  } catch (error) {
    logger.error('Add internal note error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to add internal note',
        code: 'ADD_NOTE_ERROR'
      }
    });
  }
};

// Rate resolution - User only
export const rateFeedbackResolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    const feedback = await Feedback.findOne({ _id: id, userId: req.user.userId });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Feedback not found',
          code: 'FEEDBACK_NOT_FOUND'
        }
      });
    }

    if (feedback.status !== 'resolved' && feedback.status !== 'closed') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Can only rate resolved or closed feedback',
          code: 'INVALID_STATUS'
        }
      });
    }

    feedback.resolution.satisfactionRating = rating;
    if (feedback.status === 'resolved') {
      feedback.status = 'closed';
    }
    await feedback.save();

    logger.info(`Feedback ${id} rated ${rating}/5 by user: ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: { feedback }
    });
  } catch (error) {
    logger.error('Rate feedback error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to rate feedback',
        code: 'RATE_FEEDBACK_ERROR'
      }
    });
  }
};

// Delete feedback - Admin only or own feedback if pending
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Feedback not found',
          code: 'FEEDBACK_NOT_FOUND'
        }
      });
    }

    // Only admin can delete any feedback, users can only delete their own pending feedback
    if (req.user.role !== 'admin') {
      if (feedback.userId.toString() !== req.user.userId || feedback.status !== 'pending') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied. Can only delete your own pending feedback.',
            code: 'FORBIDDEN'
          }
        });
      }
    }

    await Feedback.findByIdAndDelete(id);

    logger.info(`Feedback ${id} deleted by: ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    logger.error('Delete feedback error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete feedback',
        code: 'DELETE_FEEDBACK_ERROR'
      }
    });
  }
};

// Get feedback statistics - Admin only
export const getFeedbackStats = async (req, res) => {
  try {
    const [
      totalFeedback,
      byStatus,
      byType,
      byPriority,
      avgResolutionTime,
      avgSatisfactionRating
    ] = await Promise.all([
      Feedback.countDocuments(),
      Feedback.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Feedback.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Feedback.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Feedback.aggregate([
        {
          $match: {
            status: { $in: ['resolved', 'closed'] },
            'resolution.resolvedAt': { $exists: true }
          }
        },
        {
          $project: {
            resolutionTime: {
              $subtract: ['$resolution.resolvedAt', '$createdAt']
            }
          }
        },
        {
          $group: {
            _id: null,
            avgTime: { $avg: '$resolutionTime' }
          }
        }
      ]),
      Feedback.aggregate([
        {
          $match: {
            'resolution.satisfactionRating': { $exists: true }
          }
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$resolution.satisfactionRating' }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalFeedback,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byPriority: byPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        avgResolutionTimeHours: avgResolutionTime[0]?.avgTime 
          ? (avgResolutionTime[0].avgTime / (1000 * 60 * 60)).toFixed(2)
          : 0,
        avgSatisfactionRating: avgSatisfactionRating[0]?.avgRating?.toFixed(2) || 0
      }
    });
  } catch (error) {
    logger.error('Get feedback stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch feedback statistics',
        code: 'FETCH_STATS_ERROR'
      }
    });
  }
};

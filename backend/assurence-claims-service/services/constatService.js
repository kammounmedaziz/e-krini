const Constat = require('../models/constat');
const Assurance = require('../models/assurance');
const ServiceClient = require('../utils/serviceClient.cjs.js');

class ConstatService {
    /**
     * Create new claim (constat)
     */
    static async createConstat(data, userId) {
        try {
            // Verify insurance policy exists and belongs to user
            const assurance = await Assurance.findById(data.assuranceId);
            
            if (!assurance) {
                throw new Error('Insurance policy not found');
            }

            if (assurance.userId.toString() !== userId) {
                throw new Error('Insurance policy does not belong to this user');
            }

            if (!assurance.isActive()) {
                throw new Error('Insurance policy is not active');
            }

            // Verify vehicle if provided
            if (data.vehicleId) {
                try {
                    await ServiceClient.getCarById(data.vehicleId);
                } catch (error) {
                    throw new Error('Vehicle not found');
                }
            }

            // Generate constat number if not provided
            if (!data.constatNumber) {
                data.constatNumber = await this.generateConstatNumber();
            }

            const constat = new Constat({
                ...data,
                userId,
                status: 'draft'
            });

            await constat.save();
            return constat;
        } catch (error) {
            throw new Error(`Failed to create claim: ${error.message}`);
        }
    }

    /**
     * Generate unique constat number
     */
    static async generateConstatNumber() {
        const year = new Date().getFullYear();
        const count = await Constat.countDocuments();
        return `CONST-${year}-${String(count + 1).padStart(6, '0')}`;
    }

    /**
     * Get all claims with filters
     */
    static async getAllConstats(filters = {}) {
        try {
            const query = {};
            
            if (filters.userId) query.userId = filters.userId;
            if (filters.assuranceId) query.assuranceId = filters.assuranceId;
            if (filters.status) query.status = filters.status;
            if (filters.priority) query.priority = filters.priority;
            if (filters.incidentType) query.incidentType = filters.incidentType;

            const constats = await Constat.find(query)
                .populate('userId', 'username email')
                .populate('assuranceId', 'policyNumber insuranceType')
                .populate('reviewedBy', 'username')
                .sort({ createdAt: -1 });

            return constats;
        } catch (error) {
            throw new Error(`Failed to fetch claims: ${error.message}`);
        }
    }

    /**
     * Get claim by ID
     */
    static async getConstatById(id) {
        try {
            const constat = await Constat.findById(id)
                .populate('userId', 'username email phone')
                .populate('assuranceId')
                .populate('reviewedBy', 'username');

            if (!constat) {
                throw new Error('Claim not found');
            }

            return constat;
        } catch (error) {
            throw new Error(`Failed to fetch claim: ${error.message}`);
        }
    }

    /**
     * Get user's claims
     */
    static async getUserConstats(userId) {
        try {
            const constats = await Constat.find({ userId })
                .populate('assuranceId', 'policyNumber insuranceType')
                .sort({ createdAt: -1 });
            return constats;
        } catch (error) {
            throw new Error(`Failed to fetch user claims: ${error.message}`);
        }
    }

    /**
     * Update claim
     */
    static async updateConstat(id, data, userId, userRole) {
        try {
            const constat = await Constat.findById(id);

            if (!constat) {
                throw new Error('Claim not found');
            }

            // Only owner or admin/agency can update
            if (constat.userId.toString() !== userId && !['admin', 'agency'].includes(userRole)) {
                throw new Error('Not authorized to update this claim');
            }

            // Prevent updates to approved/processed claims
            if (['approved', 'processed', 'closed'].includes(constat.status) && userRole !== 'admin') {
                throw new Error('Cannot update processed claims');
            }

            Object.assign(constat, data);
            await constat.save();

            return constat;
        } catch (error) {
            throw new Error(`Failed to update claim: ${error.message}`);
        }
    }

    /**
     * Submit claim for review
     */
    static async submitConstat(id, userId) {
        try {
            const constat = await Constat.findById(id);

            if (!constat) {
                throw new Error('Claim not found');
            }

            if (constat.userId.toString() !== userId) {
                throw new Error('Not authorized');
            }

            if (constat.status !== 'draft') {
                throw new Error('Claim has already been submitted');
            }

            // Check if within valid timeframe
            if (!constat.isWithinValidTimeframe(30)) {
                throw new Error('Claim submission period has expired (must be within 30 days of incident)');
            }

            constat.status = 'submitted';
            await constat.save();

            return constat;
        } catch (error) {
            throw new Error(`Failed to submit claim: ${error.message}`);
        }
    }

    /**
     * Review and approve/reject claim
     */
    static async reviewConstat(id, reviewData, reviewerId) {
        try {
            const constat = await Constat.findById(id);

            if (!constat) {
                throw new Error('Claim not found');
            }

            if (!['submitted', 'under_review'].includes(constat.status)) {
                throw new Error('Claim cannot be reviewed in current status');
            }

            constat.status = reviewData.approved ? 'approved' : 'rejected';
            constat.reviewedBy = reviewerId;
            constat.reviewedAt = new Date();
            
            if (reviewData.approved && reviewData.approvedAmount) {
                constat.approvedAmount = reviewData.approvedAmount;
            }
            
            if (reviewData.rejectionReason) {
                constat.rejectionReason = reviewData.rejectionReason;
            }

            await constat.save();
            return constat;
        } catch (error) {
            throw new Error(`Failed to review claim: ${error.message}`);
        }
    }

    /**
     * Add fraud detection flags
     */
    static async addFraudDetection(id, fraudData, reviewerId) {
        try {
            const constat = await Constat.findById(id);

            if (!constat) {
                throw new Error('Claim not found');
            }

            constat.fraudDetection = {
                score: fraudData.score,
                flags: fraudData.flags || [],
                reviewedBy: reviewerId,
                reviewedAt: new Date(),
                notes: fraudData.notes
            };

            // If fraud score is high, mark for review
            if (fraudData.score > 70) {
                constat.priority = 'high';
                constat.status = 'under_review';
            }

            await constat.save();
            return constat;
        } catch (error) {
            throw new Error(`Failed to add fraud detection: ${error.message}`);
        }
    }

    /**
     * Process payment for approved claim
     */
    static async processPayment(id, paymentData) {
        try {
            const constat = await Constat.findById(id);

            if (!constat) {
                throw new Error('Claim not found');
            }

            if (constat.status !== 'approved') {
                throw new Error('Only approved claims can be paid');
            }

            constat.paymentDetails = {
                method: paymentData.method,
                reference: paymentData.reference,
                paidAt: new Date(),
                amount: constat.approvedAmount || constat.estimatedAmount
            };
            constat.status = 'processed';

            await constat.save();
            return constat;
        } catch (error) {
            throw new Error(`Failed to process payment: ${error.message}`);
        }
    }

    /**
     * Delete claim (admin only)
     */
    static async deleteConstat(id) {
        try {
            const constat = await Constat.findByIdAndDelete(id);

            if (!constat) {
                throw new Error('Claim not found');
            }

            return { message: 'Claim deleted successfully' };
        } catch (error) {
            throw new Error(`Failed to delete claim: ${error.message}`);
        }
    }

    /**
     * Get claims statistics
     */
    static async getStatistics(filters = {}) {
        try {
            const query = filters.userId ? { userId: filters.userId } : {};

            const [
                total,
                byStatus,
                totalAmount,
                approvedAmount
            ] = await Promise.all([
                Constat.countDocuments(query),
                Constat.aggregate([
                    { $match: query },
                    { $group: { _id: '$status', count: { $sum: 1 } } }
                ]),
                Constat.aggregate([
                    { $match: query },
                    { $group: { _id: null, total: { $sum: '$estimatedAmount' } } }
                ]),
                Constat.aggregate([
                    { $match: { ...query, status: 'approved' } },
                    { $group: { _id: null, total: { $sum: '$approvedAmount' } } }
                ])
            ]);

            return {
                total,
                byStatus: byStatus.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                totalEstimatedAmount: totalAmount[0]?.total || 0,
                totalApprovedAmount: approvedAmount[0]?.total || 0
            };
        } catch (error) {
            throw new Error(`Failed to get statistics: ${error.message}`);
        }
    }
}

module.exports = ConstatService;
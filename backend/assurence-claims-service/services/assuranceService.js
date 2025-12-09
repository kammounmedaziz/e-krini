const Assurance = require('../models/assurance');
const ServiceClient = require('../utils/serviceClient.cjs.js');

class AssuranceService {
    /**
     * Create new insurance policy
     */
    static async createAssurance(data, userId) {
        try {
            // Verify user exists (optional, can call auth service)
            if (data.vehicleId) {
                // Verify vehicle exists in fleet service
                try {
                    await ServiceClient.getCarById(data.vehicleId);
                } catch (error) {
                    throw new Error('Vehicle not found or unavailable');
                }
            }

            // Check for existing active policy for same user and vehicle
            if (data.vehicleId) {
                const existingPolicy = await Assurance.findOne({
                    userId,
                    vehicleId: data.vehicleId,
                    status: 'active',
                    endDate: { $gte: new Date() }
                });

                if (existingPolicy) {
                    throw new Error('Active insurance policy already exists for this vehicle');
                }
            }

            const assurance = new Assurance({
                ...data,
                userId,
                status: 'pending' // Requires approval
            });

            await assurance.save();
            return assurance;
        } catch (error) {
            throw new Error(`Failed to create insurance policy: ${error.message}`);
        }
    }

    /**
     * Get all insurance policies (with filters)
     */
    static async getAllAssurances(filters = {}) {
        try {
            const query = {};
            
            if (filters.userId) query.userId = filters.userId;
            if (filters.status) query.status = filters.status;
            if (filters.vehicleId) query.vehicleId = filters.vehicleId;

            const assurances = await Assurance.find(query)
                .populate('userId', 'username email')
                .populate('approvedBy', 'username')
                .sort({ createdAt: -1 });

            return assurances;
        } catch (error) {
            throw new Error(`Failed to fetch insurance policies: ${error.message}`);
        }
    }

    /**
     * Get insurance policy by ID
     */
    static async getAssuranceById(id) {
        try {
            const assurance = await Assurance.findById(id)
                .populate('userId', 'username email phone')
                .populate('approvedBy', 'username');

            if (!assurance) {
                throw new Error('Insurance policy not found');
            }

            return assurance;
        } catch (error) {
            throw new Error(`Failed to fetch insurance policy: ${error.message}`);
        }
    }

    /**
     * Get user's insurance policies
     */
    static async getUserAssurances(userId) {
        try {
            const assurances = await Assurance.find({ userId })
                .sort({ createdAt: -1 });
            return assurances;
        } catch (error) {
            throw new Error(`Failed to fetch user insurance policies: ${error.message}`);
        }
    }

    /**
     * Get vehicle insurance
     */
    static async getVehicleInsurance(vehicleId) {
        try {
            const assurance = await Assurance.findOne({
                vehicleId,
                status: 'active',
                endDate: { $gte: new Date() }
            }).populate('userId', 'username email');

            return assurance;
        } catch (error) {
            throw new Error(`Failed to fetch vehicle insurance: ${error.message}`);
        }
    }

    /**
     * Update insurance policy
     */
    static async updateAssurance(id, data, userId, userRole) {
        try {
            const assurance = await Assurance.findById(id);

            if (!assurance) {
                throw new Error('Insurance policy not found');
            }

            // Only owner or admin/agency can update
            if (assurance.userId.toString() !== userId && !['admin', 'agency'].includes(userRole)) {
                throw new Error('Not authorized to update this policy');
            }

            Object.assign(assurance, data);
            await assurance.save();

            return assurance;
        } catch (error) {
            throw new Error(`Failed to update insurance policy: ${error.message}`);
        }
    }

    /**
     * Approve insurance policy
     */
    static async approveAssurance(id, approvedBy) {
        try {
            const assurance = await Assurance.findById(id);

            if (!assurance) {
                throw new Error('Insurance policy not found');
            }

            if (assurance.status === 'active') {
                throw new Error('Policy is already active');
            }

            assurance.status = 'active';
            assurance.approvedBy = approvedBy;
            assurance.approvedAt = new Date();

            await assurance.save();
            return assurance;
        } catch (error) {
            throw new Error(`Failed to approve insurance policy: ${error.message}`);
        }
    }

    /**
     * Cancel insurance policy
     */
    static async cancelAssurance(id, userId, userRole) {
        try {
            const assurance = await Assurance.findById(id);

            if (!assurance) {
                throw new Error('Insurance policy not found');
            }

            // Only owner or admin can cancel
            if (assurance.userId.toString() !== userId && userRole !== 'admin') {
                throw new Error('Not authorized to cancel this policy');
            }

            assurance.status = 'cancelled';
            await assurance.save();

            return assurance;
        } catch (error) {
            throw new Error(`Failed to cancel insurance policy: ${error.message}`);
        }
    }

    /**
     * Delete insurance policy (admin only)
     */
    static async deleteAssurance(id) {
        try {
            const assurance = await Assurance.findByIdAndDelete(id);

            if (!assurance) {
                throw new Error('Insurance policy not found');
            }

            return { message: 'Insurance policy deleted successfully' };
        } catch (error) {
            throw new Error(`Failed to delete insurance policy: ${error.message}`);
        }
    }

    /**
     * Get expiring policies
     */
    static async getExpiringPolicies(days = 30) {
        try {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + days);

            const policies = await Assurance.find({
                status: 'active',
                endDate: {
                    $gte: new Date(),
                    $lte: futureDate
                }
            }).populate('userId', 'username email');

            return policies;
        } catch (error) {
            throw new Error(`Failed to fetch expiring policies: ${error.message}`);
        }
    }
}

module.exports = AssuranceService;
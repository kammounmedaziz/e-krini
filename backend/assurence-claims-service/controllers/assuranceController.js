const AssuranceService = require('../services/assuranceService');

class AssuranceController {
    /**
     * Create new insurance policy
     * POST /api/assurances
     */
    static async createAssurance(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const assurance = await AssuranceService.createAssurance(req.body, userId);

            return res.status(201).json({
                success: true,
                message: 'Insurance policy created successfully',
                data: assurance
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get all insurance policies
     * GET /api/assurances
     */
    static async getAllAssurances(req, res) {
        try {
            const filters = {
                userId: req.query.userId,
                status: req.query.status,
                vehicleId: req.query.vehicleId
            };

            const assurances = await AssuranceService.getAllAssurances(filters);

            return res.status(200).json({
                success: true,
                count: assurances.length,
                data: assurances
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get insurance policy by ID
     * GET /api/assurances/:id
     */
    static async getAssuranceById(req, res) {
        try {
            const assurance = await AssuranceService.getAssuranceById(req.params.id);

            return res.status(200).json({
                success: true,
                data: assurance
            });
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get user's insurance policies
     * GET /api/assurances/user/me
     */
    static async getMyAssurances(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const assurances = await AssuranceService.getUserAssurances(userId);

            return res.status(200).json({
                success: true,
                count: assurances.length,
                data: assurances
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get vehicle insurance
     * GET /api/assurances/vehicle/:vehicleId
     */
    static async getVehicleInsurance(req, res) {
        try {
            const assurance = await AssuranceService.getVehicleInsurance(req.params.vehicleId);

            if (!assurance) {
                return res.status(404).json({
                    success: false,
                    message: 'No active insurance found for this vehicle'
                });
            }

            return res.status(200).json({
                success: true,
                data: assurance
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update insurance policy
     * PUT /api/assurances/:id
     */
    static async updateAssurance(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const userRole = req.user.role;
            
            const assurance = await AssuranceService.updateAssurance(
                req.params.id,
                req.body,
                userId,
                userRole
            );

            return res.status(200).json({
                success: true,
                message: 'Insurance policy updated successfully',
                data: assurance
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Approve insurance policy
     * PUT /api/assurances/:id/approve
     */
    static async approveAssurance(req, res) {
        try {
            const approvedBy = req.user.userId || req.user.id;
            const assurance = await AssuranceService.approveAssurance(req.params.id, approvedBy);

            return res.status(200).json({
                success: true,
                message: 'Insurance policy approved successfully',
                data: assurance
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Cancel insurance policy
     * PUT /api/assurances/:id/cancel
     */
    static async cancelAssurance(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const userRole = req.user.role;
            
            const assurance = await AssuranceService.cancelAssurance(req.params.id, userId, userRole);

            return res.status(200).json({
                success: true,
                message: 'Insurance policy cancelled successfully',
                data: assurance
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Delete insurance policy
     * DELETE /api/assurances/:id
     */
    static async deleteAssurance(req, res) {
        try {
            const result = await AssuranceService.deleteAssurance(req.params.id);

            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get expiring policies
     * GET /api/assurances/expiring/:days
     */
    static async getExpiringPolicies(req, res) {
        try {
            const days = parseInt(req.params.days) || 30;
            const policies = await AssuranceService.getExpiringPolicies(days);

            return res.status(200).json({
                success: true,
                count: policies.length,
                data: policies
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = AssuranceController;
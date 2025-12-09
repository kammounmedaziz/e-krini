const ConstatService = require('../services/constatService');

class ConstatController {
    /**
     * Create new claim
     * POST /api/constats
     */
    static async createConstat(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const constat = await ConstatService.createConstat(req.body, userId);

            return res.status(201).json({
                success: true,
                message: 'Claim created successfully',
                data: constat
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get all claims
     * GET /api/constats
     */
    static async getAllConstats(req, res) {
        try {
            const filters = {
                userId: req.query.userId,
                assuranceId: req.query.assuranceId,
                status: req.query.status,
                priority: req.query.priority,
                incidentType: req.query.incidentType
            };

            const constats = await ConstatService.getAllConstats(filters);

            return res.status(200).json({
                success: true,
                count: constats.length,
                data: constats
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get claim by ID
     * GET /api/constats/:id
     */
    static async getConstatById(req, res) {
        try {
            const constat = await ConstatService.getConstatById(req.params.id);

            return res.status(200).json({
                success: true,
                data: constat
            });
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get user's claims
     * GET /api/constats/user/me
     */
    static async getMyConstats(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const constats = await ConstatService.getUserConstats(userId);

            return res.status(200).json({
                success: true,
                count: constats.length,
                data: constats
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update claim
     * PUT /api/constats/:id
     */
    static async updateConstat(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const userRole = req.user.role;
            
            const constat = await ConstatService.updateConstat(
                req.params.id,
                req.body,
                userId,
                userRole
            );

            return res.status(200).json({
                success: true,
                message: 'Claim updated successfully',
                data: constat
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Submit claim for review
     * PUT /api/constats/:id/submit
     */
    static async submitConstat(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const constat = await ConstatService.submitConstat(req.params.id, userId);

            return res.status(200).json({
                success: true,
                message: 'Claim submitted successfully',
                data: constat
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Review claim (approve/reject)
     * PUT /api/constats/:id/review
     */
    static async reviewConstat(req, res) {
        try {
            const reviewerId = req.user.userId || req.user.id;
            const constat = await ConstatService.reviewConstat(
                req.params.id,
                req.body,
                reviewerId
            );

            return res.status(200).json({
                success: true,
                message: 'Claim reviewed successfully',
                data: constat
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Add fraud detection
     * PUT /api/constats/:id/fraud-detection
     */
    static async addFraudDetection(req, res) {
        try {
            const reviewerId = req.user.userId || req.user.id;
            const constat = await ConstatService.addFraudDetection(
                req.params.id,
                req.body,
                reviewerId
            );

            return res.status(200).json({
                success: true,
                message: 'Fraud detection added successfully',
                data: constat
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Process payment
     * PUT /api/constats/:id/payment
     */
    static async processPayment(req, res) {
        try {
            const constat = await ConstatService.processPayment(req.params.id, req.body);

            return res.status(200).json({
                success: true,
                message: 'Payment processed successfully',
                data: constat
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Delete claim
     * DELETE /api/constats/:id
     */
    static async deleteConstat(req, res) {
        try {
            const result = await ConstatService.deleteConstat(req.params.id);

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
     * Get statistics
     * GET /api/constats/stats
     */
    static async getStatistics(req, res) {
        try {
            const filters = {
                userId: req.query.userId
            };

            const stats = await ConstatService.getStatistics(filters);

            return res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = ConstatController;
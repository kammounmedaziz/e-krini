const axios = require('axios');

/**
 * Service Client for Inter-Service Communication (CommonJS)
 * Centralized client for making requests to other microservices
 */
class ServiceClient {
    /**
     * Get car details by ID from Fleet Service
     */
    static async getCarById(carId, token = null) {
        try {
            const fleetServiceUrl = process.env.FLEET_SERVICE_URL || 'http://localhost:3002';
            const headers = {};
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await axios.get(`${fleetServiceUrl}/api/cars/${carId}`, { headers });
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching car from fleet service:', error.message);
            throw new Error('Failed to fetch car details');
        }
    }

    /**
     * Get user details by ID from Auth Service
     */
    static async getUserById(userId, token = null) {
        try {
            const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
            const headers = {};
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await axios.get(`${authServiceUrl}/api/v1/users/${userId}`, { headers });
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching user from auth service:', error.message);
            throw new Error('Failed to fetch user details');
        }
    }

    /**
     * Create reservation in Reservation Service
     */
    static async createReservation(reservationData, token) {
        try {
            const reservationServiceUrl = process.env.RESERVATION_SERVICE_URL || 'http://localhost:3004';
            const response = await axios.post(
                `${reservationServiceUrl}/api/reservations`,
                reservationData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error creating reservation:', error.message);
            throw new Error('Failed to create reservation');
        }
    }

    /**
     * Get reservation details by ID
     */
    static async getReservationById(reservationId, token) {
        try {
            const reservationServiceUrl = process.env.RESERVATION_SERVICE_URL || 'http://localhost:3004';
            const response = await axios.get(
                `${reservationServiceUrl}/api/reservations/${reservationId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching reservation:', error.message);
            throw new Error('Failed to fetch reservation details');
        }
    }

    /**
     * Update reservation status
     */
    static async updateReservationStatus(reservationId, status, token) {
        try {
            const reservationServiceUrl = process.env.RESERVATION_SERVICE_URL || 'http://localhost:3004';
            const response = await axios.patch(
                `${reservationServiceUrl}/api/reservations/${reservationId}/status`,
                { status },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error updating reservation status:', error.message);
            throw new Error('Failed to update reservation status');
        }
    }

    /**
     * Check car availability
     */
    static async checkCarAvailability(carId, startDate, endDate, token = null) {
        try {
            const reservationServiceUrl = process.env.RESERVATION_SERVICE_URL || 'http://localhost:3004';
            const headers = {};
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await axios.get(
                `${reservationServiceUrl}/api/reservations/availability/${carId}`,
                {
                    params: { startDate, endDate },
                    headers
                }
            );
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error checking car availability:', error.message);
            throw new Error('Failed to check car availability');
        }
    }

    /**
     * Get agency details by ID
     */
    static async getAgencyById(agencyId, token = null) {
        try {
            const fleetServiceUrl = process.env.FLEET_SERVICE_URL || 'http://localhost:3002';
            const headers = {};
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await axios.get(`${fleetServiceUrl}/api/agencies/${agencyId}`, { headers });
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching agency from fleet service:', error.message);
            throw new Error('Failed to fetch agency details');
        }
    }
}

module.exports = ServiceClient;

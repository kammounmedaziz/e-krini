import axios from 'axios';

const FLEET_SERVICE_URL = process.env.FLEET_SERVICE_URL || 'http://fleet-service:3002';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-user-service:3001';
const PROMOTION_SERVICE_URL = process.env.PROMOTION_SERVICE_URL || 'http://promotion-coupon-service:3006';
const RESERVATION_SERVICE_URL = process.env.RESERVATION_SERVICE_URL || 'http://reservation-service:3003';
const MAINTENANCE_SERVICE_URL = process.env.MAINTENANCE_SERVICE_URL || 'http://maintenance-service:3007';
const ASSURANCE_SERVICE_URL = process.env.ASSURANCE_SERVICE_URL || 'http://assurence-claims-service:3004';

/**
 * Utility for making authenticated inter-service calls
 */
class ServiceClient {
    /**
     * Get car details from fleet service
     */
    static async getCarById(carId, token = null) {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(`${FLEET_SERVICE_URL}/api/cars/${carId}`, { headers });
            return response.data;
        } catch (error) {
            console.error('Error fetching car from fleet service:', error.message);
            throw new Error(`Failed to fetch car: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Check car availability
     */
    static async checkCarAvailability(carIds, startDate, endDate, token = null) {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            console.log('Checking availability for:', { carIds, startDate, endDate });
            const response = await axios.post(
                `${FLEET_SERVICE_URL}/api/cars/availability`,
                { carIds, startDate, endDate },
                { headers }
            );
            console.log('Fleet service response:', JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.error('Error checking car availability:', error.message);
            console.error('Error response:', error.response?.data);
            throw new Error(`Failed to check availability: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Update car status in fleet service
     */
    static async updateCarStatus(carId, status, token = null) {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.patch(
                `${FLEET_SERVICE_URL}/api/cars/${carId}`,
                { status },
                { headers }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating car status:', error.message);
            throw new Error(`Failed to update car status: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Verify and apply coupon/promotion
     */
    static async verifyCoupon(code, token = null) {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.post(
                `${PROMOTION_SERVICE_URL}/api/coupons/verify`,
                { code },
                { headers }
            );
            return response.data;
        } catch (error) {
            console.error('Error verifying coupon:', error.message);
            return null;
        }
    }

    /**
     * Apply coupon to a reservation
     */
    static async applyCoupon(code, amount, token = null) {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.post(
                `${PROMOTION_SERVICE_URL}/api/coupons/apply`,
                { code, amount },
                { headers }
            );
            return response.data;
        } catch (error) {
            console.error('Error applying coupon:', error.message);
            throw new Error(`Failed to apply coupon: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Get user details from auth service
     */
    static async getUserById(userId, token) {
        try {
            const response = await axios.get(
                `${AUTH_SERVICE_URL}/api/v1/users/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error.message);
            throw new Error(`Failed to fetch user: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Get reservations for a car (from reservation service)
     */
    static async getCarReservations(carId, token = null) {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(
                `${RESERVATION_SERVICE_URL}/api/reservations/car/${carId}`,
                { headers }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching car reservations:', error.message);
            return { data: [] };
        }
    }

    /**
     * Get maintenance records for a vehicle
     */
    static async getVehicleMaintenance(vehicleId, token = null) {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(
                `${MAINTENANCE_SERVICE_URL}/maintenance/vehicule/${vehicleId}`,
                { headers }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching vehicle maintenance:', error.message);
            return { data: [] };
        }
    }

    /**
     * Get insurance details for a vehicle
     */
    static async getVehicleInsurance(vehicleId, token = null) {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(
                `${ASSURANCE_SERVICE_URL}/api/assurances/vehicle/${vehicleId}`,
                { headers }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching vehicle insurance:', error.message);
            return null;
        }
    }
}

export default ServiceClient;

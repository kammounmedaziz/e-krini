import axios from 'axios';
import logger from '../../../common/utils/logger.js';

class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.discoveryUrl = process.env.DISCOVERY_SERVICE_URL || 'http://localhost:3000/services';
    this.healthCheckInterval = 30000; // 30 seconds
    this.healthCheckTimer = null;
  }

  /**
   * Initialize service registry
   */
  async initialize() {
    try {
      logger.info('🔍 Initializing service registry...');

      // Load services from discovery service
      await this.loadServices();

      // Start health monitoring
      this.startHealthMonitoring();

      logger.info('✅ Service registry initialized');
      logger.info(`📊 Registered services: ${Array.from(this.services.keys()).join(', ')}`);

    } catch (error) {
      logger.error('❌ Failed to initialize service registry', { error: error.message });
      throw error;
    }
  }

  /**
   * Load services from discovery service
   */
  async loadServices() {
    try {
      const response = await axios.get(this.discoveryUrl, { timeout: 5000 });

      if (response.data) {
        this.services.clear();
        for (const [name, url] of Object.entries(response.data)) {
          this.services.set(name, {
            url,
            healthy: true,
            lastHealthCheck: new Date(),
            responseTime: 0
          });
        }
        logger.info(`📥 Loaded ${this.services.size} services from discovery service`);
      }
    } catch (error) {
      logger.error('❌ Failed to load services from discovery service', { error: error.message });
      // Fallback to hardcoded services if discovery fails
      this.loadFallbackServices();
    }
  }

  /**
   * Fallback service configuration
   */
  loadFallbackServices() {
    logger.warn('⚠️ Using fallback service configuration');

    const fallbackServices = {
      auth: 'http://localhost:3001',
      fleet: 'http://localhost:3002',
      reservation: 'http://localhost:3004',
      feedback: 'http://localhost:3007',
      promotion: 'http://localhost:3008'
    };

    this.services.clear();
    for (const [name, url] of Object.entries(fallbackServices)) {
      this.services.set(name, {
        url,
        healthy: true,
        lastHealthCheck: new Date(),
        responseTime: 0
      });
    }
  }

  /**
   * Get service URL by name
   */
  getServiceUrl(serviceName) {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service '${serviceName}' not found`);
    }
    if (!service.healthy) {
      throw new Error(`Service '${serviceName}' is currently unhealthy`);
    }
    return service.url;
  }

  /**
   * Get all services
   */
  getAllServices() {
    const services = {};
    for (const [name, service] of this.services) {
      services[name] = service.url;
    }
    return services;
  }

  /**
   * Check service health
   */
  async checkServiceHealth(serviceName) {
    const service = this.services.get(serviceName);
    if (!service) return false;

    try {
      const startTime = Date.now();
      const response = await axios.get(`${service.url}/health`, {
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      const responseTime = Date.now() - startTime;

      service.healthy = response.status === 200;
      service.lastHealthCheck = new Date();
      service.responseTime = responseTime;

      return service.healthy;
    } catch (error) {
      service.healthy = false;
      service.lastHealthCheck = new Date();
      service.responseTime = 0;
      return false;
    }
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    this.healthCheckTimer = setInterval(async () => {
      for (const [name] of this.services) {
        await this.checkServiceHealth(name);
      }

      const healthyCount = Array.from(this.services.values()).filter(s => s.healthy).length;
      const totalCount = this.services.size;

      logger.debug(`🏥 Health check: ${healthyCount}/${totalCount} services healthy`);
    }, this.healthCheckInterval);
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  /**
   * Get service health status
   */
  getServiceHealth() {
    const health = {};
    for (const [name, service] of this.services) {
      health[name] = {
        url: service.url,
        healthy: service.healthy,
        lastHealthCheck: service.lastHealthCheck,
        responseTime: service.responseTime
      };
    }
    return health;
  }
}

// Export singleton instance
export const serviceRegistry = new ServiceRegistry();
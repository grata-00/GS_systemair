
// This file serves as an adapter to access backend services from the frontend
import { ProductService, DeliveryService, UserService } from '../../backend/db';
import { getServiceStatus, resetServices } from '../../backend/services';

// Re-export the services
export { ProductService, DeliveryService, UserService, getServiceStatus, resetServices };

import jwt from 'jsonwebtoken';

/**
 * Middleware to authenticate JWT tokens
 * Works with both ES modules and CommonJS
 */
export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_NO_TOKEN',
                    message: 'No token provided'
                }
            });
        }
        
        const token = authHeader.substring(7);
        const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
        
        if (!secret) {
            throw new Error('JWT secret not configured');
        }
        
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'AUTH_INVALID_TOKEN',
                message: 'Invalid or expired token'
            }
        });
    }
};

/**
 * Middleware to authorize based on user roles
 * @param {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_NO_USER',
                    message: 'User not authenticated'
                }
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied. Insufficient permissions.'
                }
            });
        }

        next();
    };
};

// CommonJS exports for services that use require()
export default {
    authMiddleware,
    authorize
};

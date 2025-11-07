import {verifyAccessToken} from '../utils/jwt.js';

export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                error:{
                    code: 'AUTH_NO_TOKEN',
                    message: 'No token provided'
                }
            });
        }
        const token = authHeader.substring(7);
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false,
            error:{
                code: 'AUTH_INVALID_TOKEN',
                message: 'Invalid or expired token'
            }
        });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error:{
                    code: 'AUTH_NO_USER',
                    message: 'User not authenticated'
                }
            });
        }
        
        next();
    };
};


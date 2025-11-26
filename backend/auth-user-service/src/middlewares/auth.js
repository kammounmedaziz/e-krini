import {verifyAccessToken} from '../utils/jwt.js';

export const authMiddleware = (req, res, next) => {
    try {
        console.log('=== Auth Middleware ===');
        console.log('Headers:', req.headers.authorization ? 'Authorization header present' : 'No authorization header');
        
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Auth failed: No token or invalid format');
            return res.status(401).json({
                success: false,
                error:{
                    code: 'AUTH_NO_TOKEN',
                    message: 'No token provided'
                }
            });
        }
        const token = authHeader.substring(7);
        console.log('Token extracted, length:', token.length);
        
        const decoded = verifyAccessToken(token);
        console.log('Token decoded successfully:', { userId: decoded.userId, id: decoded.id, role: decoded.role });
        
        req.user = decoded;
        console.log('req.user set:', req.user);
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

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error:{
                    code: 'FORBIDDEN',
                    message: 'Access denied'
                }
            });
        }

        next();
    };
};


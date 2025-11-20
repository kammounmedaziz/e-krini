export const adminMiddleware = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_NO_USER',
                    message: 'User not authenticated'
                }
            });
        }

        // Check if user has admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied. Admin privileges required.'
                }
            });
        }

        next();
    } catch (error) {
        console.error('Admin middleware error:', error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred during authorization'
            }
        });
    }
};

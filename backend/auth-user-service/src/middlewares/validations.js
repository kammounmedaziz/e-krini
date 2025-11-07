import {body, validationResult} from 'express-validator';

export const validateUserRegistration = (validation) => {
    return async (req,res,next) => {
        
        await Promise.all(validation.map(validation => validation.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Validation failed',
                    details: errors.array()
                }
            });
        }
        next();
    };
};

export const registrationValidation = [
    body('username')
        .trim()
        .isLength({min:3, max:20})
        .withMessage('Username must be between 3 and 20 characters long'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Invalid email address'),
    body('password')
        .isLength({min:8})
        .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
        .withMessage('Password must be at least 8 characters long and contain at least one letter, one number, and one special character'),
    body('role')
        .trim()
        .isIn(['user', 'agency', 'admin'])
        .withMessage('Role must be either user, agency, or admin')

];

export const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Invalid email address'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];


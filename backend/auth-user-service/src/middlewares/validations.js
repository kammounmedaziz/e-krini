import {body, validationResult} from 'express-validator';

export const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));
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

export const registerValidation = [
    body('username')
        .trim()
        .isLength({min:3, max:20})
        .withMessage('Username must be between 3 and 20 characters long'),
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('phoneNumber').optional().trim(),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Invalid email address'),
    body('password')
        .isLength({min:8})
        .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
        .withMessage('Password must be at least 8 characters long and contain at least one letter, one number, and one special character'),
    body('role')
        .optional()
        .isIn(['client', 'agency', 'admin', 'insurance'])
        .withMessage('Role must be client, agency, admin, or insurance')
];

export const loginValidation = [
    body('username')
        .notEmpty()
        .withMessage('Username is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];


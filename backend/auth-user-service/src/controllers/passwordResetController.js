import User from '../models/User.js';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/emailService.js';

// Generate random password
const generateRandomPassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Request password reset
export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_EMAIL',
                    message: 'Email is required'
                }
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        
        // Always return success for security (don't reveal if email exists)
        if (!user) {
            return res.json({
                success: true,
                message: 'If the email exists, a password reset link has been sent'
            });
        }

        // Check if user is banned
        if (user.isBanned) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'USER_BANNED',
                    message: 'Your account has been banned. Please contact support.'
                }
            });
        }

        // Generate reset token (valid for 1 hour)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        user.passwordResetToken = resetTokenHash;
        user.passwordResetTokenExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Create reset URL (for later use if you want link-based reset)
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

        // For now, we'll just return success
        res.json({
            success: true,
            message: 'Password reset initiated. Please check your email.',
            data: {
                resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
            }
        });
    } catch (error) {
        console.error('Request password reset error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while processing password reset request'
            }
        });
    }
};

// Reset password (generates new password and sends via email)
export const resetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_EMAIL',
                    message: 'Email is required'
                }
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'No user found with this email address'
                }
            });
        }

        // Check if user is banned
        if (user.isBanned) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'USER_BANNED',
                    message: 'Your account has been banned. Please contact support.'
                }
            });
        }

        // Generate new random password
        const newPassword = generateRandomPassword();

        // Update user password
        user.password = newPassword; // Will be hashed by pre-save hook
        user.passwordResetToken = null;
        user.passwordResetTokenExpires = null;
        await user.save();

        // Send email with new password
        try {
            await sendPasswordResetEmail(user.email, newPassword, user.username);
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'EMAIL_SEND_FAILED',
                    message: 'Password was reset but email could not be sent. Please contact support.'
                }
            });
        }

        res.json({
            success: true,
            message: 'Password has been reset successfully. Check your email for the new password.',
            data: {
                // Only show password in development mode
                newPassword: process.env.NODE_ENV === 'development' ? newPassword : undefined
            }
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while resetting password'
            }
        });
    }
};

// Change password (for logged-in users)
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_CREDENTIALS',
                    message: 'Current password and new password are required'
                }
            });
        }

        // Validate new password strength
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'WEAK_PASSWORD',
                    message: 'Password must be at least 8 characters long'
                }
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
        }

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_PASSWORD',
                    message: 'Current password is incorrect'
                }
            });
        }

        // Check if new password is same as current
        const isSamePassword = await user.comparePassword(newPassword);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'SAME_PASSWORD',
                    message: 'New password must be different from current password'
                }
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while changing password'
            }
        });
    }
};

export default {
    requestPasswordReset,
    resetPassword,
    changePassword
};

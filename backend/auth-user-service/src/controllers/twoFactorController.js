import User from '../models/User.js';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { send2FAEmail } from '../utils/emailService.js';

// Enable 2FA - Generate secret and QR code
export const enable2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        
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

        if (user.mfaEnabled) {
            return res.status(400).json({
                success: false,
                error: {
                    code: '2FA_ALREADY_ENABLED',
                    message: 'Two-factor authentication is already enabled'
                }
            });
        }

        // Generate secret
        const secret = speakeasy.generateSecret({
            name: `Car Rental (${user.email})`,
            issuer: 'Car Rental Platform'
        });

        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        // Generate backup codes
        const backupCodes = [];
        for (let i = 0; i < 10; i++) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            backupCodes.push({
                code,
                used: false
            });
        }

        // Store secret temporarily (will be confirmed in verify step)
        user.mfaSecret = secret.base32;
        user.mfaBackupCodes = backupCodes;
        await user.save();

        res.json({
            success: true,
            data: {
                secret: secret.base32,
                qrCode: qrCodeUrl,
                backupCodes: backupCodes.map(b => b.code),
                manualEntry: secret.otpauth_url
            },
            message: '2FA setup initiated. Please scan the QR code with your authenticator app and verify with a code.'
        });
    } catch (error) {
        console.error('Enable 2FA error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while enabling 2FA'
            }
        });
    }
};

// Verify and confirm 2FA setup
export const verify2FASetup = async (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.user.id;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_TOKEN',
                    message: '2FA token is required'
                }
            });
        }

        const user = await User.findById(userId);
        if (!user || !user.mfaSecret) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_SETUP',
                    message: '2FA setup not initiated'
                }
            });
        }

        // Verify token
        const verified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: token,
            window: 2
        });

        if (!verified) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid 2FA token'
                }
            });
        }

        // Enable 2FA
        user.mfaEnabled = true;
        await user.save();

        // Send confirmation email
        try {
            await send2FAEmail(user.email, 'ENABLED', user.username);
        } catch (emailError) {
            console.error('Failed to send 2FA confirmation email:', emailError);
        }

        res.json({
            success: true,
            message: 'Two-factor authentication enabled successfully'
        });
    } catch (error) {
        console.error('Verify 2FA setup error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while verifying 2FA'
            }
        });
    }
};

// Disable 2FA
export const disable2FA = async (req, res) => {
    try {
        const { password, token } = req.body;
        const userId = req.user.id;

        if (!password || !token) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_CREDENTIALS',
                    message: 'Password and 2FA token are required'
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

        if (!user.mfaEnabled) {
            return res.status(400).json({
                success: false,
                error: {
                    code: '2FA_NOT_ENABLED',
                    message: 'Two-factor authentication is not enabled'
                }
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_PASSWORD',
                    message: 'Invalid password'
                }
            });
        }

        // Verify 2FA token
        const verified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: token,
            window: 2
        });

        if (!verified) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid 2FA token'
                }
            });
        }

        // Disable 2FA
        user.mfaEnabled = false;
        user.mfaSecret = null;
        user.mfaBackupCodes = [];
        await user.save();

        res.json({
            success: true,
            message: 'Two-factor authentication disabled successfully'
        });
    } catch (error) {
        console.error('Disable 2FA error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while disabling 2FA'
            }
        });
    }
};

// Verify 2FA token during login
export const verify2FAToken = async (req, res) => {
    try {
        const { userId, token } = req.body;

        if (!userId || !token) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_CREDENTIALS',
                    message: 'User ID and 2FA token are required'
                }
            });
        }

        const user = await User.findById(userId);
        if (!user || !user.mfaEnabled) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'Invalid 2FA verification request'
                }
            });
        }

        // Check if it's a backup code
        const backupCodeIndex = user.mfaBackupCodes.findIndex(
            bc => bc.code === token.toUpperCase() && !bc.used
        );

        if (backupCodeIndex !== -1) {
            // Mark backup code as used
            user.mfaBackupCodes[backupCodeIndex].used = true;
            await user.save();

            return res.json({
                success: true,
                message: '2FA verified successfully using backup code',
                data: { verified: true, method: 'backup' }
            });
        }

        // Verify TOTP token
        const verified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: token,
            window: 2
        });

        if (!verified) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid 2FA token'
                }
            });
        }

        res.json({
            success: true,
            message: '2FA verified successfully',
            data: { verified: true, method: 'totp' }
        });
    } catch (error) {
        console.error('Verify 2FA token error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while verifying 2FA token'
            }
        });
    }
};

// Get 2FA status
export const get2FAStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select('mfaEnabled mfaBackupCodes');
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
        }

        const unusedBackupCodes = user.mfaBackupCodes?.filter(bc => !bc.used).length || 0;

        res.json({
            success: true,
            data: {
                enabled: user.mfaEnabled,
                backupCodesRemaining: unusedBackupCodes
            }
        });
    } catch (error) {
        console.error('Get 2FA status error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while getting 2FA status'
            }
        });
    }
};

// Regenerate backup codes
export const regenerateBackupCodes = async (req, res) => {
    try {
        const { password } = req.body;
        const userId = req.user.id;

        if (!password) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_PASSWORD',
                    message: 'Password is required'
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

        if (!user.mfaEnabled) {
            return res.status(400).json({
                success: false,
                error: {
                    code: '2FA_NOT_ENABLED',
                    message: 'Two-factor authentication is not enabled'
                }
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_PASSWORD',
                    message: 'Invalid password'
                }
            });
        }

        // Generate new backup codes
        const backupCodes = [];
        for (let i = 0; i < 10; i++) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            backupCodes.push({
                code,
                used: false
            });
        }

        user.mfaBackupCodes = backupCodes;
        await user.save();

        res.json({
            success: true,
            data: {
                backupCodes: backupCodes.map(b => b.code)
            },
            message: 'Backup codes regenerated successfully. Please save them securely.'
        });
    } catch (error) {
        console.error('Regenerate backup codes error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while regenerating backup codes'
            }
        });
    }
};

export default {
    enable2FA,
    verify2FASetup,
    disable2FA,
    verify2FAToken,
    get2FAStatus,
    regenerateBackupCodes
};

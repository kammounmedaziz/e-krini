import User from '../models/User.js';
import {generateAccessToken, generateRefreshToken, verifyRefreshToken} from '../utils/jwt.js';
import { createLoginHistory } from './loginHistoryController.js';
import speakeasy from 'speakeasy';

export const register = async (req, res) => {
    try {
        const {username, password, email, role = 'client', firstName, lastName, phoneNumber} = req.body;
        
        const existingUser = await User.findOne({ $or: [{username}, {email}] });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error:{
                    code: 'USER_ALREADY_EXISTS',
                    message: 'User with the given username or email already exists.'
                }
            });
        }

        // create new user
        const newUser = new User({
            username,
            password,
            email,
            role,
            firstName,
            lastName,
            phoneNumber
        });

        await newUser.save();

        //generate tokens
        const accessToken = generateAccessToken({
            id: newUser._id,
            username: newUser.username,
            role: newUser.role
        });

        const refreshToken = generateRefreshToken({
            id: newUser._id,
            username: newUser.username,
            role: newUser.role
        });

        //store refresh token
        newUser.refreshTokens.push({token: refreshToken});
        await newUser.save();

        // Determine redirect URL based on role
        let redirectUrl = '/';
        switch (newUser.role) {
            case 'admin':
                redirectUrl = '/admin/dashboard';
                break;
            case 'agency':
                redirectUrl = '/agency/dashboard';
                break;
            case 'insurance':
                redirectUrl = '/insurance/dashboard';
                break;
            case 'client':
            default:
                redirectUrl = '/client/dashboard';
                break;
        }

        res.status(201).json({
            success: true,
            data: {
                accessToken,
                refreshToken,
                expiresIn: 3600,
                redirectUrl,
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role,
                    profilePicture: newUser.profilePicture,
                    faceAuthEnabled: newUser.faceAuthEnabled
                }
            },
            message: 'User registered successfully.'
        });
    } catch (err) {
        console.error('Error during user registration:', err);
        res.status(500).json({
            success: false,
            error:{
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred during registration. Please try again later.'
            }
        });
    }
};

export const login = async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({ $or: [{username}, {email: username}] }); // allow login with username or email
        if (!user) {
            // Track failed login attempt
            await createLoginHistory(null, req, 'failed', 'password', 'User not found');
            
            return res.status(401).json({
                success: false,
                error:{
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid username or password.'
                }
            });
        }

        // Check if user is banned
        if (user.isBanned) {
            await createLoginHistory(user._id, req, 'blocked', 'password', 'User is banned');
            
            return res.status(403).json({
                success: false,
                error: {
                    code: 'USER_BANNED',
                    message: `Your account has been banned. Reason: ${user.banReason || 'No reason provided'}`
                }
            });
        }

        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            // Track failed login attempt
            await createLoginHistory(user._id, req, 'failed', 'password', 'Invalid password');
            
            return res.status(401).json({
                success: false,
                error:{
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid username or password.'
                }
            });
        }

        // Check if 2FA is enabled
        if (user.mfaEnabled) {
            // Don't generate full tokens yet, return a temporary indicator
            return res.json({
                success: true,
                data: {
                    requires2FA: true,
                    userId: user._id,
                    username: user.username
                },
                message: '2FA verification required'
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken({
            id: user._id,
            username: user.username,
            role: user.role
        });

        const refreshToken = generateRefreshToken({
            id: user._id,
            username: user.username,
            role: user.role
        });

        // Store refresh token
        user.refreshTokens.push({token: refreshToken});
        
        // Update login tracking
        user.lastLoginAt = new Date();
        user.loginCount = (user.loginCount || 0) + 1;
        
        await user.save();

        // Track successful login
        await createLoginHistory(user._id, req, 'success', 'password');

        // Determine redirect URL based on role
        let redirectUrl = '/';
        switch (user.role) {
            case 'admin':
                redirectUrl = '/admin/dashboard';
                break;
            case 'agency':
                redirectUrl = '/agency/dashboard';
                break;
            case 'insurance':
                redirectUrl = '/insurance/dashboard';
                break;
            case 'client':
            default:
                redirectUrl = '/client/dashboard';
                break;
        }

        res.json({
            success: true,
            data: {
                accessToken,
                refreshToken,
                expiresIn: 3600,
                redirectUrl,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture,
                    faceAuthEnabled: user.faceAuthEnabled,
                    mfaEnabled: user.mfaEnabled
                }
            },
            message: 'Login successful.'
        });
    } catch (err) {
        console.error('Error during user login:', err);
        res.status(500).json({
            success: false,
            error:{
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred during login. Please try again later.'
            }
        });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const {refreshToken} = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error:{
                    code: 'REFRESH_TOKEN_REQUIRED',
                    message: 'Refresh token is required.'
                }
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user and check if refresh token exists
        const user = await User.findOne({
            _id: decoded.id,
            'refreshTokens.token': refreshToken
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error:{
                    code: 'INVALID_REFRESH_TOKEN',
                    message: 'Refresh token is invalid or has been revoked.'
                }
            });
        }

        // Generate new access token
        const accessToken = generateAccessToken({
            id: user._id,
            username: user.username,
            role: user.role
        });

        res.json({
            success: true,
            data: {
                accessToken,
                expiresIn: 3600
            },
            message: 'Token refreshed successfully'
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: {
                code: 'TOKEN_REFRESH_FAILED',
                message: 'Failed to refresh token'
            }
        });
    }
};

export const logout = async (req, res) => {
    try {
        const {refreshToken} = req.body;

        if (refreshToken) {
            await User.updateOne(
                {'refreshTokens.token': refreshToken},
                {$pull: {refreshTokens: {token: refreshToken}}}
            );
        }

        res.json({
            success: true,
            message: 'Logged out successfully.'
        });
    } catch (err) {
        console.error('Error during user logout:', err);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred during logout. Please try again later.'
            }
        });
    }
};

export const enableFaceAuth = async (req, res) => {
    try {
        console.log('enableFaceAuth - Request received');
        console.log('enableFaceAuth - Request body:', req.body);
        const { userId, faceEncoding } = req.body;

        if (!userId || !faceEncoding) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_REQUIRED_FIELDS',
                    message: 'userId and faceEncoding are required.'
                }
            });
        }

        if (!Array.isArray(faceEncoding)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_FACE_ENCODING',
                    message: 'faceEncoding must be an array of numbers.'
                }
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found.'
                }
            });
        }

        // Store face encoding in main database
        user.faceAuthEnabled = true;
        user.faceEncoding = faceEncoding;
        await user.save();

        // Also register with AI backend for face recognition
        try {
            const axios = (await import('axios')).default;
            const aiResponse = await axios.post('http://127.0.0.1:5002/api/face/register-embeddings', {
                username: user.username,
                embeddings: [faceEncoding]  // Send as array of embeddings
            });

            if (aiResponse.data.success) {
                console.log('Face registered successfully with AI backend');
            } else {
                console.warn('AI backend registration failed:', aiResponse.data.error);
            }
        } catch (aiError) {
            console.error('Error registering with AI backend:', aiError.message);
            // Continue anyway - main DB registration succeeded
        }

        res.json({
            success: true,
            message: 'Face authentication enabled successfully.',
            data: {
                faceAuthEnabled: true
            }
        });
    } catch (err) {
        console.error('Error enabling face auth:', err);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while enabling face authentication.'
            }
        });
    }
};

export const loginWithFace = async (req, res) => {
    try {
        const { imageData, username } = req.body;

        if (!imageData) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_IMAGE_DATA',
                    message: 'Image data is required for face authentication.'
                }
            });
        }

        let user = null;

        // If username is provided, find user directly
        if (username) {
            user = await User.findOne({ username });
            if (!user) {
                await createLoginHistory(null, req, 'failed', 'face', 'User not found');
                
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'User not found.'
                    }
                });
            }
        } else {
            // Try AI backend for face recognition
            try {
                const axios = (await import('axios')).default;
                
                // Check if AI backend is running, if not, try to start it
                let aiBackendRunning = false;
                try {
                    await axios.get('http://127.0.0.1:5002/api/face/status', { timeout: 1000 });
                    aiBackendRunning = true;
                } catch (e) {
                    console.log('AI backend not running, attempting to start...');
                    // Try to start AI backend
                    const { spawn } = await import('child_process');
                    const path = await import('path');
                    const aiBackendPath = path.join(process.cwd(), '..', '..', 'AI-backend');
                    
                    spawn('python3', ['face_auth_api.py'], {
                        cwd: aiBackendPath,
                        detached: true,
                        stdio: 'ignore'
                    }).unref();
                    
                    // Wait 3 seconds for it to start
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    
                    try {
                        await axios.get('http://127.0.0.1:5002/api/face/status', { timeout: 2000 });
                        aiBackendRunning = true;
                        console.log('AI backend started successfully');
                    } catch (e2) {
                        console.log('Failed to start AI backend automatically');
                    }
                }
                
                if (aiBackendRunning) {
                    const aiResponse = await axios.post('http://127.0.0.1:5002/api/face/verify-frame', {
                        image: imageData
                    });

                    if (aiResponse.data.success && aiResponse.data.threshold_met && aiResponse.data.best_match) {
                        user = await User.findOne({ username: aiResponse.data.best_match });
                        console.log('Face recognized via AI backend as:', aiResponse.data.best_match);
                    }
                }
            } catch (aiError) {
                console.error('AI backend error:', aiError.message);
            }
        }

        if (!user) {
            await createLoginHistory(null, req, 'failed', 'face', 'Face not recognized');
            
            return res.status(401).json({
                success: false,
                error: {
                    code: 'FACE_NOT_RECOGNIZED',
                    message: 'Face not recognized. Please try again or use password login.'
                }
            });
        }

        // Check if user is banned
        if (user.isBanned) {
            await createLoginHistory(user._id, req, 'blocked', 'face', 'User is banned');
            
            return res.status(403).json({
                success: false,
                error: {
                    code: 'USER_BANNED',
                    message: `Your account has been banned. Reason: ${user.banReason || 'No reason provided'}`
                }
            });
        }

        // Check if face auth is enabled for this user
        if (!user.faceAuthEnabled || !user.faceEncoding) {
            await createLoginHistory(user._id, req, 'failed', 'face', 'Face auth not enabled');
            
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FACE_AUTH_NOT_ENABLED',
                    message: 'Face authentication is not enabled for this user. Please enable it in settings first.'
                }
            });
        }

        // For now, accept any face if face auth is enabled and user is found
        // In a production system, you would compare the captured face with stored encoding
        console.log('Face authentication successful for user:', user.username);

        // Generate tokens
        const accessToken = generateAccessToken({
            id: user._id,
            username: user.username,
            role: user.role
        });

        const refreshToken = generateRefreshToken({
            id: user._id,
            username: user.username,
            role: user.role
        });

        // Store refresh token
        user.refreshTokens.push({ token: refreshToken });
        
        // Update login tracking
        user.lastLoginAt = new Date();
        user.loginCount = (user.loginCount || 0) + 1;
        
        await user.save();

        // Track successful login
        await createLoginHistory(user._id, req, 'success', 'face');

        // Determine redirect URL based on role
        let redirectUrl = '/';
        switch (user.role) {
            case 'admin':
                redirectUrl = '/admin/dashboard';
                break;
            case 'agency':
                redirectUrl = '/agency/dashboard';
                break;
            case 'insurance':
                redirectUrl = '/insurance/dashboard';
                break;
            case 'client':
            default:
                redirectUrl = '/client/dashboard';
                break;
        }

        res.json({
            success: true,
            data: {
                accessToken,
                refreshToken,
                expiresIn: 3600,
                redirectUrl,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture,
                    faceAuthEnabled: user.faceAuthEnabled
                }
            },
            message: 'Face authentication successful.'
        });
    } catch (err) {
        console.error('Error during face login:', err);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred during face authentication.'
            }
        });
    }
};

// Complete login with 2FA
export const loginWith2FA = async (req, res) => {
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
            await createLoginHistory(userId, req, 'failed', '2fa', 'Invalid 2FA request');
            
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

        let verified = false;
        let method = 'totp';

        if (backupCodeIndex !== -1) {
            // Mark backup code as used
            user.mfaBackupCodes[backupCodeIndex].used = true;
            verified = true;
            method = 'backup';
        } else {
            // Verify TOTP token
            verified = speakeasy.totp.verify({
                secret: user.mfaSecret,
                encoding: 'base32',
                token: token,
                window: 2
            });
        }

        if (!verified) {
            await createLoginHistory(user._id, req, 'failed', '2fa', 'Invalid 2FA token');
            
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid 2FA token'
                }
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken({
            id: user._id,
            username: user.username,
            role: user.role
        });

        const refreshToken = generateRefreshToken({
            id: user._id,
            username: user.username,
            role: user.role
        });

        // Store refresh token
        user.refreshTokens.push({ token: refreshToken });
        
        // Update login tracking
        user.lastLoginAt = new Date();
        user.loginCount = (user.loginCount || 0) + 1;
        
        await user.save();

        // Track successful login
        await createLoginHistory(user._id, req, 'success', '2fa');

        // Determine redirect URL based on role
        let redirectUrl = '/';
        switch (user.role) {
            case 'admin':
                redirectUrl = '/admin/dashboard';
                break;
            case 'agency':
                redirectUrl = '/agency/dashboard';
                break;
            case 'insurance':
                redirectUrl = '/insurance/dashboard';
                break;
            case 'client':
            default:
                redirectUrl = '/client/dashboard';
                break;
        }

        res.json({
            success: true,
            data: {
                accessToken,
                refreshToken,
                expiresIn: 3600,
                redirectUrl,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture,
                    faceAuthEnabled: user.faceAuthEnabled,
                    mfaEnabled: user.mfaEnabled
                },
                method
            },
            message: '2FA verification successful'
        });
    } catch (error) {
        console.error('2FA login error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred during 2FA verification'
            }
        });
    }
};




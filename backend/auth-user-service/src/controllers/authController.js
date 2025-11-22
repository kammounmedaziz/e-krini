import User from '../models/User.js';
import {generateAccessToken, generateRefreshToken, verifyRefreshToken} from '../utils/jwt.js';

export const register = async (req, res) => {
    try {
        const {username, password, email, role = 'client'} = req.body;
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
            role
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

        res.status(201).json({
            success: true,
            data: {
                accessToken,
                refreshToken,
                expiresIn: 3600,
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
            return res.status(401).json({
                success: false,
                error:{
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid username or password.'
                }
            });
        }

        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                error:{
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid username or password.'
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
        user.refreshTokens.push({token: refreshToken});
        await user.save();

        res.json({
            success: true,
            data: {
                accessToken,
                refreshToken,
                expiresIn: 3600,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture,
                    faceAuthEnabled: user.faceAuthEnabled
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
                const aiResponse = await axios.post('http://127.0.0.1:5002/api/face/verify-frame', {
                    image: imageData
                });

                if (aiResponse.data.success && aiResponse.data.threshold_met && aiResponse.data.best_match) {
                    user = await User.findOne({ username: aiResponse.data.best_match });
                    console.log('Face recognized via AI backend as:', aiResponse.data.best_match);
                }
            } catch (aiError) {
                console.error('AI backend error:', aiError.message);
            }
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'FACE_NOT_RECOGNIZED',
                    message: 'Face not recognized. Please try again or use password login.'
                }
            });
        }

        // Check if face auth is enabled for this user
        if (!user.faceAuthEnabled || !user.faceEncoding) {
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
        await user.save();

        res.json({
            success: true,
            data: {
                accessToken,
                refreshToken,
                expiresIn: 3600,
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




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
                    role: newUser.role
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
                    role: user.role
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



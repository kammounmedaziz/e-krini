import User from '../models/User.js';

export const getUserProfile = async (req, res) => {
    try {
        console.log('getUserProfile - Request received');
        console.log('getUserProfile - req.user:', req.user);
        console.log('getUserProfile - req.headers.authorization:', req.headers.authorization ? 'Present' : 'Missing');

        const user = await User.findById(req.user.id).select('-password -refreshTokens');
        console.log('getUserProfile - Found user:', user ? 'Yes' : 'No');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found.'
                }
            });
        }
        return res.json({
            success: true,
            data: { 
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture,
                    faceAuthEnabled: user.faceAuthEnabled,
                    kycStatus: user.kycStatus
                }
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: {
                code: 'PROFILE_FETCH_ERROR',
                message: 'Failed to fetch profile.'
            }
        });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { username, email },
            { new: true }
        ).select('-password -refreshTokens');
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found.'
                }
            });
        }
        return res.json({
            success: true,
            data: { user },
            message: 'Profile updated successfully.'
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: {
                code: 'PROFILE_UPDATE_ERROR',
                message: 'Failed to update profile.'
            }
        });
    }
};

export const uploadProfilePicture = async (req, res) => {
    try {
        const { imageData } = req.body;
        
        if (!imageData) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_IMAGE_DATA',
                    message: 'Image data is required.'
                }
            });
        }

        // Validate base64 image
        if (!imageData.startsWith('data:image/')) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_IMAGE_FORMAT',
                    message: 'Invalid image format. Must be a base64 encoded image.'
                }
            });
        }

        // Update user's profile picture
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profilePicture: imageData },
            { new: true }
        ).select('-password -refreshTokens');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found.'
                }
            });
        }

        return res.json({
            success: true,
            data: { 
                profilePicture: user.profilePicture,
                user 
            },
            message: 'Profile picture uploaded successfully.'
        });
    } catch (err) {
        console.error('Upload profile picture error:', err);
        return res.status(500).json({
            success: false,
            error: {
                code: 'UPLOAD_ERROR',
                message: 'Failed to upload profile picture.'
            }
        });
    }
};

export const deleteProfilePicture = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profilePicture: null },
            { new: true }
        ).select('-password -refreshTokens');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found.'
                }
            });
        }

        return res.json({
            success: true,
            data: { user },
            message: 'Profile picture removed successfully.'
        });
    } catch (err) {
        console.error('Delete profile picture error:', err);
        return res.status(500).json({
            success: false,
            error: {
                code: 'DELETE_ERROR',
                message: 'Failed to remove profile picture.'
            }
        });
    }
};
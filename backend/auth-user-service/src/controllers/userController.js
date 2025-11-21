import User from '../models/User.js';

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -refreshTokens');
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
            data: { user }
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
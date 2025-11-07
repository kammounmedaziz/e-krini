import User from '../models/User.js';

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
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
            data: {user}
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: {
                code: 'profile_fetch_error',
                message: 'failed to fetch profile.'
            }
        });
    }
};


export const updateProfile = async (req, res) => {
    try {
        const {username, email} = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id, 
            {username, email}, 
            {new: true}
        );
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
            data: {user}
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: {
                code: 'profile_update_error',
                message: 'failed to update profile.'
            }
        });
    }
};
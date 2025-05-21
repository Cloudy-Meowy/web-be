const User = require('../db/schema.js').User;

exports.updateUser = async (req, res) => {
    const { display_name, avatar_url, bio } = req.body;

    if (!display_name && !avatar_url && !bio) {
        return res.status(400).json({ message: 'Display name, avatar URL, and bio are required.' });
    }

    try {
        const userId = req.user.id; // Lấy ID người dùng từ token đã xác thực
        const updatedUser = await User.update({
            display_name,
            avatar_url,
            bio
        }).where({ id: userId });

        if (updatedUser) {
            return res.status(200).json({ message: 'User updated successfully.', user:updatedUser});
        } else {
            return res.status(404).json({ message: 'User not found.' });
        }
    }
    catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}

exports.getUserProfile = async (req, res) => {
}
// controllers/usersController.js
const { getProfileById,
    updateProfileById } = require('../services/userServices');

const getProfile = async (req, res) => {
    try {
        // ID được lấy từ middleware 'auth'
        const userId = req.user.id;

        // Gọi service để làm việc
        const userProfile = await getProfileById(userId);

        res.status(200).json(userProfile);
    } catch (err) {
        console.error("Lỗi trong userController.getProfile:", err);
        // Trả về lỗi mà service đã ném
        res.status(500).json({ message: err.message });
    }
};

const getPublicProfileById = async (req, res) => {
    try {
        const { id } = req.params;
        const coachProfile = await getProfileById(id);
        res.status(200).json(coachProfile);
    } catch (error) {
        res.status(err.status || 500).json({ message: error.message || "Server Error" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profileData = req.body; // Toàn bộ data từ form

        // Gọi service để làm việc
        const result = await updateProfileById(userId, profileData);

        res.status(200).json(result); // { message: "Cập nhật thành công!" }
    } catch (err) {
        console.error("Lỗi trong userController.updateProfile:", err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getProfile, updateProfile, getPublicProfileById };

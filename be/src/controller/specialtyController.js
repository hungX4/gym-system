const {
    getAll
} = require('../services/specialtyServices');

const getAllSpecialties = async (req, res) => {
    try {
        const specialties = await getAll();
        res.status(200).json(specialties);
    } catch (err) {
        console.error("Lỗi trong specialtyController.getAllSpecialties:", err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllSpecialties
}
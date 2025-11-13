const db = require('../models');

const getAll = async () => {
    try {
        const specialties = await db.Specialty.findAll({
            attributes: ['specialty_id', 'name', 'description']
        });
        return specialties;
    } catch (err) {
        throw new Error("Lỗi khi lấy danh sách chuyên môn");
    }
};

module.exports = {
    getAll
};
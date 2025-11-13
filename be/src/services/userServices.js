// services/usersService.js
const db = require('../models');
const bcrypt = require('bcryptjs');
const Users = db.Users;
const UserDetails = db.UserDetails;

const createUser = async (payload) => {
    const hashed = await bcrypt.hash(payload.password, 10);
    const user = await Users.create({ ...payload, password: hashed });
    return user;
};

const findByPhone = async (phonenumber) => {
    return Users.findOne({ where: { phonenumber }, include: [{ model: UserDetails, as: 'detail' }] });
};

const getProfileById = async (userId) => {
    const userProfile = await Users.findOne({
        where: { id: userId },
        attributes: ['id', 'fullname', 'email', 'phonenumber', 'role'],
        include: [{
            model: UserDetails,
            as: 'detail',
            attributes: ['address', 'gender', 'specialty_id'],
            required: false // Dùng LEFT JOIN
        }]
    });

    if (!userProfile) {
        // Ném lỗi để controller bắt
        throw new Error("Không tìm thấy người dùng.");
    }
    return userProfile;
};

const updateProfileById = async (userId, profileData) => {
    const {
        fullname,
        phonenumber,
        password, // Mật khẩu MỚI
        address,
        gender,
        specialty_id
    } = profileData;

    // Dùng transaction để đảm bảo cả 2 bảng cùng thành công hoặc thất bại
    try {
        const result = await db.sequelize.transaction(async (t) => {

            // --- CẬP NHẬT BẢNG `User` ---
            const userDataToUpdate = {
                fullname,
                phonenumber
            };

            if (password) {
                if (password.length < 6) {
                    throw new Error("Mật khẩu phải dài ít nhất 6 ký tự");
                }
                userDataToUpdate.password = await bcrypt.hash(password, 10);
            }

            await Users.update(userDataToUpdate, {
                where: { id: userId },
                transaction: t
            });

            // --- CẬP NHẬT/TẠO MỚI BẢNG `UserDetail` (Logic UPSERT) ---
            await UserDetails.upsert({
                user_id: userId,
                address: address || null,
                gender: gender || null,
                specialty_id: specialty_id || null
            }, {
                transaction: t
            });

            return { message: "Cập nhật thành công!" };
        });

        return result;

    } catch (err) {
        // Nếu transaction thất bại, nó sẽ tự rollback
        // Ném lỗi để controller bắt
        throw new Error(err.message || "Lỗi khi cập nhật profile");
    }
};

const getSpecialtyById = async () => {
    try {
        const specialties = await db.Specialty.findAll({
            attributes: ['id', 'name', 'description']
        });
        return specialties;
    } catch (err) {
        throw new Error("Lỗi khi lấy danh sách chuyên môn");
    }
};
module.exports = {
    createUser,
    findByPhone,
    getProfileById,
    updateProfileById,
    getSpecialtyById
};

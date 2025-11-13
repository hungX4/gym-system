const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const db = require('../models/index');
const { raw } = require('express');
const { where } = require('sequelize');

const addNewUser = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const hashPasswordFromBcryptjs = await hashUserPassword(data.password);
            await db.Users.create({
                fullname: data.fullname,
                phonenumber: data.phonenumber,
                password: hashPasswordFromBcryptjs,
                address: data.address,
                gender: data.gender === '1' ? true : false,
                roleid: data.roleid
            })
            resolve('create user succeed!');
        } catch (err) {
            console.error('Sequelize error name:', err.name);
            console.error('Sequelize error message:', err.message);

        }
    })
}

const getAllUsers = () => {
    try {
        return users = db.Users.findAll({
            raw: true
        });

    } catch (error) {
        console.log(error);
    }
}
// const addNewUser = async (data) => {
//   try {
//     const hashPassword = await hashUserPassword(data.password);
//     await db.Users.create({
//       fullname: data.fullname,
//       phonenumber: data.phonenumber,
//       password: hashPassword,
//       address: data.address,
//       gender: data.gender === '1',
//       roleId: data.roleId
//     });
//     return 'Create user succeed!';
//   } catch (error) {
//     throw error; // tự động bị reject nếu dùng async
//   }
// };

const hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            const hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e);
        }
    })
}

const getUserData = async (id) => {
    try {
        const user = await db.Users.findOne({
            where: { id: id },
            raw: true
        })
        if (user) {
            return user;
        } else {
            return [];
        }
    } catch (error) {
        console.log(error);
    }
}
const updateUserInformation = async (data) => {
    try {
        await db.Users.update(
            {
                fullname: data.fullname,
                address: data.address,
                gender: data.gender,
            },
            {
                where: { id: data.id }
            }
        )
    } catch (error) {
        console.log(error);
    }
}

const deleteCrudById = async (userId) => {
    let user = await db.Users.findOne({
        where: { id: userId }
    })
    if (user) {
        await user.destroy();
    }
}
module.exports = {
    addNewUser,
    getAllUsers,
    getUserData,
    updateUserInformation,
    deleteCrudById
}
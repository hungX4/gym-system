// models/users.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      // ví dụ: Users.hasMany(models.Posts)
    }
  }

  Users.init(
    {
      fullname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Full name không được để trống' },
          len: { args: [3, 50], msg: 'Full name phải từ 3–50 ký tự' }
        }
      },
      phonenumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: 'Số điện thoại đã tồn tại' },
        validate: {
          notEmpty: { msg: 'Số điện thoại không được để trống' },
          is: {
            args: /^[0-9]{10,11}$/,
            msg: 'Số điện thoại không hợp lệ (chỉ gồm 10–11 chữ số)'
          }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Mật khẩu không được để trống' },
          len: { args: [6, 100], msg: 'Mật khẩu phải từ 6 ký tự trở lên' }
        }
      },
      address: {
        type: DataTypes.STRING,
        validate: {
          len: { args: [0, 255], msg: 'Địa chỉ quá dài' }
        }
      },
      gender: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        validate: {
          notNull: { msg: 'Giới tính là bắt buộc' }
        }
      },
      roleid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      sequelize,
      modelName: 'Users',
      tableName: 'Users',
      timestamps: true
    }
  );

  return Users;
};

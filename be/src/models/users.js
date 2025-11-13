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
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      fullname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Full name không được để trống' },
          len: { args: [3, 50], msg: 'Full name phải từ 3–50 ký tự' }
        },
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
      },
      email: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: true
      },

      phonenumber: {
        type: DataTypes.STRING(30),
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
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Mật khẩu không được để trống' },
          len: { args: [6, 100], msg: 'Mật khẩu phải từ 6 ký tự trở lên' }
        }
      },
      role: {
        type: DataTypes.ENUM('admin', 'user', 'coach'),
        allowNull: false,
        defaultValue: 'user'
      },
    },
    {
      sequelize,
      modelName: 'Users',
      tableName: 'Users',
      timestamps: true,
      underscored: true,

    }
  );
  Users.associate = function (models) {
    Users.hasOne(models.UserDetails, { foreignKey: 'user_id', as: 'detail' });
    Users.hasMany(models.Booking, { foreignKey: 'user_id', as: 'bookings' });
    Users.hasMany(models.Schedules, { foreignKey: 'user_id', as: 'schedulesAsUser' });
    Users.hasMany(models.Schedules, { foreignKey: 'coach_id', as: 'schedulesAsCoach' });
    Users.hasMany(models.Histories, { foreignKey: 'user_id', as: 'histories' });
  };
  return Users;
};

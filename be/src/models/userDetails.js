//model/userDetails
'use strict'

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserDetails extends Model {
        static associate(models) {
            // ví dụ: Users.hasMany(models.Posts)
        }
    }

    UserDetails.init(
        {
            user_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true
            },
            address: {
                type: DataTypes.STRING(255),
                validate: {
                    len: { args: [0, 255], msg: 'Địa chỉ quá dài' }
                },
                allowNull: true
            },
            gender: {
                type: DataTypes.ENUM('male', 'female', 'others'),
                allowNull: true
            },
            specialty_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true
            },
            has_confirmed_booking: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
        },
        {
            sequelize,
            modelName: 'UserDetails',
            tableName: 'UserDetails',
            timestamps: true,
            underscored: true
        }
    );
    UserDetails.associate = function (models) {
        UserDetails.belongsTo(models.Users, { foreignKey: 'user_id', as: 'user' });
        UserDetails.belongsTo(models.Specialty, { foreignKey: 'specialty_id', as: 'specialty' });
    };

    return UserDetails;
};
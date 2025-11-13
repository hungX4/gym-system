'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Booking extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Booking.init({
        booking_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
        },
        coach_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
        },
        slot_start: {
            type: DataTypes.DATE,
            allowNull: false
        },
        note: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
            allowNull: false,
            defaultValue: 'pending'
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }

    }, {
        sequelize,
        modelName: 'Booking',
        timestamps: false,
        underscored: true,
        tableName: 'Booking'
    });

    Booking.associate = function (models) {
        Booking.belongsTo(models.Users, { foreignKey: 'user_id', as: 'user' });
        Booking.belongsTo(models.Users, { foreignKey: 'coach_id', as: 'coach' });
        Booking.hasMany(models.Histories, { foreignKey: 'booking_id', as: 'histories' });
    };

    return Booking;
};
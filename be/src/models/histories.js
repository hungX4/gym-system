'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Histories extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Histories.init({
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        user_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true
        },
        coach_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true
        },
        booking_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true
        },
        action: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        note: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'Histories',
        tableName: 'Histories',
        timestamps: false,
        underscored: true

    });
    Histories.associate = function (models) {
        Histories.belongsTo(models.Users, { foreignKey: 'user_id', as: 'user' });
        Histories.belongsTo(models.Users, { foreignKey: 'coach_id', as: 'coach' });
        Histories.belongsTo(models.Booking, { foreignKey: 'booking_id', as: 'booking' });
    };
    return Histories;
};
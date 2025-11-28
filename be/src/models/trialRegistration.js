'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TrialRegistration extends Model {
        static associate(models) {
            // define association here if needed
        }
    }
    TrialRegistration.init({
        fullname: DataTypes.STRING,
        phonenumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: DataTypes.STRING,
        status: {
            type: DataTypes.ENUM('new', 'contacted', 'converted', 'cancelled'),
            allowNull: false,
            defaultValue: 'new'
        },
        note: DataTypes.TEXT,
        turn: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'TrialRegistration',
        tableName: 'TrialRegistrations',
        underscored: true, // Dùng snake_case cho tên cột (created_at, updated_at)
    });
    return TrialRegistration;
};
'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Schedules extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Schedules.init({
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        slot_start: {
            type: DataTypes.DATE,
            allowNull: false
        },
        user_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
        },
        coach_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('confirmed', 'completed'),
            allowNull: false,
            defaultValue: 'confirmed'
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
        modelName: 'Schedules',
        tableName: 'Schedules',
        timestamps: false,
        indexes: [{ fields: ['slot_start'] }],
        uniqueKeys: {
            ux_coach_slot: {
                fields: ['coach_id', 'slot_start']
            }
        },
        underscored: true

    });

    Schedules.associate = function (models) {
        Schedules.belongsTo(models.Users, { foreignKey: 'user_id', as: 'user' });
        Schedules.belongsTo(models.Users, { foreignKey: 'coach_id', as: 'coach' });
    };
    return Schedules;
};
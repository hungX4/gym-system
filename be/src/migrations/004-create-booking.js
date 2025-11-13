'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Booking', {

            booking_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            user_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                references: { model: 'Users', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            coach_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
                references: { model: 'Users', key: 'id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            },
            slot_start: {
                type: Sequelize.DATE,
                allowNull: false
            },
            note: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
                allowNull: false,
                defaultValue: 'pending'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
        await queryInterface.addIndex('Booking', ['slot_start']);
        await queryInterface.addIndex('Booking', ['status']);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Members');
    }
};
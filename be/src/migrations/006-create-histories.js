'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Histories', {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            user_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
                references: { model: 'Users', key: 'id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            },
            coach_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
                references: { model: 'Users', key: 'id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            },
            booking_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
                references: { model: 'Booking', key: 'booking_id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            },
            action: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            note: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
        await queryInterface.addIndex('Histories', ['booking_id']);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Histories');
    }
};
// migrations/XXXX-create-user_details.js
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('UserDetails', {
            user_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true
            },
            address: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            gender: {
                type: Sequelize.ENUM('male', 'female', 'other'),
                allowNull: false,
                defaultValue: 'other'
            },
            specialty_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
                references: {
                    model: 'Specialty',
                    key: 'specialty_id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            },
            has_confirmed_booking: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
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

        // add FK to Users (user_id -> Users.id)
        await queryInterface.addConstraint('UserDetails', {
            fields: ['user_id'],
            type: 'foreign key',
            name: 'fk_ud_user',
            references: {
                table: 'Users',
                field: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeConstraint('UserDetails', 'fk_ud_user');
        await queryInterface.dropTable('UserDetails');
    }
};

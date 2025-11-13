'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      // id: DataTypes.STRING,
      // fullname: DataTypes.STRING,
      // phonenumber: DataTypes.STRING,
      // address: DataTypes.STRING,
      // gender: DataTypes.BOOLEAN,
      // roleid: DataTypes.STRING
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      fullname: {
        type: Sequelize.STRING(200),
        allowNull: false,
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      },
      phonenumber: {
        type: Sequelize.STRING(30),
        allowNull: true,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      // address: {
      //   type: Sequelize.STRING
      // },
      // gender: {
      //   type: Sequelize.BOOLEAN
      // },
      role: {
        type: Sequelize.ENUM('admin', 'user', 'coach')
      },
      // specialty: {
      //   type: Sequelize.STRING
      // },
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
    await queryInterface.addIndex('Users', ['role']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
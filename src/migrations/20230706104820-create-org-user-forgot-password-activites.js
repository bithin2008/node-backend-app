'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_org_users_forgot_password_activities', {
      org_user_forgot_password_activity_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      org_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        name: 'hws_org_users_forgot_password_activites_org_user_id_fk',
        references: {
          model: 'hws_org_users',
          key: 'org_user_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      active_status: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 1,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      }
    }, {
      schema: 'hws_schema',
    });
  
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('hws_org_users_forgot_password_activities', 'hws_org_users_forgot_password_activites_org_user_id_fk');
    await queryInterface.dropTable('hws_org_users_forgot_password_activities');
  }
};
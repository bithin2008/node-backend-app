'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_customer_forgot_password_activities', {
      customer_forgot_password_activity_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        name: 'hws_customer_forgot_password_activities_customer_id_fk',
        references: {
          model: 'hws_customers',
          key: 'customer_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_customer_forgot_password_activities_org_id_fk',
        
        references: {
          model: 'hws_organizations',
          key: 'org_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_organizations=>org_id",
        validate: {
          notNull: {
            msg: "Please select a organization",
          },
          notEmpty: {
            msg: "organisation name cannot be empty",
          },
  
        },
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
      schema: 'hws_schema'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      'hws_customer_forgot_password_activities',
      'hws_customer_forgot_password_activities_customer_id_fk'
    );
    await queryInterface.removeConstraint(
      'hws_customer_forgot_password_activities',
      'hws_customer_forgot_password_activities_org_id_fk'
    );
    await queryInterface.dropTable('hws_customer_forgot_password_activities');
  }
};
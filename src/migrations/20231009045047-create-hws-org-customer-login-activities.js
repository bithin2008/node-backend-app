'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_org_customer_login_activities', {
      org_customer_login_activity_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      customer_id: {
        allowNull: false,
        name: 'hws_org_customers_login_activities_customer_id_fk',
        type: Sequelize.INTEGER,
        references: {
          model: 'hws_customers',
          key: 'customer_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_customers=>customer_id",
      },
      token: {
        allowNull: true,
        defaultValue:null,
        type: Sequelize.STRING,
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      device_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_agent: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      os_platform: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_by: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER,
      },
      updated_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      deleted_by: {
        allowNull: true,
        type: Sequelize.INTEGER
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
      },
    }, {
      schema: 'hws_schema'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      'hws_org_customer_login_activities',
      'hws_org_customers_login_activities_customer_id_fk'
    );
    await queryInterface.dropTable('hws_org_customer_login_activities');
  }
};
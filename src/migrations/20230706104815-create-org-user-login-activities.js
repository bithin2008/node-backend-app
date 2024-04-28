'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'hws_org_user_login_activities',
      {
        org_user_login_activity_id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        org_user_id: {
          allowNull: false,
          name: 'hws_org_users_login_activities_org_user_id_fk',
          type: Sequelize.INTEGER,
          references: {
            model: 'hws_org_users',
            key: 'org_user_id'
          },
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
          comment: "table=>org_users=>org_user_id",
        },
        token: Sequelize.STRING,
        ip_address: Sequelize.STRING,
        user_agent: Sequelize.STRING,
        device_id: Sequelize.STRING,
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
      },
      {
        schema: 'hws_schema',
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      'hws_org_user_login_activities',
      'hws_org_users_login_activities_org_user_id_fk'
    );
    await queryInterface.dropTable('hws_org_user_login_activities');
  },
};

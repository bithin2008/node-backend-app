'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_payment_status', {
      payment_status_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_payment_status_org_id_fk',
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
            msg: "Organisation name cannot be empty",
          },
        },
      },
  
      status_name: {
        allowNull: false,
        type: Sequelize.STRING,
        validate: {
          notNull: {
            msg: "Please provide a status name",
          },
          notEmpty: {
            msg: "status name cannot be empty",
          },
        },
      },
      
      value: {
        allowNull: false,
        unique: true,
        type: Sequelize.INTEGER,
        validate: {
          notNull: {
            msg: "Please provide a status value",
          },
          notEmpty: {
            msg: "status value cannot be empty",
          },
        },
      },

      status_color: {
        allowNull: true,
        unique: true,
        type: Sequelize.STRING,
      },

      active_status: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        defaultValue: 1,
        comment: "active=>1, inactive=>0",
      },
      created_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        defaultValue:null,
        name: 'hws_payment_status_created_by_fk',
        references: {
          model: 'hws_org_users',
          key: 'org_user_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_org_users=>org_user_id",
      },
      updated_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        defaultValue:null,
        name: 'hws_payment_status_updated_by_fk',
        references: {
          model: 'hws_org_users',
          key: 'org_user_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_org_users=>org_user_id",
      },
      deleted_by: {
        allowNull: true,
        defaultValue:null,
        type: Sequelize.INTEGER,
        name: 'hws_payment_status_deleted_by_fk',
        references: {
          model: 'hws_org_users',
          key: 'org_user_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_org_users=>org_user_id",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue:new Date()
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue:new Date()
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      }
    },
    {
      schema: 'hws_schema'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('hws_payment_status', 'hws_payment_status_org_id_fk');
    await queryInterface.removeConstraint('hws_payment_status', 'hws_payment_status_deleted_by_fk');
    await queryInterface.removeConstraint('hws_payment_status', 'hws_payment_status_updated_by_fk');
    await queryInterface.removeConstraint('hws_payment_status', 'hws_payment_status_created_by_fk');
    await queryInterface.dropTable('hws_payment_status');
  }
};
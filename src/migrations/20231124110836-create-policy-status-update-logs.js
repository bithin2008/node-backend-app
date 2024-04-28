'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_policy_status_update_logs', {
      policy_satus_update_log_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_policy_status_update_logs_org_id_fk',
        
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
          }
        }
      },
      policy_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_policy_status_update_logs_policy_id_fk',
        references: {
          model: 'hws_policies',
          key: 'policy_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_policies=>policy_id",
        validate: {
          notNull: {
            msg: "Please select a policy",
          },
          notEmpty: {
            msg: "policy name cannot be empty",
          },
        },
      },
      prev_policy_status_id: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        comment: "Cancelled=>0, 30 Days Wait=>2,Expired=>3, Escrow - Pending =>4, Do not Charge =>5, Hold (Failed Payment)=>6, Pending (Link-Payment) => 7",
      },
      prev_policy_status: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      current_policy_status_id: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        comment: "Cancelled=>0, 30 Days Wait=>2,Expired=>3, Escrow - Pending =>4, Do not Charge =>5, Hold (Failed Payment)=>6, Pending (Link-Payment) => 7",
      },
      current_policy_status: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      description:{
        allowNull: true,
        defaultValue:null,
        type: Sequelize.STRING,
      },
      create_user_type: {
        allowNull: true,
        defaultValue: 1,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1,  admin-user=>2, realtor=>3,",
      },
      update_user_type: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1, admin-user=>2, realtor=>3,",
      },
      created_by: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER,
        comment: "table=>depending on the create_user_type value =>respected table id",
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
    await queryInterface.removeConstraint('hws_policy_status_update_logs', 'hws_policy_status_update_logs_org_id_fk');
    await queryInterface.removeConstraint('hws_policy_status_update_logs', 'hws_policy_status_update_logs_policy_id_fk');

    await queryInterface.dropTable('hws_policy_status_update_logs');
  }
};
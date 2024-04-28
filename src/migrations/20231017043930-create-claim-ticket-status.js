'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_claim_ticket_statuses', {
      claim_ticket_statuses_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_claim_ticket_statuses_org_id_fk',
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
      ticket_status: {
        type: Sequelize.STRING(150),
        allowNull: false,
        validate: {
          notNull: {
            msg: "Ticket status can not be null",
          },
          notEmpty: {
            msg: "ticket status cannot be empty",
          }
        }
      },
      status_description: {
        type: Sequelize.STRING(250),
        allowNull: true,
        defaultValue: null
      }, 
      ticket_identifier:{
        allowNull: false,
        type: Sequelize.SMALLINT,
        defaultValue: 1,
        comment: '1=>Ticket Status, 2 =>Progression Status',
      },
      active_status: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        defaultValue: 1,
        comment: "active=>1, inactive=>0"
      },
      
      created_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        name: 'hws_claim_ticket_statuses_created_by_fk',
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
        defaultValue:null,
        type: Sequelize.INTEGER,
        name: 'hws_claim_ticket_statuses_updated_by_fk',
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
        type: Sequelize.INTEGER,
        name: 'hws_claim_ticket_statuses_deleted_by_fk',
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
    await queryInterface.removeConstraint('hws_claim_ticket_statuses', 'hws_claim_ticket_statuses_org_id_fk');
    await queryInterface.removeConstraint('hws_claim_ticket_statuses', 'hws_claim_ticket_statuses_created_by_fk');
    await queryInterface.removeConstraint('hws_claim_ticket_statuses', 'hws_claim_ticket_statuses_updated_by_fk');
    await queryInterface.removeConstraint('hws_claim_ticket_statuses', 'hws_claim_ticket_statuses_deleted_by_fk');
    await queryInterface.dropTable('hws_claim_ticket_statuses');
  }
};
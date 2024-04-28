'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_service_call_fees', {
        service_call_fees_id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          org_id: {
            allowNull: false,
            type: Sequelize.INTEGER,
            name: 'hws_service_call_fee_org_id_fk',
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
          month: {
            allowNull: false,
            type:Sequelize.INTEGER,
            validate: {        
              notNull: {
                msg: "Please provide month.",
              },
              notEmpty: {
                msg: "month cannot be empty",
              },
            },
          },
      
          scf_value: {
            allowNull: false,
            type:Sequelize.DOUBLE,
            validate: {        
              notNull: {
                msg: "Please provide scf value.",
              },
              notEmpty: {
                msg: "scf value cannot be empty",
              },
            },
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
            defaultValue: null,
            name: 'hws_service_call_fee_created_by_fk',
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
            defaultValue: null,
            name: 'hws_service_call_fee_updated_by_fk',
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
            name: 'hws_service_call_fee_deleted_by_fk',
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
            defaultValue: new Date(),
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: new Date(),
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
    await queryInterface.removeConstraint('hws_service_call_fees', 'hws_service_call_fee_org_id_fk');
    await queryInterface.removeConstraint('hws_service_call_fees', 'hws_service_call_fee_created_by_fk');
    await queryInterface.removeConstraint('hws_service_call_fees', 'hws_service_call_fee_updated_by_fk');
    await queryInterface.removeConstraint('hws_service_call_fees', 'hws_service_call_fee_deleted_by_fk');
    await queryInterface.dropTable('hws_service_call_fees');
  }
};
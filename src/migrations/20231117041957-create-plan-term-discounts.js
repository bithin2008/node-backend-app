'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_planterm_discounts', {
      planterm_discount_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_planterm_discounts_org_id_fk',
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
          }        
        }
      }, 
      plan_term: {
        allowNull: false,
        type: Sequelize.INTEGER,
        validate: {
          notEmpty: {
            msg: "Plan Term can not be empty",
          }
        },
        comment: "Plan Term In Months",
      },
      price_percentage: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Price or percentage can not be empty",
          }
        },
        comment: "Price=>0,Percentage=>1"
      },   
      discount_value: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Discount value cannot be empty",
          }
        }
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
        name: 'hws_planterm_discounts_created_by_fk',
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
        name: 'hws_planterm_discounts_updated_by_fk',
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
        name: 'hws_planterm_discounts_deleted_by_fk',
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
    await queryInterface.removeConstraint('hws_planterm_discounts', 'hws_planterm_discounts_org_id_fk');
    await queryInterface.removeConstraint('hws_planterm_discounts', 'hws_planterm_discounts_created_by_fk');
    await queryInterface.removeConstraint('hws_planterm_discounts', 'hws_planterm_discounts_updated_by_fk');
    await queryInterface.removeConstraint('hws_planterm_discounts', 'hws_planterm_discounts_deleted_by_fk');
    await queryInterface.dropTable('hws_planterm_discounts');
  }
};
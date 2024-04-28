'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_plans', {
      plan_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_plans_org_id_fk',
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
      plan_name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: {
            msg: "Please provide plan name",
          },
          notEmpty: {
            msg: "Plan name cannot be empty",
          },
        },
      },
      max_price: {
        allowNull: false,
        type: Sequelize.DOUBLE,
        validate: {
          notNull: {
            msg: "Please provide a maximum price.",
          },
          notEmpty: {
            msg: "Maximum price cannot be empty",
          },
        },
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        name: 'hws_plans_product_id_fk',
        references: {
          model: 'hws_products',
          key: 'product_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_products=>product_id",
        validate: {
          notNull: {
            msg: "Please provide product",
          },
          notEmpty: {
            msg: "Product cannot be empty",
          },
        },
      },
      sequence:{
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue:null,
        validate: {
          notEmpty: {
            msg: "Sequence cannot be empty",
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
        name: 'hws_products_created_by_fk',
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
        name: 'hws_products_updated_by_fk',
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
        name: 'hws_products_deleted_by_fk',
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
    await queryInterface.removeConstraint('hws_plans', 'hws_plans_org_id_fk');
    await queryInterface.removeConstraint('hws_plans', 'hws_plans_product_id_fk');
    await queryInterface.removeConstraint('hws_plans', 'hws_plans_created_by_fk');
    await queryInterface.removeConstraint('hws_plans', 'hws_plans_updated_by_fk');
    await queryInterface.removeConstraint('hws_plans', 'hws_plans_deleted_by_fk');
    await queryInterface.dropTable('hws_plans');
  }
};
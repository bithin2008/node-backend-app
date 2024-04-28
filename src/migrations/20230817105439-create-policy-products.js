'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_policy_products', {
      policy_product_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_policy_products_org_id_fk',
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
      policy_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_policy_products_policy_id_fk',
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
      product_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_policy_products_product_id_fk',
        references: {
          model: 'hws_products',
          key: 'product_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_products=>product_id",
        validate: {
          notNull: {
            msg: "Please select a product",
          },
          notEmpty: {
            msg: "product name cannot be empty",
          },        
        },
      },
    
      product_quantity:{
        allowNull: false,
        type: Sequelize.INTEGER,
        validate: {
          notNull: {
            msg: "Please enter a product quantity",
          },
          notEmpty: {
            msg: "product quantity cannot be empty",
          },        
        },
      },
      create_user_type:{
        allowNull: true,
        defaultValue:null,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1, salesman user=>2, realtor=>3,",
      },
      update_user_type:{
        allowNull: true,
        defaultValue:null,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1, salesman user=>2, realtor=>3,",
      },
      created_by: {
        allowNull: true,
        defaultValue:null,
        type: Sequelize.INTEGER,
        comment: "table=>depends of create_user_type => respected table id ",
      },
      updated_by: {
        allowNull: true,
        defaultValue:null,
        type: Sequelize.INTEGER,
        comment: "table=>depends of update_user_type =>respected table id  ",
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
    await queryInterface.removeConstraint('hws_policy_products', 'hws_policy_products_policy_id_fk');
    await queryInterface.removeConstraint('hws_policy_products', 'hws_policy_products_org_id_fk');
    await queryInterface.removeConstraint('hws_policy_products', 'hws_policy_products_product_id_fk');
    await queryInterface.removeConstraint('hws_policy_products', 'hws_customers_created_by_fk');
    await queryInterface.removeConstraint('hws_policy_products', 'hws_customers_updated_by_fk');
    await queryInterface.removeConstraint('hws_policy_products', 'hws_customers_deleted_by_fk');
    await queryInterface.dropTable('hws_policy_products');
  }
};
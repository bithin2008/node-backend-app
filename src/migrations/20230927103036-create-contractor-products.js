'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_contractor_products', {
      contractor_product_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_contractor_products_org_id_fk',
        
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
      contractor_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_contractor_products_contractor_id_fk',
        references: {
          model: 'hws_contractors',
          key: 'contractor_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_contractors=>contractor_id",
        validate: {
          notNull: {
            msg: "Please select a contractor",
          },
          notEmpty: {
            msg: "contractor id cannot be empty",
          },        
        },
      },
      product_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_contractor_products_product_id_fk',
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
            msg: "product id cannot be empty",
          },        
        },
      },   
      product_name: {
        allowNull: false,
        type: Sequelize.STRING,
        validate: {
          notNull: {
            msg: "Please provide a product name",
          },
          notEmpty: {
            msg: "product name cannot be empty",
          },
        },
      },
      create_user_type:{
        allowNull: true,
        defaultValue:null,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1, salesman user=>2, realtor=>3, contractor=>4,",
      },
      update_user_type:{
        allowNull: true,
        defaultValue:null,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1, salesman user=>2, realtor=>3,, contractor=>4",
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
        name: 'hws_contractor_products_deleted_by_fk',
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
    await queryInterface.removeConstraint('hws_contractor_products', 'hws_contractor_products_org_id_fk');
    await queryInterface.removeConstraint('hws_contractor_products', 'hws_contractor_products_contractor_id_fk');
    await queryInterface.removeConstraint('hws_contractor_products', 'hws_contractor_products_product_id_fk');
    await queryInterface.removeConstraint('hws_contractor_products', 'hws_contractor_products_deleted_by_fk');
    await queryInterface.dropTable('hws_contractor_products');
  }
};
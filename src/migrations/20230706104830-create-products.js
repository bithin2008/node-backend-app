'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_products', {
      product_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_products_org_id_fk',
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
      // product_categories: {
      //   allowNull: false,
      //   type: Sequelize.INTEGER,
      //   comment: "Appliances=>1, System Guard=>2, Total Home Guard=>3, Add on=>4",
      // },
      product_name: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: {
          msg: 'Product name already exist'
        },
        validate: {
          notNull: {
            msg: "Please provide a product name",
          },
          notEmpty: {
            msg: "product name cannot be empty",
          },
        },
      },
      product_image: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {         
          notEmpty: {
            msg: "Product image cannot be empty",
          },
        },
      },
      product_type: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        comment: "Base=>1, Addon=>0",
        validate: {
          notNull: {
            msg: "Please select product type",
          },
          notEmpty: {
            msg: "product type cannot be empty",
          },
        },
      },
      monthly_price: {
        allowNull: false,
        type: Sequelize.DOUBLE,
        validate: {          
          notNull: {
            msg: "Please provide a maximum monthly price.",
          },
          notEmpty: {
            msg: "Maximum monthly price cannot be empty",
          },
        },
      },
      yearly_price: {
        allowNull: false,
        type: Sequelize.DOUBLE,
        validate: {          
          notNull: {
            msg: "Please provide a maximum yearly price.",
          },
          notEmpty: {
            msg: "Maximum yearly price cannot be empty",
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
        allowNull: false,
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
     await queryInterface.removeConstraint('hws_products', 'hws_products_org_id_fk');
    await queryInterface.removeConstraint('hws_products', 'hws_products_created_by_fk');
    await queryInterface.removeConstraint('hws_products', 'hws_products_updated_by_fk');
    await queryInterface.removeConstraint('hws_products', 'hws_products_deleted_by_fk');
    await queryInterface.dropTable('hws_products');
  }
};
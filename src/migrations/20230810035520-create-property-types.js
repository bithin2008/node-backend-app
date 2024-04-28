'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_property_types', {
      property_type_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_property_types_org_id_fk',
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
      property_type: {
        allowNull: false,
        type: Sequelize.STRING,
        validate: {        
          notNull: {
            msg: "Please provide a property type.",
          },
          notEmpty: {
            msg: "Property type cannot be empty",
          },
        },
      },
     /*  price_or_percentage: {
        allowNull: false,
        type:Sequelize.SMALLINT,
        comment: "0=>Price, 1=> Percentage",
        validate: {        
          notNull: {
            msg: "Please provide price or percentage.",
          },
          notEmpty: {
            msg: "Price or percentage cannot be empty",
          },
        },
      },
      above_5000_sqft:{
        allowNull: false,
        type: Sequelize.SMALLINT,
        defaultValue: 0,
        comment: "Above 5000=>1, Below 5000=>0",
      }, */
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
      property_icon: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          notEmpty: {
            msg: "property icon cannot be empty",
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
        name: 'hws_property_types_created_by_fk',
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
        name: 'hws_property_types_updated_by_fk',
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
        name: 'hws_property_types_deleted_by_fk',
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
    await queryInterface.removeConstraint('hws_property_types', 'hws_property_types_org_id_fk');
    await queryInterface.removeConstraint('hws_property_types', 'hws_property_types_created_by_fk');
    await queryInterface.removeConstraint('hws_property_types', 'hws_property_types_updated_by_fk');
    await queryInterface.removeConstraint('hws_property_types', 'hws_property_types_deleted_by_fk');
    await queryInterface.dropTable('hws_property_types');
  }
};
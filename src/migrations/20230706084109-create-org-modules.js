'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_org_modules', {
      org_module_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_org_modules_org_id_fk',
        references: {
          schema: 'hws_schema', // Replace 'your_schema_name' with the actual schema name
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
      module_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_modules_module_id_fk',
        references: {
          model: 'hws_modules',
          key: 'module_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_modules=>module_id",
        validate: {
          notNull: {
            msg: "Please select a module",
          },
          notEmpty: {
            msg: "Module name cannot be empty",
          },
          
        },
      },
      module_name: {
        type: Sequelize.STRING,
        allowNull: false,
        //unique: true,
        validate: {
          notNull: {
            msg: "Please provide a module name",
          },
          notEmpty: {
            msg: "Module name cannot be empty",
          },
          
        },
      },
      module_slug:{
        type: Sequelize.STRING,
        allowNull:false
      },
      route_path:{
        type: Sequelize.STRING,
        allowNull:true,
        defaultValue:null,
        validate: {
          notEmpty: {
            msg: "Routing path cannot be empty",
          },
          
        },
      },
      descriptions: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null,
        validate: {
          notEmpty: {
            msg: "Descriptions cannot be empty",
          },
          customValidation(value) {
            // Check if value is not null and if it doesn't meet the length requirements
            if (value !== null && (value.length < 3 || value.length > 200)) {
              throw new CustomError("Description must be between 3 and 200 characters long",400);
            }
          },
        },
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null,
        validate: {
          notEmpty: {
            msg: "Icon cannot be empty",
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
      s_admin_active_status:{
        allowNull:false,
        type:Sequelize.SMALLINT,
        defaultValue:1,
        comment: "active=>1, inactive=>0",
      },
      active_status:{
        allowNull:false,
        type:Sequelize.SMALLINT,
        defaultValue:1,
        comment: "active=>1, inactive=>0",
      },
      created_by: {
        allowNull: true,
        defaultValue:null,
        type: Sequelize.INTEGER,
        name: 'hws_org_modules_created_by_fk',
        references: {
          model: 'hws_system_administrators',
          key: 'system_administrator_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>system_administrators=>system_administrator_id",
      },
      updated_by: {
        allowNull: true,
        defaultValue:null,
        type: Sequelize.INTEGER,
        comment: "table=>org_users=>org_user_id",
      },
      deleted_by: {
        allowNull: true,
        defaultValue:null,
        type: Sequelize.INTEGER,
        name: 'hws_org_modules_deleted_by_fk',
        references: {
          model: 'hws_system_administrators',
          key: 'system_administrator_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>system_administrators=>system_administrator_id",
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
      schema: 'hws_schema',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('hws_org_modules', 'hws_org_modules_org_id_fk');
    await queryInterface.removeConstraint('hws_org_modules', 'hws_modules_module_id_fk');
    await queryInterface.removeConstraint('hws_org_modules', 'hws_org_modules_created_by_fk');
    await queryInterface.removeConstraint('hws_org_modules', 'hws_org_modules_deleted_by_fk');
    await queryInterface.dropTable('hws_org_modules');
  }
};
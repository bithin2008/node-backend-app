'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('===========================hws_modules');
    await queryInterface.createTable('hws_modules', {
      module_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      module_name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: {
          arg: true,
          msg: 'module name must be unique.',
        },
        validate: {
          notNull: {
            msg: "Please provide a module name",
          },
          notEmpty: {
            msg: "module name cannot be empty",
          },
          
        },
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
      module_slug:{
        type: Sequelize.STRING,
        allowNull:false
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: null,
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
        unique: {
          arg: true,
          msg: 'Sequence must be unique.',
        },
        validate: {
          notEmpty: {
            msg: "Sequence cannot be empty",
          }, 
        },
      },
      active_status:{
        allowNull:false,
        type:Sequelize.SMALLINT,
        defaultValue:1,
        comment: "active=>1, inactive=>0",
      },
      created_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        name: 'hws_modules_created_by_fk',
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
        type: Sequelize.INTEGER,
        name: 'hws_modules_updated_by_fk',
        references: {
          model: 'hws_system_administrators',
          key: 'system_administrator_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>system_administrators=>system_administrator_id",
      },
      deleted_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        name: 'hws_modules_deleted_by_fk',
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
    await queryInterface.removeConstraint('hws_modules', 'hws_modules_created_by_fk');
    await queryInterface.removeConstraint('hws_modules', 'hws_modules_updated_by_fk');
    await queryInterface.removeConstraint('hws_modules', 'hws_modules_deleted_by_fk');
    await queryInterface.dropTable('hws_modules');
  }
};
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_org_user_roles', {
      user_role_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_org_user_roles_org_id_fk',
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
      role_type: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: {
            msg: "Please provide a role type",
          },
          notEmpty: {
            msg: "role type cannot be empty",
          },
          len: {
            args: [3, 50],
            msg: "role type must be between 3 and 50 characters long",
          },
        },
      },
      description: {
        allowNull: true,
        type: Sequelize.STRING
      },
      is_super_admin:{
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 0,
        comment: "active=>1, inactive=>0",
      },
      active_status: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 1,
        comment: "active=>1, inactive=>0",
      },
      created_by: {
        allowNull: true,
        defaultValue:null,
        type: Sequelize.INTEGER,
        comment: "table=>org_users=>org_user_id",
        // allowNull: true,
        // defaultValue:null,
        // type: Sequelize.INTEGER,
        // name: 'hws_org_user_roles_created_by_fk',
        // references: {
        //   model: 'hws_org_users',
        //   key: 'org_user_id'
        // },
        // onDelete: 'RESTRICT',
        // onUpdate: 'CASCADE',
        // comment: "table=>hws_org_users=>org_user_id",
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
        comment: "table=>org_users=>org_user_id",
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
    await queryInterface.removeConstraint('hws_org_user_roles', 'hws_org_user_roles_org_id_fk');
    // await queryInterface.removeConstraint('hws_org_user_roles', 'hws_org_user_roles_created_by_fk');
    // await queryInterface.removeConstraint('hws_org_user_roles', 'hws_org_user_roles_deleted_by_fk');
    await queryInterface.dropTable('hws_org_user_roles');
  }
};
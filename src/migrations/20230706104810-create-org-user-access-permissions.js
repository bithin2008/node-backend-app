'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_org_user_access_permissions', {
      user_access_permissions_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      org_user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_org_user_access_permissions_org_user_id_fk',
        references: {
          model: 'hws_org_users',
          key: 'org_user_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_org_users=>org_user_id",
      },
      org_module_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_org_user_access_permissions_org_module_id_fk',
        references: {
          model: 'hws_org_modules',
          key: 'org_module_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_org_modules=>org_module_id",
      },
      org_sub_module_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_org_user_access_permissions_org_sub_module_id_fk',
        references: {
          model: 'hws_org_sub_modules',
          key: 'org_sub_module_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_org_sub_modules=>org_sub_module_id",
      },
      permission_combination_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_org_user_access_permissions_permission_combination_id_fk',
        references: {
          model: 'hws_permission_combinations',
          key: 'permission_combination_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_org_permission_combinations=>permission_combination_id",
      },
      created_by: {
        allowNull: true,
        defaultValue:null,
        type: Sequelize.INTEGER,
        name: 'hws_org_user_access_permissions_created_by_fk',
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
        defaultValue:null,
        type: Sequelize.INTEGER,
        name: 'hws_org_user_access_permissions_updated_by_fk',
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
        defaultValue:null,
        type: Sequelize.INTEGER,
        name: 'hws_org_user_access_permissions_deleted_by_fk',
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
      schema: 'hws_schema',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('hws_org_user_access_permissions', 'hws_org_user_access_permissions_org_user_id_fk');
    await queryInterface.removeConstraint('hws_org_user_access_permissions', 'hws_org_user_access_permissions_org_module_id_fk');
    await queryInterface.removeConstraint('hws_org_user_access_permissions', 'hws_org_user_access_permissions_org_sub_module_id_fk');
    await queryInterface.removeConstraint('hws_org_user_access_permissions', 'hws_org_user_access_permissions_permission_combination_id_fk');
    await queryInterface.removeConstraint('hws_org_user_access_permissions', 'hws_org_user_access_permissions_created_by_fk');
    await queryInterface.removeConstraint('hws_org_user_access_permissions', 'hws_org_user_access_permissions_updated_by_fk');
    await queryInterface.removeConstraint('hws_org_user_access_permissions', 'hws_org_user_access_permissions_deleted_by_fk');
    await queryInterface.dropTable('hws_org_user_access_permissions');
  }
};
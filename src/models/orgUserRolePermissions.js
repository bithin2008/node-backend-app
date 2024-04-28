'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class orgUserRolePermissions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      orgUserRolePermissions.belongsTo(models.orgSubModulesModel, { foreignKey: 'org_sub_module_id', as: 'submodule_details' });
      orgUserRolePermissions.belongsTo(models.orgModulesModel, { foreignKey: 'org_module_id', as: 'module_details' });
      orgUserRolePermissions.belongsTo(models.orgUserRolesModel, { foreignKey: 'user_role_id', as: 'role_permission_details' });
      orgUserRolePermissions.belongsTo(models.permissionCombinationsModel, { foreignKey: 'permission_combination_id', as: 'permission_details' });

    }
  }
  orgUserRolePermissions.init({
    user_role_permission_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_org_user_role_permissions_org_id_fk',
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
      }
    },
    user_role_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_org_user_role_permissions_user_role_id_fk',
      references: {
        model: 'hws_org_user_roles',
        key: 'user_role_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_org_user_roles=>user_role_id",
    },
    org_module_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_org_user_role_permissions_org_module_id_fk',
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
      type: DataTypes.INTEGER,
      name: 'hws_org_user_role_permissions_org_sub_module_id_fk',
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
      type: DataTypes.INTEGER,
      name: 'hws_org_user_role_permissions_permission_combination_id_fk',
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
      type: DataTypes.INTEGER,
      name: 'hws_org_user_role_permissions_created_by_fk',
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
      type: DataTypes.INTEGER,
      name: 'hws_org_user_role_permissions_updated_by_fk',
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
      type: DataTypes.INTEGER,
      name: 'hws_org_user_role_permissions_deleted_by_fk',
      references: {
        model: 'hws_org_users',
        key: 'org_user_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_org_users=>org_user_id",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    }
  }, {
    sequelize,
    modelName: 'orgUserRolePermissionsModel',
    schema: 'hws_schema',
    tableName: 'hws_org_user_role_permissions',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return orgUserRolePermissions;
};
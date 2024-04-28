'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class orgUserAccessPermissions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      orgUserAccessPermissions.belongsTo(models.permissionCombinationsModel , { foreignKey: 'permission_combination_id', as:'permission_details'  });
      orgUserAccessPermissions.belongsTo(models.orgUsersModel, { foreignKey: 'org_user_id',  });
      orgUserAccessPermissions.belongsTo(models.orgModulesModel, { foreignKey: 'org_module_id', as:'module_details' });
      orgUserAccessPermissions.belongsTo(models.orgSubModulesModel, { foreignKey: 'org_sub_module_id', as:'submod_details', });

    }
  }
  orgUserAccessPermissions.init({
    user_access_permissions_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    org_user_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
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
      type: DataTypes.INTEGER,
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
      type: DataTypes.INTEGER,
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
      type: DataTypes.INTEGER,
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
      type: DataTypes.INTEGER,
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
      type: DataTypes.INTEGER,
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
      type: DataTypes.INTEGER,
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
    modelName: 'orgUserAccessPermissionsModel',
    schema: 'hws_schema',
    tableName: 'hws_org_user_access_permissions',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return orgUserAccessPermissions;
};
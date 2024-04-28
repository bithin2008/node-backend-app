'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class orgUserRoles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
     
      orgUserRoles.belongsTo(models.organizationsModel, { foreignKey: 'org_id', as: 'organization' });
      orgUserRoles.hasMany(models.orgUserRolePermissionsModel, { foreignKey: 'user_role_id', as: 'role_permission_details' });
      orgUserRoles.belongsTo(models.orgUsersModel, { foreignKey: 'updated_by', as: 'update_info' });
      orgUserRoles.belongsTo(models.orgUsersModel, { foreignKey: 'created_by', as: 'create_info' });
    }
  }
  orgUserRoles.init({
    user_role_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
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
      type: DataTypes.STRING,
      allowNull: false,
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
    is_super_admin:{
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0,
      comment: "super admin=>1, others=>0",
    },
    description: {
      allowNull: true,
      type: DataTypes.STRING
    },
    active_status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1,
      comment: "active=>1, inactive=>0",
    },
    created_by: {
      allowNull: true,
      defaultValue:null,
      type: DataTypes.INTEGER,
      comment: "table=>org_users=>org_user_id",
    },
    updated_by: {
      allowNull: true,
      defaultValue:null,
      type: DataTypes.INTEGER,
      comment: "table=>org_users=>org_user_id",
    },
    deleted_by: {
    allowNull: true,
      defaultValue:null,
      type: DataTypes.INTEGER,
      comment: "table=>org_users=>org_user_id",
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
    modelName: 'orgUserRolesModel',
    schema: 'hws_schema',
    tableName: 'hws_org_user_roles',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return orgUserRoles;
};
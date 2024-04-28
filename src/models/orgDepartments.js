'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class departments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here     
      departments.belongsTo(models.organizationsModel, { foreignKey: 'org_id', as: 'organization' });
      departments.belongsTo(models.orgUsersModel, { foreignKey: 'updated_by', as: 'update_info' });
      departments.belongsTo(models.orgUsersModel, { foreignKey: 'created_by', as: 'create_info' });
    }
  }
  departments.init({
    department_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_org_departments_org_id_fk',
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
    department_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide a department name",
        },
        notEmpty: {
          msg: "Department name cannot be empty",
        },
        len: {
          args: [3, 50],
          msg: "Department name must be between 3 and 50 characters long",
        },
      },
    },
    description: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    active_status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1,
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
    modelName: 'orgDepartmentsModel',
    schema: 'hws_schema',
    tableName: 'hws_org_departments',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return departments;
};
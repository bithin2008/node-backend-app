'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class customerForgotPasswordActivites extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  customerForgotPasswordActivites.init({
    customer_forgot_password_activity_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      name: 'hws_customer_forgot_password_activities_customer_id_fk',
      references: {
        model: 'hws_customers',
        key: 'customer_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_customer_forgot_password_activities_org_id_fk',
      
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
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    active_status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1,
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
    schema: 'hws_schema',
    tableName: "hws_customer_forgot_password_activities",
    modelName: 'customerForgotPasswordActivitiesModel',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return customerForgotPasswordActivites;
};
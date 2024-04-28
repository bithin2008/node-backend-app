'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class orgUserLoginActivities extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  orgUserLoginActivities.init({
    org_user_login_activity_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    org_user_id: {
      allowNull: false,
      name: 'hws_org_users_login_activities_org_user_id_fk',
      type: DataTypes.INTEGER,
      references: {
        model: 'hws_org_users',
        key: 'org_user_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>org_users=>org_user_id",
    },
    token: DataTypes.STRING,
    ip_address: DataTypes.STRING,
    user_agent: DataTypes.STRING,
    device_id: DataTypes.STRING,

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
    tableName: 'hws_org_user_login_activities',
    modelName: 'orgUserLoginActivitiesModel',
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return orgUserLoginActivities;
};
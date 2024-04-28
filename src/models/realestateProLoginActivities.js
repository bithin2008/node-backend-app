'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class realestateProLoginActivities extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  realestateProLoginActivities.init({
    realestate_pro_login_activity_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    realestate_professional_id: {
      allowNull: false,
      name: 'realestate_pro_login_activities_realestate_professional_id_fk',
      type: DataTypes.INTEGER,
      references: {
        model: 'hws_realestate_professionals',
        key: 'realestate_professional_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_customers=>realestate_professional_id",
    },
    token: {
      allowNull: true,
      defaultValue:null,
      type: DataTypes.STRING,
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    device_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_agent: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    os_platform: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_by: {
      allowNull: true,
      defaultValue: null,
      type: DataTypes.INTEGER,
    },
    updated_by: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    deleted_by: {
      allowNull: true,
      type: DataTypes.INTEGER
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
    },
  }, {
    sequelize,
    tableName: 'hws_realestate_pro_login_activities',
    modelName: 'realestateProLoginActivitiesModel',
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return realestateProLoginActivities;
};
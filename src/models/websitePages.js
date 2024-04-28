'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class websitePages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
       // websitePages.belongsTo(models.orgUsersModel, { foreignKey: 'org_user_id', as: 'user_info' });
      // whitelistIP.belongsTo(models.orgUsersModel, { foreignKey: 'updated_by', as: 'update_info' });
      // whitelistIP.belongsTo(models.orgUsersModel, { foreignKey: 'created_by', as: 'create_info' });
    }
  }
  websitePages.init({
    page_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: "hws_website_pages_org_id_fk",
      references: {
        model: "hws_organizations",
        key: "org_id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
      comment: "table=>hws_organizations=>org_id",
      validate: {
        notNull: {
          msg: "Please provide a organization id",
        },
        notEmpty: {
          msg: "organization id  cannot be empty",
        },
      },
    },
    page_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {        
        notEmpty: {
          msg: "Page name can not be empty",
        }
      },
    },
    route_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {        
        notEmpty: {
          msg: "Route name can not be empty",
        }
      },
    },
    active_status: {
      allowNull: false,
      type: DataTypes.SMALLINT,
      defaultValue: 1,
      comment: "active=>1, inactive=>0",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue:new Date()
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue:new Date()
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  }, {
    sequelize,
    modelName: 'websitePagesModel',
    schema: 'hws_schema',
    tableName: 'hws_website_pages',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return websitePages;
};
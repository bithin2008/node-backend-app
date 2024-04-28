'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class orgModules extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      //orgModules.belongsToMany(models.orgUsersModel, { foreignKey: 'org_user_id', through: models.orgUserAccessPermissionsModel, as: 'associated_user' });
      orgModules.hasMany(models.orgSubModulesModel, { foreignKey: 'module_id', as: 'sub_module_details' });
      
    }
  }
  orgModules.init({
    org_module_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_org_modules_org_id_fk',
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
    module_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_modules_module_id_fk',
      references: {
        model: 'hws_modules',
        key: 'module_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_modules=>module_id",
      validate: {
        notNull: {
          msg: "Please select a module",
        },
        notEmpty: {
          msg: "Module name cannot be empty",
        },
        
      },
    },
    org_module_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide a module name",
        },
        notEmpty: {
          msg: "Module name cannot be empty",
        }, 
      },
    },
    org_module_slug:{
      type: DataTypes.STRING,
      allowNull:false
    },
    route_path:{
      type: DataTypes.STRING,
      allowNull:true,
      defaultValue:null,
      validate: {
        notEmpty: {
          msg: "Routing path cannot be empty",
        },
        
      },
    },
    descriptions: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null,
      validate: {
        notEmpty: {
          msg: "Descriptions cannot be empty",
        },
        len: {
          args: [3, 200],
          msg: "Description must be between 3 and 200 characters long",
        },
      },
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null,
      validate: {
        notEmpty: {
          msg: "Icon cannot be empty",
        },
        
      },
    },
    sequence:{
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue:null,
      validate: {
        notEmpty: {
          msg: "Sequence cannot be empty",
        },
        
      },
    },
    s_admin_active_status:{
      allowNull:false,
      type:DataTypes.SMALLINT,
      defaultValue:1,
      comment: "active=>1, inactive=>0",
    },
    active_status:{
      allowNull:false,
      type:DataTypes.SMALLINT,
      defaultValue:1,
      comment: "active=>1, inactive=>0",
    },
    created_by: {
      allowNull: true,
      defaultValue:null,
      type: DataTypes.INTEGER,
      name: 'hws_org_modules_created_by_fk',
      references: {
        model: 'hws_system_administrators',
        key: 'system_administrator_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>system_administrators=>system_administrator_id",
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
      name: 'hws_org_modules_deleted_by_fk',
      references: {
        model: 'hws_system_administrators',
        key: 'system_administrator_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>system_administrators=>system_administrator_id",
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
    modelName: 'orgModulesModel',
    schema: 'hws_schema',
    tableName: 'hws_org_modules',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    defaultScope: {
      where: {
        s_admin_active_status: 1
      }
    }
  });
 
  return orgModules;
};
'use strict';
const {
  Model
} = require('sequelize');
const CustomError = require('../utils/customErrorHandler');
module.exports = (sequelize, DataTypes) => {
  class modules extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  modules.init({
    module_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    module_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        arg: true,
        msg: 'Module name must be unique.',
      },
      validate: {
        notNull: {
          msg: "Please provide a module name",
        },
        notEmpty: {
          msg: "Module name cannot be empty",
        },
        
      },
    },
    module_slug:{
      type: DataTypes.STRING,
      allowNull:false,
      
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
        customValidation(value) {
          // Check if value is not null and if it doesn't meet the length requirements
          if (value !== null && (value.length < 3 || value.length > 200)) {
            throw new CustomError("Description must be between 3 and 200 characters long",400);
          }
        },
      },
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pi-list',
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
    active_status:{
      allowNull:false,
      type:DataTypes.SMALLINT,
      defaultValue:1,
      comment: "active=>1, inactive=>0",
    },
    created_by: {
      allowNull: true,
      type: DataTypes.INTEGER,
      name: 'hws_modules_created_by_fk',
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
      type: DataTypes.INTEGER,
      name: 'hws_modules_updated_by_fk',
      references: {
        model: 'hws_system_administrators',
        key: 'system_administrator_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>system_administrators=>system_administrator_id",
    },
    deleted_by: {
      allowNull: true,
      type: DataTypes.INTEGER,
      name: 'hws_modules_deleted_by_fk',
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
    modelName: 'modulesModel',
    schema: 'hws_schema',
    tableName: 'hws_modules',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    
  });
  // Add the beforeValidate hook here
  modules.beforeValidate(async (module, options) => {
    if (module.module_name) {
      const slug = module.module_name.toLowerCase().replace(/ /g, '-');
      module.module_slug = slug;
    }
  });
  
  return modules;
};
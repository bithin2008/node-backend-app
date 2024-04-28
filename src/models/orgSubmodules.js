'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class orgSubModules extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      orgSubModules.belongsTo(models.orgModulesModel, { foreignKey: 'module_id', as: 'module_details',});
      orgSubModules.hasMany(models.orgUserAccessPermissionsModel, { foreignKey: 'org_sub_module_id',as: 'submod_details'});
    }
  }
  orgSubModules.init({
    org_sub_module_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
      
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_org_sub_modules_org_id_fk',
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
    module_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_org_sub_modules_module_id_fk',
      references: {
        model: 'hws_org_modules',
        key: 'org_module_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_org_modules=>org_module_id",
      validate: {
        notNull: {
          msg: "Please select a module",
        },
        notEmpty: {
          msg: "Module name cannot be empty",
        },

      },
    },
    sub_module_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_sub_modules_sub_module_id_fk',
      references: {
        model: 'hws_sub_modules',
        key: 'sub_module_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_sub_modules=>module_id",
      validate: {
        notNull: {
          msg: "Please select a sub module",
        },
        notEmpty: {
          msg: "Sub module name cannot be empty",
        },

      }, 
    },
    org_sub_module_name: {
      type: DataTypes.STRING,
      allowNull: false,
     // unique: true,
      validate: {
        notNull: {
          msg: "Please provide a submodule name size",
        },
        notEmpty: {
          msg: "submodule name size cannot be empty",
        },

      },
    },
  
    org_sub_module_slug:{
      type: DataTypes.STRING,
      allowNull:false
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
    route_path:{
      type: DataTypes.STRING,
      allowNull:false,
      validate: {
        notNull: {
          msg: "Please provide a routing path",
        },
        notEmpty: {
          msg: "Routing path cannot be empty",
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
    sequence: {
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
    active_status: {
      allowNull: false,
      type: DataTypes.SMALLINT,
      defaultValue: 1,
      comment: "active=>1, inactive=>0",
    },
    created_by: {
      allowNull: true,
      defaultValue:null,
      type: DataTypes.INTEGER,
      name: 'hws_sub_modules_created_by_fk',
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
      name: 'hws_sub_modules_deleted_by_fk',
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
    modelName: 'orgSubModulesModel',
    schema: 'hws_schema',
    tableName: 'hws_org_sub_modules',
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
 
  return orgSubModules;
};
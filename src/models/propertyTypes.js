'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class propertyTypes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
     /*  propertyTypes.belongsTo(models.organizationsModel, {
        foreignKey: 'org_id',
        onDelete: 'RESTRICT', // Define your onDelete behavior
        onUpdate: 'CASCADE',  // Define your onUpdate behavior
      }); */
      
    }
  }
  propertyTypes.init({
    property_type_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_property_types_org_id_fk',
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
    property_type: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {        
        notNull: {
          msg: "Please provide a property type.",
        },
        notEmpty: {
          msg: "Property type cannot be empty",
        },
      },
    },
 /*    price_or_percentage: {
      allowNull: false,
      defaultValue:0,
      type:DataTypes.SMALLINT,
      comment: "0=>Price, 1=> Percentage",
      validate: {        
        notNull: {
          msg: "Please provide price or percentage.",
        },
        notEmpty: {
          msg: "Price or percentage cannot be empty",
        },
      },
    }, */
  /*   above_5000_sqft:{
      allowNull: false,
      type: DataTypes.SMALLINT,
      defaultValue: 0,
      comment: "Above 5000=>1, Below 5000=>0",
    }, */
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
    property_icon: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        notEmpty: {
          msg: "property icon cannot be empty",
        },
        
      },
    },
    active_status: {
      allowNull: false,
      type: DataTypes.SMALLINT,
      defaultValue: 1,
      comment: "active=>1, inactive=>0",
    },
    created_by: {
      allowNull: true,
      type: DataTypes.INTEGER,
      name: 'hws_property_types_created_by_fk',
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
      type: DataTypes.INTEGER,
      name: 'hws_property_types_updated_by_fk',
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
      type: DataTypes.INTEGER,
      name: 'hws_property_types_deleted_by_fk',
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
    modelName: 'propertyTypesModel',
    schema: 'hws_schema',
    tableName: 'hws_property_types',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });
  return propertyTypes;
};
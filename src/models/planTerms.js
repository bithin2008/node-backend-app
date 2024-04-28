'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class planTerms extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      planTerms.belongsTo(models.plansModel, { foreignKey: 'plan_id', as: 'plan_details' });
      planTerms.belongsTo(models.propertyTypesModel, { foreignKey: 'property_type_id', as: 'property_type_details' });
      planTerms.belongsTo(models.orgUsersModel, { foreignKey: 'updated_by', as: 'update_info' });
      planTerms.belongsTo(models.orgUsersModel, { foreignKey: 'created_by', as: 'create_info' });
    }
  }
  planTerms.init({
    plan_terms_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_plan_terms_org_id_fk',
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
    plan_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_plan_terms_plan_id_fk',
      references: {
        model: 'hws_plans',
        key: 'plan_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_plans=>plan_id",
      validate: {
        notNull: {
          msg: "Please select a plan",
        },
        notEmpty: {
          msg: "Plan name cannot be empty",
        },
        
      },
    },
    plan_term: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {        
        notNull: {
          msg: "Please provide a plan term.",
        },
        notEmpty: {
          msg: "Plan term cannot be empty",
        },
      },
    }, 
    plan_term_month: {
      allowNull: false,
      type: DataTypes.INTEGER,
      validate: {        
        notNull: {
          msg: "Please provide a plan term in month.",
        },
        notEmpty: {
          msg: "Plan term in month cannot be empty",
        },
      },
    },
    max_split_payment: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue:0,
      validate: {        
        notNull: {
          msg: "Please provide a plan term in month.",
        },
        notEmpty: {
          msg: "Plan term in month cannot be empty",
        },
      },
    },
    property_type_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_plan_terms_property_type_id_fk',
      references: {
        model: 'hws_property_types',
        key: 'property_type_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_property_types=>property_type_id",
      validate: {
        notNull: {
          msg: "Please select a property type",
        },
        notEmpty: {
          msg: "Porperty cannot be empty",
        },
        
      },
    },
    price_below_5000_sqft: {
      allowNull: false,
      type: DataTypes.DOUBLE, 
      validate: {
        notNull: {
          msg: "Please enter a price below 5000 sqft",
        },
        notEmpty: {
          msg: "Price cannot be empty",
        },
        
      },
    },
    min_price_below_5000_sqft: {
      allowNull: false,
      type: DataTypes.DOUBLE, 
      defaultValue:0,
      validate: {
        notNull: {
          msg: "Please enter a minimum price below 5000 sqft",
        },
        notEmpty: {
          msg: "Price cannot be empty",
        },
        
      },
    },
    price_above_5000_sqft: {
      allowNull: false,
      type: DataTypes.DOUBLE, 
      validate: {
        notNull: {
          msg: "Please enter a price above 5000 sqft",
        },
        notEmpty: {
          msg: "Price cannot be empty",
        },
        
      },
    },
    min_price_above_5000_sqft: {
      allowNull: false,
      type: DataTypes.DOUBLE, 
      defaultValue:0,
      validate: {
        notNull: {
          msg: "Please enter a minimum price above 5000 sqft",
        },
        notEmpty: {
          msg: "Price cannot be empty",
        },
        
      },
    },
    bonus_month: {
      allowNull: false,
      type: DataTypes.INTEGER,
      
      validate: {        
        notNull: {
          msg: "Please provide a bonus month.",
        },
        notEmpty: {
          msg: "Bonus month cannot be empty",
        },
      },
    },
    show_website:{
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue:false,
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
      name: 'hws_plan_terms_created_by_fk',
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
      name: 'hws_plan_terms_updated_by_fk',
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
      name: 'hws_plan_terms_deleted_by_fk',
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
    modelName: 'planTermsModel',
    schema: 'hws_schema',
    tableName: 'hws_plan_terms',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });
  return planTerms;
};
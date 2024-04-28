'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class plans extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here  
      plans.hasMany(models.planTermsModel, { foreignKey: 'plan_id', as: 'plan_term' });
      plans.belongsTo(models.orgUsersModel, { foreignKey: 'updated_by', as: 'update_info' });
      plans.belongsTo(models.orgUsersModel, { foreignKey: 'created_by', as: 'create_info' });
    }
  }
  plans.init({
    plan_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_plans_org_id_fk',
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
        }        
      }
    },
    plan_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: {
          msg: "Please provide plan name",
        },
        notEmpty: {
          msg: "Plan name cannot be empty",
        },
      },
    },
    max_price: {
      allowNull: false,
      type: DataTypes.DOUBLE,
      validate: {        
        notNull: {
          msg: "Please provide a maximum price.",
        },
        notEmpty: {
          msg: "Maximum price cannot be empty",
        },
      },
    },   
    product_id: {
      type: DataTypes.STRING,
      allowNull: false,
      name: 'hws_plans_product_id_fk',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_products=>product_id",
      validate: {
        notNull: {
          msg: "Please provide product",
        },
        notEmpty: {
          msg: "Product cannot be empty",
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
    active_status: {
      allowNull: false,
      type: DataTypes.SMALLINT,
      defaultValue: 1,
      comment: "active=>1, inactive=>0",
    },
    created_by: {
      allowNull: true,
      type: DataTypes.INTEGER,
      name: 'hws_plans_created_by_fk',
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
      name: 'hws_plans_updated_by_fk',
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
      name: 'hws_plans_deleted_by_fk',
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
    modelName: 'plansModel',
    schema: 'hws_schema',
    tableName: 'hws_plans',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });
  return plans;
};
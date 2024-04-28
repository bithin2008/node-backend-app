'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class policyProducts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      //policyProducts.belongsTo(models.policiesModel, { foreignKey: 'policy_id',as: 'policy_product_list',});
      policyProducts.belongsTo(models.productsModel, { foreignKey: 'product_id',as: 'product_details',});

    }
  }
  policyProducts.init({
    policy_product_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_policy_products_org_id_fk',
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
    policy_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_policy_products_policy_id_fk',
      references: {
        model: 'hws_policies',
        key: 'policy_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_policies=>policy_id",
      validate: {
        notNull: {
          msg: "Please select a policy",
        },
        notEmpty: {
          msg: "policy name cannot be empty",
        },        
      },
    },
    product_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_policy_products_product_id_fk',
      references: {
        model: 'hws_products',
        key: 'product_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_products=>product_id",
      validate: {
        notNull: {
          msg: "Please select a product",
        },
        notEmpty: {
          msg: "product id cannot be empty",
        },        
      },
    },
   
    product_quantity:{
      allowNull: false,
      type: DataTypes.INTEGER,
      validate: {
        notNull: {
          msg: "Please enter a product quantity",
        },
        notEmpty: {
          msg: "product quantity cannot be empty",
        },        
      },
    },
    create_user_type:{
      allowNull: true,
      defaultValue:null,
      type: DataTypes.SMALLINT,
      comment: "self customer =>1, salesman user=>2, realtor=>3,",
    },
    update_user_type:{
      allowNull: true,
      defaultValue:null,
      type: DataTypes.SMALLINT,
      comment: "self customer =>1, salesman user=>2, realtor=>3,",
    },
    created_by: {
      allowNull: true,
      defaultValue:null,
      type: DataTypes.INTEGER,
      comment: "table=>depends of create_user_type => respected table id ",
    },
    updated_by: {
      allowNull: true,
      defaultValue:null,
      type: DataTypes.INTEGER,
      comment: "table=>depends of update_user_type =>respected table id  ",
    },
    deleted_by: {
      allowNull: true,
      type: DataTypes.INTEGER,
      name: 'hws_products_deleted_by_fk',
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
    modelName: 'policyProductsModel',
    schema: 'hws_schema',
    tableName:`hws_policy_products`,
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return policyProducts;
};
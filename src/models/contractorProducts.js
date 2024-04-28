'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class contractorProducts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  contractorProducts.init({
    contractor_product_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_contractor_products_org_id_fk',
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
    contractor_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_contractor_products_contractor_id_fk',
      references: {
        model: 'hws_contractors',
        key: 'contractor_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_contractors=>contractor_id",
      validate: {
        notNull: {
          msg: "Please select a contractor",
        },
        notEmpty: {
          msg: "contractor id cannot be empty",
        },        
      },
    },
    product_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_contractor_products_product_id_fk',
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
    product_name: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notNull: {
          msg: "Please provide a product name",
        },
        notEmpty: {
          msg: "product name cannot be empty",
        },
      },
    },
    create_user_type:{
      allowNull: true,
      defaultValue:null,
      type: DataTypes.SMALLINT,
      comment: "self customer =>1, salesman user=>2, realtor=>3, contractor=>4,",
    },
    update_user_type:{
      allowNull: true,
      defaultValue:null,
      type: DataTypes.SMALLINT,
      comment: "self customer =>1, salesman user=>2, realtor=>3,, contractor=>4",
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
      name: 'hws_contractor_products_deleted_by_fk',
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
    modelName: 'contractorProductsModel',
    schema: 'hws_schema',
    tableName:`hws_contractor_products`,
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return contractorProducts;
};
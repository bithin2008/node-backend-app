'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static initHooks() {
      products.addHook('beforeValidate', 'disableUniqueCheckForDeleted', (instance, options) => {
        if (instance.deleted_at !== null && options.fields.includes('product_name')) {
          options.fields.splice(options.fields.indexOf('product_name'), 1);
          delete instance.changed().product_name;
        }
      });
    }
    
    static associate(models) {
      // define association here
      products.belongsTo(models.orgUsersModel, { foreignKey: 'updated_by', as: 'update_info' });
      products.belongsTo(models.orgUsersModel, { foreignKey: 'created_by', as: 'create_info' });
    }
  }
  products.init({
    product_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_products_org_id_fk',
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

    product_name: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: {
        msg: 'Product name already exist'
      },
      validate: {
        notNull: {
          msg: "Please provide a product name",
        },
        notEmpty: {
          msg: "product name cannot be empty",
        },
      },
    },
    product_image: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {        
        notEmpty: {
          msg: "Product image cannot be empty",
        },
      },
    },
    product_type: {
      allowNull: false,
      type: DataTypes.SMALLINT,
      comment: "Base=>1, Addon=>0",
      validate: {
        notNull: {
          msg: "Please select product type",
        },
        notEmpty: {
          msg: "product type cannot be empty",
        },
      },
    },
    monthly_price: {
      allowNull: false,
      type: DataTypes.DOUBLE,
      validate: {        
        notNull: {
          msg: "Please provide a maximum monthly price.",
        },
        notEmpty: {
          msg: "Maximum monthly price cannot be empty",
        },
      },
    },
    yearly_price: {
      allowNull: false,
      type: DataTypes.DOUBLE,
      validate: {        
        notNull: {
          msg: "Please provide a maximum yearly price.",
        },
        notEmpty: {
          msg: "Maximum yearly price cannot be empty",
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
      allowNull: false,
      defaultValue: 1,
      comment: "active=>1, inactive=>0"
    },
    created_by: {
      allowNull: true,
      type: DataTypes.INTEGER,
      name: 'hws_products_created_by_fk',
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
      name: 'hws_products_updated_by_fk',
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
    modelName: 'productsModel',
    schema: 'hws_schema',
    tableName:`hws_products`,// 'hws_products',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });


  return products;
};
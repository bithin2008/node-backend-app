'use strict';
const {
  Model, BOOLEAN
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class customerCards extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      customerCards.belongsTo(models.customersModel, { foreignKey: 'customer_id', as: 'customer_details',});

    }
  }
  customerCards.init({
    customer_card_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_customer_cards_org_id_fk',
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
    customer_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_customer_cards_customer_id_fk',
      references: {
        model: 'hws_customers',
        key: 'customer_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_customers=>customer_id",
      validate: {
        notNull: {
          msg: "Please select a customer",
        },
        notEmpty: {
          msg: "customer name cannot be empty",
        }
      }
    },
    authorizeNet_payment_profile_id:{
      allowNull: true,
      defaultValue: null,
      type: DataTypes.INTEGER,
      comment:'Authorize.net Paymemnt Profile Id.'
    },
    card_number: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    card_last_4_digit: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    card_type: {
      type: DataTypes.STRING(75),
      allowNull: true,
      defaultValue: null
    },
    card_holder_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please enter a card holder name",
        },
        notEmpty: {
          msg: "card holder name cannot be empty",
        }
      }
    },
    card_expiry_date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
 
    card_icon: {
      type: DataTypes.STRING(75),
      allowNull: true,
      defaultValue: null
    },
    primary_card: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "True=>primary, False=>secondary",
    },
    active_status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1,
      comment: "active =>1,  inactive=>0",
    },
    ip_address: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    create_user_type: {
      allowNull: true,
      defaultValue: 1,
      type: DataTypes.SMALLINT,
      comment: "self customer =>1,  admin-user=>2, realtor=>3,",
    },
    update_user_type: {
      allowNull: true,
      defaultValue: null,
      type: DataTypes.SMALLINT,
      comment: "self customer =>1, admin-user=>2, realtor=>3,",
    },
    created_by: {
      allowNull: true,
      defaultValue: null,
      type: DataTypes.INTEGER,
      comment: "table=>depending on the create_user_type value =>respected table id",
    },
    updated_by: {
      allowNull: true,
      defaultValue: null,
      type: DataTypes.INTEGER,
      comment: "table=>depending on the update_user_type value =>respected table id",
    },
    deleted_by: {
      allowNull: true,
      type: DataTypes.INTEGER,
      name: 'hws_policies_deleted_by_fk',
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
    modelName: 'customerCardsModel',
    schema: 'hws_schema',
    tableName: `hws_customer_cards`,
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return customerCards;
};
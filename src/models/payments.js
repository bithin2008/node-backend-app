'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class payments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
       payments.belongsTo(models.customersModel, { foreignKey: 'customer_id',as: 'customer_details',});
       payments.belongsTo(models.policiesModel, { foreignKey: 'policy_id',as: 'policy_details',});
    }
  }
  payments.init({
    payment_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_payments_org_id_fk',
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
    policy_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_payments_policy_id_fk',
      references: {
        model: 'hws_policies',
        key: 'policy_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>policy_id=>policy_id",
      validate: {
        notNull: {
          msg: "Please select a policy",
        },
        notEmpty: {
          msg: "policy cannot be empty",
        }
      }
    },
    customer_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_policies_customer_id_fk',
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
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Amount cannot be null",
        },
        notEmpty: {
          msg: "Amount cannot be empty",
        }
      }
    },
    payment_type: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      comment: "CREDIT CARD=>1, BANK ACH=>2, Escrow=>3, Do not Charge=>4 ,Link =>5" ,
      validate: {
        notNull: {
          msg: "Payment type cannot be null",
        },
        notEmpty: {
          msg: "Payment type no cannot be empty",
        }
      }
    },
    acc_holder_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    acc_no: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    routing_no: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    schedule_payment: {
      type: DataTypes.SMALLINT,
      defaultValue: 0,
      allowNull: false,
      comment:'0=>SAME DAY PAYMENT,1=>FUTURE PAYMENT'
    },
    recurring_type: {
      type: DataTypes.SMALLINT,
      defaultValue: 0,
      allowNull: false,
      comment:'0=>yearly,1=>monthly'
    },
    manually_collected_by: {
      type: DataTypes.STRING(765),
      allowNull: true,
      defaultValue: null
    },
    manual_payment_type: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0,
      comment:'0 =>policy, 1=>ticket'
    },
    ticket_no: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    card_number: {
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
      allowNull: true,
      defaultValue: null
    },
    card_expiry_date: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    card_icon: {
      type: DataTypes.STRING(75),
      allowNull: true,
      defaultValue: null
    },
    cheque_no: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: null
    },
    repayment_count: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0
    },
    validate_cheque_code: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: null
    },
    payment_status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 4,
      comment: "success=>1,failed=>2, cancelled=>3, pending=>4, deactivate=>5,",
    },
    transaction_response:{
      type: DataTypes.JSON,
      allowNull: true   
    },
    comments: {
      type: DataTypes.STRING(765),
      allowNull: true,
      defaultValue: null
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
    payment_successfull_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
    invoice_no:{
      allowNull: true,
      type: DataTypes.STRING,
      defaultValue:null,
    },
    transaction_no: {
      type: DataTypes.STRING(765),
      allowNull: true,
      defaultValue: null
    },
    paypal_PROFILEID: {
      type: DataTypes.STRING(150),
      allowNull: true,
      defaultValue: null
    },
    paypal_RPREF: {
      type: DataTypes.STRING(150),
      allowNull: true,
      defaultValue: null
    },
    paypal_RESPMSG: {
      type: DataTypes.STRING(465),
      allowNull: true,
      defaultValue: null
    },
    paypal_AUTHCODE: {
      type: DataTypes.STRING(150),
      allowNull: true,
      defaultValue: null
    },
    paypal_TRXRESPMSG: {
      type: DataTypes.STRING(150),
      allowNull: true,
      defaultValue: null
    },
    state: {
      type: DataTypes.STRING(150),
      allowNull: true,
      defaultValue: null
    },
    cron_payment: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0
    },
    failed_repayment_by_sms: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0
    },
    failed_payment_email: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0
    },
    create_user_type:{
      allowNull: true,
      defaultValue:1,
      type: DataTypes.SMALLINT,
      comment: "self customer =>1,  admin-user=>2, realtor=>3, Cron Process =>10",
    },
    update_user_type:{
      allowNull: true,
      defaultValue:null,
      type: DataTypes.SMALLINT,
      comment: "self customer =>1, admin-user=>2,  realtor=>3, Cron Process =>10",
    },
    created_by: {
      allowNull: true,
      defaultValue:null,
      type: DataTypes.INTEGER,
      comment: "table=>depending on the create_user_type value =>respected table id",
    },
    updated_by: {
      allowNull: true,
      defaultValue:null,
      type: DataTypes.INTEGER,
      comment: "table=>depending on the update_user_type value =>respected table id",
    },
    deleted_by: {
      allowNull: true,
      type: DataTypes.INTEGER,
      name: 'hws_payments_deleted_by_fk',
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
    modelName: 'paymentsModel',
    schema: 'hws_schema',
    tableName: 'hws_payments',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });
  return payments;
};
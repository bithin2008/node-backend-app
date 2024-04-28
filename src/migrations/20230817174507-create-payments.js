'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_payments', {
      payment_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
  
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
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
        type: Sequelize.INTEGER,
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
        type: Sequelize.INTEGER,
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
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: null,
        validate: {
          notEmpty: {
            msg: "Amount cannot be empty",
          }
        }
      },
      payment_type: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        comment: "CREDIT CARD=>1, BANK ACH=>2, Escrow=>3, Do not Charge=>4 ,Link =>5" ,
        validate: {
          notEmpty: {
            msg: "Payment type no cannot be empty",
          }
        }
      },
      acc_holder_name: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      acc_no: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      routing_no: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      schedule_payment: {
        type: Sequelize.SMALLINT,
        defaultValue: 0,
        allowNull: false,
      },
      recurring_type: {
        type: Sequelize.SMALLINT,
        defaultValue: 0,
        allowNull: false,
        comment:'0=>yearly,1=>monthly'
      },
      manually_collected_by: {
        type: Sequelize.STRING(765),
        allowNull: true,
        defaultValue: null
      },
      manual_payment_type: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 0
      },
      ticket_no: {
        type: Sequelize.STRING(60),
        allowNull: true,
        defaultValue: null
      },
      card_number: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },  
      card_type: {
        type: Sequelize.STRING(75),
        allowNull: true,
        defaultValue: null
      },
      card_expiry_date: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      card_holder_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null
      },
      
      card_icon: {
        type: Sequelize.STRING(75),
        allowNull: true,
        defaultValue: null
      },
      cheque_no: {
        type: Sequelize.STRING(250),
        allowNull: true,
        defaultValue: null
      },
      repayment_count: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 0
      },
      validate_cheque_code: {
        type: Sequelize.STRING(30),
        allowNull: true,
        defaultValue: null
      },
      payment_status: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 4,
        comment: "success=>1,failed=>2, cancelled=>3, pending=>4, deactivate=>5,",
      },
      transaction_response:{
        type: Sequelize.JSON,
        allowNull: true 
      },
      comments: {
        type: Sequelize.STRING(765),
        allowNull: true,
        defaultValue: null
      },
      payment_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      re_payment_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      invoice_no:{
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue:null
      },
      transaction_no: {
        type: Sequelize.STRING(765),
        allowNull: true,
        defaultValue: null
      },
      paypal_PROFILEID: {
        type: Sequelize.STRING(150),
        allowNull: true,
        defaultValue: null
      },
      paypal_RPREF: {
        type: Sequelize.STRING(150),
        allowNull: true,
        defaultValue: null
      },
      paypal_RESPMSG: {
        type: Sequelize.STRING(465),
        allowNull: true,
        defaultValue: null
      },
      paypal_AUTHCODE: {
        type: Sequelize.STRING(150),
        allowNull: true,
        defaultValue: null
      },
      paypal_TRXRESPMSG: {
        type: Sequelize.STRING(150),
        allowNull: true,
        defaultValue: null
      },
      state: {
        type: Sequelize.STRING(150),
        allowNull: true,
        defaultValue: null
      },
      cron_payment: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 0
      },
      failed_repayment_by_sms: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 0
      },
      failed_payment_email: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 0
      },
      active_status: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        defaultValue: 0,
        comment: "active=>1, inactive=>0",
      },
  
      create_user_type:{
        allowNull: true,
        defaultValue:null,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1, salesman user=>2, realtor=>3, Cron Process =>10",
      },
      update_user_type:{
        allowNull: true,
        defaultValue:null,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1, salesman user=>2, realtor=>3, Cron Process =>10",
      },
      created_by: {
        allowNull: true,
        defaultValue:1,
        type: Sequelize.INTEGER,
        comment: "table=>depends of create_user_type => respected table id ",
      },
      updated_by: {
        allowNull: true,
        defaultValue:null,
        type: Sequelize.INTEGER,
        comment: "table=>depends of update_user_type =>respected table id  ",
      },
     
      deleted_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
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
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      }
    }, {
      schema: 'hws_schema'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('hws_payments', 'hws_payments_org_id_fk');
    await queryInterface.removeConstraint('hws_payments', 'hws_payments_policy_id_fk');
    await queryInterface.removeConstraint('hws_payments', 'hws_policies_customer_id_fk');
    await queryInterface.removeConstraint('hws_payments', 'hws_payments_deleted_by_fk');
    await queryInterface.dropTable('hws_payments');
  }
};
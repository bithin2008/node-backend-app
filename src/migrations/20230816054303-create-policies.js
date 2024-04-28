'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_policies', {
      policy_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_policies_org_id_fk',
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
      
      plan_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_policies_plan_id_fk',
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
            msg: "plan name cannot be empty",
          }
        }
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "First name cannot be empty",
          },
          len: {
            args: [3, 20],
            msg: "First name must be between 3 and 20 characters long",
          },
        },
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Last name cannot be empty",
          },
          len: {
            args: [3, 20],
            msg: "Last name must be between 3 and 20 characters long",
          },
        },
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide an email",
          },
          notEmpty: {
            msg: "Email cannot be empty",
          },
          isEmail: {
            msg: "Please provide a valid email address",
          },
        },
      },
      mobile: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide a password",
          },
          notEmpty: {
            msg: "Password cannot be empty",
          },
          not: {
            args: [/^\+[1-9]\d{1,14}$/], // Regular expression to validate mobile number format
            msg: "Invalid mobile number format. Please provide a valid mobile number.",
          },
          len: {
            args: [10, 20],
            msg: "Min length of the phone number is 10"
          }
        },
      },
     
      policy_number: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
        validate: {
          notNull: {
            msg: "Please provide a policy number",
          },
          notEmpty: {
            msg: "policy number cannot be empty",
          }
        },
      },
      pcf: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: null,
      },
      plan_terms_id:{
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_policies_plan_terms_id_fk',
        references: {
          model: 'hws_plan_terms',
          key: 'plan_terms_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_plan_terms=>plan_terms_id",
        validate: {
          notNull: {
            msg: "Please select a plan term",
          },
          notEmpty: {
            msg: "plan term cannot be empty",
          }
        }
      },
      policy_term: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: null,
      },
      policy_term_month: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: null,
      },
      holding_period:{
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue:30,
      },
      policy_start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: null,
        validate: {
          notEmpty: {
            msg: "Policy start date cannot be empty",
          }
        },
        comment: "Policy start date shoud be set after holding_period day complete",
  
      },
      
      policy_expiry_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Policy expiry date cannot be empty",
          }
        }
      },
      property_type_id: {
        allowNull: false,
        defaultValue:1,
        type: Sequelize.INTEGER,
        name: 'hws_policies_property_type_id_fk',
        references: {
          model: 'hws_property_types',
          key: 'property_type_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_property_types=>property_type_id",
        validate: {
          notNull: {
            msg: "Please select a Property Type",
          },
          notEmpty: {
            msg: "Property type cannot be empty",
          }
        }
      },
      property_size_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "0=>Under 5,000 sq. ft,  1=> Over 5,000 sq. ft",
      },
      order_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Order date cannot be empty",
          }
        }
      },
      bonus_month: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      expiry_with_bonus: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Policy expiry with bonus date cannot be empty",
          }
        }
      },
      policy_amount: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Policy amount cannot be empty",
          }
        }
      },
      addon_coverage_amount: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0,
        validate: {
          notEmpty: {
            msg: "Addon coverage amount cannot be empty",
          }
        }
      },
      sub_total_amount: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Sub total amount cannot be empty",
  
          }
        },
        comment:'(policy_amount + addon_coverage_amount)'
      },
      tax_type: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue:null,
        validate: {
          notEmpty: {
            msg: "Tax Paercentage cannot be empty",
          }
        },
        comment: '1=>New-york tax, 2=> state wise tax, 3=>wave-off tax'
      },
      tax_percentage: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue:null,
        validate: {
          notEmpty: {
            msg: "Tax Paercentage cannot be empty",
          }
        }
      },
      tax_amount: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Tax amount cannot be empty",
          }
        }
      },
    
      total_price: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Total amount cannot be empty",
          }
        },
        comment:'(policy_amount + addon_coverage_amount+tax_amount)'
  
      },
      miscellaneous_charges: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0,
        validate: {
          notEmpty: {
            msg: "Miscellaneous amount cannot be empty",
          }
        },
      },
      discount_amount: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0,
        validate: {
          notEmpty: {
            msg: "Discount amount cannot be empty",
          }
        },
        
      },
      net_amount: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: null,
        validate: {
          notEmpty: {
            msg: "Net amount cannot be empty",
          }
        },
        comment:'(total_price - discount_amount)'
      },  
      coupon_code: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      billing_zip: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: null,
      },
      billing_state: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: null,
      },
      billing_city: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: null,
      },
      billing_address1: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: null,
      },
      billing_address2: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      purchase_status: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        defaultValue: 1,
        comment: "success=>1, failed=>0",
      },
      first_free_service: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        defaultValue: 0,
        comment: "Yes eligible for first free service=>1, No Not eligible=>0",
      },
      realtor_email: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null,
        validate: {
          notEmpty: {
            msg: "Email cannot be empty",
          },
          isEmail: {
            msg: "Please provide a valid email address",
          },
        },
      },
      agent_email: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null,
        validate: {
          notEmpty: {
            msg: "Email cannot be empty",
          },
          isEmail: {
            msg: "Please provide a valid email address",
          },
        },
      },
      policy_status: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        defaultValue: 0,
        comment: "Cancelled=>0, 30 Days Wait=>2,Expired=>3, Escrow - Pending =>4, Do not Charge =>5, Hold (Failed Payment)=>6, Pending (Link-Payment) => 7",
      },
      renewal_status: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        defaultValue: 0,
        comment: "Renewal Pending=>0, Renewed=>1, Rejected By Customer=>2",
      },
      is_policy_renewed: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        defaultValue: 0,
        comment: "Not Renewed=>0, Renewed=>1",
      },
      renewed_from_policy_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        comment: "Insert policy Id from where the current policy was renewed",
      },
      source: {
        allowNull: false,
        defaultValue:0,
        type: Sequelize.SMALLINT,
        comment: "0=>self customer, 1=>backend team, realtor=>3, Cron Process =>10",
      },
      is_anamaly: {
        allowNull: false,
        type: Sequelize.SMALLINT, 
        defaultValue: 0,
        comment: "anamaly=>1, not anamaly=>0",
      },
      ip_address: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      create_user_type:{
        allowNull: true,
        defaultValue:1,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1,  admin-user=>2, realtor=>3, Cron Process =>10",
      },
      update_user_type:{
        allowNull: true,
        defaultValue:null,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1, admin-user=>2, realtor=>3, Cron Process =>10",
      },
      created_by: {
        allowNull: true,
        defaultValue:null,
        type: Sequelize.INTEGER,
        comment: "table=>depending on the create_user_type value =>respected table id",
      },
      updated_by: {
        allowNull: true,
        defaultValue:null,
        type: Sequelize.INTEGER,
        comment: "table=>depending on the update_user_type value =>respected table id",
      },
      deleted_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
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
    await queryInterface.removeConstraint('hws_policies', 'hws_policies_org_id_fk');
    await queryInterface.removeConstraint('hws_policies', 'hws_policies_customer_id_fk');
    await queryInterface.removeConstraint('hws_policies', 'hws_policies_plan_id_fk');
    await queryInterface.removeConstraint('hws_policies', 'hws_policies_property_type_id_fk');
    await queryInterface.removeConstraint('hws_policies', 'hws_customers_deleted_by_fk');
    await queryInterface.dropTable('hws_policies');
  }
};
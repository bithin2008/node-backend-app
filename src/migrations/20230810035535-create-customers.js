'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_customers', {
      customer_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_customers_org_id_fk',
        
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
      lead_id: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
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
        allowNull: true,
        defaultValue: null,
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
        unique: {
          arg: true,
          msg: 'Customer email must be unique.',
        },
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
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide a password",
          },
          notEmpty: {
            msg: "Password cannot be empty",
          },
          len: {
            args: [3],
            msg: "Min length of the password is 3"
          }
        },
      },
      mobile: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide phone number",
          },
          notEmpty: {
            msg: "Phone number cannot be empty",
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
      alternate_phone: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          not: {
            args: [/^\+[1-9]\d{1,14}$/], // Regular expression to validate mobile number format
            msg: "Invalid mobile number format. Please provide a valid mobile number.",
          }
        },
      },
      profile_image: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null
      },
      zip: {
        allowNull: false,
        type: Sequelize.STRING,
        validate: {
          notNull: {
            msg: "Please provide a zip code",
          },
          notEmpty: {
            msg: "Zipcode cannot be empty",
          },
        },
      },
      state: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      city: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: null
      },
      address1: {
        allowNull: false,
        type: Sequelize.STRING,
        validate: {
          notNull: {
            msg: "Please provide a address",
          },
          notEmpty: {
            msg: "Address cannot be empty",
          },
        },
      },
      address2: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null
      },
      active_status: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 1,
      },
      login_otp: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        validate: {
          notEmpty: {
            msg: "OTP cannot be empty",
          },
          isValidOTP(value) {
            if(value)
            if (!/^\d{4}$/.test(value)) {
              throw new Error(
                "Invalid OTP format. Please provide a 4-digit OTP."
              );
            }
          },
        },
      },
      login_otp_created_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },  
      last_login: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.DATE,
      },
      authorizeNet_customer_profile_id:{
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER,
        comment:'Authorize.net Customer Profile Id.'
      },
      source: {
        allowNull: false,
        defaultValue:0,
        type: Sequelize.SMALLINT,
        comment: "0=>self customer, 1=>backend team",
      },
      ip_address: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      device_id: {
        allowNull: true,
        type: Sequelize.STRING
      },
      user_agent: {
        allowNull: true,
        type: Sequelize.STRING
      },
      create_user_type:{
        allowNull: true,
        defaultValue:1,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1,  admin-user=>2, realtor=>3,",
      },
      update_user_type:{
        allowNull: true,
        defaultValue:null,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1, admin-user=>2, realtor=>3,",
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
        name: 'hws_customers_deleted_by_fk',
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
    await queryInterface.removeConstraint('hws_customers', 'hws_customers_org_id_fk');
    await queryInterface.removeConstraint('hws_customers', 'hws_customers_lead_id_fk');
    await queryInterface.removeConstraint('hws_customers', 'hws_customers_deleted_by_fk');
    await queryInterface.dropTable('hws_customers');
  }
};
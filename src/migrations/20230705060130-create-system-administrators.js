'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // console.log(queryInterface.sequelize.options.schema);
    // return
    // if (queryInterface.sequelize.options.schema != 'hws_schema') {
    //   console.log('Skipping migration...');
    //   return;
    // }

    await queryInterface.createTable('hws_system_administrators', {
      system_administrator_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide a first name",
          },
          notEmpty: {
            msg: "First name cannot be empty",
          },
          len: {
            args: [3, 25],
            msg: "First name must be between 3 and 25 characters long",
          },
        },
      },
     
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
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
          isStrongPassword: {
            args: [
              {
                minSymbols: 0, // Minimum number of symbols required
                minLength: 8, // Minimum password length
                minLowercase: 1, // Minimum number of lowercase characters required
                minUppercase: 1, // Minimum number of uppercase characters required
                minNumbers: 1, // Minimum number of numeric characters required
              },
            ],
            msg: "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one numeric digit, and no spaces.",
          },
        },
      },
      mobile: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
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
      is_system_admin: {
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
            if (!/^\d{4}$/.test(value)) {
              throw new Error(
                "Invalid OTP format. Please provide a 4-digit OTP."
              );
            }
          },
        },
      },
      login_otp_expired_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      token: {
        allowNull: true,
        defaultValue:null,
        type: Sequelize.STRING,
      },
      last_login: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue:null,
      },
      forgot_password_token:{
        allowNull: true,
        defaultValue:null,
        type: Sequelize.STRING,
      },
      forgot_password_link_expired_at:{
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue:null,
      },
      ip_address: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue:null,
      },
      user_agent: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue:null,
      }, 
      device_id: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue:null,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue:Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      }
    }, {
      schema: 'hws_schema',
    });


  
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('hws_system_administrators');
  }
};
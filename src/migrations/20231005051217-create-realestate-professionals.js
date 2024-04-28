'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_realestate_professionals', {
      realestate_professional_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_realestate_professionals_org_id_fk',
  
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
          }
        }
      },
      company_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide company name",
          },
          notEmpty: {
            msg: "Company name cannot be empty",
          },
          len: {
            args: [3, 150],
            msg: "Company name must be between 3 and 150 characters long",
          },
        },
      },
      contact_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide contact name",
          },
          notEmpty: {
            msg: "Contact name cannot be empty",
          },
          len: {
            args: [3, 150],
            msg: "Contact name must be between 3 and 150 characters long",
          },
        },
      },
      email: {
        type: Sequelize.STRING(75),
        allowNull: false,
        unique: {
          msg: 'This email address is already taken.'
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
      profile_image: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null
      },
      address: {
        type: Sequelize.STRING(300),
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide address",
          },
          notEmpty: {
            msg: "Address cannot be empty",
          }
        },
      },
      account_type: {
        type: Sequelize.STRING(255),
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide account type",
          },
          notEmpty: {
            msg: "Account type cannot be empty",
          }
        },
      },
      office_location: {
        type: Sequelize.STRING(300),
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide office location",
          },
          notEmpty: {
            msg: "Office location cannot be empty",
          }
        },
      },
      office_address: {
        type: Sequelize.STRING(300),
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide office address",
          },
          notEmpty: {
            msg: "Office address cannot be empty",
          }
        },
      },
      office_zip: {
        allowNull: false,
        type: Sequelize.STRING(20),
        validate: {
          notNull: {
            msg: "Please provide office zip code",
          },
          notEmpty: {
            msg: "Office Zipcode cannot be empty",
          },
        },
      },
      office_state: {
        allowNull: false,
        type: Sequelize.STRING(50),
        validate: {
          notNull: {
            msg: "Please provide office state",
          },
          notEmpty: {
            msg: "Office state cannot be empty",
          }
        },
      },
      office_city: {
        allowNull: false,
        type: Sequelize.STRING(50),
        validate: {
          notNull: {
            msg: "Please provide office city",
          },
          notEmpty: {
            msg: "Office city cannot be empty",
          }
        },
      },
      active_status: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        defaultValue: 1,
        comment: "active=>1, inactive=>0"
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
            if (value)
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
      source: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.SMALLINT,
        comment: "0=>Self Realtor, 1=>Backend Team",
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
      os_platform: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      create_user_type: {
        allowNull: true,
        defaultValue: 1,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1,  admin-user=>2, realtor=>3,contractor=>4, real-state-professional=>5",
      },
      update_user_type: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1, admin-user=>2, realtor=>3,contractor=>4, real-state-professional=>5",
      },
      created_by: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER,
        comment: "table=>depending on the create_user_type value =>respected table id",
      },
      updated_by: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER,
        comment: "table=>depending on the update_user_type value =>respected table id",
      },
      deleted_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        name: 'hws_realestate_professionals_deleted_by_fk',
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
    await queryInterface.removeConstraint('hws_realestate_professionals', 'hws_realestate_professionals_org_id_fk');
    await queryInterface.removeConstraint('hws_realestate_professionals', 'hws_realestate_professionals_deleted_by_fk');
    await queryInterface.dropTable('hws_realestate_professionals');
  }
};
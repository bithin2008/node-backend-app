'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_org_users', {
      org_user_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_org_users_org_id_fk',
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
      user_role_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_org_users_user_role_id_fk',
        references: {
          model: 'hws_org_user_roles',
          key: 'user_role_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_org_user_roles=>user_role_id",
      },
      department_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_org_users_department_id_fk',
        references: {
          model: 'hws_org_departments',
          key: 'department_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_org_departments=>department_id",
      },
      first_name: {
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
            args: [3, 20],
            msg: "First name must be between 3 and 20 characters long",
          },
        },
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide a last name",
          },
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
      gender: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.SMALLINT,
        comment: "1=>Male, 2=> Female, 3=> Others",
        validate: {
          notEmpty: {
            msg: "gender cannot be empty",
          }
        }
      },
      date_of_birth: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
        validate: {
          notEmpty: {
            msg: "Date of birth cannot be empty",
          }
        }
      },
      joining_date: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
        validate: {
          notEmpty: {
            msg: "Date of Joining cannot be empty",
          }
        }
      },
      residential_phone: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      profile_image: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      zip: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      address1: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      address2: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
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
      self_activation_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      spiff_commision_gen_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      last_login: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.DATE,
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      device_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_agent: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      os_platform: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_by: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER,
      },
      updated_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      deleted_by: {
        allowNull: true,
        type: Sequelize.INTEGER
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
      },
    }, {
      schema: 'hws_schema',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('hws_org_users', 'hws_org_users_org_id_fk');
    await queryInterface.removeConstraint('hws_org_users', 'hws_org_users_user_role_id_fk');
    await queryInterface.removeConstraint('hws_org_users', 'hws_org_users_department_id_fk');
    await queryInterface.dropTable('hws_org_users');
  }
};
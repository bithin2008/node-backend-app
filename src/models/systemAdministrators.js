'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class systemAdministrators extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  systemAdministrators.init({
    system_administrator_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
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
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1,
    },
    login_otp: {
      type: DataTypes.INTEGER,
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
    login_otp_expired_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    token: {
      allowNull: true,
      defaultValue:null,
      type: DataTypes.STRING,
    },
    last_login: {
      allowNull: true,
      type: DataTypes.DATE,
      defaultValue:null,
    },
    forgot_password_token:{
      allowNull: true,
      defaultValue:null,
      type: DataTypes.STRING,
    },
    forgot_password_link_expired_at:{
      allowNull: true,
      type: DataTypes.DATE,
      defaultValue:null,
    },
    ip_address: {
      allowNull: true,
      type: DataTypes.STRING,
      defaultValue:null,
    },
    user_agent: {
      allowNull: true,
      type: DataTypes.STRING,
      defaultValue:null,
    }, 
    device_id: {
      allowNull: true,
      type: DataTypes.STRING,
      defaultValue:null,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue:sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue:sequelize.literal('CURRENT_TIMESTAMP')
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    }
  }, {
    sequelize,
    modelName: 'systemAdministratorsModel',
    schema: 'hws_schema',
    tableName: 'hws_system_administrators',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return systemAdministrators;
};
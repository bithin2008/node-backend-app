'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class customers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      customers.hasMany(models.claimsModel, { foreignKey: 'customer_id', as: 'claim_list', });
      customers.hasMany(models.policiesModel, { foreignKey: 'customer_id', as: 'policy_list', });
      customers.hasMany(models.paymentsModel, { foreignKey: 'customer_id', as: 'payment_list', });
      customers.hasMany(models.customerCardsModel, { foreignKey: 'customer_id', as: 'card_list', });
      // customers.hasMany(models.policyNotesModel, { foreignKey: 'customer_id', as: 'policy_note_list',});
    }
  }
  customers.init({
    customer_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
      // Add index for customer_id
      indexes: [
        {
          unique: true, // Set to true if customer_id should be unique
          fields: ['customer_id']
        }
      ]

    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      // Add index for org_id
      indexes: [
        {
          unique: false, // Set to true if org_id should be unique
          fields: ['org_id']
        }
      ],
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
      type: DataTypes.INTEGER
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      validate: {
        notEmpty: {
          msg: "First name cannot be empty",
        },
        len: {
          args: [3, 150],
          msg: "First name must be between 3 and 150 characters long",
        },
      },
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      validate: {
        notEmpty: {
          msg: "Last name cannot be empty",
        },
        len: {
          args: [3, 150],
          msg: "Last name must be between 3 and 150 characters long",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
      defaultValue: null
    },
    zip: {
      allowNull: false,
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
    },
    city: {
      allowNull: false,
      type: DataTypes.STRING,
      defaultValue: null
    },
    address1: {
      allowNull: false,
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
      defaultValue: null
    },
    active_status: {
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
    login_otp_created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    last_login: {
      allowNull: true,
      defaultValue: null,
      type: DataTypes.DATE,
    },
    authorizeNet_customer_profile_id: {
      allowNull: true,
      defaultValue: null,
      type: DataTypes.INTEGER,
      comment: 'Authorize.net Paymemnt Profile Id.'
    },
    source: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.SMALLINT,
      comment: "0=>Self Customer, 1=>Backend Team",
    },
    ip_address: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    device_id: {
      allowNull: true,
      type: DataTypes.STRING
    },
    user_agent: {
      allowNull: true,
      type: DataTypes.STRING
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
    },


  }, {
    sequelize,
    modelName: 'customersModel',
    schema: 'hws_schema',
    tableName: 'hws_customers',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  // (async () => {
  //   await customers.sync();
  // })();
  return customers;
};


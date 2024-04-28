'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class contractors extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      contractors.hasMany(models.contractorProductsModel, { foreignKey: 'contractor_id', as: 'contractor_product_list',});
      contractors.hasMany(models.contractorAssignedJobModel, { foreignKey: 'contractor_id', as: 'assign_jobs',});
      
    }
  }
  contractors.init({
    contractor_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_contractors_org_id_fk',
      
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
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "First name cannot be empty",
        },
        len: {
          args: [3, 100],
          msg: "First name must be between 3 and 20 characters long",
        },
      },
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Last name cannot be empty",
        },
        len: {
          args: [3, 100],
          msg: "Last name must be between 3 and 100 characters long",
        },
      },
    },
    company_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Company name cannot be empty",
        },
        len: {
          args: [3, 150],
          msg: "Company name must be between 3 and 150 characters long",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null
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
    company_phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide company phone number",
        },
        notEmpty: {
          msg: "Company phone number cannot be empty",
        },
        not: {
          args: [/^\+[1-9]\d{1,14}$/], // Regular expression to validate mobile number format
          msg: "Invalid phone number format. Please provide a valid phone number.",
        },
        len: {
          args: [10, 20],
          msg: "Min length of the phone number is 10"
        }
      },
    },
    license_no:{
      allowNull: true,
      type: DataTypes.STRING(50),
      defaultValue: null
    },
    license_expiry:{
      allowNull: true,
      type: DataTypes.DATEONLY,
      defaultValue: null,
    },
    address1: {
      allowNull: false,
      type: DataTypes.STRING(150),
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
      type: DataTypes.STRING(150),
      defaultValue: null
    },
    profile_image: {
      allowNull: true,
      type: DataTypes.STRING(150),
      defaultValue: null
    },
    zip: {
      allowNull: false,
      type: DataTypes.STRING(20),
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
      type: DataTypes.STRING(50),
    },
    city: {
      allowNull: false,
      type: DataTypes.STRING(50),
      defaultValue: null
    },
    contractor_count:{
      allowNull: false,
      type: DataTypes.INTEGER,
      validate: {
        notNull: {
          msg: "Please provide contractor count"
        },
        notEmpty: {
          msg: "contractor count cannot be empty"
        },
      },
      comment: "0 to 50=>1, 50 to 100=>2 ,100 to 250=>3, More than 250=>4"
    },
    service_location:{
      allowNull: true,
      type: DataTypes.STRING(150),
    },
    radial_distance:{
      allowNull: false,
      type: DataTypes.DOUBLE,
      validate: {
        notNull: {
          msg: "Please provide a radial distance"
        },
        notEmpty: {
          msg: "Radial distance cannot be empty"
        },
      },
    },
    service_call_fee:{
      allowNull: false,
      type: DataTypes.DOUBLE,
      validate: {
        notNull: {
          msg: "Please provide a service call fee"
        },
        notEmpty: {
          msg: "Service call fee cannot be empty"
        },
      },
    },
    license_doc:{
      allowNull: true,
      type: DataTypes.STRING,
      defaultValue:null,
      validate: {        
        notEmpty: {
          msg: "Licence document cannot be empty"
        },
      },
    },    
    source: {
      allowNull: false,
      defaultValue:0,
      type: DataTypes.STRING(150),
      comment: "Source name of the contractor",
    },
    active_status: {
      allowNull: false,
      type: DataTypes.SMALLINT,
      defaultValue: 1,
      comment: "Verified=>1, Unverified=>0 ,Blacklist=>2"
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
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    last_login: {
      allowNull: true,
      defaultValue: null,
      type: DataTypes.DATE,
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
    os_platform: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    create_user_type:{
      allowNull: true,
      defaultValue:4,
      type: DataTypes.SMALLINT,
      comment: "self customer =>1,  admin-user=>2, realtor=>3,contractor=>4,",
    },
    update_user_type:{
      allowNull: true,
      defaultValue:null,
      type: DataTypes.SMALLINT,
      comment: "self customer =>1, admin-user=>2, realtor=>3,,contractor=>4",
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
      name: 'hws_contractors_deleted_by_fk',
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
    modelName: 'contractorsModel',
    schema: 'hws_schema',
    tableName:`hws_contractors`,
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return contractors;
};
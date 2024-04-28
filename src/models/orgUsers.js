'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class orgUsers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      orgUsers.belongsTo(models.organizationsModel, { foreignKey: 'org_id', as: 'organization_details' });
      orgUsers.belongsTo(models.orgDepartmentsModel, { foreignKey: 'department_id', as: 'department_details' });
      orgUsers.belongsTo(models.orgUserRolesModel, { foreignKey: 'user_role_id', as: 'user_role_details' });
      //orgUsers.hasMany(models.orgUserAccessPermissionsModel, { foreignKey: 'user_access_permissions_id', as: 'access_permission_details' });
      orgUsers.hasMany(models.orgUserAccessPermissionsModel, { foreignKey: 'org_user_id',as: 'accessable_module_submodules',});
      orgUsers.hasMany(models.orgUserLoginActivitiesModel, { foreignKey: 'org_user_id',as: 'login_activities',});
      orgUsers.hasMany(models.policiesModel, { foreignKey: 'created_by', as: 'policy_list',});
      orgUsers.belongsTo(models.orgUsersModel, { foreignKey: 'updated_by', as: 'update_info' });
      orgUsers.belongsTo(models.orgUsersModel, { foreignKey: 'created_by', as: 'create_info' });
     //orgUsers.belongsToMany(models.orgModulesModel, { foreignKey: 'org_user_id', through: models.orgUserAccessPermissionsModel,});

      // this.belongsToMany(orgUsers, {
      //   through: 'orgUserAccessPermissionsModel', // Replace with the actual name of the intermediary table
      //   foreignKey: 'user_access_permissions_id', // Foreign key from orgUserAccessPermissionsModel
      //   otherKey: 'org_user_id', // Foreign key from OtherModel
      //   as: 'modules', // Alias for the relationship
      // });
    }
  }
  orgUsers.init({
    org_user_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
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
          msg: "organization name cannot be empty",
        },

      },
    },
    user_role_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_org_users_user_role_id_fk',
      references: {
        model: 'hws_org_user_roles',
        key: 'user_role_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_org_user_roles=>user_role_id",
      validate: {
        notNull: {
          msg: "Please provide a role",
        },
        notEmpty: {
          msg: "Role cannot be empty",
        },
        
      },
    },
    department_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_org_users_department_id_fk',
      references: {
        model: 'hws_org_departments',
        key: 'department_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_org_departments=>department_id",
      validate: {
        notNull: {
          msg: "Please select department",
        },
        notEmpty: {
          msg: "Department name cannot be empty",
        },

      },
    },
    first_name: {
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
          msg: "First name must be between 3 and 20 characters long",
        },
      },
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide a last name",
        },
        notEmpty: {
          msg: "Last name cannot be empty",
        },
        len: {
          args: [3, 25],
          msg: "Last name must be between 3 and 100 characters long",
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
    gender: {
      allowNull: true,
      defaultValue: null,
      type: DataTypes.SMALLINT,
      comment: "1=>Male, 2=> Female, 3=> Others",
      validate: {
        notEmpty: {
          msg: "gender cannot be empty",
        }
      }
    },
    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      validate: {
        notEmpty: {
          msg: "Date of birth cannot be empty",
        }
      }
    },
    joining_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      validate: {
        notEmpty: {
          msg: "Date of Joining cannot be empty",
        }
      }
    },
    residential_phone: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    address1: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    address2: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    active_status:{
      allowNull:false,
      type:DataTypes.SMALLINT,
      defaultValue:1,
      comment: "active=>1, inactive=>0",
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
    self_activation_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    spiff_commision_gen_at: {
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
      type: DataTypes.STRING,
      allowNull: false,
    },
    device_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_agent: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    os_platform: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_by: {
      allowNull: true,
      defaultValue: null,
      type: DataTypes.INTEGER,
    },
    updated_by: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    deleted_by: {
      allowNull: true,
      type: DataTypes.INTEGER
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
    modelName: 'orgUsersModel',
    schema: 'hws_schema',
    tableName: 'hws_org_users',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return orgUsers;
};
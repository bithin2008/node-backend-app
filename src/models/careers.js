'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class careers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  careers.init({
    career_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_careers_org_id_fk',
      
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
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide first name",
        },
        notEmpty: {
          msg: "First name cannot be empty",
        },
        len: {
          args: [3, 100],
          msg: "First name must be between 3 and 100 characters long",
        },
      },
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: null,
      validate: {
        notNull: {
          msg: "Please provide last name",
        },
        notEmpty: {
          msg: "Last name cannot be empty",
        },
        len: {
          args: [3, 100],
          msg: "Last name must be between 3 and 100 characters long",
        },
      },
    },
    email: {
      type: DataTypes.STRING(100),
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
    position: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
    },
    experience: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },   
    qualification: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },   
    has_experience: {
      allowNull: false,
      type: DataTypes.SMALLINT,
      defaultValue: 0,
      comment: "Has experience=>1, No experience=>0"
    },
    resume_doc:{
      allowNull: true,
      type: DataTypes.STRING,
      defaultValue:null 
    },
    active_status: {
      allowNull: false,
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1,
      comment: "active=>1, inactive=>0"
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
    create_user_type:{
      allowNull: true,
      defaultValue:1,
      type: DataTypes.SMALLINT,
      comment: "self customer =>1,  admin-user=>2, realtor=>3, contractor=>4",
    },
    update_user_type:{
      allowNull: true,
      defaultValue:null,
      type: DataTypes.SMALLINT,
      comment: "self customer =>1, admin-user=>2, realtor=>3, contractor=>4",
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
      name: 'hws_careers_deleted_by_fk',
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
    modelName: 'careersModel',
    schema: 'hws_schema',
    tableName: 'hws_careers',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return careers;
};
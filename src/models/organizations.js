'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Organizations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Organizations.init({
    org_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    org_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique:true,
      validate: {
        notNull: {
          msg: "Please provide a organization name",
        },
        notEmpty: {
          msg: "organization name cannot be empty",
        },
        len: {
          args: [3, 50],
          msg: "Organization name must be between 3 and 50 characters long",
        },
      },
    },
    org_title: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null,
      validate: {
        notEmpty: {
          msg: "organization title cannot be empty",
        },
        len: {
          args: [3, 50],
          msg: "Organization title must be between 3 and 50 characters long",
        },
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null,
      validate: {
        notEmpty: {
          msg: "organization description cannot be empty",
        },
        len: {
          args: [3, 200],
          msg: "Organization description must be between 3 and 200 characters long",
        },
      },
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null
    },
    tiny_logo: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null
    },
    favicon: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null
    },
    copyright_text: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null,
    },
    contact_email: {
      type: DataTypes.STRING,
      unique: true,
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
    contact_phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: {
          msg: "Please provide a contact email",
        },
        notEmpty: {
          msg: "contact email cannot be empty",
        },
        not: {
          args: [/^(\([0-9]{3}\)|[0-9]{3}-)[0-9]{3}-[0-9]{4}$/], // Regular expression to validate mobile number format
          msg: "Invalid mobile number format. Please provide a valid mobile number.",
        },
        len: {
          args: [10, 20],
          msg: "Min length of the phone number is 10"
        }
      },
    },
    support_email: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null,
      unique: true,
      validate: {
        notEmpty: {
          msg: "Email cannot be empty",
        },
        isEmail: {
          msg: "Please provide a valid email address",
        },
      },
    },
    support_phone: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null,
      unique: true,
      validate: {
        notEmpty: {
          msg: "support phone cannot be empty",
        },
        not: {
          args: [/^(\([0-9]{3}\)|[0-9]{3}-)[0-9]{3}-[0-9]{4}$/], // Regular expression to validate mobile number format
          msg: "Invalid phone number format. Please provide a valid phone number.",
        },
        len: {
          args: [10, 20],
          msg: "Min length of the phone number is 10"
        }
      },
    },
    color_scheme: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null,
    },
    fb_link: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null,
    },
    twitter_link: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null,
    },
    linkedin_link: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null,
    },
    instagram_link: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null,
    },
    youtube_link: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null,
    },
    whatsapp_link: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null,
    },
    pinterest_link: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null,
    },
    db_schema_prefix: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null
      // unique:true,
      // validate: {
      //   notNull: {
      //     msg: "Please provide an db schema prefix",
      //   },
      //   notEmpty: {
      //     msg: "Db schema prefix cannot be empty",
      //   },

      // },
    },
    active_status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1, 
      comment: "1=>Active,0=>Inactive",
    },
    is_configured: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0, 
      comment: "1=>configured,0=>not configured",
    },
    created_by: {
      allowNull: true,
      defaultValue:null,
      type: DataTypes.INTEGER,
    },
    updated_by: {
      allowNull: true,
      defaultValue:null,
      type: DataTypes.INTEGER,
    },
    deleted_by: {
      allowNull: true,
      defaultValue:null,
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
    modelName: 'organizationsModel',
    schema: 'hws_schema',
    tableName: 'hws_organizations',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return Organizations;
};
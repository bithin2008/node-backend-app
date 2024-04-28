'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_organizations', {
      org_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      org_name: {
        type: Sequelize.STRING,
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
        type: Sequelize.STRING,
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
        type: Sequelize.STRING,
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
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null
      },
      tiny_logo: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null
      },
      favicon: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null
      },
      copyright_text: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null,
      },
      contact_email: {
        type: Sequelize.STRING,
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
        type: Sequelize.STRING,
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
        type: Sequelize.STRING,
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
        type: Sequelize.STRING,
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
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null,
      },
      fb_link: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null,
      },
      twitter_link: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null,
      },
      linkedin_link: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null,
      },
      instagram_link: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null,
      },
      youtube_link: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null,
      },
      whatsapp_link: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null,
      },
      pinterest_link: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null,
      },
      db_schema_prefix: {
        type: Sequelize.STRING,
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
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 1, 
        comment: "1=>Active,0=>Inactive",
      },
      is_configured: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 0, 
        comment: "1=>configured,0=>not configured",
      },
      created_by: {
        allowNull: true,
        defaultValue:null,
        type: Sequelize.INTEGER,
      },
      updated_by: {
        allowNull: true,
        defaultValue:null,
        type: Sequelize.INTEGER,
      },
      deleted_by: {
        allowNull: true,
        defaultValue:null,
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
    await queryInterface.dropTable('hws_organizations');
  }
};
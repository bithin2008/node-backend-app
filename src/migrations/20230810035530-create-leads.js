'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_leads', {
      lead_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_leads_org_id_fk',
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
      application_id: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.STRING
      },
      session_id: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.STRING
      },
      lead_user_id: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.STRING
      },
      first_name: {
        type: Sequelize.STRING,
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
        type: Sequelize.STRING,
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
        type: Sequelize.STRING,
        allowNull: false,
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
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide phone number",
          },
          notEmpty: {
            msg: "phone number cannot be empty",
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
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
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
      property_zip: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          notEmpty: {
            msg: "Zipcode cannot be empty",
          },
          len: {
            args: [5, 5],
            msg: "length of the zip code is 5"
          }
        },
      },
      property_state: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          notEmpty: {
            msg: "state cannot be empty",
          },
  
        },
      },
      property_city: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          notEmpty: {
            msg: "city cannot be empty",
          },
        },
      },
      property_address1: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      property_address2: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lead_source: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      plan_name: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null
      },
      policy_term: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null
      },
      property_type: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null
      },
      property_size: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null
      },
      add_on_coverages: {
        allowNull: true,
        type: DataTypes.STRING(950),
        defaultValue: null
      },
      billing_zip: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null
      },
      billing_state: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null
      },
      billing_city: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null
      },
      billing_address1: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null
      },
      price: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: null,
        comment: 'Plan Price (Add Addon Item price if available)'
      },
      landing_url: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null
      },
      utm_campaighn: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null
      },
      utm_source: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null
      },
      utm_id: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null
      },
      is_conversion_done: {
        allowNull: true,
        type: Sequelize.SMALLINT,
        defaultValue: 0,
        comment: "done=>1, not done=>0",
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
      step: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        validate: {
          notNull: {
            msg: "Please provide a step",
          },
          notEmpty: {
            msg: "Step cannot be empty",
          },
        },
      },
      created_by: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER,
        comment: "table=>depends of create_user_type => respected table id ",
      },
      updated_by: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER,
        comment: "table=>depends of update_user_type =>respected table id  ",
      },
      deleted_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        name: 'hws_leads_deleted_by_fk',
        references: {
          model: 'hws_org_users',
          key: 'org_user_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>users=>org_user_id",
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
    await queryInterface.removeConstraint('hws_leads', 'hws_leads_org_id_fk');
    await queryInterface.removeConstraint('hws_leads', 'hws_leads_deleted_by_fk');
    await queryInterface.dropTable('hws_leads');
  }
};
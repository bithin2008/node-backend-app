'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_affiliates', {
      affiliate_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_affiliates_org_id_fk',
        
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
        type: Sequelize.STRING(100),
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
            msg: "First name must be between 3 and 20 characters long",
          },
        },
      },
      last_name: {
        type: Sequelize.STRING(100),
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
            msg: "Last name must be between 3 and 20 characters long",
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
      company_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide company name",
          },
          notEmpty: {
            msg: "company name cannot be empty",
          },
          len: {
            args: [3, 150],
            msg: "company name must be between 3 and 150 characters long",
          },
        },
      },
      message: {
        type: Sequelize.STRING(750),
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide message",
          },
          notEmpty: {
            msg: "Message cannot be empty",
          }      },
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
      create_user_type:{
        allowNull: true,
        defaultValue:5,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1,  admin-user=>2, realtor=>3, contractor=>4,affiliate=>5",
      },
      update_user_type:{
        allowNull: true,
        defaultValue:null,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1, admin-user=>2, realtor=>3, contractor=>4,affiliate=>5",
      },
      created_by: {
        allowNull: true,
        defaultValue:null,
        type: Sequelize.INTEGER,
        comment: "table=>depending on the create_user_type value =>respected table id",
      },
      updated_by: {
        allowNull: true,
        defaultValue:null,
        type: Sequelize.INTEGER,
        comment: "table=>depending on the update_user_type value =>respected table id",
      },
      deleted_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        name: 'hws_affiliates_deleted_by_fk',
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
    await queryInterface.removeConstraint('hws_affiliates', 'hws_affiliates_org_id_fk');
    await queryInterface.removeConstraint('hws_affiliates', 'hws_affiliates_deleted_by_fk');
    await queryInterface.dropTable('hws_affiliates');
  }
};
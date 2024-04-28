'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_refer_friends', {
      refer_friend_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_refer_friends_org_id_fk',
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
            msg: "Organisation name cannot be empty",
          },
          
        },
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        validate: {
          notEmpty: {
            msg: "Name cannot be empty",
          },
          len: {
            args: [3, 100],
            msg: "Name must be between 3 and 100 characters long",
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
      policy_number: {
        allowNull: false,
        type: Sequelize.STRING,
        validate: {
          notNull: {
            msg: "Please provide a policy number",
          },
          notEmpty: {
            msg: "policy number cannot be empty",
          }
        },
      },
      purchase_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: null,
        validate: {
          notEmpty: {
            msg: "Purchase date cannot be empty",
          }
        },      
      },
      policy_status: {
        allowNull: true,
        type: Sequelize.SMALLINT,
        defaultValue: 0,
      },
      friend_name: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        validate: {
          notEmpty: {
            msg: "Friend name cannot be empty",
          },
          len: {
            args: [3, 100],
            msg: "Friend name must be between 3 and 100 characters long",
          },
        },
      },
      friend_email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide an email",
          },
          notEmpty: {
            msg: "Friend email cannot be empty",
          },
          isEmail: {
            msg: "Please provide a valid email address",
          },
        },
      },
      friend_mobile: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {    
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
      friend_policy_number: {
        allowNull: true,
        type: Sequelize.STRING,
        unique: true     
      },
      friend_purchase_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null,     
      },
      friend_policy_status: {
        allowNull: true,
        type: Sequelize.SMALLINT,
        defaultValue: 0,
      },
      synced_on:{
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null,  
        comment: "when last cron synced",   
      },
      reward: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      days_remaining: {
        allowNull: true,
        type: Sequelize.SMALLINT,
      },
      is_eligible: {
        allowNull: true,
        type: Sequelize.SMALLINT,
        defaultValue: 0,
        comment: "0=>not eligible, 1=>eligible (if any order placed from friend email and not cancel within 60 days)",
      },
      comment: {
        allowNull: true,
        type: Sequelize.STRING(750)  
      },
      redeem_on: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null,     
      },
      active_status: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 1,
        comment: "active=>1, inactive=>0"
      },
      ip_address: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      create_user_type:{
        allowNull: true,
        defaultValue:1,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1,  admin-user=>2, realtor=>3,",
      },
      update_user_type:{
        allowNull: true,
        defaultValue:null,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1, admin-user=>2, realtor=>3,",
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
        name: 'hws_refer_friends_deleted_by_fk',
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
    await queryInterface.removeConstraint('hws_refer_friends', 'hws_refer_friends_org_id_fk');
    await queryInterface.removeConstraint('hws_refer_friends', 'hws_refer_friends_deleted_by_fk');
    await queryInterface.dropTable('hws_refer_friends');
  }
};
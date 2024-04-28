'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_policy_proforma_info', {
      policy_proforma_info_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_policy_proforma_info_org_id_fk',
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
      policy_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_policy_proforma_info_policy_id_fk',
        references: {
          model: 'hws_policies',
          key: 'policy_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>policy_id=>policy_id",
        validate: {
          notNull: {
            msg: "Please select a policy",
          },
          notEmpty: {
            msg: "policy cannot be empty",
          }
        }
      },
      customer_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_policy_proforma_info_customer_id_fk',
        references: {
          model: 'hws_customers',
          key: 'customer_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_customers=>customer_id",
        validate: {
          notNull: {
            msg: "Please select a customer",
          },
          notEmpty: {
            msg: "customer name cannot be empty",
          }
        }
      },
      buyer_first_name: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        validate: {
          notEmpty: {
            msg: "Buyer First name cannot be empty",
          },
          len: {
            args: [3, 150],
            msg: "Buyer First name must be between 3 and 150 characters long",
          },
        },
      },
      buyer_last_name: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        validate: {
          notEmpty: {
            msg: "Buyer Last name cannot be empty",
          },
          len: {
            args: [3, 150],
            msg: "Buyer Last name must be between 3 and 150 characters long",
          },
        },
      },
      buyer_email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: {
          arg: true,
          msg: 'Buyer email must be unique.',
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
      buyer_mobile: {
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
      seller_first_name: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        validate: {
          notEmpty: {
            msg: "Seller First name cannot be empty",
          },
          len: {
            args: [3, 150],
            msg: "Seller First name must be between 3 and 150 characters long",
          },
        },
      },
      seller_last_name: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        validate: {
          notEmpty: {
            msg: "Seller Last name cannot be empty",
          },
          len: {
            args: [3, 150],
            msg: "Seller Last name must be between 3 and 150 characters long",
          },
        },
      },
      seller_email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: {
          arg: true,
          msg: 'Seller email must be unique.',
        },
        validate: {        
          notEmpty: {
            msg: "Email cannot be empty",
          },
          isEmail: {
            msg: "Please provide a valid email address",
          },
        },
      },
      seller_mobile: {
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
      realestate_professional_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_policy_proforma_info_realestate_professional_id_fk',
        references: {
          model: 'hws_realestate_professionals',
          key: 'realestate_professional_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_realestate_professionals=>realestate_professional_id",
        validate: {
          notNull: {
            msg: "Please select a realestate professional",
          },
          notEmpty: {
            msg: "realestate professional name cannot be empty",
          }
        }
      },   
      company_name: {
        type: Sequelize.STRING(150),
        allowNull: true,
        defaultValue: null,
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
      company_contact_person: {
        type: Sequelize.STRING(150),
        allowNull: true,
        defaultValue: null,
        validate: {
          notEmpty: {
            msg: "Company contact person cannot be empty",
          },
          len: {
            args: [3, 150],
            msg: "Company contact person must be between 3 and 150 characters long",
          },
        },
      },
      company_email: {
        type: Sequelize.STRING(75),
        allowNull: true,
        validate: {          
          notEmpty: {
            msg: "Email cannot be empty",
          },
          isEmail: {
            msg: "Please provide a valid email address",
          },
        },
      },
      company_mobile: {
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
      has_company_info: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 1,
        comment: "info available=>1, info unavailable=>0"
      },
      active_status: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 1,
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
    await queryInterface.removeConstraint('hws_policy_proforma_info', 'hws_policy_proforma_info_org_id_fk');
     await queryInterface.removeConstraint('hws_policy_proforma_info', 'hws_policy_proforma_info_policy_id_fk');
    await queryInterface.removeConstraint('hws_policy_proforma_info', 'hws_policy_proforma_info_customer_id_fk');
    await queryInterface.dropTable('hws_policy_proforma_info');
  }
};
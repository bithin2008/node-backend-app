'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_claims', {
      claim_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_claims_org_id_fk',
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
      policy_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_claims_policy_id_fk',
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
        name: 'hws_claims_customer_id_fk',
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
     
      product_id:{
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_claims_product_id_fk',
        references: {
          model: 'hws_products',
          key: 'product_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_products=>product_id",
        validate: {
          notNull: {
            msg: "Please select a product",
          },
          notEmpty: {
            msg: "Product name cannot be empty",
          }
        }
      },
      ticket_no:{
        allowNull: false,
        type: Sequelize.STRING,
        
      },
      ticket_type:{
        allowNull: true,
        defaultValue:1,
        type: Sequelize.SMALLINT,
        comment: "Cliam =>1,",
      },
      claim_ticket_statuses_id:{
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_claims_claim_ticket_statuses_id_fk',
        references: {
          model: 'hws_claim_ticket_statuses',
          key: 'claim_ticket_statuses_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_products=>claim_ticket_statuses_id",
        validate: {
          notNull: {
            msg: "Please select a Claim ticket status",
          },
          notEmpty: {
            msg: "Claim ticket status name cannot be empty",
          }
        }
      },
      product_problem_id:{
        allowNull: true,
        defaultValue:null,
        type: Sequelize.INTEGER,
        name: 'hws_claims_product_problem_id_fk',
        references: {
          model: 'hws_product_problems',
          key: 'product_problem_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_product_problems=>product_problem_id",
        
      },
      other_issue_type:{
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue:null,
        validate: {
          notEmpty: {
            msg: "Other issue type cannot be empty",
          }
        }
      },
      issue_details:{
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please enter issue details",
          },
          notEmpty: {
            msg: "Issue details cannot be empty",
          }
        }
      },
      priority:{
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please enter Priority",
          },
          notEmpty: {
            msg: "Priority cannot be empty",
          }
        }
      },
      product_brand:{
        type: Sequelize.STRING(250),
        allowNull: true,
        defaultValue:null
      },
      product_model:{
        type: Sequelize.STRING(250),
        allowNull: true,
        defaultValue:true
      },
      product_serial_no:{
        type: Sequelize.STRING(250),
        allowNull: true,
        defaultValue:null
        
      },
      product_issue_date:{
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue:null
      },
      unit_age_month:{
        type: Sequelize.STRING(100),
        defaultValue:null,
        allowNull: true,
        validate: {
          notEmpty: {
            msg: "Unit age cannot be empty",
          }
        }
      },
      pcf: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      
      create_user_type:{
        allowNull: true,
        defaultValue:1,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1,  admin-user=>2, realtor=>3,contractor=>4,",
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
        name: 'hws_claims_deleted_by_fk',
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
    await queryInterface.removeConstraint('hws_claims', 'hws_claims_org_id_fk');
    await queryInterface.removeConstraint('hws_claims', 'hws_claims_customer_id_fk');
    await queryInterface.removeConstraint('hws_claims', 'hws_claims_policy_id_fk');
    await queryInterface.removeConstraint('hws_claims', 'hws_claims_product_problem_id_fk');
    await queryInterface.removeConstraint('hws_claims', 'hws_claims_product_id_fk');
    await queryInterface.removeConstraint('hws_claims', 'hws_claims_claim_ticket_statuses_id_fk');
    await queryInterface.removeConstraint('hws_claims', 'hws_claims_deleted_by_fk');
    await queryInterface.dropTable('hws_claims');

  }
};
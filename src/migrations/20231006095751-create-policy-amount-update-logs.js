'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_policy_amount_update_logs', {
      policy_amount_update_log_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_policy_amount_update_logs_org_id_fk',
        
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
      policy_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_policy_amount_update_logs_policy_id_fk',
        references: {
          model: 'hws_policies',
          key: 'policy_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_policies=>policy_id",
        validate: {
          notNull: {
            msg: "Please select a policy",
          },
          notEmpty: {
            msg: "policy name cannot be empty",
          },
        },
      },
      customer_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_policy_amount_update_logs_customer_id_fk',
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
    
     
     
      plan_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_policy_amount_update_logs_plan_id_fk',
        references: {
          model: 'hws_plans',
          key: 'plan_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_plans=>plan_id",
        validate: {
          notNull: {
            msg: "Please select a plan",
          },
          notEmpty: {
            msg: "plan name cannot be empty",
          }
        }
      },
      amount:{
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: null,
        validate: {
          notNull: {
            msg: "Updated Policy Amount is required",
          }, 
          notEmpty: {
            msg: "Updated Policy amount cannot be empty",
          }
        },
      },
      plan_terms_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_policy_amount_update_logs_plan_terms_id_fk',
        references: {
          model: 'hws_plan_terms',
          key: 'plan_terms_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_plan_terms=>plan_terms_id",
        validate: {
          notNull: {
            msg: "Please select a plan term",
          },
          notEmpty: {
            msg: "plan term cannot be empty",
          }
        }
      },
      previous_policy_term_months:{
        allowNull: false,
        type: Sequelize.INTEGER,
        
      },
      previous_plan_id:{
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_policy_amount_update_logs_previous_plan_id_fk',
        references: {
          model: 'hws_plans',
          key: 'plan_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_plans=>plan_id",
        validate: {
          notNull: {
            msg: "Please select a plan plan",
          },
          notEmpty: {
            msg: "Previous plan name cannot be empty",
          }
        }
      },
      policy_term_months: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ip_address: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      policy__amount_update_sale_type: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        comment: "Up Sale=>1, Down Sale=>0",
      },
      active_status: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        defaultValue: 1,
        comment: "active=>1, inactive=>0",
      },
      create_user_type: {
        allowNull: true,
        defaultValue: 1,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1,  admin-user=>2, realtor=>3,",
      },
      update_user_type: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1, admin-user=>2, realtor=>3,",
      },
      created_by: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER,
        comment: "table=>depending on the create_user_type value =>respected table id",
      },
      updated_by: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER,
        comment: "table=>depending on the update_user_type value =>respected table id",
      },
      deleted_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        name: 'hws_policy_amount_update_logs_deleted_by_fk',
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
      },
     
     
    },{
      schema: 'hws_schema'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('hws_policy_amount_update_logs', 'hws_policy_amount_update_logs_org_id_fk');
    await queryInterface.removeConstraint('hws_policy_amount_update_logs', 'hws_policy_amount_update_logs_previous_plan_id_fk');
    await queryInterface.removeConstraint('hws_policy_amount_update_logs', 'hws_policy_amount_update_logs_policy_id_fk');
    await queryInterface.removeConstraint('hws_policy_amount_update_logs', 'hws_policy_amount_update_logs_customer_id_fk');
    await queryInterface.removeConstraint('hws_policy_amount_update_logs', 'hws_policy_amount_update_logs_plan_id_fk');
    await queryInterface.removeConstraint('hws_policy_amount_update_logs', 'hws_policy_amount_update_logs_plan_terms_id_fk');
    await queryInterface.removeConstraint('hws_policy_amount_update_logs', 'hws_policy_amount_update_logs_deleted_by_fk');
    await queryInterface.dropTable('hws_policy_amount_update_logs');
  }
};
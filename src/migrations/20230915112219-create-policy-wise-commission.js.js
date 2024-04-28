'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_policy_wise_commissions', {
      policy_wise_commission_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_policy_wise_commissions_org_id_fk',
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
      org_user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_policy_wise_commissions_org_user_id_fk',
        references: {
          model: 'hws_org_users',
          key: 'org_user_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_org_users=>org_user_id",
        validate: {
          notNull: {
            msg: "User can not be null",
          },
          notEmpty: {
            msg: "User name cannot be empty",
          },

        },
      },
      customer_id: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER,
        name: 'hws_policy_wise_commissions_customer_id_fk',
        references: {
          model: 'hws_customers',
          key: 'customer_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_customers=>customer_id",
        validate: {

          notEmpty: {
            msg: "Customer name cannot be empty",
          },

        },
      },
      policy_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        name: 'hws_policy_wise_commissions_policy_id_fk',
        references: {
          model: 'hws_policies',
          key: 'policy_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_policies=>policy_id",
        validate: {
         
          notEmpty: {
            msg: "Policy name cannot be empty",
          },

        },
      },
      commission_type: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        comment: "Policy=>1, SPIFF=>2, One Day Sale=>3, Full Paid=>4"
      },
      commission_value: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Commission Value cannot be empty",
          }
        }
      },
      notes: {
        type: Sequelize.STRING(250),
        allowNull: true,
        defaultValue: null,
        notNull: {
          msg: "Commission note is required.",
        },
        notEmpty: {
          msg: "Commission note cannot be empty",
        },
      },
      active_status: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        defaultValue: 1,
        comment: "active=>1, inactive=>0",
      },
      created_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        name: 'hws_policy_wise_commissions_created_by_fk',
        references: {
          model: 'hws_org_users',
          key: 'org_user_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_org_users=>org_user_id",
      },
      updated_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        name: 'hws_policy_wise_commissions_updated_by_fk',
        references: {
          model: 'hws_org_users',
          key: 'org_user_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_org_users=>org_user_id",
      },
      deleted_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        name: 'hws_policy_wise_commissions_deleted_by_fk',
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
    await queryInterface.removeConstraint('hws_policy_wise_commissions', 'hws_policy_wise_commissions_created_by_fk');
    await queryInterface.removeConstraint('hws_policy_wise_commissions', 'hws_policy_wise_commissions_updated_by_fk');
    await queryInterface.removeConstraint('hws_policy_wise_commissions', 'hws_policy_wise_commissions_deleted_by_fk');
    await queryInterface.removeConstraint('hws_policy_wise_commissions', 'hws_policy_wise_commissions_org_id_fk');
    await queryInterface.removeConstraint('hws_policy_wise_commissions', 'hws_policy_wise_commissions_customer_id_fk');
    await queryInterface.removeConstraint('hws_policy_wise_commissions', 'hws_policy_wise_commissions_policy_id_fk');
    await queryInterface.dropTable('hws_policy_wise_commissions');
  }
};
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_customer_payment_links', {
      customer_payment_link_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_customer_payment_links_org_id_fk',
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
        name: 'hws_customer_payment_links_policy_id_fk',
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
        name: 'hws_customer_payment_links_customer_id_fk',
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
      payment_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_customer_payment_links_payment_id_fk',
        references: {
          model: 'hws_payments',
          key: 'payment_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_payments=>payment_id",
        validate: {
          notNull: {
            msg: "Please select a payment",
          },
          notEmpty: {
            msg: "payment name cannot be empty",
          }
        }
      },
      payment_link: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      },
      payment_link_status: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 1
      },
      created_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        name: 'hws_customer_payment_links_created_by_fk',
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
        name: 'hws_customer_payment_links_updated_by_fk',
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
        name: 'hws_customer_payment_links_deleted_by_fk',
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
    await queryInterface.removeConstraint('hws_customer_payment_links', 'hws_customer_payment_links_org_id_fk');
    await queryInterface.removeConstraint('hws_customer_payment_links', 'hws_customer_payment_links_customer_id_fk');
    await queryInterface.removeConstraint('hws_customer_payment_links', 'hws_customer_payment_links_policy_id_fk');
    await queryInterface.removeConstraint('hws_customer_payment_links', 'hws_customer_payment_links_payment_id_fk');
    await queryInterface.removeConstraint('hws_customer_payment_links', 'hws_customer_payment_links_payment_id_fk');
    await queryInterface.removeConstraint('hws_customer_payment_links', 'hws_customer_payment_links_deleted_by_fk');
    await queryInterface.removeConstraint('hws_customer_payment_links', 'hws_customer_payment_links_updated_by_fk');
    await queryInterface.removeConstraint('hws_customer_payment_links', 'hws_customer_payment_links_created_by_fk');
    await queryInterface.dropTable('hws_customer_payment_links');
  }
};
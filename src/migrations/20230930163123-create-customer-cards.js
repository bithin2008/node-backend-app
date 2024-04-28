'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_customer_cards', {
      customer_card_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_customer_cards_org_id_fk',
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
      customer_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_customer_cards_customer_id_fk',
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
      authorizeNet_payment_profile_id:{
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER,
        comment:'Authorize.net Paymemnt Profile Id.'
      },
      card_number: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      card_last_4_digit: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      card_type: {
        type: Sequelize.STRING(75),
        allowNull: true,
        defaultValue: null
      },
      card_holder_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please enter a card holder name",
          },
          notEmpty: {
            msg: "card holder name cannot be empty",
          }
        }
      },
      card_expiry_date: {
        type: Sequelize.STRING,
        allowNull: false,
        
      },
     
      card_icon: {
        type: Sequelize.STRING(75),
        allowNull: true,
        defaultValue: null
      },
      primary_card: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "1=>primary, 0=>secondary",
        
      },
      active_status: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 1,
        comment: "active =>1,  inactive=>0",
      },
      ip_address: {
        allowNull: true,
        type: Sequelize.STRING,
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
        name: 'hws_policies_deleted_by_fk',
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
    },{
      schema: 'hws_schema'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('hws_customer_cards', 'hws_customer_cards_org_id_fk');
    await queryInterface.removeConstraint('hws_customer_cards', 'hws_customer_cards_customer_id_fk');
    await queryInterface.removeConstraint('hws_customer_cards', 'hws_customer_cards_deleted_by_fk');
    await queryInterface.dropTable('hws_customer_cards');
  }
};
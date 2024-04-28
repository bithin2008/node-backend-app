'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_customer_reviews', {
      customer_review_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_customer_reviews_org_id_fk',
        
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
        },
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide last name",
          },
          notEmpty: {
            msg: "Last name cannot be empty",
          },
        },
      },
      description: {
        type: Sequelize.STRING(750),
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide description",
          },
          notEmpty: {
            msg: "Description cannot be empty",
          }
        },
      },
      review_date: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide review date",
          },
          notEmpty: {
            msg: "Review date cannot be empty",
          }        
        },
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide rating",
          },
          notEmpty: {
            msg: "Rating cannot be empty",
          }        
        },
      },
      review_source: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        defaultValue: 1,
        comment: "ooogle=>1, others=>0"
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
        name: 'hws_customer_reviews_deleted_by_fk',
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
    await queryInterface.removeConstraint('hws_customer_reviews', 'hws_customer_reviews_org_id_fk');
    await queryInterface.removeConstraint('hws_customer_reviews', 'hws_customer_reviews_deleted_by_fk');
    await queryInterface.dropTable('hws_customer_reviews');
  }
};
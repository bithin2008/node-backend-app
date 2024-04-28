'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_website_pages', {
      page_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: "hws_website_pages_org_id_fk",
        references: {
          model: "hws_organizations",
          key: "org_id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
        comment: "table=>hws_organizations=>org_id",
        validate: {
          notNull: {
            msg: "Please provide a organization id",
          },
          notEmpty: {
            msg: "organization id  cannot be empty",
          },
        },
      },
      page_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {        
          notEmpty: {
            msg: "Page name can not be empty",
          }
        },
      },
      route_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {        
          notEmpty: {
            msg: "Route name can not be empty",
          }
        },
      },
      active_status: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        defaultValue: 1,
        comment: "active=>1, inactive=>0",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue:new Date()
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue:new Date()
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
    await queryInterface.removeConstraint('hws_website_pages', 'hws_website_pages_org_id_fk');
    await queryInterface.dropTable('hws_website_pages');
  }
};
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_page_seo', {
      page_seo_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_page_seo_org_id_fk',
        references: {
          model: 'hws_organizations',
          key: 'org_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
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
      page_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        name: 'hws_page_seo_page_id_fk',
        references: {
          model: 'hws_website_pages',
          key: 'page_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_website_pages=>page_id",
        validate: {
          notNull: {
            msg: "Please provide a page id",
          },
          notEmpty: {
            msg: "page id  cannot be empty",
          },

        },
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        validate: {
          notNull: {
            msg: "Title is required.",
          },
          notEmpty: {
            msg: "Title can not be empty",
          }
        },
      },
      meta_description: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Meta description is required.",
          },
          notEmpty: {
            msg: "Meta description  cannot be empty",
          },

        },
      },
      meta_keywords: {
        defaultValue: null,
        type: Sequelize.STRING(255),
      },
      h1_tag: {
        type: Sequelize.STRING(120),
        allowNull: false,
        validate: {
          notNull: {
            msg: "H1 tag value is required.",
          },
          notEmpty: {
            msg: "H1 tag value  cannot be empty",
          },

        },
      },
      schema_markup: { // Add the new field for schema markup
        type: Sequelize.TEXT, // Use TEXT for larger schema markup content
        allowNull: true,
        defaultValue: null,
        validate: {
          notEmpty: {
            msg: "Schema Markup  cannot be empty",
          },
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
        defaultValue: null,
        type: Sequelize.INTEGER,
      },
      updated_by: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER,
      },
      deleted_by: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER
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
    }, {
      schema: 'hws_schema'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('hws_page_seo', 'hws_page_seo_org_id_fk');
    await queryInterface.removeConstraint('hws_page_seo', 'hws_page_seo_page_id_fk');
    await queryInterface.dropTable('hws_page_seo');
  }
};
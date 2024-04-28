"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "hws_terms_master",
      {
        term_master_id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        org_id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          name: "hws_term_master_org_id_fk",
          references: {
            model: "hws_organizations",
            key: "org_id",
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
          comment: "table=>hws_organizations=>org_id",
          validate: {
            notNull: {
              msg: "Please select an organization",
            },
            notEmpty: {
              msg: "organisation name can't be empty",
            },
          },
        },
        term_name: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            notNull: {
              msg: "Please select a term name",
            },
            notEmpty: {
              msg: "term name can't be empty",
            },
          },
        },
        term_month: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: {
            notNull: {
              msg: "Please select a term month",
            },
            notEmpty: {
              msg: "term month can't be empty",
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
          type: Sequelize.INTEGER,
          name: "hws_term_master_created_by_fk",
          references: {
            model: "hws_org_users",
            key: "org_user_id",
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
          comment: "table=>hws_org_users=>org_user_id",
        },
        updated_by: {
          allowNull: true,
          type: Sequelize.INTEGER,
          name: "hws_term_master_updated_by_fk",
          references: {
            model: "hws_org_users",
            key: "org_user_id",
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
          comment: "table=>hws_org_users=>org_user_id",
        },
        deleted_by: {
          allowNull: true,
          type: Sequelize.INTEGER,
          name: "hws_term_master_deleted_by_fk",
          references: {
            model: "hws_org_users",
            key: "org_user_id",
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
          comment: "table=>hws_org_users=>org_user_id",
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
        },
      },
      {
        schema: "hws_schema",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "hws_terms_master",
      "hws_term_master_org_id_fk"
    );
    await queryInterface.removeConstraint(
      "hws_terms_master",
      "hws_term_master_created_by_fk"
    );
    await queryInterface.removeConstraint(
      "hws_terms_master",
      "hws_term_master_updated_by_fk"
    );
    await queryInterface.removeConstraint(
      "hws_terms_master",
      "hws_term_master_deleted_by_fk"
    );
    await queryInterface.dropTable("hws_terms_master");
  },
};

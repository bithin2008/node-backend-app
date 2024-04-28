"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "hws_renewal_status",
      {
        renewal_status_id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        org_id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          name: "hws_renewal_status_org_id_fk",
          references: {
            model: "hws_organizations",
            key: "org_id",
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
          comment: "table=>hws_organizations=>org_id",
          validate: {
            notNull: {
              msg: "Please select a organization",
            },
            notEmpty: {
              msg: "organisation name can't be empty",
            },
          },
        },
        status_name: {
          allowNull: false,
          type: Sequelize.STRING,
          validate: {
            notNull: {
              msg: "Please select a status name",
            },
            notEmpty: {
              msg: "Status name can't be empty",
            },
          },
        },
        value: {
          allowNull: false,
          type: Sequelize.INTEGER,
          comment: "Renewal Pending=>0, Renewed=>1, Rejected By Customer=>2",
          validate: {
            notNull: {
              msg: "Please select a status value",
            },
            notEmpty: {
              msg: "Status value can't be empty",
            },
          },
        },
        status_color: {
          allowNull: false,
          type: Sequelize.STRING,
          validate: {
            notNull: {
              msg: "Please select a status color",
            },
            notEmpty: {
              msg: "Status color can't be empty",
            },
          },
        },
        active_status: {
          allowNull: false,
          type: Sequelize.SMALLINT,
          allowNull: false,
          defaultValue: 1,
          comment: "active=>1, inactive=>0",
        },
        created_by: {
          allowNull: true,
          type: Sequelize.INTEGER,
          name: "hws_renewal_status_created_by_fk",
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
          name: "hws_renewal_status_updated_by_fk",
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
          name: "hws_renewal_status_deleted_by_fk",
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
      "hws_renewal_status",
      "hws_renewal_status_org_id_fk"
    );
    await queryInterface.removeConstraint(
      "hws_renewal_status",
      "hws_renewal_status_created_by_fk"
    );
    await queryInterface.removeConstraint(
      "hws_renewal_status",
      "hws_renewal_status_updated_by_fk"
    );
    await queryInterface.removeConstraint(
      "hws_renewal_status",
      "hws_renewal_status_deleted_by_fk"
    );
    await queryInterface.dropTable("hws_renewal_status");
  },
};

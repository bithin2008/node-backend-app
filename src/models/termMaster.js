"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class termsMaster extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  termsMaster.init(
    {
      term_master_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      org_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
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
        type: DataTypes.STRING,
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
        type: DataTypes.INTEGER,
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
        type: DataTypes.SMALLINT,
        defaultValue: 1,
        comment: "active=>1, inactive=>0",
      },
      created_by: {
        allowNull: true,
        type: DataTypes.INTEGER,
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
        type: DataTypes.INTEGER,
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
        type: DataTypes.INTEGER,
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
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: "termsMasterModel",
      schema: "hws_schema",
      tableName: "hws_terms_master",
      freezeTableName: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );
  return termsMaster;
};

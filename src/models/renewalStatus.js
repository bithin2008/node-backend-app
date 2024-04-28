"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class renewalStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  renewalStatus.init(
    {
      renewal_status_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      org_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
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
        type: DataTypes.STRING,
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
        type: DataTypes.INTEGER,
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
        type: DataTypes.STRING,
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
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 1,
        comment: "active=>1, inactive=>0",
      },
      created_by: {
        allowNull: true,
        type: DataTypes.INTEGER,
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
        type: DataTypes.INTEGER,
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
        type: DataTypes.INTEGER,
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
      modelName: "renewalStatusModel",
      schema: "hws_schema",
      tableName: `hws_renewal_status`,
      freezeTableName: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );
  return renewalStatus;
};

'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class paymentStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  paymentStatus.init({
    payment_status_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_payment_status_org_id_fk',
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

    status_name: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING,
      validate: {
        notNull: {
          msg: "Please provide a status name",
        },
        notEmpty: {
          msg: "status name cannot be empty",
        },
      },
    },
    
    value: {
      allowNull: false,
      unique: true,
      type: DataTypes.INTEGER,
      validate: {
        notNull: {
          msg: "Please provide a status value",
        },
        notEmpty: {
          msg: "status value cannot be empty",
        },
      },
    },

    status_color: {
      allowNull: true,
      unique: true,
      type: DataTypes.STRING,
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
      defaultValue:null,
      name: 'hws_payment_status_created_by_fk',
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
      type: DataTypes.INTEGER,
      defaultValue:null,
      name: 'hws_payment_status_updated_by_fk',
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
      defaultValue:null,
      type: DataTypes.INTEGER,
      name: 'hws_payment_status_deleted_by_fk',
      references: {
        model: 'hws_org_users',
        key: 'org_user_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_org_users=>org_user_id",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue:new Date()
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue:new Date()
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    }

  }, {
    sequelize,
    modelName: 'paymentStatusModel',
    tableName:`hws_payment_status`,
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return paymentStatus;
};
'use strict';
const {  Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class policyStatusUpdateLogs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  policyStatusUpdateLogs.init({
    policy_satus_update_log_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_policy_status_update_logs_org_id_fk',
      
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
    policy_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_policy_status_update_logs_policy_id_fk',
      references: {
        model: 'hws_policies',
        key: 'policy_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_policies=>policy_id",
      validate: {
        notNull: {
          msg: "Please select a policy",
        },
        notEmpty: {
          msg: "policy name cannot be empty",
        },
      },
    },
    prev_policy_status_id: {
      allowNull: false,
      type: DataTypes.SMALLINT,
      comment: "Cancelled=>0, 30 Days Wait=>2,Expired=>3, Escrow - Pending =>4, Do not Charge =>5, Hold (Failed Payment)=>6, Pending (Link-Payment) => 7",
    },
    prev_policy_status: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    current_policy_status_id: {
      allowNull: false,
      type: DataTypes.SMALLINT,
      comment: "Cancelled=>0, 30 Days Wait=>2,Expired=>3, Escrow - Pending =>4, Do not Charge =>5, Hold (Failed Payment)=>6, Pending (Link-Payment) => 7",
    },
    current_policy_status: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    description:{
      allowNull: true,
      defaultValue:null,
      type: DataTypes.STRING,
    },
    create_user_type: {
      allowNull: true,
      defaultValue: 1,
      type: DataTypes.SMALLINT,
      comment: "self customer =>1,  admin-user=>2, realtor=>3,",
    },
    update_user_type: {
      allowNull: true,
      defaultValue: null,
      type: DataTypes.SMALLINT,
      comment: "self customer =>1, admin-user=>2, realtor=>3,",
    },
    created_by: {
      allowNull: true,
      defaultValue: null,
      type: DataTypes.INTEGER,
      comment: "table=>depending on the create_user_type value =>respected table id",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  }, {
    sequelize,
    modelName: 'policyStatusUpdateLogsModel',
    schema: 'hws_schema',
    tableName: `hws_policy_status_update_logs`,
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return policyStatusUpdateLogs;
};
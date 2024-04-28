'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class contractor_assigned_jobs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      contractor_assigned_jobs.belongsTo(models.claimsModel, { foreignKey: 'claim_id',as: 'claim_details'});
      contractor_assigned_jobs.belongsTo(models.contractorsModel, { foreignKey: 'contractor_id',as: 'contractor_details'});

    }
  }
  contractor_assigned_jobs.init({
    contractors_assigned_job_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_contractor_assigned_jobs_org_id_fk',
      
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
    claim_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_contractor_assigned_jobs_claim_id_fk',
      references: {
        model: 'hws_claims',
        key: 'claim_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_claims=>claim_id",
      validate: {
        notNull: {
          msg: "Please select a Claim",
        },
        notEmpty: {
          msg: "Claim name cannot be empty",
        },
      },
    },
    contractor_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_contractor_assigned_jobs_contractor_id_fk',
      references: {
        model: 'hws_contractors',
        key: 'contractor_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_contractors=>contractor_id",
      validate: {
        notNull: {
          msg: "Please select a contractor",
        },
        notEmpty: {
          msg: "contractor id cannot be empty",
        },        
      },
    },
    job_assigned_date:{
      type: DataTypes.DATE,
      defaultValue:new Date(),
    },
    job_status:{
      allowNull: true,
      defaultValue:1,
      type: DataTypes.SMALLINT,
      comment: "Dispatched =>1, Completed=>2,",
    },
    active_status: {
      allowNull: false,
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1,
      comment: "active=>1, inactive=>0"
    },
    create_user_type:{
      allowNull: true,
      defaultValue:1,
      type: DataTypes.SMALLINT,
      comment: "admin-user =>1",
    },
    update_user_type:{
      allowNull: true,
      defaultValue:null,
      type: DataTypes.SMALLINT,
      comment: "admin-user =>1",
    },
    created_by: {
      allowNull: true,
      defaultValue: null,
      type: DataTypes.INTEGER,
      comment: "table=>depends of create_user_type => respected table id ",
    },
    updated_by: {
      allowNull: true,
      defaultValue: null,
      type: DataTypes.INTEGER,
      comment: "table=>depends of update_user_type =>respected table id  ",
    },
    deleted_by: {
      allowNull: true,
      type: DataTypes.INTEGER,
      name: 'hws_contractor_assigned_jobs_deleted_by_fk',
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
      defaultValue:new Date(),
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue:new Date(),
      allowNull: false
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    }
  }, {
    sequelize,
    schema: 'hws_schema',
    modelName: 'contractorAssignedJobModel',
    tableName:`hws_contractor_assigned_jobs`,
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return contractor_assigned_jobs;
};
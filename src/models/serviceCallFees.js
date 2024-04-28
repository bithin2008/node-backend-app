'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class serviceCallFees extends Model {
   
    static associate(models) {
      // define association here
     /*  propertyTypes.belongsTo(models.organizationsModel, {
        foreignKey: 'org_id',
        onDelete: 'RESTRICT', // Define your onDelete behavior
        onUpdate: 'CASCADE',  // Define your onUpdate behavior
      }); */
      //serviceCallFees.belongsTo(models.planTermsModel , { foreignKey: 'plan_term_month',as: 'plan_term_details',});
      // models.planTermsModel.hasMany(serviceCallFees);
    }
  }

  serviceCallFees.init({
    service_call_fees_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_service_call_fee_org_id_fk',
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
        },

      },
    },
    month: {
      allowNull: false,
      type:DataTypes.INTEGER,
      validate: {        
        notNull: {
          msg: "Please provide month.",
        },
        notEmpty: {
          msg: "month cannot be empty",
        },
      },
    },

    scf_value: {
      allowNull: false,
      type:DataTypes.DOUBLE,
      validate: {        
        notNull: {
          msg: "Please provide scf value.",
        },
        notEmpty: {
          msg: "scf value cannot be empty",
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
      defaultValue: null,
      name: 'hws_service_call_fee_created_by_fk',
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
      defaultValue: null,
      name: 'hws_service_call_fee_updated_by_fk',
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
      type: DataTypes.INTEGER,
      name: 'hws_service_call_fee_deleted_by_fk',
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
      defaultValue: new Date(),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date(),
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    }
  }, {
    sequelize,
    modelName: 'serviceCallFeesModel',
    schema: 'hws_schema',
    tableName: 'hws_service_call_fees',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });
  return serviceCallFees;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class policyWiseCommission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      policyWiseCommission.belongsTo(models.policiesModel, { foreignKey: 'policy_id', as: 'policy_info' });
      policyWiseCommission.belongsTo(models.customersModel, { foreignKey: 'customer_id', as: 'customer_info' });
      policyWiseCommission.belongsTo(models.orgUsersModel, { foreignKey: 'org_user_id', as: 'user_info' });
      policyWiseCommission.belongsTo(models.orgUsersModel, { foreignKey: 'updated_by', as: 'update_info' });
      policyWiseCommission.belongsTo(models.orgUsersModel, { foreignKey: 'created_by', as: 'create_info' });
    }
  }
  policyWiseCommission.init({
    policy_wise_commission_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_policy_wise_commissions_org_id_fk',
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
    org_user_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_policy_wise_commissions_org_user_id_fk',
      references: {
        model: 'hws_org_users',
        key: 'org_user_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_org_users=>org_user_id",
      validate: {
        notNull: {
          msg: "User can not be null",
        },
        notEmpty: {
          msg: "User name cannot be empty",
        },

      },
    },
    customer_id: {
      allowNull: true,
      type: DataTypes.INTEGER,
      defaultValue: null,
      name: 'hws_policy_wise_commissions_customer_id_fk',
      references: {
        model: 'hws_customers',
        key: 'customer_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_customers=>customer_id",
      validate: {
        notEmpty: {
          msg: "Customer name cannot be empty",
        },
      },
    },    
    policy_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue:null,
      name: 'hws_policy_wise_commissions_policy_id_fk',
      references: {
        model: 'hws_policies',
        key: 'policy_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_policies=>policy_id",
      validate: {
       
        notEmpty: {
          msg: "Policy name cannot be empty",
        },

      },
    },
    commission_type: {
      allowNull: false,
      type: DataTypes.SMALLINT,
      comment: "Policy=>1, SPIFF=>2, One Day Sale=>3, Full Paid=>4"
    },
    commission_value: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Commission Value cannot be empty",
        }
      }
    },
    notes: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue:null,
      notNull: {
        msg: "Commission note is required.",
      },
      notEmpty: {
        msg: "Commission note cannot be empty",
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
      name: 'hws_policy_wise_commissions_created_by_fk',
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
      name: 'hws_policy_wise_commissions_updated_by_fk',
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
      name: 'hws_policy_wise_commissions_deleted_by_fk',
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
    }
  }, {
    sequelize,
    modelName: 'policyWiseCommiosionModel',
    schema: 'hws_schema',
    tableName: 'hws_policy_wise_commissions',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return policyWiseCommission;
};
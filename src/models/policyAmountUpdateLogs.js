'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class policyAmountUpdateLogs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  policyAmountUpdateLogs.init({
    policy_amount_update_log_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_policy_amount_update_logs_org_id_fk',
      
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
      name: 'hws_policy_amount_update_logs_policy_id_fk',
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
    customer_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_policy_amount_update_logs_customer_id_fk',
      references: {
        model: 'hws_customers',
        key: 'customer_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_customers=>customer_id",
      validate: {
        notNull: {
          msg: "Please select a customer",
        },
        notEmpty: {
          msg: "customer name cannot be empty",
        }
      }
    },
    plan_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_policy_amount_update_logs_plan_id_fk',
      references: {
        model: 'hws_plans',
        key: 'plan_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_plans=>plan_id",
      validate: {
        notNull: {
          msg: "Please select a plan",
        },
        notEmpty: {
          msg: "plan name cannot be empty",
        }
      }
    },
    amount:{
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: null,
      validate: {
        notNull: {
          msg: "Updated Policy Amount is required",
        }, 
        notEmpty: {
          msg: "Updated Policy amount cannot be empty",
        }
      },
    },
    plan_terms_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_policy_amount_update_logs_plan_terms_id_fk',
      references: {
        model: 'hws_plan_terms',
        key: 'plan_terms_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_plan_terms=>plan_terms_id",
      validate: {
        notNull: {
          msg: "Please select a plan term",
        },
        notEmpty: {
          msg: "plan term cannot be empty",
        }
      }
    },
    previous_policy_term_months:{
      allowNull: false,
      type: DataTypes.INTEGER,
      
    },
    previous_plan_id:{
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_policy_amount_update_logs_previous_plan_id_fk',
      references: {
        model: 'hws_plans',
        key: 'plan_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_plans=>plan_id",
      validate: {
        notNull: {
          msg: "Please select a plan plan",
        },
        notEmpty: {
          msg: "Previous plan name cannot be empty",
        }
      }
    },
    policy_term_months: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: null,
    },
    ip_address: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    policy__amount_update_sale_type: {
      allowNull: false,
      type: DataTypes.SMALLINT,
      comment: "Up Sale=>1, Down Sale=>0",
    },
    active_status: {
      allowNull: false,
      type: DataTypes.SMALLINT,
      defaultValue: 1,
      comment: "active=>1, inactive=>0",
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
    updated_by: {
      allowNull: true,
      defaultValue: null,
      type: DataTypes.INTEGER,
      comment: "table=>depending on the update_user_type value =>respected table id",
    },
    deleted_by: {
      allowNull: true,
      type: DataTypes.INTEGER,
      name: 'hws_policy_amount_update_logs_deleted_by_fk',
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
    },
   
  }, {
    sequelize,
    modelName: 'policyAmountUpdateLogsModel',
    schema: 'hws_schema',
    tableName: `hws_policy_amount_update_logs`,
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return policyAmountUpdateLogs;
};
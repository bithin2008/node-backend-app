'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class commissionMaster extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      commissionMaster.belongsTo(models.orgUsersModel, { foreignKey: 'updated_by', as: 'update_info' });
      commissionMaster.belongsTo(models.orgUsersModel, { foreignKey: 'created_by', as: 'create_info' });
    }
  }
  commissionMaster.init({
    commission_type_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_property_types_org_id_fk',
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
    commission_type: {
      allowNull: false,
      type: DataTypes.SMALLINT,
      comment: "Policy=>1, SPIFF=>2, One Day Sale=>3, Full Paid=>4"
    },
    policy_term: {
      allowNull: true,
      type: DataTypes.STRING,
      defaultValue: null
    },
    total_months: {
      allowNull: true,
      type: DataTypes.INTEGER,
      defaultValue: null
    },
    lower_limit: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: null,
      validate: {
        notEmpty: {
          msg: "Min value cannot be empty",
        }
      }
    },
    upper_limit: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: null,
      validate: {
        notEmpty: {
          msg: "Max value cannot be empty",
        }
      }
    },
    price_percentage: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0,
      comment: "Price=>0,Percentage=>1",
    },
    commission_value: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: null,
      validate: {
        notEmpty: {
          msg: "Commission Value cannot be empty",
        }
      }
    },
    commission_times: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "How many times commission will paid after Full Payment",
    },
    spiff_amount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: null,
      validate: {
        notEmpty: {
          msg: "SPIFF amount cannot be empty",
        }
      }
    },
    one_day_sale_amount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: null,
      validate: {
        notEmpty: {
          msg: "One day sale amount cannot be empty",
        }
      }
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
      name: 'hws_commissions_master_created_by_fk',
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
      name: 'hws_commissions_master_updated_by_fk',
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
      name: 'hws_commissions_master_deleted_by_fk',
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
  modelName: 'commissionsMasterModel',
  schema: 'hws_schema',
  tableName: 'hws_commissions_master',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
});
return commissionMaster;
};
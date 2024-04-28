'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class claim_ticket_statuses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // claim_ticket_statuses.belongsTo(models.claimsModel , { foreignKey: 'claim_ticket_statuses_id',as: 'claim_ticket_status_details',});

    }

  }
  claim_ticket_statuses.init({
    claim_ticket_statuses_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_claim_ticket_statuses_org_id_fk',
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
    ticket_status: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Ticket status can not be null",
        },
        notEmpty: {
          msg: "ticket status cannot be empty",
        }
      }
    },
    status_description: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: null
    }, 
    
    ticket_identifier:{
      allowNull: false,
      type: DataTypes.SMALLINT,
      defaultValue: 1,
      comment: '1=>Ticket Status, 2 =>Progression Status',
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
      comment: "active=>1, inactive=>0"
    },

    created_by: {
      allowNull: true,
      type: DataTypes.INTEGER,
      name: 'hws_claim_ticket_statuses_created_by_fk',
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
      defaultValue:null,
      type: DataTypes.INTEGER,
      name: 'hws_claim_ticket_statuses_updated_by_fk',
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
      name: 'hws_claim_ticket_statuses_deleted_by_fk',
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
    modelName: 'claimTicketStatusesModel',
    schema: 'hws_schema',
    tableName: `hws_claim_ticket_statuses`,
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });

  return claim_ticket_statuses;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class auditTrail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  auditTrail.init({
    audit_trail_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_audit_trail_org_id_fk',
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
    customer_id: {
      allowNull: true,
      defaultValue: null,
      type: DataTypes.INTEGER 
    },
    user_id: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
          len: {
          args: [2, 255],
          msg: "Name must be between 2 and 255 characters long",
        },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    row_id: {
      allowNull: true,
      type: DataTypes.INTEGER
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Description can not be empty",
        }
      },
    },
    section: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Section can not be empty",
        }
      },
    },
    table_name: {
      type: DataTypes.STRING(55),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Table name can not be empty",
        }
      },
    },
    source: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.SMALLINT,
      comment: "0=>website, 1=>admin portal, 2=>customer portal, 3=>realestate pro portal,  3=>technicial portal, 10 =>Cron Process" ,
    },
    ip_address: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    // mac_address: {
    //   allowNull: true,
    //   type: DataTypes.STRING,
    // },
    device_id: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null
    },
    user_agent: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null
    },
    os_platform: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:null
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
      name: 'hws_audit_trail_deleted_by_fk',
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
    modelName: 'auditTrailModel',
    schema: 'hws_schema',
    tableName: 'hws_audit_trail',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });
  return auditTrail;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class zipcodes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  zipcodes.init({
    zip_code_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    zipcode: {
      type: DataTypes.STRING,
      unique: {
        msg: 'Zip Code already exist'
      },
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Zip Code cannot be empty",
        }
      }
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_zipcodes_org_id_fk',
      
      references: {
        model: 'hws_organizations',
        key: 'org_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_organizations=>org_id",
      defaultValue:3,
      validate: {
        notNull: {
          msg: "Please select a organization",
        },
        notEmpty: {
          msg: "Organisation name cannot be empty",
        },

      },
    }, 
    
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "City name cannot be empty",
        }
      }
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "State name cannot be empty",
        }
      }
    },
    statecode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "State Code cannot be empty",
        }
      }
    },
    state_rate: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue:null,
      validate: {
        notEmpty: {
          msg: "State rate cannot be empty",
        }
      }
    },
    county_rate: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue:null,
      validate: {
        notEmpty: {
          msg: "country rate cannot be empty",
        }
      }
    },
    city_rate: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue:null,
      validate: {
        notEmpty: {
          msg: "city rate cannot be empty",
        }
      }
    },
    combined_rate: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue:null,
      validate: {
        notEmpty: {
          msg: "combined rate cannot be empty",
        }
      }
    },
    special_rate: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue:null,
      validate: {
        notEmpty: {
          msg: "special rate cannot be empty",
        }
      }
    },

    is_serviceable: {
      allowNull: false,
      type: DataTypes.SMALLINT,
      defaultValue: 1,
      comment: "active=>1, inactive=>0",
    },
    lat: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Latitude cannot be empty",
        }
      }
    },
    lon: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Longitute cannot be empty",
        }
      }
    },
    active_status: {
      allowNull: false,
      type: DataTypes.SMALLINT,
      defaultValue: 1,
      comment: "active=>1, inactive=>0",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
      allowNull: true,
      defaultValue: null,

    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
      allowNull: true,
      defaultValue: null,

    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    }
  }, {
    sequelize,
    modelName: 'zipcodesModel',
    schema: 'hws_schema',
    tableName: 'hws_zipcodes',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return zipcodes;
};
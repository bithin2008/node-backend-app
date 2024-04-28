'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pageSeo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      pageSeo.belongsTo(models.websitePagesModel, { foreignKey: 'page_id', as: 'page_details' });
    }

  }
  pageSeo.init({
    page_seo_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_page_seo_org_id_fk',
      references: {
        model: 'hws_organizations',
        key: 'org_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_organizations=>org_id",
      validate: {
        notNull: {
          msg: "Please provide a organization id",
        },
        notEmpty: {
          msg: "organization id  cannot be empty",
        },

      },
    },
    page_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      name: 'hws_page_seo_page_id_fk',
      references: {
        model: 'hws_website_pages',
        key: 'page_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_website_pages=>page_id",
      validate: {
        notNull: {
          msg: "Please provide a page id",
        },
        notEmpty: {
          msg: "page id  cannot be empty",
        },

      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {    
        notNull: {
          msg: "Title is required.",
        },    
        notEmpty: {
          msg: "Title can not be empty",
        }
      },
    },
    meta_description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Meta description is required.",
        },
        notEmpty: {
          msg: "Meta description  cannot be empty",
        },

      },
    },
    meta_keywords: {
      defaultValue: null,
      type: DataTypes.STRING(255),
    },
    h1_tag: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: {
        notNull: {
          msg: "H1 tag value is required.",
        },
        notEmpty: {
          msg: "H1 tag value  cannot be empty",
        },

      },
    },
    schema_markup: { // Add the new field for schema markup
      type: DataTypes.TEXT, // Use TEXT for larger schema markup content
      allowNull: true,
      defaultValue:null,
      validate: {
      
        notEmpty: {
          msg: "Schema Markup  cannot be empty",
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
      defaultValue: null,
      type: DataTypes.INTEGER,
    },
    updated_by: {
      allowNull: true,
      defaultValue: null,
      type: DataTypes.INTEGER,
    },
    deleted_by: {
      allowNull: true,
      defaultValue: null,
      type: DataTypes.INTEGER
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
    modelName: 'pageSeoModel',
    schema: 'hws_schema',
    tableName: 'hws_page_seo',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return pageSeo;
};
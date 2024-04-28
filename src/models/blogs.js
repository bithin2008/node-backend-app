'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class blogs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      blogs.belongsTo(models.blogCategoriesModel, { foreignKey: 'blog_category_id', as: 'blog_category' });
      blogs.belongsTo(models.orgUsersModel, { foreignKey: 'updated_by', as: 'update_info' });
      blogs.belongsTo(models.orgUsersModel, { foreignKey: 'created_by', as: 'create_info' });
    }
  }
  blogs.init({
    blog_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    org_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_blogs_org_id_fk',
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
          msg: "Organisation name cannot be empty",
        },

      },
    },
    blog_title: {
      type: DataTypes.STRING(350),
      allowNull: false,
      defaultValue: null,
      validate: {
        notEmpty: {
          msg: "Title cannot be empty",
        },
        len: {
          args: [3, 120],
          msg: "Title must be between 3 and 120 characters long",
        },
      },
    },
    author: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
      validate: {
        notEmpty: {
          msg: "Author cannot be empty",
        },
        len: {
          args: [3, 20],
          msg: "Author must be between 3 and 20 characters long",
        },
      },
    },
    author_image: {
      type: DataTypes.STRING(150),
      allowNull: true,
      defaultValue: null,
    },
    blog_category_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      name: 'hws_blogs_blog_category_id_fk',
      references: {
        model: 'hws_blog_categories',
        key: 'blog_category_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: "table=>hws_blogs=>blog_category_id",
      validate: {
        notNull: {
          msg: "Please select a blog category",
        },
        notEmpty: {
          msg: "blog category cannot be empty",
        },

      },
    },
    slug: {
      type: DataTypes.STRING(350),
      unique: {
        msg: 'This slug is already taken. Please generate a new slug'
      },
      allowNull: false,
      defaultValue: null,
      validate: {
        notNull: {
          msg: "Please provide a slug",
        },
        notEmpty: {
          msg: "slug cannot be empty",
        }
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: null,
    },
    short_description: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: null,
    },
    image: {
      type: DataTypes.STRING(150),
      allowNull: true,
      defaultValue: null,
    },
    alt: {
      type: DataTypes.STRING(150),
      allowNull: true,
      defaultValue: null,
    },
    product_id: {
      allowNull: true,
      type: DataTypes.INTEGER,
      defaultValue: null
    },
    view_count: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0,
    },
    meta_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    meta_keyword: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    meta_description: {
      type: DataTypes.STRING(700),
      allowNull: true,
      defaultValue: null,
    },
    tracking_code: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
    },
    json_ld: {
      type: DataTypes.STRING(700),
      allowNull: true,
      defaultValue: null,
    },
    publish_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    active_status: {
      allowNull: false,
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1,
      comment: "active=>1, inactive=>0"
    },
    created_by: {
      allowNull: true,
      type: DataTypes.INTEGER,
      name: 'hws_blogs_created_by_fk',
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
      name: 'hws_blogs_updated_by_fk',
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
      name: 'hws_blogs_deleted_by_fk',
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
    modelName: 'blogsModel',
    schema: 'hws_schema',
    tableName: 'hws_blogs',
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return blogs;
};
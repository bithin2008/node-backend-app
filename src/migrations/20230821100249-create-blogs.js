'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_blogs', {
      blog_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_blogs_org_id_fk',
        references: {
          model: 'hws_organizations',
          key: 'org_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_blogs=>org_id",
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
        type: Sequelize.STRING(350),
        allowNull: true,
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
        type: Sequelize.STRING(100),
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
        type: Sequelize.STRING(150),
        allowNull: true,
        defaultValue: null,
      },
      blog_category_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
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
        type: Sequelize.STRING(350),
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
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      short_description: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      image: {
        type: Sequelize.STRING(150),
        allowNull: true,
        defaultValue: null,
      },
      alt: {
        type: Sequelize.STRING(150),
        allowNull: true,
        defaultValue: null,
      },
      product_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        defaultValue: null
      },
      view_count: {
        type: Sequelize.BIGINT,
        allowNull: true,
        defaultValue: 0,
      },
      meta_title: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      meta_keyword: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      meta_description: {
        type: Sequelize.STRING(700),
        allowNull: true,
        defaultValue: null,
      },
      tracking_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      json_ld: {
        type: Sequelize.STRING(700),
        allowNull: true,
        defaultValue: null,
      },
      publish_date: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      active_status: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 1,
        comment: "active=>1, inactive=>0"
      },
      created_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
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
        type: Sequelize.INTEGER,
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
        type: Sequelize.INTEGER,
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
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      }
    }, {
      schema: 'hws_schema'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('hws_blogs', 'hws_blogs_org_id_fk');
    await queryInterface.removeConstraint('hws_blogs', 'hws_blogs_created_by_fk');
    await queryInterface.removeConstraint('hws_blogs', 'hws_blogs_updated_by_fk');
    await queryInterface.removeConstraint('hws_blogs', 'hws_blogs_deleted_by_fk');
    await queryInterface.dropTable('hws_blogs');
  }
};
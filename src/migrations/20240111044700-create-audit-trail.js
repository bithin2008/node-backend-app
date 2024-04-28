'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_audit_trail', {
      audit_trail_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
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
        type: Sequelize.INTEGER 
      },
      user_id: {
        type: Sequelize.INTEGER,
        defaultValue: null,
        allowNull: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: true,
        validate: {
            len: {
            args: [2, 255],
            msg: "Name must be between 2 and 255 characters long",
          },
        },
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      row_id: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Description can not be empty",
          }
        },
      },
      section: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Section can not be empty",
          }
        },
      },
      table_name: {
        type: Sequelize.STRING(55),
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
        type: Sequelize.SMALLINT,
        comment: "0=>website, 1=>admin portal, 2=>customer portal, 3=>realestate pro portal,  3=>technicial portal",
      },
      ip_address: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      // mac_address: {
      //   allowNull: true,
      //   type: Sequelize.STRING,
      // },
      device_id: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null
      },
      user_agent: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null
      },
      os_platform: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null
      },
      create_user_type: {
        allowNull: true,
        defaultValue: 1,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1,  admin-user=>2, realtor=>3,",
      },
      update_user_type: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.SMALLINT,
        comment: "self customer =>1, admin-user=>2, realtor=>3,",
      },
      created_by: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER,
        comment: "table=>depending on the create_user_type value =>respected table id",
      },
      updated_by: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER,
        comment: "table=>depending on the update_user_type value =>respected table id",
      },
      deleted_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
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
    await queryInterface.removeConstraint('hws_audit_trail', 'hws_audit_trail_org_id_fk');
    await queryInterface.dropTable('hws_audit_trail');
  }
};
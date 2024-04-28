'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_holding_periods', {
       holding_period_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    org_id: {
      allowNull: false,
      type: Sequelize.INTEGER,
      name: 'hws_holding_period_org_id_fk',
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

    holding_period: {
      allowNull: false,
      type: Sequelize.STRING,
      validate: {
        notNull: {
          msg: "Please provide a holding period name",
        },
        notEmpty: {
          msg: "product holding period cannot be empty",
        },
      },
    },

    active_status: {
      allowNull: false,
      type: Sequelize.SMALLINT,
      defaultValue: 1,
      comment: "active=>1, inactive=>0",
    },
    created_by: {
      allowNull: true,
      type: Sequelize.INTEGER,
      defaultValue:null,
      name: 'hws_holding_period_created_by_fk',
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
      defaultValue:null,
      name: 'hws_holding_period_updated_by_fk',
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
      defaultValue:null,
      type: Sequelize.INTEGER,
      name: 'hws_holding_period_deleted_by_fk',
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
      allowNull: false,
      defaultValue:new Date()
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue:new Date()
    },
    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    }
  },{
    schema: 'hws_schema'
  });
},
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('hws_holding_periods', 'hws_holding_period_org_id_fk');
    await queryInterface.dropTable('hws_holding_period');
  }
};
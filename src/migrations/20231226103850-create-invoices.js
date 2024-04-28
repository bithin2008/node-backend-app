'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_invoices', {
      invoice_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_invoices_org_id_fk',
        
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
      invoice_no:{
        allowNull: false,
        type: Sequelize.STRING,
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
      },
    }, {
      schema: 'hws_schema'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('hws_invoices', 'hws_invoices_org_id_fk');
    await queryInterface.dropTable('hws_invoices');
  }
};
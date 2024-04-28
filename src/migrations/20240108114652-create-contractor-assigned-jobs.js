'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hws_contractor_assigned_jobs', {
      contractors_assigned_job_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_contractor_assigned_jobs_org_id_fk',
        
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
      claim_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_contractor_assigned_jobs_claim_id_fk',
        references: {
          model: 'hws_claims',
          key: 'claim_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_claims=>claim_id",
        validate: {
          notNull: {
            msg: "Please select a Claim",
          },
          notEmpty: {
            msg: "Claim name cannot be empty",
          },
        },
      },
      contractor_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_contractor_assigned_jobs_contractor_id_fk',
        references: {
          model: 'hws_contractors',
          key: 'contractor_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_contractors=>contractor_id",
        validate: {
          notNull: {
            msg: "Please select a contractor",
          },
          notEmpty: {
            msg: "contractor id cannot be empty",
          },        
        },
      },
      job_assigned_date:{
        type: Sequelize.DATE,
        defaultValue:new Date(),
      },
      job_status:{
        allowNull: true,
        defaultValue:1,
        type: Sequelize.SMALLINT,
        comment: "Dispatched =>1, Completed=>2,",
      },
      active_status: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 1,
        comment: "active=>1, inactive=>0"
      },
      create_user_type:{
        allowNull: true,
        defaultValue:1,
        type: Sequelize.SMALLINT,
        comment: "admin-user =>1",
      },
      update_user_type:{
        allowNull: true,
        defaultValue:null,
        type: Sequelize.SMALLINT,
        comment: "admin-user =>1",
      },
      created_by: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER,
        comment: "table=>depends of create_user_type => respected table id ",
      },
      updated_by: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER,
        comment: "table=>depends of update_user_type =>respected table id  ",
      },
      deleted_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        name: 'hws_contractor_assigned_jobs_deleted_by_fk',
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
    // Set the schema explicitly for each operation
    const schema = 'hws_schema';
  
    await queryInterface.removeConstraint({ tableName: 'hws_contractor_assigned_jobs', schema },'hws_contractor_assigned_jobs_org_id_fk');
    await queryInterface.removeConstraint({ tableName: 'hws_contractor_assigned_jobs', schema }, 'hws_contractor_assigned_jobs_claim_id_fk' );
    await queryInterface.removeConstraint({ tableName: 'hws_contractor_assigned_jobs', schema },'hws_contractor_assigned_jobs_deleted_by_fk');
    await queryInterface.removeConstraint({ tableName: 'hws_contractor_assigned_jobs', schema },'hws_contractor_assigned_jobs_contractor_id_fk');
    await queryInterface.dropTable({ tableName: 'hws_contractor_assigned_jobs', schema });
  }
  
};
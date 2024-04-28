'use strict';
const db = require('../models')
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await db.serviceCallFeesModel.bulkCreate(
        [

            {
                
                "org_id": 3,
                "month":1,
                "scf_value":60,
                "active_status":1,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":1,
                "scf_value":75,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":1,
                "scf_value":100,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":1,
                "scf_value":125,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":12,
                "scf_value":60,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":12,
                "scf_value":75,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":12,
                "scf_value":100,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":12,
                "scf_value":125,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":24,
                "scf_value":60,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":24,
                "scf_value":75,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":24,
                "scf_value":100,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":24,
                "scf_value":125,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":36,
                "scf_value":60,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":36,
                "scf_value":75,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":36,
                "scf_value":100,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":36,
                "scf_value":125,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":48,
                "scf_value":60,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":48,
                "scf_value":75,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":48,
                "scf_value":100,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":48,
                "scf_value":125,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":60,
                "scf_value":60,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":60,
                "scf_value":75,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":60,
                "scf_value":100,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":60,
                "scf_value":125,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":24,
                "scf_value":45,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":36,
                "scf_value":45,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "month":60,
                "scf_value":45,
                "active_status":1,"created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            
        ]
    
    )},

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};

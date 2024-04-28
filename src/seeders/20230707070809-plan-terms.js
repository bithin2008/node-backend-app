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
    await db.planTermsModel.bulkCreate(
        [
            {
                
                "org_id": 3,
                "plan_id": 1,
                "plan_term": "Monthly",
                "plan_term_month": 1,
                "max_split_payment": 0,
                "property_type_id": 1,
                "price_below_5000_sqft": 39.99,
                "price_above_5000_sqft": 57.6,
                "bonus_month": 0,
                "created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:07:31.596Z",
                "updated_at": "2023-09-01T09:07:31.596Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "plan_id": 1,
                "plan_term": "Yearly",
                "plan_term_month": 12,
                "max_split_payment": 0,
                "property_type_id": 1,
                "price_below_5000_sqft": 419.99,
                "price_above_5000_sqft": 619.99,
                "bonus_month": 0,
                "created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:08:12.871Z",
                "updated_at": "2023-09-01T09:08:12.871Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "plan_id": 1,
                "plan_term": "Monthly",
                "plan_term_month": 1,
                "max_split_payment": 0,
                "property_type_id": 2,
                "price_below_5000_sqft": 39.99,
                "price_above_5000_sqft": 57.6,
                "bonus_month": 0,
                "created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:08:44.735Z",
                "updated_at": "2023-09-01T09:08:44.735Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "plan_id": 1,
                "plan_term": "Yearly",
                "plan_term_month": 12,
                "max_split_payment": 0,
                "property_type_id": 2,
                "price_below_5000_sqft": 419.99,
                "price_above_5000_sqft": 619.99,
                "bonus_month": 0,
                "created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:09:17.403Z",
                "updated_at": "2023-09-01T09:09:17.403Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "plan_id": 2,
                "plan_term": "Monthly",
                "plan_term_month": 1,
                "max_split_payment": 0,
                "property_type_id": 1,
                "price_below_5000_sqft": 47.99,
                "price_above_5000_sqft": 58.9,
                "bonus_month": 0,
                "created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:09:43.567Z",
                "updated_at": "2023-09-01T09:09:43.567Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "plan_id": 2,
                "plan_term": "Yearly",
                "plan_term_month": 12,
                "max_split_payment": 0,
                "property_type_id": 1,
                "price_below_5000_sqft": 499.99,
                "price_above_5000_sqft": 699.99,
                "bonus_month": 0,
                "created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:10:26.750Z",
                "updated_at": "2023-09-01T09:10:26.750Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "plan_id": 2,
                "plan_term": "Monthly",
                "plan_term_month": 1,
                "max_split_payment": 0,
                "property_type_id": 2,
                "price_below_5000_sqft": 44.99,
                "price_above_5000_sqft": 58.9,
                "bonus_month": 0,
                "created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:10:47.805Z",
                "updated_at": "2023-09-01T09:10:47.805Z",
                "deleted_at": null
            },
            {
                
                "org_id": 3,
                "plan_id": 2,
                "plan_term": "Yearly",
                "plan_term_month": 12,
                "max_split_payment": 0,
                "property_type_id": 2,
                "price_below_5000_sqft": 499.99,
                "price_above_5000_sqft": 699.99,
                "bonus_month": 0,
                "created_by": null,
                "updated_by": null,
                "deleted_by": null,
                "created_at": "2023-09-01T09:11:10.904Z",
                "updated_at": "2023-09-01T09:11:10.904Z",
                "deleted_at": null
            }
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

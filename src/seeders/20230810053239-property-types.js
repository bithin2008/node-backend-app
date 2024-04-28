
'use strict';
const bcrypt = require('bcryptjs')
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
    await db.propertyTypesModel.bulkCreate(
        [
          {
            property_type: 'Single Family',
            price_or_percentage: 0,
            above_5000_sqft: 0,
            property_icon: 'pi pi-home',
            active_status: 1,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null
          },
          {
            property_type: 'Condo',
            price_or_percentage: 0,
            above_5000_sqft: 0,
            property_icon: 'pi pi-home',
            active_status: 1,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null
          },
          {
            property_type: 'Town Home',
            price_or_percentage: 0,
            above_5000_sqft: 0,
            property_icon: 'pi pi-home',
            active_status: 1,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null
          },
          {
            property_type: 'Mobile',
            price_or_percentage: 0,
            above_5000_sqft: 0,
            property_icon: 'pi pi-home',
            active_status: 1,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null
          },
          {
            property_type: 'Two Family',
            price_or_percentage: 0,
            above_5000_sqft: 0,
            property_icon: 'pi pi-home',
            active_status: 1,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null
          },
          {
            property_type: 'Three Family',
            price_or_percentage: 0,
            above_5000_sqft: 0,
            property_icon: 'pi pi-home',
            active_status: 1,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null
          },
          {
            property_type: 'Four Family',
            price_or_percentage: 0,
            above_5000_sqft: 0,
            property_icon: 'pi pi-home',
            active_status: 1,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null
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


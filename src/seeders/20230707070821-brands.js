'use strict';
const db = require('../models')
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await db.productBrandModel.bulkCreate(
      [

        {
          "org_id": 3,
          "brand_name": 'Samsung',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'LG',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Maytag',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Whirlpool',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'GE',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'KitchenAid',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Bosch',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Frigidaire',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Frigidaire',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Miele',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Beko',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Electrolux',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Bissell',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Hoover',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Vacmaster',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Vax',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Swan',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Karcher',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Rug Doctor',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Prominence Home',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Honeywell',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Hunter',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Emerson',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Westinghouse',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Dirt Devil',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'NuTone',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'OVO',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Prolux',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'VacuMaid',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Ultra Clean',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Imperium',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Nadair',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Allegro',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Cafe',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Farberware',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Fisher & Paykel',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Amana',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Liberty Pumps',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'WaterAce',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Zoeller',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Acquaer',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Hallmark',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Wayne',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Superior Pump',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'ECO-FLO',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Burcam',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Sony',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Apple',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Intel',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'IBM',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Panasonic',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Fujitsu',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Toshiba',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Haier',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Igloo',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Kenmore',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Midea',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Danby',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Magic Chef',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Trane',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Carrier',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Goodman',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Rheem',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Ruud',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Bryant',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Heil',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'American Standard',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Daikin',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Lennox',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'York',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Genie',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Skylink',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Chamberlain',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Sommer',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'LiftMaster',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'BeamUP',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'BeamUP',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'BeamUP',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Ismartgate',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'InSinkErator',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },

        {
          "org_id": 3,
          "brand_name": 'MOEN',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Waste King',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Waste Maid',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Honda',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Generac',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Champion',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Briggs & Stratton',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'DuroMax',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Predator',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Wen',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Cummins',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Yeti',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Happybuy',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Bullfrog Spas',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Jacuzzi',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Sundance Spas',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'ThermoSpas',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Hot Spring',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "org_id": 3,
          "brand_name": 'Catalina Spas',
          "active_status": 1,
          "updated_by": null,
          "created_by": 3,
          "deleted_by": null,
          "created_at": "2023-09-01T09:07:31.596Z",
          "updated_at": "2023-09-01T09:07:31.596Z",
          "deleted_at": null
        },
        {
          "active_status": 1,
          "brand_name": "Master Spas",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Marquis Spas",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Cal Spas",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "PDC Spas",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "EcoSmart",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Ready Hot",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Anaheim",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "WestBrass",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Franke,",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Crownful",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Euhomy",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Costway",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "NewAir",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Luma Comfort",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "VEVOR",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Bossin",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "HomeLabs",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Scotsman",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Manitowoc",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "ADT",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Smad",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "DUURA",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "EdgeStar",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Sunpentown",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "SMETA",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Whynter",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Sharp",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "AmazonBasics",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Galanz",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Jenn-Air",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Thermador",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Viking",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Thor Kitchen",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Waterdrop RO",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "APEC Water",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Express Water",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "iSpring",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "AquaTru",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "RKIN",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Home Master",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Brio",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "PureDrop",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "NU Aqua",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Frizzlife",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Little Giant",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "The Basement Watchdog",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Pro-Series",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Hessaire",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Cool-Space",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Phoenix Manufacturing",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Evapolar",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Champion Cooler",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Trash Krusher",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Gladiator",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "JennAir",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Household Essentials",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Avalon",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Vitapur",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Crystal Quest",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Primo",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Giantex",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "A.O. Smith",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Bradford White",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "American Water Heaters",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Navien",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Noritz",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Reliance",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Rinnai",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Stiebel Eltron",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Takagi",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "FutureSoft",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "SoftPro",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Fleck",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Pelican Advantage",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Springwell",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Waterboss",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "DuraWater",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Aquasana",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Filtersmart",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "US Water Systems",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Flotec",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "CountyLine",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Red Lion",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Dayton",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Flint and Walling",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Grundfos",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Goulds",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Franklin",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "A.Y. McDonald",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Berkeley",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Boshart",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Myers",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Sta-Rite",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "NutriChef",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Kalamera",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Wine Enthusiast",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Ivation",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "VinoTemp",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "EuroCave",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Koolatron",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Allavino",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Avanti",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }, {
          "active_status": 1,
          "brand_name": "Koldfront",
          "created_at": "2023-09-01T09:07:31.596Z",
          "created_by": 3,
          "deleted_at": null,
          "deleted_by": null,
          "org_id": 3,
          "updated_at": "2023-09-01T09:07:31.596Z",
          "updated_by": null
        }


      ]

    )
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};

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
    await db.permissionCombinationsModel.bulkCreate(
        [
            {
                "combination": "0,0,0,0"
            },
            {
                "combination": "1,0,0,0"
            },
            {
                "combination": "1,0,0,1"
            },
            {
                "combination": "1,0,1,0"
            },
            {
                "combination": "1,0,1,1"
            },
            {
                "combination": "1,1,0,0"
            },
            {
                "combination": "1,1,0,1"
            },
            {
                "combination": "1,1,1,0"
            },
            {
                "combination": "1,1,1,1"
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

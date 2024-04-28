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
    await db.systemAdministratorsModel.bulkCreate(
      [
      {
        name: 'Arindam Halder',
        email: 'notfound@mailinator.com',
        mobile:"7001166306",
        password: await bcrypt.hash("123456", 10),
        user_agent: 'seeders',
        ip_address:'seeders',
        device_id:"seeders",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at:null
      },
      

    ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};

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
    await db.websitePagesModel.bulkCreate(
        [
            {
                org_id: 3,
                page_name: 'Plans',
                route_name:'plan',
            },
            {
                org_id: 3,
                page_name: 'Our Coverage',
                route_name:'our-coverage',
            },
            {
                org_id: 3,
                page_name: 'Affiliates',
                route_name:'affiliates',
            },
            {
                org_id: 3,
                page_name: 'Contractors',
                route_name:'contractor',
            },
            {
                org_id: 3,
                page_name: 'Real Estate Professionals',
                route_name:'real-estate-professionals',
            },
            {
                org_id: 3,
                page_name: 'About',
                route_name:'about-us',
            },
            {
                org_id: 3,
                page_name: 'Blogs',
                route_name:'blogs',
            },
            {
                org_id: 3,
                page_name: 'Testimonials',
                route_name:'testimonials',
            },
            {
                org_id: 3,
                page_name: 'Careers',
                route_name:'career',
            },
            {
                org_id: 3,
                page_name: 'Contact',
                route_name:'contact-us',
            },
            {
                org_id: 3,
                page_name: 'FAQ',
                route_name:'faq',
            },
            {
                org_id: 3,
                page_name: 'Terms & Conditions',
                route_name:'terms-conditions',
            },
            {
                org_id: 3,
                page_name: 'Privacy Policy',
                route_name:'privacy-policy',
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

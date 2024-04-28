require("dotenv").config();
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index');
const moment = require("moment");
const url = require('url');
const querystring = require('querystring');
const _ = require("lodash");
const { Op } = require("sequelize");
const helper = require('../../../common/helper');
const referFriendsService = require("../../../services/v1/admin/referFriendsService");

/*****************************
 *  GET ALL REFER FRIENDS
 ******************************/
exports.getAllReferfriends = async (req, res, next) => {
    try {
        // Extract the search term from the query parameters
        const searchingValue = req.query.search || '';
        // Construct the search query
        const searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    name: {
                        [Op.like]: `%${searchingValue}%`,
                    },
                },
                {
                    email: {
                        [Op.like]: `%${searchingValue}%`,
                    },
                },
                {
                    friend_name: {
                        [Op.like]: `%${searchingValue}%`,
                    },
                },
                {
                    friend_email: {
                        [Op.like]: `%${searchingValue}%`,
                    },
                },
                // {
                //     alternate_phone: {
                //         [Op.like]: `%${searchingValue}%`,
                //     },
                // },
                // {
                //     zip: {
                //         [Op.like]: `%${searchingValue}%`,
                //     },
                // },
                // {
                //     state: {
                //         [Op.like]: `%${searchingValue}%`,
                //     },
                // },
                // {
                //     city: {
                //         [Op.like]: `%${searchingValue}%`,
                //     },
                // },
                // {
                //     address1: {
                //         [Op.like]: `%${searchingValue}%`,
                //     },
                // }

                // Add more columns here for searching
            ],

        } : {};
        const activeStatus = req.query.active_status ? { active_status: parseInt(req.query.active_status) } : 1;
        const sortField = req.query.sortField || 'created_at'; // Default to 'created_at'
        const sortOrder = req.query.sortOrder || 'ASC'; // Default to ascending order
        const queryOptions = {
            //  attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'updated_at', 'deleted_at', 'user_agent', 'device_id', 'ip_address', 'password'] },
            where: {
                org_id: parseInt(req.tokenData.org_id),
                ...searchQuery,
                ...activeStatus,
            },
            // include: [
            //     {
            //         model: db.productsModel,
            //         as: 'product_details',
            //         attributes: { exclude: ['created_at', 'deleted_at', 'deleted_by'] }
            //     },
            //     {
            //         model: db.claimTicketStatusesModel,
            //         as: 'claim_ticket_status_details',
            //         attributes: ['ticket_status', 'status_description']
            //     },
            //     {
            //         model: db.policiesModel,
            //         as: 'policy_details',
            //         attributes: ['first_name', 'policy_id', 'plan_terms_id', 'last_name', 'email', 'mobile', 'policy_number', 'billing_address1', 'billing_city', 'billing_state', 'billing_zip'],
            //         include: [{
            //             model: db.plansModel,
            //             as: 'plan_details',
            //             attributes: ['plan_name']
            //         },
            //         {
            //             model: db.planTermsModel,
            //             as: 'plan_term_details',
            //             attributes: ['plan_term', 'plan_term_month']
            //         }]

            //     },
            // ],
            order: [
                [sortField, sortOrder],
            ],
            distinct: true,
            // logging: console.log
        };


        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }
        let allRefers = await referFriendsService.getAllReferFriends(queryOptions);
        if (allRefers.rows) {
            allRefers.rows = await Promise.all(allRefers.rows.map(async (element) => {
                // console.log('element',element);
                if (element.create_user_type == 1) {
                    // Handle create_user_type 3 if needed
                    element.create_info = {                       
                        name: element.name
                    }
                }
            //  element.create_info = await helper.getUserInfo(parseInt(element.created_by));
              if(element.updated_by){
                element.update_info = await helper.getUserInfo(parseInt(element.updated_by));
              }
              return element;
            }));
          }
        if (res.pagination) {
            res.pagination.total = allRefers.count
            res.pagination.totalPages = Math.ceil(allRefers.count / queryOptions.limit)
        }
        if (allRefers.count > 0) {
            res.status(200).send({ status: 1, data: allRefers.rows, pagination: res.pagination, message: 'Refers list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allRefers.rows, pagination: res.pagination, message: 'No Refer found' })
        }

    } catch (error) {
        next(error)
    }
}
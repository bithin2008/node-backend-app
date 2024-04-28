require("dotenv").config();
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index')
const moment = require("moment");
const helper = require("../../../common/helper");
const url = require('url');
const querystring = require('querystring');
const { Op } = require("sequelize");
const fs = require('fs');
const websitepagesService = require("../../../services/v1/admin/websitePagesService");

exports.getAllWebsitePages = async (req, res, next) => {
    try {
        let queryOptions = {
            where: {},
            attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
            order: [
                ['page_id', 'ASC']
            ],
        };
       let allPages = await websitepagesService.getAllWebsitePages(req, res, next, queryOptions);
        if (allPages.count > 0) {
            res.status(200).send({ status: 1, data: allPages.rows, message: 'Website Pages found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allPages.rows, message: 'No Website Pages found' })
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}
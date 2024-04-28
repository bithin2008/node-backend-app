require("dotenv").config();
const config = require("../../../config/config");
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index');
const helper = require("../../../common/helper");
const moment = require("moment");
const bcrypt = require('bcryptjs');
const userService = require("../../../services/v1/admin/userService");
const commonService = require("../../../services/v1/common/commonService");
const blogService = require("../../../services/v1/admin/blogService");
const ejs = require('ejs');
const path = require("path");
const url = require('url');
const querystring = require('querystring');
const { Op } = require("sequelize");
const { forEach } = require("lodash");

//const model =db.sequelize.models// Object.keys(db.sequelize.models);
/*****************************
 *  LOCATION BY ZIP
 ******************************/
exports.locationByZip = async (req, res, next) => {
    try {
        if (req.body.zipCodedata) {
            res.status(200).send({ status: 1, data: req.body.zipCodedata, message: 'Zipcode details found successfully' })
        } else {
            res.status(200).send({ status: 0, message: 'Invalid zipcode' })
        }
    } catch (error) {
        next(error);
    }
}

exports.searchZipCode = async (req, res, next) => {
    try {

        let {zipcode} = req.body;
        let zipCodeRes = await commonService.searchZipCode(zipcode);
        if (zipCodeRes) {
            res.status(200).send({ status: 1, data: zipCodeRes, message: 'Zipcode found successfully' })
        } else {
            res.status(200).send({ status: 0, message: 'No zipcode found' })
        }
    } catch (error) {
        next(error);
    }
}


exports.getStates = async (req, res, next) => {
    try {
        const statelist = await db.zipcodesModel.findAll({

            attributes: [[db.sequelize.fn('DISTINCT', db.sequelize.col('state')), 'state'], 'statecode']
        })
        res.status(200).send({ status: 1, data: statelist, message: 'State list found successfully' })

    } catch (error) {
        next(error);
    }
}

exports.isValueUnique = async (req, res, next) => {
    try {
        let hasValue = await commonService.uniqueValueCheck(req.body.model, req.body.field, req.body.value);
        if (hasValue) {
            res.status(200).send({ status: 1, hasRecord: true, field: req.body.field, field_value: req.body.value, message: req.body.field + ' has value' })
        } else {
            res.status(200).send({ status: 1, hasRecord: false, field: req.body.field, message: 'No records found' })
        }
    } catch (error) {
        next(error);
    }
}

exports.checkIsSuperAdmin = async (org_user_id) => {
    try {
      let queryOption = {
        include: [
          {
            model: db.orgUserRolesModel,
            as: 'user_role_details',
            attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
  
          },
        ]
  
      }
      let userRes = await userService.findUserById(org_user_id, queryOption);
      if (!userRes) {
        throw new CustomError (`User Not Found`,400)
      }
      if (userRes.user_role_details.is_super_admin==1) {
        return true
      }else{
        return false
      }
    } catch (error) {
      throw error
    }
  }

/*****************************
 *  GET ALL POSTS
 ******************************/
exports.getAllPosts = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        let search = req.query.search || '';
        const searchQuery = search ? { blog_title: { [Op.iLike]: `%${search}%` } } : {};
        const activeStatus = req.query.active_status ? { active_status: parseInt(req.query.active_status) } : {};
        const sortField = req.query.sortField || 'created_at'; // Default to 'created_at'
        const sortOrder = req.query.sortOrder || 'ASC'; // Default to ascending order
        let queryOptions = {
            attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
            where: {
                publish_date: {
                    [Op.lte]: new Date()
                },
                ...searchQuery,
                ...activeStatus
            },
            order: [
                ['created_at', 'DESC']
            ],

        }
        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }

        allPosts = await blogService.getAllPosts(req, res, next, queryOptions);

        if (res.pagination) {
            res.pagination.total = allPosts.count
            res.pagination.totalPages = Math.ceil(allPosts.count / queryOptions.limit)
        }
        if (allPosts.count > 0) {
            res.status(200).send({ status: 1, data: allPosts.rows, pagination: res.pagination, message: 'Post list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allPosts.rows, pagination: res.pagination, message: 'No Post found' })
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}




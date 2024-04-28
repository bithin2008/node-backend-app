
require("dotenv").config();
const config = require("../../../config/config");
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index');
const moment = require("moment");
const _ = require("lodash");
const { Op } = require("sequelize");
const helper = require('../../../common/helper');
const policyNoteService = require("../../../services/v1/admin/policyNoteService");
const { checkIsSuperAdmin } = require("./commonController");
const policyService = require("../../../services/v1/admin/policyService");


exports.getAllPolicyTasks = async (req, res, next) => {
    try {
        let taskData = {};
        const org_user_id = req.tokenData.org_user_id;
        let isSuperAdmin = await checkIsSuperAdmin(org_user_id)
        const userFilter = isSuperAdmin == false ? {
            [Op.or]: [{
                created_by: org_user_id
            }, {
                assign_to_org_user_id: org_user_id
            }]
        } : { org_id: req.tokenData.org_id }
        const searchingValue = req.query.search || '';

        // Construct the search query
        const searchQuery = searchingValue ? {
            notes: {
                [Op.iLike]: `%${searchingValue}%`,
            }
        } : {};

        const sortField = req.query.sortField || 'created_at'; // Default to 'created_at'
        const sortOrder = req.query.sortOrder || 'ASC'; // Default to ascending order
        let queryOptions = {
            where: {
                ...userFilter,
                ...searchQuery
            },
            include: [
                {
                    model: db.policiesModel,
                    as: 'policy_details'
                },
                {
                    model: db.orgUsersModel,
                    as: 'assignee_user_info'
                },
            ],
            order: [
                [sortField, sortOrder],
            ],
            distinct: true,
        }
        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }
        taskData = await policyNoteService.getAllPolicyNotes(queryOptions);
        if (taskData.rows.length > 0) {
            taskData.rows = await Promise.all(taskData.rows.map(async (element) => {

                if (element.create_user_type == 2) {
                    element.created_user_info = await helper.getUserInfo(parseInt(element.created_by));
                }
                if (element.update_user_type == 2) {
                    element.updated_user_info = await helper.getUserInfo(parseInt(element.updated_by));
                }
                if (element.create_user_type == 1) {
                    element.created_user_info = {
                        customer_id: element.customer_id,
                        first_name: element.first_name,
                        last_name: element.last_name,
                    }
                }
                await policyService.getPolicyObjectFlagsName(element.policy_details);
                return element;
            }));
        }
        if (res.pagination) {
            res.pagination.total = taskData.count
            res.pagination.totalPages = Math.ceil(taskData.count / queryOptions.limit)
        }
        if (taskData.count > 0) {
            res.status(200).send({ status: 1, data: taskData.rows, pagination: res.pagination, message: "Policy Note list found successfully." });
        }
        else {
            res.status(200).send({ status: 1, data: taskData.rows, pagination: res.pagination, message: 'No Policy found' })
        }
    } catch (error) {
        next(error);
    }
}


exports.getPolicyTasksByPolicyId = async (req, res, next) => {
    try {
        let taskData = {};
        const org_user_id = req.tokenData.org_user_id;
        const {policy_id} = req.params;
        if (!policy_id) {
            throw new CustomError('Please provide the policy information to get the policy note data.',400)
        }
        const searchingValue = req.query.search || '';
        let note_type =  req.query.note_type ?{note_type:parseInt(req.query.note_type)}  : {};
        // console.log('req.query.note_type',req.query.note_type);
        // Construct the search query
        const searchQuery = searchingValue ? {
            notes: {
                [Op.iLike]: `%${searchingValue}%`,
            }
        } : {};

        const sortField = req.query.sortField || 'created_at'; // Default to 'created_at'
        const sortOrder = req.query.sortOrder || 'ASC'; // Default to ascending order
        let queryOptions = {
            where: {
                org_id:req.tokenData.org_id,
                policy_id:policy_id,
                ...note_type,
                ...searchQuery
            },
            include: [
                {
                    model: db.policiesModel,
                    as: 'policy_details'
                },
                {
                    model: db.orgUsersModel,
                    as: 'assignee_user_info'
                },
            ],
            order: [
                [sortField, sortOrder],
            ],
            distinct: true,
        }
        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }
        taskData = await policyNoteService.getAllPolicyNotes(queryOptions);
        if (taskData.rows.length > 0) {
            taskData.rows = await Promise.all(taskData.rows.map(async (element) => {

                if (element.create_user_type == 2) {
                    element.created_user_info = await helper.getUserInfo(parseInt(element.created_by));
                }
                if (element.update_user_type == 2) {
                    element.updated_user_info = await helper.getUserInfo(parseInt(element.updated_by));
                }
                if (element.create_user_type == 1) {
                    element.created_user_info = {
                        customer_id: element.customer_id,
                        first_name: element.first_name,
                        last_name: element.last_name,
                    }
                }
                return element;
            }));
        }
        if (res.pagination) {
            res.pagination.total = taskData.count
            res.pagination.totalPages = Math.ceil(taskData.count / queryOptions.limit)
        }
        if (taskData.count > 0) {
            res.status(200).send({ status: 1, data: taskData.rows, pagination: res.pagination, message: "Policy Note list found successfully." });
        }
        else {
            res.status(200).send({ status: 1, data: taskData.rows, pagination: res.pagination, message: 'No Policy found' })
        }
    } catch (error) {
        next(error);
    }
}
require("dotenv").config();
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index')
const helper = require("../../../common/helper");
const os = require('os');
const { Op } = require("sequelize");
const auditTrailService = require("../../../services/v1/admin/auditTrailService");
const mailService = require("../../../services/v1/admin/mailService");

/*****************************
 *  GET ALL CUSTOMR AUDIT
 ******************************/
exports.getCustomerAudit = async (req, res, next) => {
    try {
        const customerId = req.params.customer_id
        const sortField = req.query.sortField || 'created_at'; // Default to 'created_at'
        const sortOrder = req.query.sortOrder || 'ASC'; // Default to ascending order      
        const queryOptions = {
            attributes: { exclude: ['deleted_by', 'deleted_at', 'user_agent', 'device_id', 'ip_address',] },
            where: {     
                org_id:req.tokenData.org_id,
                customer_id:customerId
            },
            order: [
                [sortField, sortOrder],
            ],
            distinct: true,
            // logging: console.log,
        };
        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }
        let allAuditTrail = await auditTrailService.getAllAudit(req, res, next, queryOptions);
     
        if (res.pagination) {
            res.pagination.total = allAuditTrail.count
            res.pagination.totalPages = Math.ceil(allAuditTrail.count / queryOptions.limit)
        }
        if (allAuditTrail.rows) {
            allAuditTrail.rows = await Promise.all(allAuditTrail.rows.map(async (element) => {
                if (element.create_user_type == 2) {
                    element.created_user_info = await helper.getUserInfo(parseInt(element.created_by));
                }
                if (element.update_user_type == 2) {
                    element.updated_user_info = await helper.getUserInfo(parseInt(element.updated_by));
                }
                if (element.create_user_type == 1) {
                    // Handle create_user_type 3 if needed
                    element.created_user_info = {
                        customer_id: element.customer_id,
                        first_name: element.first_name,
                        last_name: element.last_name,
                    }
                }


                return element;
            }));
        }
        if (allAuditTrail.count > 0) {
            res.status(200).send({ status: 1, data: allAuditTrail.rows, pagination: res.pagination, message: 'Customer audit trail found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allAuditTrail.rows, pagination: res.pagination, message: 'No customer audit trail found' })
        }
    } catch (error) {
        next(error)
    }
}
const CustomError = require("../../../utils/customErrorHandler");
const moment = require('moment')
const db = require("../../../models");
const commissionService = require("../../../services/v1/admin/commissionService");
const policyWiseCommissionService = require("../../../services/v1/admin/policyWiseCommissionService");
const paymentService = require("../../../services/v1/admin/paymentService");
const userService = require("../../../services/v1/admin/userService");
const policyService = require("../../../services/v1/admin/policyService");
const url = require('url');
const querystring = require('querystring');
const helper = require("../../../common/helper");
const { Op } = require('sequelize');

/*****************************
 *  CREATE COMMISSIOMN TYPE
 ******************************/

exports.createcommissionType = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const data = {
            org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
            commission_type: req.body.commissionType ? parseInt(req.body.commissionType) : null,
            policy_term: req.body.policyTerm ? req.body.policyTerm : null,
            total_months: req.body.totalMonths ? parseInt(req.body.totalMonths) : null,
            lower_limit: req.body.lowerLimit ? parseFloat(req.body.lowerLimit) : 0,
            upper_limit: req.body.upperLimit ? parseFloat(req.body.upperLimit) : 0,
            price_percentage: req.body.pricePercentage == 0 ? 0 : 1,
            commission_value: req.body.commissionValue ? parseFloat(req.body.commissionValue) : null,
            commission_times: req.body.commissionTimes ? parseInt(req.body.commissionTimes) : 0,
            spiff_amount: req.body.spiffAmount ? parseFloat(req.body.spiffAmount) : 0,
            one_day_sale_amount: req.body.oneDaySaleAmount ? parseFloat(req.body.oneDaySaleAmount) : 0,
            active_status: parseInt(req.body.activeStatus),
            created_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
            updated_by: null,
            deleted_by: null
        };
        const createdCommissionType = await commissionService.createCommissionType(data, transaction);
        if (createdCommissionType) {
            transaction.commit();
            res.status(200).send({
                status: 1,
                message: "Commission type created Successfully.",
            });
        } else {
            res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
        }
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}

/*****************************
 *  UPDATE COMMISSIOMN TYPE
 ******************************/
exports.updatecommissionType = async (req, res, next) => {
    try {
        const { commission_type_id } = req.params;
        const owner_id = req.tokenData.org_user_id
        const commissionTypeExists = await commissionService.findCommissionTypeById(parseInt(commission_type_id));
        if (commissionTypeExists) {
            let commissionTypeDetail = {
                org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
                commission_type: req.body.commissionType ? parseInt(req.body.commissionType) : null,
                policy_term: req.body.policyTerm ? req.body.policyTerm : null,
                total_months: req.body.totalMonths ? parseInt(req.body.totalMonths) : null,
                lower_limit: req.body.lowerLimit ? parseFloat(req.body.lowerLimit) : 0,
                upper_limit: req.body.upperLimit ? parseFloat(req.body.upperLimit) : 0,
                price_percentage: req.body.pricePercentage == 0 ? 0 : 1,
                commission_value: req.body.commissionValue ? parseFloat(req.body.commissionValue) : null,
                commission_times: req.body.commissionTimes ? parseInt(req.body.commissionTimes) : 0,
                spiff_amount: req.body.spiffAmount ? parseFloat(req.body.spiffAmount) : 0,
                one_day_sale_amount: req.body.oneDaySaleAmount ? parseFloat(req.body.oneDaySaleAmount) : 0,
                active_status: parseInt(req.body.activeStatus),
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
                deleted_by: null
            }
            const transaction = await db.sequelize.transaction(async (t) => {
                await db.commissionsMasterModel.update(
                    { updated_by: owner_id },
                    { where: { commission_type_id: commission_type_id }, transaction: t })
                await db.commissionsMasterModel.update(commissionTypeDetail, { where: { commission_type_id: commission_type_id }, transaction: t })
                res.status(200).send({ status: 1, message: 'Commission type has been successfully updated.' })
            });
        } else {
            res.status(200).send({ status: 0, message: "Commission type not found" });
        }
    } catch (error) {
        next(error);
    }
}

/*****************************
 *  GET ALL COMMISSIOMN TYPES
 ******************************/
exports.getAllcommissionTypes = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQp = querystring.parse(parsedUrl.query);
        let searchingValue = req.query.search || '';
        let sortField = req.query.sortField || 'created_by';
        let sortOrder = req.query.sortOrder || 'DESC';
        let searchQuery = searchingValue ? {
            [Op.or]: [

                {

                }

            ]
        } : {};
        let order = [[sortField, sortOrder]];

        let active_status = parsedQp.activeStatus ? parseInt(parsedQp.activeStatus) : '';
        let queryOptions = {
            where: { org_id: req.tokenData.org_id },
            attributes: { exclude: ['deleted_by', 'deleted_at'] },
            include: [
                {
                    model: db.orgUsersModel,
                    as: 'update_info',
                    attributes: ['first_name', 'last_name'],
                    required: false
                },
                {
                    model: db.orgUsersModel,
                    as: 'create_info',
                    attributes: ['first_name', 'last_name'],
                    required: false
                },
            ],
            order: order,
        };

        if (active_status) {
            queryOptions.where[Op.and] = [
                { active_status: parseInt(active_status) }
            ];
        }


        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }



        allcommissionTypes = await commissionService.getAllcommissionTypes(queryOptions);

        if (res.pagination) {
            res.pagination.total = allcommissionTypes.count;
            res.pagination.totalPages = Math.ceil(allcommissionTypes.count / queryOptions.limit)
        }
        if (allcommissionTypes.rows.length > 0) {
            res.status(200).send({ status: 1, data: allcommissionTypes.rows, pagination: res.pagination, message: 'Commission list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allcommissionTypes.rows, pagination: res.pagination, message: 'No Payment found' })
        }
    } catch (error) {
        next(error)
    }
}


/*****************************
 *  DELETE COMMISSIOMN TYPE
 ******************************/

exports.deletecommissionType = async (req, res, next) => {
    try {
        const { commission_type_id } = req.params;
        const ownerId = req.tokenData.org_user_id
        const commissionTypeExists = await commissionService.findCommissionTypeById(parseInt(commission_type_id));
        if (!commissionTypeExists) {
            res.status(200).send({ status: 0, message: "Commission type not found" });
        } else {
            const deletePlan = await commissionService.deleteCommissionType(commissionTypeExists, ownerId);
            if (deletePlan) {
                res.status(200).send({ status: 1, message: 'Commission type deleted sucessfully.' });
            } else {
                res.status(200).send({ status: 0, message: 'Unable to delete Commission type.' });
            }
        }
    } catch (error) {
        next(error);
    }
}


/*****************************
 *  TOGGLE COMMISSIOMN TYPE STATUS
 ******************************/

exports.togglecommissionTypeStatus = async (req, res, next) => {
    try {
        const { commission_type_id } = req.params;
        const owner_id = req.tokenData.org_user_id
        const commissionTypeExists = await commissionService.findCommissionTypeById(parseInt(commission_type_id));
        if (commissionTypeExists) {
            let manageCommissionsDetail = {
                active_status: parseInt(req.body.activeStatus),
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
            }
            const transaction = await db.sequelize.transaction(async (t) => {
                await db.commissionsMasterModel.update(
                    { updated_by: owner_id },
                    { where: { commission_type_id: commission_type_id }, transaction: t })

                await db.commissionsMasterModel.update(manageCommissionsDetail, { where: { commission_type_id: commission_type_id }, transaction: t })
                res.status(200).send({ status: 1, message: `Commission type successfully ${req.body.activeStatus ? 'enabled' : 'disabled'}.` })

            });
        } else {
            res.status(200).send({ status: 0, message: "Sub Module not found" });
        }
    } catch (error) {
        next(error);
    }
}

exports.togglePolicyWisecommissionStatus = async (req, res, next) => {
    try {
        const { policy_wise_commission_id } = req.params;
        const owner_id = req.tokenData.org_user_id
        const commissionTypeExists = await commissionService.findPolicyWiseCommissionId(parseInt(policy_wise_commission_id));
        if (commissionTypeExists) {
            let manageCommissionsDetail = {
                active_status: parseInt(req.body.activeStatus),
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
            }
            const transaction = await db.sequelize.transaction(async (t) => {
                // await db.policyWiseCommiosionModel.update(
                //     { updated_by: owner_id },
                //     { where: { policy_wise_commission_id: policy_wise_commission_id }, transaction: t })

                await db.policyWiseCommiosionModel.update(manageCommissionsDetail, { where: { policy_wise_commission_id: policy_wise_commission_id }, transaction: t })
                res.status(200).send({ status: 1, message: `Commission type successfully ${req.body.activeStatus ? 'enabled' : 'disabled'}.` })

            });
        } else {
            res.status(200).send({ status: 0, message: "Sub Module not found" });
        }
    } catch (error) {
        next(error);
    }
}


/*****************************
 *  UPDATE COMMISSION VALUE
 ******************************/

exports.updateCommissionValue = async (req, res, next) => {
    try {
        const { policy_wise_commission_id } = req.params;
        const owner_id = req.tokenData.org_user_id
        const commissionExists = await commissionService.findPolicyWiseCommissionById(parseInt(policy_wise_commission_id));
        if (commissionExists) {
            let manageSalesCommission = {
                commission_value: req.body.commissionValue ? req.body.commissionValue : null,
                notes: req.body.commissionNotes ? req.body.commissionNotes : null,
                active_status: parseInt(req.body.activeStatus),
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
            }
            const transaction = await db.sequelize.transaction(async (t) => {
                await db.policyWiseCommiosionModel.update(
                    { updated_by: owner_id },
                    { where: { policy_wise_commission_id: policy_wise_commission_id }, transaction: t })

                await db.policyWiseCommiosionModel.update(manageSalesCommission, { where: { policy_wise_commission_id: policy_wise_commission_id }, transaction: t })
                res.status(200).send({ status: 1, message: `Commission updated successfully.` })

            });
        } else {
            res.status(200).send({ status: 0, message: "Sub Module not found" });
        }
    } catch (error) {
        next(error);
    }
}



/*****************************
 * GET RELAVENT COMMISSIONS
 ******************************/
exports.getRelaventCommission = async (req, res, next) => {
    try {
        let queryOptions = {
            where: {
                commission_type: 1,
                active_status: 1,
                total_months: req.body.policy_term_months,
                // [Op.or]: [
                //     db.Sequelize.literal(`lower_limit >= ${req.body.subtotal_amount}`),
                //     db.Sequelize.literal(`upper_limit <= ${req.body.subtotal_amount}`),
                // ],
                [Op.and]: [
                    { lower_limit: { [Op.lte]: req.body.subtotal_amount } }, // Lower limit should be less than or equal to subtotal_amount
                    { upper_limit: { [Op.gte]: req.body.subtotal_amount } } // Upper limit should be greater than or equal to subtotal_amount
                ],
            },
            // logging: console.log, // Enable logging for this specific query

            // (  subtotal*commission_value)/100
        }

        comissionResponse = await db.commissionsMasterModel.findOne(queryOptions);
        comissionResponse = comissionResponse ? helper.getJsonParseData(comissionResponse) : comissionResponse
        // console.log('comissionResponse',comissionResponse);
        res.status(200).send({ status: comissionResponse ? 1 : 0, data: comissionResponse, message: comissionResponse ? 'Relavent Commission found successfully' : 'No Relavent Commission found.' })
    } catch (error) {
        next(error)
    }
}



/*****************************
 *  GET ALL COMMISSIOMN TYPES
 ******************************/
/* exports.getAllSalesCommission = async (req, res, next) => {
    try {
        let roleBasedCondition = helper.generateRoleBasedCondition(req.tokenData)
        let { org_user_id } = req.body;
        const whereClauseUserBasis = org_user_id ? { org_user_id: org_user_id } : {};

        delete roleBasedCondition.create_user_type
        let parsedUrl = url.parse(req.url);
        let parsedQp = querystring.parse(parsedUrl.query);
        let searchingValue = req.query.search || '';
        let sortField = req.query.sortField || 'created_by';
        let sortOrder = req.query.sortOrder || 'DESC';

        let associationSearch = {
            [Op.and]: [], // Initialize an array for AND conditions
        };
        if (parsedQp.first_name) {
            const nameGroup = {
                [Op.or]: [
                    {
                        '$policy_info.first_name$': {
                            [Op.iLike]: `%${parsedQp.first_name}%`,
                        },
                    },
                    {
                        '$policy_info.last_name$': {
                            [Op.iLike]: `%${parsedQp.first_name}%`,
                        },
                    },
                ],
            };
            associationSearch[Op.and].push(nameGroup);
        } else if (parsedQp.email) {
            associationSearch[Op.and].push({
                '$policy_info.email$': {
                    [Op.iLike]: `%${parsedQp.email}%`,
                },
            });

        } else if (parsedQp.policy_number) {
            associationSearch[Op.and].push({
                '$policy_info.policy_number$': {
                    [Op.iLike]: `%${parsedQp.policy_number}%`,
                },
            });
        }

        const searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    '$policy_info.policy_number$': {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    // Search in the associated model columns
                    '$policy_info.first_name$': {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                }, {
                    // Search in the associated model columns
                    '$policy_info.last_name$': {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    // Search in the associated model columns
                    '$policy_info.policy_number$': {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    '$policy_info.email$': {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                db.Sequelize.literal(`CAST("commission_value" AS TEXT) ILIKE '%${searchingValue}%'`),
                db.Sequelize.literal(`CAST("policy_info"."net_amount" AS TEXT) ILIKE '%${searchingValue}%'`),
                // Add more columns here for searching
            ],

        } : {};
        let order = [];

        if (sortField === 'customer_info.first_name') {
            order.push([{ model: db.customersModel, as: 'customer_info' }, 'first_name', sortOrder]);
        } else if (sortField === 'create_info.first_name') {
            order.push([{ model: db.orgUsersModel, as: 'create_info' }, 'first_name', sortOrder]);
        } else if (sortField === 'policy_info.policy_term_month') {
            order.push([{ model: db.policiesModel, as: 'policy_info' }, 'policy_term_month', sortOrder]);
        } else if (sortField === 'policy_info.policy_number') {
            order.push([{ model: db.policiesModel, as: 'policy_info' }, 'policy_number', sortOrder]);
        } else if (sortField === 'policy_info.net_amount') {
            order.push([{ model: db.policiesModel, as: 'policy_info' }, 'net_amount', sortOrder]);
        } else if (sortField === 'policy_info.pcf') {
            order.push([{ model: db.policiesModel, as: 'policy_info' }, 'pcf', sortOrder]);
        } else if (sortField === 'policy_info.order_date') {
            order.push([{ model: db.policiesModel, as: 'policy_info' }, 'order_date', sortOrder]);
        } else if (sortField === 'policy_info.first_name') {
            order.push([{ model: db.policiesModel, as: 'policy_info' }, 'first_name', sortOrder]);
        } else {
            order.push([sortField, sortOrder]);
        }


        let active_status = parsedQp.activeStatus ? parseInt(parsedQp.activeStatus) : '';
        let queryOptions = {
            where: {
               ...whereClauseUserBasis,
                ...associationSearch,
                ...searchQuery,
                
            },
            attributes: { exclude: ['deleted_by', 'deleted_at'] },
            include: [
                {
                    model: db.policiesModel,
                    as: 'policy_info',
                    attributes: ['policy_number', 'first_name', 'last_name', 'policy_term_month', 'net_amount', 'pcf', 'order_date', 'policy_status', 'created_by'],
                    include: [
                        {
                            model: db.paymentsModel,
                            as: 'payment_details',
                            attributes: ['payment_type', 'payment_status'],
                            // required: false,
                            // where: {
                            //     [Op.or]: [
                            //         {
                            //             payment_status: 1
                            //         }
                            //     ]
                            // }
                        },
                    ],

                },
                // {
                //     model: db.orgUsersModel,
                //     as: 'update_info',
                //     attributes: ['first_name', 'last_name'],
                //     required: false
                // },
                // {
                //     model: db.orgUsersModel,
                //     as: 'create_info',
                //     attributes: ['first_name', 'last_name'],
                //     required: false
                // },
            ],
            order: order,
            logging: console.log
        };

        if (active_status) {
            queryOptions.where[Op.and] = [
                { active_status: parseInt(active_status) }
            ];
        }
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }
        getAllSalesCommissions = await commissionService.getAllPolicyWiseSalesCommissions(queryOptions);

        const result = await db.policyWiseCommiosionModel.sum('commission_value', {
            where: {...whereClauseUserBasis, active_status:1}
        });
        if (res.pagination) {
            res.pagination.total = getAllSalesCommissions.count;
            res.pagination.totalPages = Math.ceil(getAllSalesCommissions.count / queryOptions.limit)
        }
        if (getAllSalesCommissions.rows.length > 0) {
            await Promise.all(getAllSalesCommissions.rows.map(async (element) => {
                if (element.policy_info && element.policy_info.payment_details && element.policy_info.payment_details.length > 0) {
                    element.policy_info.payment_details[0].payment_type_name = paymentService.getPaymentTypeFlagName(element.policy_info.payment_details[0]?.payment_type)
                    element.policy_info.payment_details[0].payment_status_name = paymentService.getPaymentStatusFlagName(element.policy_info.payment_details[0]?.payment_status)
                }
            }))
            res.status(200).send({ status: 1, data: getAllSalesCommissions.rows, total: result ? result : 0, pagination: res.pagination, message: 'Sales commission list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: getAllSalesCommissions.rows, total: result ? result : 0, pagination: res.pagination, message: 'No Sales Commission found' })
        }
    } catch (error) {
        next(error)
    }
} */

exports.getAllSalesCommission = async (req, res, next) => {
    try {
        let roleBasedCondition = helper.generateRoleBasedCondition(req.tokenData)
        let { org_user_id } = req.body;
        const whereClauseUserBasis = org_user_id ? `"policyWiseCommiosionModel"."org_user_id" = ${org_user_id}` : '';
        const whereClauseOrgBasis = `"policyWiseCommiosionModel"."org_id" = ${req.tokenData.org_id}`;

        delete roleBasedCondition.create_user_type;
        let parsedUrl = url.parse(req.url);
        let parsedQp = querystring.parse(parsedUrl.query);
        let searchingValue = req.query.search || '';
        let sortField = req.query.sortField || 'created_by';
        let sortOrder = req.query.sortOrder || 'DESC';

        const searchQuery = searchingValue ? `
        
            (
                "policy_info"."policy_number" ILIKE '%${searchingValue}%'
                OR "policy_info"."first_name" ILIKE '%${searchingValue}%'
                OR "policy_info"."last_name" ILIKE '%${searchingValue}%'
                OR "policy_info"."policy_number" ILIKE '%${searchingValue}%'
                OR "policy_info"."email" ILIKE '%${searchingValue}%'
                OR CAST("policyWiseCommiosionModel"."commission_value" AS TEXT) ILIKE '%${searchingValue}%'
                OR CAST("policy_info"."net_amount" AS TEXT) ILIKE '%${searchingValue}%'
            )
    ` : '';
        let whereClause = '';
        if (whereClauseUserBasis || searchQuery || whereClauseOrgBasis) {
            whereClause = 'WHERE ';
            if (whereClauseUserBasis) {
                whereClause += whereClauseUserBasis;
                if (searchQuery) {
                    whereClause += ' AND ';
                }
            }
            if (searchQuery) {
                whereClause += searchQuery;
            }
        }

        const rawQuery = `
        SELECT  
            "custom".*,
            "policy_info->payment_details"."payment_id" AS "policy_info.payment_details.payment_id",
            "policy_info->payment_details"."payment_type" AS "policy_info.payment_details.payment_type",
            "policy_info->payment_details"."payment_status" AS "policy_info.payment_details.payment_status",
            "policy_info->payment_details"."amount" AS "policy_info.payment_details.amount"
        FROM
            (SELECT 
                "policyWiseCommiosionModel"."policy_wise_commission_id",
                "policyWiseCommiosionModel"."org_id",
                "policyWiseCommiosionModel"."org_user_id",
                "policyWiseCommiosionModel"."customer_id",
                "policyWiseCommiosionModel"."policy_id",
                "policyWiseCommiosionModel"."commission_type",
                "policyWiseCommiosionModel"."commission_value",
                "policyWiseCommiosionModel"."notes",
                "policyWiseCommiosionModel"."active_status",
                "policyWiseCommiosionModel"."created_by",
                "policyWiseCommiosionModel"."updated_by",
                "policyWiseCommiosionModel"."created_at",
                "policyWiseCommiosionModel"."updated_at",
                "policy_info"."policy_id" AS "policy_info.policy_id",
                "policy_info"."policy_number" AS "policy_info.policy_number",
                "policy_info"."first_name" AS "policy_info.first_name",
                "policy_info"."last_name" AS "policy_info.last_name",
                "policy_info"."policy_term_month" AS "policy_info.policy_term_month",
                "policy_info"."net_amount" AS "policy_info.net_amount",
                "policy_info"."pcf" AS "policy_info.pcf",
                "policy_info"."order_date" AS "policy_info.order_date",
                "policy_info"."policy_status" AS "policy_info.policy_status",
                "policy_info"."created_by" AS "policy_info.created_by"
            FROM 
                "hws_schema"."hws_policy_wise_commissions" AS "policyWiseCommiosionModel"
            LEFT OUTER JOIN 
                "hws_schema"."hws_policies" AS "policy_info" 
                ON "policyWiseCommiosionModel"."policy_id" = "policy_info"."policy_id"
                AND ("policy_info"."deleted_at" IS NULL)
                ${whereClause}
            ) 
        AS "custom"
        LEFT JOIN 
        (SELECT hws_schema.hws_payments.* FROM hws_schema.hws_payments 
            inner join (SELECT min(payment_id) as payment_id FROM hws_schema.hws_payments where payment_status =1 group by policy_id) temp_p
                on hws_schema.hws_payments.payment_id = temp_p.payment_id) AS "policy_info->payment_details" 
            ON "custom"."policy_id" = "policy_info->payment_details"."policy_id"
        WHERE 
            ("policy_info->payment_details"."deleted_at" IS NULL
            AND ("policy_info->payment_details"."payment_status" = 1 or "custom"."commission_type" = 2 ))
            ORDER BY 
            "${sortField}" ${sortOrder}
            `;

        // Execute the raw query
        const resultRawQuery = await db.sequelize.query(rawQuery, {
            replacements: {},
            type: db.sequelize.QueryTypes.SELECT,

        });

        let jsonData = []
        // console.log('resultRawQuery.length', resultRawQuery);
        if (resultRawQuery && resultRawQuery.length > 0) {
            jsonData = await Promise.all(resultRawQuery.map(async (row) => {
                const rowData = {
                    policy_wise_commission_id: row.policy_wise_commission_id,
                    org_id: row.org_id,
                    org_user_id: row.org_user_id,
                    customer_id: row.customer_id,
                    policy_id: row.policy_id,
                    commission_type: row.commission_type,
                    commission_value: row.commission_value,
                    notes: row.notes,
                    active_status: row.active_status,
                    created_by: row.created_by,
                    updated_by: row.updated_by,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                    policy_info: row['policy_info.policy_id'] ? {
                        policy_id: row['policy_info.policy_id'],
                        policy_number: row['policy_info.policy_number'],
                        first_name: row['policy_info.first_name'],
                        last_name: row['policy_info.last_name'],
                        policy_term_month: row['policy_info.policy_term_month'],
                        net_amount: row['policy_info.net_amount'],
                        pcf: row['policy_info.pcf'],
                        order_date: row['policy_info.order_date'],
                        policy_status: row['policy_info.policy_status'],
                        created_by: row['policy_info.created_by'],
                        payment_details: {
                            payment_id: row['policy_info.payment_details.payment_id'],
                            payment_type: row['policy_info.payment_details.payment_type'],
                            amount: row['policy_info.payment_details.amount'],
                            payment_status: row['policy_info.payment_details.payment_status'],
                            payment_status_name: paymentService.getPaymentStatusFlagName(row['policy_info.payment_details.payment_status']),
                            payment_type_name: paymentService.getPaymentTypeFlagName(row['policy_info.payment_details.payment_type'])
                        }
                    } : null
                };
            
                // Add additional properties if created_by exists
                if (row.created_by) {
                    rowData.create_info = await helper.getUserInfo(parseInt(row.created_by));
                 
                }
            
                // Check if updated_by exists, then fetch update_info
                if (row.updated_by) {
                    rowData.update_info = await helper.getUserInfo(parseInt(row.updated_by));
                }


                return rowData;
            }));
            
        }
        // console.log(jsonData);

        let totalCommision = 0;

        if (jsonData.length > 0) {
            // Iterate through the commissions array
            jsonData.forEach(commission => {
                // Check if active_status is equal to 1s
                if (commission.active_status == 1) {
                    // Add commission_value to the sum
                    totalCommision += commission.commission_value;
                }
                if (commission.created_by) {

                }
            });
            res.status(200).send({ status: 1, data: jsonData, total_commission: totalCommision ? totalCommision : 0, message: 'Sales commission list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: jsonData, total_commission: totalCommision ? totalCommision : 0, message: 'No Sales Commission found' })
        }
    } catch (error) {
        next(error)
    }
}



/*****************************
 *  GET ALL COMMISSIOMN TYPES
 ******************************/
exports.processDailySPIFFCommissions = async () => {
    const transaction = await db.sequelize.transaction();
    try {
        let todayStart = moment().startOf('day'); // Get the start of today

        let queryOptions = {
            where: {
                active_status: 1,
                org_id: helper.default_org_id,
                [Op.or]: [
                    { spiff_commision_gen_at: { [Op.lt]: todayStart } }, // Less than the start of yesterday
                    { spiff_commision_gen_at: { [Op.eq]: null } } // Equals null
                ]
                // user_role_id: helper.userRole.sales_representative
            },
            attributes: ['org_user_id'],
        };
        let salesmanList = await userService.getAllUsers(queryOptions);
        salesmanList = salesmanList.rows;
        console.log('salesmanList', salesmanList);
        //  console.log('salesmanList',salesmanList);
        if (salesmanList.length) {
            let salesMansIds = salesmanList.map(e => e.org_user_id)
            //console.log('salesMansIds', salesMansIds);
            let paymentsRes = await paymentService.getAllPayments({
                attributes: [
                    'created_by',
                    [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total_amount']
                ],
                where: {
                    org_id: helper.default_org_id,
                    create_user_type: 2,
                    payment_status: 1,
                    payment_successfull_date: moment().subtract(1, 'days').format('YYYY-MM-DD'),
                    created_by: salesMansIds
                },
                group: ['created_by']
            });
            paymentsRes = paymentsRes.rows
            // console.log('paymentsRes', paymentsRes);
            if (paymentsRes.length > 0) {
                for (let i = 0; i < paymentsRes.length; i++) {
                    const element = paymentsRes[i];
                    let getSPIFFCommissions = await commissionService.getAllcommissionTypes({
                        where: {
                            commission_type: 2, // SPIFF commission type
                            active_status: 1, //active=>1,
                            spiff_amount: {
                                [Op.lte]: element.total_amount, // Amount should be less than or equal to element.total_amount
                            }
                        },
                        limit: 1, // Limit the result to 1 record
                        order: [
                            ['spiff_amount', 'DESC'], // Order the results by spiff_amount in descending order
                        ],
                    });
                    if (getSPIFFCommissions.rows.length > 0) {
                        let calculatedCommision = getSPIFFCommissions.rows[0]
                        // console.log('calculatedCommision', calculatedCommision);
                        let policyWiseCommissionData = {
                            policy_id: null,
                            org_id: helper.default_org_id,
                            org_user_id: element.created_by,
                            policy_no: null,
                            customer_id: null,
                            commission_value: calculatedCommision.commission_value,
                            commission_type: 2,
                            created_by: null,
                        }
                        const createdPolicyWiseCommission = await policyWiseCommissionService.createpolicyWiseCommission(policyWiseCommissionData, transaction);
                        console.log(element.created_by, { self_activation_at: moment() });
                        const updateOrgUse = await userService.updateUser(element.created_by, { spiff_commision_gen_at: new Date() }, transaction);
                        //console.log('updateOrgUse',updateOrgUse);
                    }
                }
                await transaction.commit();
                console.log('Spiff Commission Cron Commited Successfully');
            } else {
                await transaction.rollback();
            }
        } else {
            await transaction.rollback();
        }
    } catch (error) {
        console.error('Error occurred:', error);
        await transaction.rollback();
    }
}
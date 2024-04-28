require("dotenv").config();
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index')
const moment = require("moment");
const helper = require("../../../common/helper");
const url = require('url');
const querystring = require('querystring');
const { Op } = require("sequelize");
const whitelistIPService = require("../../../services/v1/admin/whitelistIPService");


/*****************************
 *  CREATE WHITELIST IP
 ******************************/
exports.createWhitelistIP = async (req, res, next) => {
    try {
        const transaction = await db.sequelize.transaction();
        const data = {
            org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
            ip_address: req.body.ipAddress ? req.body.ipAddress : null,
            active_status: parseInt(req.body.activeStatus),
            created_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
            updated_by: null,
            deleted_by: null
        };

        const createdWhitelistIP = await whitelistIPService.createWhitelistIP(data, transaction);
        if (createdWhitelistIP) {
            transaction.commit();
            res.status(200).send({
                status: 1,
                message: "Whitelist IP added Successfully.",
            });
        } else {
            res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
        }
    } catch (error) {
        next(error);
    }
}


/*****************************
 *  GET ALL WHITELIST IPS
 ******************************/
exports.getAllWhitelistIPs = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        const sortField = req.query.sortField || 'created_by'; // Default to 'org_user_id'
        const sortOrder = req.query.sortOrder || 'DESC';
        let activeStatus = parsedQs.active_status ? parsedQs.active_status : '';
        const searchingValue = req.query.search || '';

        const searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    ip_address: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                }
            ]
        } : {};
        let queryOptions = {
            where: { ...searchQuery, },
            attributes: { exclude: ['deleted_by', 'deleted_at',] },
            include: [
                {
                    model: db.orgUsersModel,
                    as: 'user_info',
                    attributes: ['first_name', 'last_name'],
                    required: false
                },
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
            order: [
                [sortField, sortOrder]
            ],
            distinct: true,
        };

        if (activeStatus !== '') {
            queryOptions.where[Op.or] = [
                { active_status: activeStatus }
            ];
        }
        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }

        getAllWhitelistIPs = await whitelistIPService.getAllWhitelistIPs(req, res, next, queryOptions);
        if (res.pagination) {
            res.pagination.total = getAllWhitelistIPs.count
            res.pagination.totalPages = Math.ceil(getAllWhitelistIPs.count / queryOptions.limit)
        }

        if (getAllWhitelistIPs.count > 0) {
            res.status(200).send({ status: 1, data: getAllWhitelistIPs.rows, pagination: res.pagination, message: 'Whitelist IP found successfully' })
        } else {
            res.status(200).send({ status: 1, data: getAllWhitelistIPs.rows,  pagination: res.pagination, message: 'No Whitelist IP found' })
        }
    } catch (error) {

        next(error)
    }
}

/*****************************
 *  UPDATE PLAN
 ******************************/
exports.updateIPAddress = async (req, res, next) => {
    try {
        const { whitelist_ip_id } = req.params;
        const owner_id = req.tokenData.org_user_id
        const ipaddressExists = await whitelistIPService.findIPAddressById(parseInt(whitelist_ip_id));
        if (ipaddressExists) {
            let ipaddress_detail = {
                org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
                ip_address: req.body.ipAddress ? req.body.ipAddress : null,
                active_status: parseInt(req.body.activeStatus),
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
                deleted_by: null
            }
            const transaction = await db.sequelize.transaction(async (t) => {
                await db.whitelistIPsModel.update(
                    { updated_by: owner_id },
                    { where: { whitelist_ip_id: whitelist_ip_id }, transaction: t })
                await db.whitelistIPsModel.update(ipaddress_detail, { where: { whitelist_ip_id: whitelist_ip_id }, transaction: t })
                res.status(200).send({ status: 1, message: 'Whitelist IP successfully  updated.' })
            });
        } else {
            res.status(200).send({ status: 0, message: "Whitelist IP not found" });
        }
    } catch (error) {
        next(error);
    }
}

/*****************************
 *  DELETE WHITELIST IPS
 ******************************/
exports.deleteIPAddress = async (req, res, next) => {
    try {
        const { whitelist_ip_id } = req.params;
        const ownerId = req.tokenData.org_user_id
        const ipAddress = await whitelistIPService.findIPAddressById(parseInt(whitelist_ip_id));
        if (!ipAddress) {
            res.status(200).send({ status: 0, message: "IP address not found" });
        } else {
            const deleteIPAddress = await whitelistIPService.deleteIPAddress(ipAddress, ownerId);
            if (deleteIPAddress) {
                res.status(200).send({ status: 1, message: 'IP address deleted sucessfully.' });
            } else {
                res.status(200).send({ status: 0, message: 'Unable to delete IP address.' });
            }
        }
    } catch (error) {
        next(error);
    }
    
}



/*****************************
 *  TOGGLE WHITELIST IPS STATUS
 ******************************/
exports.toggleIPAddressStatus = async (req, res, next) => {
    try {
        const { whitelist_ip_id } = req.params;
        const owner_id = req.tokenData.org_user_id;
        const ipaddressExists = await whitelistIPService.findIPAddressById(parseInt(whitelist_ip_id));
        if (ipaddressExists) {
            let ipaddress_detail = {
                active_status: parseInt(req.body.activeStatus),
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
            }
            const transaction = await db.sequelize.transaction(async (t) => {
                await db.whitelistIPsModel.update(
                    { updated_by: owner_id },
                    { where: { whitelist_ip_id: whitelist_ip_id }, transaction: t })

                await db.whitelistIPsModel.update(ipaddress_detail, { where: { whitelist_ip_id: whitelist_ip_id }, transaction: t })
                res.status(200).send({ status: 1, message: `Whitelist IP successfully ${req.body.activeStatus ? 'enabled' : 'disabled'}.` })

            });


        } else {
            res.status(200).send({ status: 0, message: "Whitelist IP not found" });
        }
    } catch (error) {
        next(error);
    }
}
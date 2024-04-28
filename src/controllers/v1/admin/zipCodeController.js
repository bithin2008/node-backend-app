require("dotenv").config();
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index')
const moment = require("moment");
const helper = require("../../../common/helper");
const url = require('url');
const querystring = require('querystring');
const { Op } = require("sequelize");
const zipCodeService = require("../../../services/v1/admin/zipCodeService");

/*****************************
 *  GET ALL ZIP CODE
 ******************************/
exports.getAllZipCode = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        const sortField = req.query.sortField || 'zip_code_id'; // Default to 'zip_code_id'
        const sortOrder = req.query.sortOrder || 'DESC';
        let activeStatus = parsedQs.active_status ? parsedQs.active_status : '';
        const searchingValue = req.query.search || '';
        let searchTimestamp = helper.searchTimeStamp(searchingValue) ? helper.searchTimeStamp(searchingValue) : {}

        const searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    zipcode: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    city: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    state: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
            ],
        } : {};
        let queryOptions = {
            where: { ...searchQuery, },
            attributes: { exclude: ['deleted_by', 'deleted_at',] },
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

        allZipCodes = await zipCodeService.getAllZipCode(req, res, next, queryOptions);
        if (res.pagination) {
            res.pagination.total = allZipCodes.count
            res.pagination.totalPages = Math.ceil(allZipCodes.count / queryOptions.limit)
        }
        if (allZipCodes.count > 0) {
            res.status(200).send({ status: 1, data: allZipCodes.rows, pagination: res.pagination, message: 'Zip code list found successfully' })
        } else {
            res.status(200).send({ status: 0, data: allZipCodes.rows, pagination: res.pagination, message: 'No zip code found' })
        }

    } catch (error) {

        next(error)
    }
}


/*****************************
 *  CREATE NEW ZIP CODE
 ******************************/
exports.createNewZipCode = async (req, res, next) => {
    try {
        const transaction = await db.sequelize.transaction();
        const data = {
            org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
            zipcode: req.body.zipCode ? req.body.zipCode : null,
            city: req.body.city ? req.body.city : null,
            state: req.body.state ? req.body.state : null,
            statecode: req.body.stateCode ? req.body.stateCode : null,
            staterate: req.body.stateRate ? req.body.stateRate : null,
            active_status: parseInt(req.body.activeStatus),
            is_serviceable: parseInt(req.body.isServiceable),
            lat:req.body.lat ? req.body.lat : null,
            lon:req.body.long ? req.body.long : null
        };

        const createZipCode = await zipCodeService.createZipCode(data, transaction);
        if (createZipCode) {
            transaction.commit();
            res.status(200).send({
                status: 1,
                message: "Zip Code added Successfully.",
            });
        } else {
            res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
        }
    } catch (error) {
        next(error);
    }
}



/*****************************
 *  UPDATE ZIP CODE
 ******************************/
exports.updateZipCode = async (req, res, next) => {
    try {
        const { zip_code_id } = req.params;
        const owner_id = req.tokenData.org_user_id
        const zipCodeExists = await zipCodeService.findZipCodeById(parseInt(zip_code_id));
        if (zipCodeExists) {
            let ipaddress_detail = {
                zipcode: req.body.zipCode ? req.body.zipCode : null,
                city: req.body.city ? req.body.city : null,
                state: req.body.state ? req.body.state : null,
                statecode: req.body.stateCode ? req.body.stateCode : null,
                staterate: req.body.stateRate ? req.body.stateRate : null,
                active_status: parseInt(req.body.activeStatus),
                is_serviceable: parseInt(req.body.isServiceable),
                lat:req.body.lat ? req.body.lat : null,
                lon:req.body.long ? req.body.long : null
            }
            const transaction = await db.sequelize.transaction(async (t) => {
                await db.zipcodesModel.update(
                    { updated_by: owner_id },
                    { where: { zip_code_id: zip_code_id }, transaction: t })
                await db.zipcodesModel.update(ipaddress_detail, { where: { zip_code_id: zip_code_id }, transaction: t })
                res.status(200).send({ status: 1, message: 'Zip Code successfully  updated.' })
            });
        } else {
            res.status(200).send({ status: 0, message: "Zip Code not found" });
        }
    } catch (error) {
        next(error);
    }
}


/*****************************
 *  TOGGLE ZIP CODE STATUS
 ******************************/
exports.toggleZipCodeStatus = async (req, res, next) => {
    try {
        const { zip_code_id } = req.params;
        const owner_id = req.tokenData.org_user_id;
        const zipCodeExists = await zipCodeService.findZipCodeById(parseInt(zip_code_id));
        if (zipCodeExists) {
            let zipcode_detail = {
                active_status: parseInt(req.body.activeStatus),
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
            }
            const transaction = await db.sequelize.transaction(async (t) => {
                await db.zipcodesModel.update(
                    { updated_by: owner_id },
                    { where: { zip_code_id: zip_code_id }, transaction: t })

                await db.zipcodesModel.update(zipcode_detail, { where: { zip_code_id: zip_code_id }, transaction: t })
                res.status(200).send({ status: 1, message: `Zip Code successfully ${req.body.activeStatus ? 'enabled' : 'disabled'}.` })

            });


        } else {
            res.status(200).send({ status: 0, message: "Zip Code IP not found" });
        }
    } catch (error) {
        next(error);
    }
}
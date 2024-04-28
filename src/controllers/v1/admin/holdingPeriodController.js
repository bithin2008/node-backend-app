require("dotenv").config();
const db = require('../../../models/index')
const url = require('url');
const querystring = require('querystring');
const { Op } = require("sequelize");
const holdingPeriodService = require("../../../services/v1/admin/holdingPeriodService");
const CustomError = require("../../../utils/customErrorHandler");

exports.createAndUpdate = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        let {holding_period,updateId}=req.body;
        if (!holding_period) {
            throw new CustomError('Something went wrong.',400)
        }
        if (updateId) {
            const data = {   
                holding_period: holding_period
            };
            const updatedData = await holdingPeriodService.updateHoldingPeriod(data,updateId, transaction);
            if (updatedData) { 
                res.status(200).send({ status: 1, data: updatedData, message: "Updated Successfully." });  
                transaction.commit();
            }else{
                res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
            }
        }else{
            const data = {
                org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
                holding_period: holding_period,
                created_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
                updated_by: null,
                deleted_by: null
            };
            const createdData = await holdingPeriodService.createHoldingPeriod(data, transaction);
            if (createdData) { 
                res.status(200).send({ status: 1, data: createdData, message: "Created Successfully." });  
                transaction.commit();
            }else{
                res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
            }
        }
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}

exports.updateHoldingPeriodStatus = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        let { updateId, active_status } = req.body;
        if (!updateId) {
            throw new CustomError('Something went wrong.', 400)
        }
        if (updateId) {
            const data = {
                active_status: active_status
            }
            const updatedData = await holdingPeriodService.updateHoldingPeriod(data,updateId, transaction);
            if (updatedData) {
                res.status(200).send({ status: 1, data: updatedData, message: "Updated Successfully." });
                transaction.commit();
            } else {
                res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
            }
        }
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}


exports.getHoldingPeriods = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        const sortField = req.query.sortField || 'holding_period'; // Default to 'holding_period'
        const sortOrder = req.query.sortOrder || 'ASC';
        let activeStatus = parsedQs.active_status ? parsedQs.active_status : '';
         
        const searchingValue = req.query.search || '';
        const searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    holding_period: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                    
                },
            ],
        } : {};

        let queryOptions = {
            where: { ...searchQuery,org_id:req.tokenData.org_id },
            attributes: { exclude: ['deleted_by', 'deleted_at'] },
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
    
       const result = await holdingPeriodService.getHoldingPeriods(queryOptions)
       
        if (res.pagination) {
            res.pagination.total = result.count
            res.pagination.totalPages = Math.ceil(result.count / queryOptions.limit)
        }
        if (result.count > 0) {
            res.status(200).send({ status: 1, data: result.rows, pagination: res.pagination, message: 'Holding periods found successfully' })
        } else {
            res.status(200).send({ status: 1, data: result.rows, pagination: res.pagination, message: 'No Holding periods found' })
        }

    } catch (error) {
        next(error)
    }
}

exports.deleteHoldingPeriod = async (req, res, next) => {
    try {
        const { holding_period_id } = req.params;
        const ownerId = req.tokenData.org_user_id
        const poldingPeriod = await holdingPeriodService.findHoldingPeriodById(parseInt(holding_period_id));
        if (!poldingPeriod) {
            res.status(200).send({ status: 0, message: "Holding period is not found" });
        } else {
            const deleteHoldingPeriod = await holdingPeriodService.deleteProductBrand(holding_period_id, ownerId);
            if (deleteHoldingPeriod) {
                res.status(200).send({ status: 1, message: 'Deleted sucessfully.' });
            } else {
                res.status(200).send({ status: 0, message: 'Unable to delete.' });
            }
        }
    } catch (error) {
        next(error);
    }
    
}




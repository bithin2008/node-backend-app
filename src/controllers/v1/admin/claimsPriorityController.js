require("dotenv").config();
const db = require('../../../models/index')
const url = require('url');
const querystring = require('querystring');
const { Op } = require("sequelize");
const claimsPriorityService = require("../../../services/v1/admin/claimsPriorityService");
const CustomError = require("../../../utils/customErrorHandler");




exports.createAndUpdateClaimsPriority = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        let {priority_name,priority_details,updateId}=req.body;
        if (!priority_details && !priority_name) {
            throw new CustomError('Something went wrong.',400)
        }
        if (updateId) {
            const data = {   
                priority_name: priority_name.trim(),
                priority_details: priority_details.trim(),
            };
            const updatePriority = await claimsPriorityService.updateClaimsPriority(data,updateId, transaction);
            if (updatePriority) { 
                res.status(200).send({ status: 1, data: updatePriority, message: "Priority Updated Successfully." });  
                transaction.commit();
            }else{
                res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
            }
        }else{
            const data = {
                org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
                priority_name: priority_name.trim(),
                priority_details: priority_details.trim(),
                created_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
                updated_by: null,
                deleted_by: null
            };
            const createdPriority = await claimsPriorityService.createClaimsPriority(data, transaction);
            if (createdPriority) { 
                res.status(200).send({ status: 1, data: createdPriority, message: "Priority Created Successfully." });  
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

exports.updateClaimsPriorityStatus = async (req, res, next) => {
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
            const updatePriority = await claimsPriorityService.updateClaimsPriority(data, updateId, transaction);
            if (updatePriority) {
                res.status(200).send({ status: 1, data: updatePriority, message: "Priority Updated Successfully." });
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

exports.getClaimsPriority = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        const sortField = req.query.sortField || 'claim_priority_id'; // Default to 'claim_priority_id'
        const sortOrder = req.query.sortOrder || 'ASC';
        let activeStatus = parsedQs.active_status ? parsedQs.active_status : '';
         
        const searchingValue = req.query.search || '';
        const searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    priority_name: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                    
                },
                {
                    priority_details: {
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
    
       const result = await claimsPriorityService.getClaimsPriority(queryOptions)
        if (res.pagination) {
            res.pagination.total = result.count
            res.pagination.totalPages = Math.ceil(result.count / queryOptions.limit)
        }
        if (result.count > 0) {
            res.status(200).send({ status: 1, data: result.rows, pagination: res.pagination, message: 'Claims priority successfully' })
        } else {
            res.status(200).send({ status: 1, data: result.rows, pagination: res.pagination, message: 'No Claims priority found' })
        }

    } catch (error) {
        next(error)
    }
}

exports.deleteClaimsPriority = async (req, res, next) => {
    try {
        const { claim_priority_id } = req.params;
        const ownerId = req.tokenData.org_user_id
        const productBrand = await claimsPriorityService.findById(parseInt(claim_priority_id));
        if (!productBrand) {
            res.status(200).send({ status: 0, message: "Priority not found" });
        } else {
            const deleteBrand = await claimsPriorityService.deleteClaimsPriority(claim_priority_id, ownerId);
            if (deleteBrand) {
                res.status(200).send({ status: 1, message: 'Deleted sucessfully.' });
            } else {
                res.status(200).send({ status: 0, message: 'Unable to delete.' });
            }
        }
    } catch (error) {
        next(error);
    }
    
}




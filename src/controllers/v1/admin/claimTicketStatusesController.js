require("dotenv").config();
const db = require('../../../models/index')
const url = require('url');
const querystring = require('querystring');
const { Op } = require("sequelize");
const claimTicketStatusesService = require("../../../services/v1/admin/claimTicketStatusesService");
const CustomError = require("../../../utils/customErrorHandler");




exports.saveTicketStatus = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        let {ticket_status,status_color,status_description,updateId}=req.body;
        if (!ticket_status) {
            throw new CustomError('Something went wrong.',400)
        }
        if (updateId) {
            const data = {   
                ticket_status: ticket_status,
                status_description:status_description,
                status_color:status_color,
            };
            const updateResult = await claimTicketStatusesService.updateStatus(data,updateId, transaction);
            if (updateResult) { 
                res.status(200).send({ status: 1, data: updateResult, message: "Status Updated Successfully." });  
                transaction.commit();
            }else{
                res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
            }
        }else{
            const data = {
                org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
                ticket_status: ticket_status,
                status_description:status_description,
                status_color:status_color,
                created_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
                updated_by: null,
                deleted_by: null
            };
            const createdResult = await claimTicketStatusesService.createStatus(data, transaction);
            if (createdResult) { 
                res.status(200).send({ status: 1, data: createdResult, message: "Status Created Successfully." });  
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


exports.getTicketStatusList = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        const sortField = req.query.sortField || 'claim_ticket_statuses_id'; // Default to 'claim_ticket_statuses_id'
        const sortOrder = req.query.sortOrder || 'DESC';
        let activeStatus = parsedQs.active_status ? parsedQs.active_status : '';
         
        const searchingValue = req.query.search || '';
        const searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    ticket_status: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                    
                },
                {
                    status_description: {
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
    
       const result = await claimTicketStatusesService.getStatusList(queryOptions)
        if (res.pagination) {
            res.pagination.total = result.count
            res.pagination.totalPages = Math.ceil(result.count / queryOptions.limit)
        }
        if (result.count > 0) {
            res.status(200).send({ status: 1, data: result.rows, pagination: res.pagination, message: 'Status list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: result.rows, pagination: res.pagination, message: 'No Status found' })
        }

    } catch (error) {
        next(error)
    }
}

exports.deleteTicketStatus = async (req, res, next) => {
    try {
        const { claim_ticket_statuses_id } = req.params;
        const ownerId = req.tokenData.org_user_id
        const statusRes = await claimTicketStatusesService.updateStatus(parseInt(claim_ticket_statuses_id));
        if (!statusRes) {
            res.status(200).send({ status: 0, message: "Status not found" });
        } else {
            const result = await claimTicketStatusesService.DeleteStatus(claim_ticket_statuses_id, ownerId);
            if (result) {
                res.status(200).send({ status: 1, message: 'Deleted sucessfully.' });
            } else {
                res.status(200).send({ status: 0, message: 'Unable to delete.' });
            }
        }
    } catch (error) {
        next(error);
    }
    
}

exports.updateActiveTicketStatus = async (req, res, next) => {
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
            const result = await claimTicketStatusesService.updateStatus(data,updateId, transaction);
            if (result) {
                res.status(200).send({ status: 1, data: result, message: "Updated Successfully." });
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






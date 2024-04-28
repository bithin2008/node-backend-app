require("dotenv").config();
const db = require('../../../models/index')
const url = require('url');
const querystring = require('querystring');
const { Op } = require("sequelize");
const propertySizeService = require("../../../services/v1/admin/propertySizeService");
const CustomError = require("../../../utils/customErrorHandler");




exports.savePropertySize = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        let {property_size,value,updateId}=req.body;
        if (!property_size) {
            throw new CustomError('Something went wrong.',400)
        }
        if (updateId) {
            const data = {   
                property_size: property_size,
                value:value,
            };
            const updateResult = await propertySizeService.updatePropertySize(data,updateId, transaction);
            if (updateResult) { 
                res.status(200).send({ status: 1, data: updateResult, message: "Updated Successfully." });  
                transaction.commit();
            }else{
                res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
            }
        }else{
            const data = {
                org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
                property_size: property_size,
                value:value,
                created_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
                updated_by: null,
                deleted_by: null
            };
            const createdResult = await propertySizeService.createPropertySize(data, transaction);
            if (createdResult) { 
                res.status(200).send({ status: 1, data: createdResult, message: "Created Successfully." });  
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


exports.getPropertySizeList = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        const sortField = req.query.sortField || 'property_size_id'; // Default to 'property_size_id'
        const sortOrder = req.query.sortOrder || 'DESC';
        let activeStatus = parsedQs.active_status ? parsedQs.active_status : '';
         
        const searchingValue = req.query.search || '';
        const searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    property_size: {
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
    
       const result = await propertySizeService.getPropertySizeList(queryOptions)
        if (res.pagination) {
            res.pagination.total = result.count
            res.pagination.totalPages = Math.ceil(result.count / queryOptions.limit)
        }
        if (result.count > 0) {
            res.status(200).send({ status: 1, data: result.rows, pagination: res.pagination, message: 'Found successfully' })
        } else {
            res.status(200).send({ status: 1, data: result.rows, pagination: res.pagination, message: 'No Property size found' })
        }

    } catch (error) {
        next(error)
    }
}

exports.deletePropertySize = async (req, res, next) => {
    try {
        const { property_size_id } = req.params;
        const ownerId = req.tokenData.org_user_id
        const propertySize = await propertySizeService.updatePropertySize(parseInt(property_size_id));
        if (!propertySize) {
            res.status(200).send({ status: 0, message: "Property size not found" });
        } else {
            const result = await propertySizeService.DeletePropertySize(property_size_id, ownerId);
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

exports.updateActiveStatus = async (req, res, next) => {
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
            const result = await propertySizeService.updatePropertySize(data,updateId, transaction);
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






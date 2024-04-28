const db = require('../../../models/index')
const url = require('url');
const querystring = require('querystring');
const { Op } = require("sequelize");
const propertyTypesService = require("../../../services/v1/admin/propertyTypesService");
const CustomError = require("../../../utils/customErrorHandler");

exports.getPropertyTypes = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        const sortField = req.query.sortField || 'property_type_id'; // Default to 'property_type_id'
        const sortOrder = req.query.sortOrder || 'DESC';
        let activeStatus = parsedQs.active_status ? parsedQs.active_status : '';
         
        const searchingValue = req.query.search || '';
        const searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    property_type: {
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
    
       const result = await propertyTypesService.getPropertyTypes(queryOptions)
        if (res.pagination) {
            res.pagination.total = result.count
            res.pagination.totalPages = Math.ceil(result.count / queryOptions.limit)
        }
        if (result.count > 0) {
            res.status(200).send({ status: 1, data: result.rows, pagination: res.pagination, message: 'Property type found successfully' })
        } else {
            res.status(200).send({ status: 1, data: result.rows, pagination: res.pagination, message: 'No Property type found' })
        }

    } catch (error) {
        next(error)
    }
}

exports.createAndUpdate = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        let {property_type,updateId}=req.body;
        if (!property_type) {
            throw new CustomError('Something went wrong.',400)
        }
        if (updateId) {
            const data = {   
                property_type: property_type
            };
            const updatedData = await propertyTypesService.updatePropertyType(data,updateId, transaction);
            if (updatedData) { 
                res.status(200).send({ status: 1, data: updatedData, message: "Updated Successfully." });  
                transaction.commit();
            }else{
                res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
            }
        }else{
            const data = {
                org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
                property_type: property_type,
                created_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
                updated_by: null,
                deleted_by: null
            };
            const createdData = await propertyTypesService.createPropertyType(data, transaction);
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

exports.deletePropertyType = async (req, res, next) => {
    try {
        const { property_type_id } = req.params;
        const ownerId = req.tokenData.org_user_id;
        const result = await propertyTypesService.findPropertyTypeById(parseInt(property_type_id));
        if (!result) {
            res.status(200).send({ status: 0, message: "Property type is not found" });
        } else {
            const resultDelete = await propertyTypesService.deletePropertyType(property_type_id, ownerId);
            if (resultDelete) {
                res.status(200).send({ status: 1, message: 'Deleted sucessfully.' });
            } else {
                res.status(200).send({ status: 0, message: 'Unable to delete.' });
            }
        }
    } catch (error) {
        next(error);
    }
    
}

exports.updatePropertyTypeStatus = async (req, res, next) => {
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
            const updatedData = await propertyTypesService.updatePropertyType(data,updateId, transaction);
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
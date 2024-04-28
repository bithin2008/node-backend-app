require("dotenv").config();
const db = require('../../../models/index')
const url = require('url');
const querystring = require('querystring');
const { Op } = require("sequelize");
const productBrandService = require("../../../services/v1/admin/productBrandService");
const CustomError = require("../../../utils/customErrorHandler");




exports.createAndUpdateBrand = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        let {brand_name,updateId}=req.body;
        if (!brand_name) {
            throw new CustomError('Something went wrong.',400)
        }
        if (updateId) {
            const data = {   
                brand_name: brand_name,
            };
            const updateBrand = await productBrandService.updateProductBrand(data,updateId, transaction);
            if (updateBrand) { 
                res.status(200).send({ status: 1, data: updateBrand, message: "Brand Updated Successfully." });  
                transaction.commit();
            }else{
                res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
            }
        }else{
            const data = {
                org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
                brand_name: brand_name,
                created_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
                updated_by: null,
                deleted_by: null
            };
            const createdBrand = await productBrandService.createProductBrand(data, transaction);
            if (createdBrand) { 
                res.status(200).send({ status: 1, data: createdBrand, message: "Brand Created Successfully." });  
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


exports.getBrands = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        const sortField = req.query.sortField || 'product_brand_id'; // Default to 'product_brand_id'
        const sortOrder = req.query.sortOrder || 'DESC';
        let activeStatus = parsedQs.active_status ? parsedQs.active_status : '';
         
        const searchingValue = req.query.search || '';
        const searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    brand_name: {
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
    
       const result = await productBrandService.getProductBrands(queryOptions)
        if (res.pagination) {
            res.pagination.total = result.count
            res.pagination.totalPages = Math.ceil(result.count / queryOptions.limit)
        }
        if (result.count > 0) {
            res.status(200).send({ status: 1, data: result.rows, pagination: res.pagination, message: 'Brands found successfully' })
        } else {
            res.status(200).send({ status: 1, data: result.rows, pagination: res.pagination, message: 'No Brand found' })
        }

    } catch (error) {
        next(error)
    }
}

exports.deleteBrand = async (req, res, next) => {
    try {
        const { product_brand_id } = req.params;
        const ownerId = req.tokenData.org_user_id
        const productBrand = await productBrandService.findProductBrandById(parseInt(product_brand_id));
        if (!productBrand) {
            res.status(200).send({ status: 0, message: "Brand not found" });
        } else {
            const deleteBrand = await productBrandService.deleteProductBrand(product_brand_id, ownerId);
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

exports.updateProductBrandStatus = async (req, res, next) => {
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
            const updateBrand = await productBrandService.updateProductBrand(data,updateId, transaction);
            if (updateBrand) {
                res.status(200).send({ status: 1, data: updateBrand, message: "Updated Successfully." });
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




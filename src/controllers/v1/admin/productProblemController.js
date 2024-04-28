require("dotenv").config();
const db = require('../../../models/index')
const url = require('url');
const querystring = require('querystring');
const { Op } = require("sequelize");
const productProblemService = require("../../../services/v1/admin/productProblemsService");
const CustomError = require("../../../utils/customErrorHandler");




exports.createProductProblem = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        let {issue,product_id,updateId}=req.body;
        if (!issue && !product_id) {
            throw new CustomError('Something went wrong.',400)
        }
        if (updateId) {
            const data = {   
                problems: issue.trim(),
                product_id: product_id,
            };
            const updatedProduct = await productProblemService.updateProductProblems(data,updateId, transaction);
            if (updatedProduct) { 
                res.status(200).send({ status: 1, data: updatedProduct, message: "Product Problem created Successfully." });  
                transaction.commit();
            }else{
                res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
            }
        }else{
            const data = {
                org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
                problems: issue.trim(),
                product_id: product_id,
                created_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
                updated_by: null,
                deleted_by: null
            };
            const createdProduct = await productProblemService.createProductProblems(data, transaction);
            if (createdProduct) { 
                res.status(200).send({ status: 1, data: createdProduct, message: "Product Problem created Successfully." });  
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


exports.getAllProductsProblems = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        const sortField = req.query.sortField || 'product_problem_id'; // Default to 'org_user_id'
        const sortOrder = req.query.sortOrder || 'DESC';
        let activeStatus = parsedQs.active_status ? parsedQs.active_status : '';
        let productWiseQuery = parsedQs.product_id ? { product_id: parsedQs.product_id } : {};
        
        const searchingValue = req.query.search || '';
        const searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    problems: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                    
                },
                {
                    // Search in the associated model columns
                    '$product_details.product_name$': {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                }
            ],
        } : {};

        let queryOptions = {
            where: { ...searchQuery,...productWiseQuery,org_id:req.tokenData.org_id },
            attributes: { exclude: ['deleted_by', 'deleted_at'] },
            include: [
                {
                    model: db.productsModel,
                    as: 'product_details',
                    attributes: { exclude: ['created_at', 'deleted_at', 'deleted_by'] }
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
    
        allProducts = await productProblemService.getAllProductProblems(req, res, next, queryOptions)
        if (res.pagination) {
            res.pagination.total = allProducts.count
            res.pagination.totalPages = Math.ceil(allProducts.count / queryOptions.limit)
        }
        if (allProducts.count > 0) {
            res.status(200).send({ status: 1, data: allProducts.rows, pagination: res.pagination, message: 'Product Problems found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allProducts.rows, pagination: res.pagination, message: 'No Product found' })
        }

    } catch (error) {
        next(error)
    }
}




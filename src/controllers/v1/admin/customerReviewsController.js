require("dotenv").config();
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index')
const moment = require("moment");
const helper = require("../../../common/helper");
const url = require('url');
const querystring = require('querystring');
const { Op } = require("sequelize");
const customerReviewsService = require("../../../services/v1/admin/customerReviewsService");
const productService = require("../../../services/v1/admin/productService");

//const model =db.sequelize.models// Object.keys(db.sequelize.models);
/*****************************
 *  CREATE REVIEWS
 ******************************/
exports.createReview = async (req, res, next) => {
    try {
        const transaction = await db.sequelize.transaction();
        const data = {
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
            description: req.body.description,
            review_date: moment().format('YYYY-MM-DD HH:mm:ss z'),
            rating: req.body.rating,
            review_source: req.body.source,
            active_status: parseInt(req.body.activeStatus),
            create_user_type:2,
            created_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
            updated_by: null,
            deleted_by: null
        };

        const createdCustomerReview = await customerReviewsService.createCustomerReview(data, transaction);
        if (createdCustomerReview) {
            transaction.commit();
            res.status(200).send({
                status: 1,
                message: "Review Created Successfully.",
            });
        } else {
            res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
        }
    } catch (error) {
        next(error);
    }
}


/*****************************
 *  UPDATE REVIEW
 ******************************/
exports.updateReview = async (req, res, next) => {
    try {
        const { customer_review_id } = req.params;
        const owner_id = req.tokenData.org_user_id
        const reviewExists = await customerReviewsService.findReviewById(parseInt(customer_review_id));
        if (reviewExists) {
            let review_detail = {
                first_name: req.body.firstName,
                last_name: req.body.lastName,
                org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
                description: req.body.description,
                review_date: req.body.reviewDate,
                rating: req.body.rating,
                review_source: req.body.source,
                active_status: parseInt(req.body.activeStatus),
                updated_user_type:2,
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
                deleted_by: null
            }
            const transaction = await db.sequelize.transaction(async (t) => {
                await db.customerReviewsModel.update(
                    { updated_by: owner_id },
                    { where: { customer_review_id: customer_review_id }, transaction: t })
                await db.customerReviewsModel.update(review_detail, { where: { customer_review_id: customer_review_id }, transaction: t })
                res.status(200).send({ status: 1, message: 'Review has been successfully updated.' })
            });
        } else {
            res.status(200).send({ status: 0, message: "Review not found" });
        }
    } catch (error) {
        next(error);
    }
}


/*****************************
 *  GET ALL REVIEWS
 ******************************/
exports.getAllReviews = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        const sortField = req.query.sortField || 'customer_review_id'; // Default to 'org_user_id'
        const sortOrder = req.query.sortOrder || 'DESC';
        let activeStatus = parsedQs.active_status ? parsedQs.active_status : '';
        const searchingValue = req.query.search || '';
        let nameQueryForSearch=searchingValue?searchingValue.trim().split(" "):[];
        const searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    first_name: {
                        [Op.iLike]: `%${nameQueryForSearch[0]?.trim()}%`,
                    },
                },
                {
                    last_name: {
                        [Op.iLike]: `%${nameQueryForSearch[1]?.trim()?nameQueryForSearch[1]?.trim():nameQueryForSearch[0]?.trim()}%`,
                    },
                },
                {
                    description: {
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

        allReviews = await customerReviewsService.getAllReviews(req, res, next, queryOptions);
        if (res.pagination) {
            res.pagination.total = allReviews.count
            res.pagination.totalPages = Math.ceil(allReviews.count / queryOptions.limit)
        }

        if (allReviews.rows) {
            allReviews.rows = await Promise.all(allReviews.rows.map(async (element) => {
              element.create_info = await helper.getUserInfo(parseInt(element.created_by));
              if(element.updated_by){
                element.update_info = await helper.getUserInfo(parseInt(element.updated_by));
              }
              return element;
            }));
          }

        if (allReviews.rows.length > 0) {
            res.status(200).send({ status: 1, data: allReviews.rows, pagination: res.pagination, message: 'Review list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allReviews.rows, pagination: res.pagination, message: 'No review found' })
        }
    } catch (error) {
        next(error)
    }
}


/*****************************
 *  GET ALL REVIEWS
 ******************************/
exports.getAllReviewsForWebsite = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        const sortField = req.query.sortField || 'customer_review_id'; // Default to 'org_user_id'
        const sortOrder = req.query.sortOrder || 'DESC';
        let activeStatus = parsedQs.active_status ? parsedQs.active_status : '';
        const searchingValue = req.query.search || '';
        let nameQueryForSearch=searchingValue?searchingValue.trim().split(" "):[];
        const searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    first_name: {
                        [Op.iLike]: `%${nameQueryForSearch[0]?.trim()}%`,
                    },
                },
                {
                    last_name: {
                        [Op.iLike]: `%${nameQueryForSearch[1]?.trim()?nameQueryForSearch[1]?.trim():nameQueryForSearch[0]?.trim()}%`,
                    },
                },
                {
                    description: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },

            ],
        } : {};


        let queryOptions = {
            where: {
                ...searchQuery, rating: {
                    [Op.gt]: 2,
                }
            },
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

        allReviews = await customerReviewsService.getAllReviews(req, res, next, queryOptions);
        if (res.pagination) {
            res.pagination.total = allReviews.count
            res.pagination.totalPages = Math.ceil(allReviews.count / queryOptions.limit)
        }
        if (allReviews.rows.length > 0) {
            res.status(200).send({ status: 1, data: allReviews.rows, pagination: res.pagination, message: 'Review list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allReviews.rows, pagination: res.pagination, message: 'No review found' })
        }
    } catch (error) {
        next(error)
    }
}



/*****************************
 *  DELETE REVIEW
 ******************************/
exports.deleteReview = async (req, res, next) => {
    try {
        const { customer_review_id } = req.params;
        const ownerId = req.tokenData.org_user_id
        const reviewExists = await customerReviewsService.findReviewById(parseInt(customer_review_id));
        if (!reviewExists) {
            res.status(200).send({ status: 0, message: "Customer review not found" });
        } else {
            const deletedReview = await customerReviewsService.deleteReview(reviewExists, ownerId);
            if (deletedReview) {
                res.status(200).send({ status: 1, message: 'Customer review deleted sucessfully.' });
            } else {
                res.status(200).send({ status: 0, message: 'Unable to delete Customer review.' });
            }
        }
    } catch (error) {
        next(error);
    }

}

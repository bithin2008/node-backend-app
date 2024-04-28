const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');

//CREATE CUSTOMER REVIEW
exports.createCustomerReview = async (obj, transaction) => {
    try {
        let createdReview = await db.customerReviewsModel.create(obj, { transaction });
        return createdReview;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//FIND SUB MODULE BY ID
exports.findReviewById = async (val) => {
    try {
        let review = await db.customerReviewsModel.findOne({ where: { customer_review_id: val } });
        return review;
    } catch (e) {
        console.log(e);
    }
}


//GET ALL REVIEWS
exports.getAllReviews = async (req, res, next, queryOptions) => {
    try {
        let allCustomerReviews = await db.customerReviewsModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(allCustomerReviews)
    } catch (e) {
        console.log(e);
        throw e
    }
}

exports.deleteReview = async (val, ownerId) => {
    try {
        const deletedReview = await db.sequelize.transaction(async (t) => {
            await db.customerReviewsModel.update(
                { deleted_by: ownerId },
                { where: { customer_review_id: val.customer_review_id }, transaction: t }
            );
            return db.customerReviewsModel.destroy({
                where: { customer_review_id: val.customer_review_id },
                transaction: t
            });
        });

        return deletedReview;
    } catch (e) {
        console.error(e);
        // throw Error('Error while fetching User')
    }
}



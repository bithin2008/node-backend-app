const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');
const productService = require("../../../services/v1/admin/productService");

//FIND SUB MODULE BY ID
exports.findPlanById = async (val) => {
    try {
        let plan = await db.plansModel.findOne({ where: { plan_id: val } });
        return helper.getJsonParseData(plan);
    } catch (e) {
        console.log(e);
    }
}


//GET PLAN WITH PRODUCT BY PLAN ID
exports.findPlanWithProductByPlanId = async (val) => {
    try {
        let plan = await db.plansModel.findOne({ where: { plan_id: val } });
        let product_list = [];

        if (plan) {
            let productIds = plan.product_id.split(',');
            // Map the array of product IDs to an array of promises that fetch product details
            const productPromises = productIds.map(async (item) => {
                let productDetails = await productService.findProductById(parseInt(item));
                return productDetails;
            });
            // Use Promise.all to wait for all promises to resolve
            product_list = await Promise.all(productPromises);
        }
        return product_list;

    } catch (e) {
        console.log(e);
    }
}

//CREATE PLAN
exports.createPlan = async (obj, transaction) => {
    try {
        let createdPlan = await db.plansModel.create(obj, { transaction });
        return createdPlan;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//BULK CREATE PRODUCT RELATED TO PLAN
exports.createBulkPolicyProducts = async (arr, transaction) => {
    try {
        //console.log('arr',arr);
        let createdPolicyProducts = await db.policyProductsModel.bulkCreate(arr, { transaction })
        return createdPolicyProducts;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}


//GET ALL PLANS
exports.getAllPlans = async (req, res, next, queryOptions) => {
    try {
        let allPlans = await db.plansModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(allPlans)
    } catch (e) {
        console.log(e);
        throw e
    }
}

//DELETE PLAN
exports.deletePlan = async (val, ownerId) => {
    try {
        let deletePlan = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.plansModel.update(
                { deleted_by: ownerId },
                { where: { plan_id: val.plan_id }, transaction: t }
            )


            deletePlan = await db.plansModel.destroy({
                where: {
                    plan_id: val.plan_id
                }, transaction: t
            })
        });
        return deletePlan;
    } catch (e) {
        console.log(e);
        // throw Error('Error while fetching User')
    }
}




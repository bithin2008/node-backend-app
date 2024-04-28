const db = require('../../../models/index');
const helper = require('../../../common/helper');
const CustomError = require('../../../utils/customErrorHandler');

//FIND SUB MODULE BY ID
exports.findProductProblemById = async (val) => {
    try {
        let product = await db.productProblemsModel.findOne({ where: { product_problem_id: val,active_status:1 }, attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] } });
        product=helper.getJsonParseData(product);
        
        return product;
    } catch (e) {
        console.log(e);
    }
}

//CREATE PRODUCT PROBLEM
exports.createProductProblems = async (obj, transaction) => {
    try {
        let createdProduct = await db.productProblemsModel.create(obj, { transaction });
        return createdProduct?helper.getJsonParseData(createdProduct):null;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

exports.updateProductProblems = async (obj,updateId, transaction) => {
    try {
        let result = await db.productProblemsModel.update(obj,{ where: { product_problem_id: updateId },transaction });
        return result?helper.getJsonParseData(result):null;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//GET ALL PRODUCTS PROBLEM
exports.getAllProductProblems = async (req, res, next, queryOptions) => {
    try {
        let allProducts = await db.productProblemsModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(allProducts)
    } catch (e) {
        console.log(e);
        throw e
    }
}

//DELETE PRODUCT PROBLEM

exports.deleteProductProblem = async (val, ownerId) => {
    try {
        let deleteProduct = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.productProblemsModel.update(
                { deleted_by: ownerId },
                { where: { product_problem_id: val.product_problem_id }, transaction: t }
            )


            deleteProduct = await db.productProblemsModel.destroy({
                where: {
                    product_problem_id: val.product_problem_id
                }, transaction: t
            })
        });
        return deleteProduct;
    } catch (e) {
        console.log(e);
        // throw Error('Error while fetching User')
    }
}
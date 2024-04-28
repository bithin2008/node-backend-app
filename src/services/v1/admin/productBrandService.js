const db = require('../../../models/index');
const helper = require('../../../common/helper');
const CustomError = require('../../../utils/customErrorHandler');

//FIND SUB MODULE BY ID
exports.findProductBrandById = async (product_brand_id) => {
    try {
        let product = await db.productBrandModel.findOne({ where: { product_brand_id: product_brand_id,active_status:1 }, attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] } });
        product=helper.getJsonParseData(product);
        
        return product;
    } catch (e) {
        console.log(e);
    }
}

//CREATE PRODUCT PROBLEM
exports.createProductBrand = async (obj, transaction) => {
    try {
        let createdBrand = await db.productBrandModel.create(obj, { transaction });
        return createdBrand?helper.getJsonParseData(createdBrand):null;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

exports.updateProductBrand = async (obj,updateId, transaction) => {
    try {
        let result = await db.productBrandModel.update(obj,{ where: { product_brand_id: updateId },transaction });
        return result?helper.getJsonParseData(result):null;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//GET ALL PRODUCTS PROBLEM
exports.getProductBrands = async (queryOptions) => {
    try {
        let result = await db.productBrandModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(result)
    } catch (e) {
        console.log(e);
        throw e
    }
}

//DELETE PRODUCT PROBLEM

exports.deleteProductBrand = async (product_brand_id, ownerId) => {
    try {
        let deleteBrand = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.productBrandModel.update(
                { deleted_by: ownerId },
                { where: { product_brand_id:product_brand_id }, transaction: t }
            )
            deleteBrand = await db.productBrandModel.destroy({
                where: {
                    product_brand_id:product_brand_id
                }, transaction: t
            })
        });
        return deleteBrand;
    } catch (e) {
        console.log(e);
        // throw Error('Error while fetching User')
    }
}
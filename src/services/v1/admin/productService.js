const db = require('../../../models/index');
const helper = require('../../../common/helper');
const CustomError = require('../../../utils/customErrorHandler');

//FIND SUB MODULE BY ID
exports.findProductById = async (val) => {
    try {
        let product = await db.productsModel.findOne({ where: { product_id: val }, attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] } });
        product=helper.getJsonParseData(product);
        
        return product;
    } catch (e) {
        console.log(e);
    }
}

//CREATE PRODUCT
exports.createProduct = async (obj, transaction) => {
    try {
        let createdProduct = await db.productsModel.create(obj, { transaction });
        return createdProduct?helper.getJsonParseData(createdProduct):null;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//GET ALL PRODUCTS
exports.getAllProducts = async (org_id,queryOptions) => {
    try {
        let allProducts = await db.productsModel.findAndCountAll(queryOptions)
        allProducts.rows.forEach((element) => { 
            element.product_image = element.product_image?`${helper.api_baseurl}/org_file/hws_${org_id}/media_content/products/${element.product_image}`:null;          
        });
        return helper.getJsonParseData(allProducts)
    } catch (e) {
        console.log(e);
        throw e
    }
}

//DELETE PRODUCT
exports.deleteProduct = async (val, ownerId) => {
    try {
        let deleteProduct = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.productsModel.update(
                { deleted_by: ownerId },
                { where: { product_id: val.product_id }, transaction: t }
            )


            deleteProduct = await db.productsModel.destroy({
                where: {
                    product_id: val.product_id
                }, transaction: t
            })
        });
        return deleteProduct;
    } catch (e) {
        console.log(e);
        // throw Error('Error while fetching User')
    }
}
const db = require('../../../models/index');
const helper = require('../../../common/helper');
const CustomError = require('../../../utils/customErrorHandler');

//FIND SUB MODULE BY ID
exports.findPropertyTypeById = async (property_type_id) => {
    try {
        let result = await db.propertyTypesModel.findOne({ where: { property_type_id: property_type_id,active_status:1 }, attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] } });
        result=helper.getJsonParseData(result);
        
        return result;
    } catch (e) {
        console.log(e);
    }
}

//CREATE PRODUCT PROBLEM
exports.createPropertyType = async (obj, transaction) => {
    try {
        let result = await db.propertyTypesModel.create(obj, { transaction });
        return result?helper.getJsonParseData(result):null;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

exports.updatePropertyType = async (obj,updateId, transaction) => {
    try {
        let result = await db.propertyTypesModel.update(obj,{ where: { property_type_id: updateId },transaction });
        return result?helper.getJsonParseData(result):null;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//GET ALL PRODUCTS PROBLEM
exports.getPropertyTypes = async (queryOptions) => {
    try {
        let result = await db.propertyTypesModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(result)
    } catch (e) {
        console.log(e);
        throw e
    }
}

//DELETE PRODUCT PROBLEM

exports.deletePropertyType = async (property_type_id, ownerId) => {
    try {
        let deletePropType = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.propertyTypesModel.update(
                { deleted_by: ownerId },
                { where: { property_type_id:property_type_id }, transaction: t }
            )
            deletePropType = await db.propertyTypesModel.destroy({
                where: {
                    property_type_id:property_type_id
                }, transaction: t
            })
        });
        return deletePropType;
    } catch (e) {
        console.log(e);
        // throw Error('Error while fetching User')
    }
}
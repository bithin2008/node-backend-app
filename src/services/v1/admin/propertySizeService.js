const db = require('../../../models/index');
const helper = require('../../../common/helper');
const CustomError = require('../../../utils/customErrorHandler');

//FIND PROPERTY SIZE BY ID
exports.findPropertySizeById = async (property_size_id) => {
    try {
        let result = await db.propertySizeModel.findOne({ where: { property_size_id: property_size_id,active_status:1 }, attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] } });
        result=helper.getJsonParseData(result); 
        return result;
    } catch (e) {
        console.log(e);
    }
}

//CREATE PROPERTY SIZE
exports.createPropertySize = async (obj, transaction) => {
    try {
        let result = await db.propertySizeModel.create(obj, { transaction });
        return result?helper.getJsonParseData(result):null;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}
//UPDATE PROPERTY SIZE
exports.updatePropertySize = async (obj,updateId, transaction) => {
    try {
        let result = await db.propertySizeModel.update(obj,{ where: { property_size_id: updateId },transaction });
        return result?helper.getJsonParseData(result):null;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//GET ALL PROPERTY SIZE
exports.getPropertySizeList = async (queryOptions) => {
    try {
        let result = await db.propertySizeModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(result)
    } catch (e) {
        console.log(e);
        throw e
    }
}

//DELETE PROPERTY SIZE

exports.DeletePropertySize = async (property_size_id, ownerId) => {
    try {
        let result = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.propertySizeModel.update(
                { deleted_by: ownerId },
                { where: { property_size_id:property_size_id }, transaction: t }
            )
            result = await db.propertySizeModel.destroy({
                where: {
                    property_size_id:property_size_id
                }, transaction: t
            })
        });
        return result;
    } catch (e) {
        console.log(e);
        // throw Error('Error while fetching User')
    }
}
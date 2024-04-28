const db = require('../../../models/index');
const helper = require('../../../common/helper');
const CustomError = require('../../../utils/customErrorHandler');

//FIND POLICY STATUS BY ID
exports.findStatusById = async (payment_status_id) => {
    try {
        let result = await db.paymentStatusModel.findOne({ where: { payment_status_id: payment_status_id,active_status:1 }, attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] } });
        result=helper.getJsonParseData(result); 
        return result;
    } catch (e) {
        console.log(e);
    }
}

//CREATE POLICY STATUS
exports.createStatus = async (obj, transaction) => {
    try {
        let result = await db.paymentStatusModel.create(obj, { transaction });
        return result?helper.getJsonParseData(result):null;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}
//UPDATE POLICY STATUS
exports.updateStatus = async (obj,updateId, transaction) => {
    try {
        let result = await db.paymentStatusModel.update(obj,{ where: { payment_status_id: updateId },transaction });
        return result?helper.getJsonParseData(result):null;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//GET ALL POLICY STATUS
exports.getStatusList = async (queryOptions) => {
    try {
        let result = await db.paymentStatusModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(result)
    } catch (e) {
        console.log(e);
        throw e
    }
}

//DELETE POLICY STATUS

exports.DeleteStatus = async (payment_status_id, ownerId) => {
    try {
        let result = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.paymentStatusModel.update(
                { deleted_by: ownerId },
                { where: { payment_status_id:payment_status_id }, transaction: t }
            )
            result = await db.paymentStatusModel.destroy({
                where: {
                    payment_status_id:payment_status_id
                }, transaction: t
            })
        });
        return result;
    } catch (e) {
        console.log(e);
        // throw Error('Error while fetching User')
    }
}
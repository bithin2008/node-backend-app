const db = require('../../../models/index');
const helper = require('../../../common/helper');
const CustomError = require('../../../utils/customErrorHandler');

//FIND POLICY STATUS BY ID
exports.findStatusById = async (policy_status_id) => {
    try {
        let result = await db.policyStatusModel.findOne({ where: { policy_status_id: policy_status_id,active_status:1 }, attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] } });
        result=helper.getJsonParseData(result); 
        return result;
    } catch (e) {
        console.log(e);
    }
}

//CREATE POLICY STATUS
exports.createStatus = async (obj, transaction) => {
    try {
        let result = await db.policyStatusModel.create(obj, { transaction });
        return result?helper.getJsonParseData(result):null;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}
//UPDATE POLICY STATUS
exports.updateStatus = async (obj,updateId, transaction) => {
    try {
        let result = await db.policyStatusModel.update(obj,{ where: { policy_status_id: updateId },transaction });
        return result?helper.getJsonParseData(result):null;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//GET ALL POLICY STATUS
exports.getStatusList = async (queryOptions) => {
    try {
        let result = await db.policyStatusModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(result)
    } catch (e) {
        console.log(e);
        throw e
    }
}

//DELETE POLICY STATUS

exports.DeleteStatus = async (policy_status_id, ownerId) => {
    try {
        let result = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.policyStatusModel.update(
                { deleted_by: ownerId },
                { where: { policy_status_id:policy_status_id }, transaction: t }
            )
            result = await db.policyStatusModel.destroy({
                where: {
                    policy_status_id:policy_status_id
                }, transaction: t
            })
        });
        return result;
    } catch (e) {
        console.log(e);
        // throw Error('Error while fetching User')
    }
}
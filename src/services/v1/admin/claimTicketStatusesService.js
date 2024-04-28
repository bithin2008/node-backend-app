const db = require('../../../models/index');
const helper = require('../../../common/helper');
const CustomError = require('../../../utils/customErrorHandler');

//FIND POLICY STATUS BY ID
exports.findStatusById = async (claim_ticket_statuses_id) => {
    try {
        let result = await db.claimTicketStatusesModel.findOne({ where: { claim_ticket_statuses_id: claim_ticket_statuses_id,active_status:1 }, attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] } });
        result=helper.getJsonParseData(result); 
        return result;
    } catch (e) {
        console.log(e);
    }
}

//CREATE POLICY STATUS
exports.createStatus = async (obj, transaction) => {
    try {
        let result = await db.claimTicketStatusesModel.create(obj, { transaction });
        return result?helper.getJsonParseData(result):null;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}
//UPDATE POLICY STATUS
exports.updateStatus = async (obj,updateId, transaction) => {
    try {
        let result = await db.claimTicketStatusesModel.update(obj,{ where: { claim_ticket_statuses_id: updateId },transaction });
        return result?helper.getJsonParseData(result):null;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//GET ALL POLICY STATUS
exports.getStatusList = async (queryOptions) => {
    try {
        let result = await db.claimTicketStatusesModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(result)
    } catch (e) {
        console.log(e);
        throw e
    }
}

//DELETE POLICY STATUS

exports.DeleteStatus = async (claim_ticket_statuses_id, ownerId) => {
    try {
        let result = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.claimTicketStatusesModel.update(
                { deleted_by: ownerId },
                { where: { claim_ticket_statuses_id:claim_ticket_statuses_id }, transaction: t }
            )
            result = await db.claimTicketStatusesModel.destroy({
                where: {
                    claim_ticket_statuses_id:claim_ticket_statuses_id
                }, transaction: t
            })
        });
        return result;
    } catch (e) {
        console.log(e);
        // throw Error('Error while fetching User')
    }
}
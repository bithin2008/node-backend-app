const db = require('../../../models/index');
const helper = require('../../../common/helper');
const CustomError = require('../../../utils/customErrorHandler');

//FIND SUB MODULE BY ID
exports.findById = async (claim_priority_id) => {
    try {
        let result = await db.claimPriorityModel.findOne({ where: { claim_priority_id: claim_priority_id,active_status:1 }, attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] } });
        result=helper.getJsonParseData(result);
        
        return result;
    } catch (e) {
        console.log(e);
    }
}

//CREATE PRODUCT PROBLEM
exports.createClaimsPriority = async (obj, transaction) => {
    try {
        let result = await db.claimPriorityModel.create(obj, { transaction });
        return result?helper.getJsonParseData(result):null;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

exports.updateClaimsPriority = async (obj,updateId, transaction) => {
    try {
        let result = await db.claimPriorityModel.update(obj,{ where: { claim_priority_id: updateId },transaction });
        return result?helper.getJsonParseData(result):null;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//GET ALL PRODUCTS PROBLEM
exports.getClaimsPriority = async (queryOptions) => {
    try {
        let result = await db.claimPriorityModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(result)
    } catch (e) {
        console.log(e);
        throw e
    }
}

//DELETE PRODUCT PROBLEM

exports.deleteClaimsPriority = async (claim_priority_id, ownerId) => {
    try {
        let deleteBrand = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.claimPriorityModel.update(
                { deleted_by: ownerId },
                { where: { claim_priority_id:claim_priority_id }, transaction: t }
            )
            deleteBrand = await db.claimPriorityModel.destroy({
                where: {
                    claim_priority_id:claim_priority_id
                }, transaction: t
            })
        });
        return deleteBrand;
    } catch (e) {
        console.log(e);
        // throw Error('Error while fetching User')
    }
}
const db = require('../../../models/index');
const helper = require('../../../common/helper');
const CustomError = require('../../../utils/customErrorHandler');

//FIND SUB MODULE BY ID
exports.findHoldingPeriodById = async (holding_period_id) => {
    try {
        let result = await db.holdingPeriodModel.findOne({ where: { holding_period_id: holding_period_id,active_status:1 }, attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] } });
        result=helper.getJsonParseData(result);
        
        return result;
    } catch (e) {
        console.log(e);
    }
}

//CREATE PRODUCT PROBLEM
exports.createHoldingPeriod = async (obj, transaction) => {
    try {
        let result = await db.holdingPeriodModel.create(obj, { transaction });
        return result?helper.getJsonParseData(result):null;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

exports.updateHoldingPeriod = async (obj,updateId, transaction) => {
    try {
        let result = await db.holdingPeriodModel.update(obj,{ where: { holding_period_id: updateId },transaction });
        return result?helper.getJsonParseData(result):null;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//GET ALL PRODUCTS PROBLEM
exports.getHoldingPeriods = async (queryOptions) => {
    try {
        let result = await db.holdingPeriodModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(result)
    } catch (e) {
        console.log(e);
        throw e
    }
}

//DELETE PRODUCT PROBLEM

exports.deleteProductBrand = async (holding_period_id, ownerId) => {
    try {
        let deleteHp = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.holdingPeriodModel.update(
                { deleted_by: ownerId },
                { where: { holding_period_id:holding_period_id }, transaction: t }
            )
            deleteHp = await db.holdingPeriodModel.destroy({
                where: {
                    holding_period_id:holding_period_id
                }, transaction: t
            })
        });
        return deleteHp;
    } catch (e) {
        console.log(e);
        // throw Error('Error while fetching User')
    }
}

const db = require('../../../models/index');
const helper = require('../../../common/helper');
//GET ALL SERVICE CALL FEES
exports.getAllServiceCallFees = async (queryOptions={}) => {
    try {
        let result = await db.serviceCallFeesModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(result)
    } catch (e) {
        console.log(e);
        throw e
    }
}

//FIND SUB MODULE BY ID
exports.findScfById = async (service_call_fees_id) => {
    try {
        let product = await db.serviceCallFeesModel.findOne({ where: { service_call_fees_id: service_call_fees_id,active_status:1 }, attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] } });
        product=helper.getJsonParseData(product);     
        return product;
    } catch (e) {
        console.log(e);
    }
}


//FIND SUB MODULE BY ID
exports.findScfByTermAndValue = async (term,scfvalue) => {
    try {        
        let scfCallFeeRes = await db.serviceCallFeesModel.findOne({ where: { month:parseInt(term),  scf_value:scfvalue, active_status:1 }, attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] } });
        return scfCallFeeRes?helper.getJsonParseData(scfCallFeeRes):null;
    } catch (e) {
        console.log(e);
    }
}

//CREATE PRODUCT PROBLEM
exports.createScf = async (obj, transaction) => {
    try {
        let created = await db.serviceCallFeesModel.create(obj, { transaction });
        return created?helper.getJsonParseData(created):null;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

exports.updateScf = async (obj,updateId, transaction) => {
    try {
        let result = await db.serviceCallFeesModel.update(obj,{ where: { service_call_fees_id: updateId },transaction });
        return result?helper.getJsonParseData(result):null;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}
const db = require('../../../models/index');
const helper = require('../../../common/helper');

//BULK CREATE POLICY WISE Notes
exports.createpolicyNotes = async (obj, transaction) => {
    try {
        let createdPolicyWiseCommission = await db.policyNotesModel.create(obj, { transaction });
        return helper.getJsonParseData(createdPolicyWiseCommission);
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

exports.getAllPolicyNotes = async (queryOptions={}) => {
    try {
        let customersNote = await db.policyNotesModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(customersNote)
    } catch (e) {
        throw e
    }
}


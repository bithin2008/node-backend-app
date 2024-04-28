const db = require('../../../models/index');
const helper = require('../../../common/helper');

// CREATE POLICY Status Log
exports.createPolicyStatusUpdateLog = async (obj, transaction) => {
    try {
        let createdPolicyStatusUpdateLog = await db.policyStatusUpdateLogsModel.create(obj, { transaction });
        return helper.getJsonParseData(createdPolicyStatusUpdateLog);
    } catch (e) {
        throw e
    }
}
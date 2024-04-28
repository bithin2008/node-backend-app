const db = require('../../../models/index');
const helper = require('../../../common/helper');

// CREATE POLICY Document
exports.createpolicyDocLogs = async (obj, transaction={}) => {
    try {
        let createpolicyDocLogsRes = await db.policyDocLogsModel.create(obj,transaction);
        return helper.getJsonParseData(createpolicyDocLogsRes);
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

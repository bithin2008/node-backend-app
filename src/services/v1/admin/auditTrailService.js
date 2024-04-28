const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');


//GET ALL AUDIT
exports.getAllAudit = async (req, res, next, queryOptions = {}) => {
    try {
        let allAuditTrails = await db.auditTrailModel.findAndCountAll(queryOptions);
        return allAuditTrails ? helper.getJsonParseData(allAuditTrails) : null
    } catch (e) {
        console.log(e);
        throw e
    }
}

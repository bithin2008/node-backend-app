const db = require('../../../models/index');
const helper = require('../../../common/helper');

//BULK CREATE POLICY WISE COMMISSION
exports.createpolicyWiseCommission = async (obj, transaction) => {
    try {
        let createdPolicyWiseCommission = await db.policyWiseCommiosionModel.create(obj, { transaction });
        return helper.getJsonParseData(createdPolicyWiseCommission);
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}
exports.updatepolicyWiseCommission = async (where,obj, transaction) => {
    try {

        let updatedPolicyWiseCommission = await db.policyWiseCommiosionModel.update(obj, { ...where,transaction });
        return updatedPolicyWiseCommission[0]!=0?true:false;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}
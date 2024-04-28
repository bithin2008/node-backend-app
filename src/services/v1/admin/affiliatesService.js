const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');


//SUBMIT AFFILIATE
exports.submitAffiliate = async (obj, transaction) => {
    try {
        let submittedAffiliate = await db.affiliatesModel.create(obj, { transaction });
        return submittedAffiliate;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//GET ALL AFFILIATE
exports.getAllAffiliates = async (queryOptions = {}) => {
    try {

        let allAffiliates = await db.affiliatesModel.findAndCountAll(queryOptions)
        return allAffiliates ? helper.getJsonParseData(allAffiliates) : null
    } catch (e) {
        console.log(e);
        throw e
    }
}

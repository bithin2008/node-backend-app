const db = require('../../../models/index');
const helper = require('../../../common/helper');

// CREATE POLICY Document
exports.createpolicyDocument = async (obj, transaction) => {
    try {
        let createPolicyDocRes = await db.policyDocumentsModel.create(obj, { transaction });
        return helper.getJsonParseData(createPolicyDocRes);
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

exports.getAllpolicyDocuments = async (customer_id,queryOptions = {}) => {
    try {

        let allPolicyDocuments = await db.policyDocumentsModel.findAll(queryOptions)
        allPolicyDocuments=helper.getJsonParseData(allPolicyDocuments);
        allPolicyDocuments.map(el=>el.document?el.document=`${helper.api_baseurl}/org_file/hws_${el.org_id}/customers/policy_docs/${el.document}`:null );
        return allPolicyDocuments
    } catch (e) {
        console.log(e);
        throw e
    }
}
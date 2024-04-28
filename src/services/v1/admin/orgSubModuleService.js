const db = require('../../../models/index');
const helper = require('../../../common/helper');
const CustomError = require('../../../utils/customErrorHandler');


//FIND Module By ID 
exports.getOrgSubModules = async (queryOptions) => {
    try {
   
        let allSubModules = await db.orgSubModulesModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(allSubModules)
    } catch (e) {
        console.log(e);
        throw e
    }
}

exports.updateOrgSubModule = async (org_sub_module_id,sub_module_detail, transaction) => {
    try {
        sub_module_detail.sub_module_slug=sub_module_detail.sub_module_name.toLowerCase().replace(/ /g, '-');
       let updateRes=await db.orgSubModulesModel.update(sub_module_detail, { where: { org_sub_module_id: org_sub_module_id }, transaction})
        return updateRes[0] != 0?true:false;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}
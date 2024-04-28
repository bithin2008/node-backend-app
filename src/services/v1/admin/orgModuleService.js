const db = require('../../../models/index');
const helper = require('../../../common/helper');


//FIND Organaization Modules
exports.getOrgModules = async (queryOptions) => {
    try {
        let allModules = await db.orgModulesModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(allModules)
    } catch (e) {
        console.log(e);
        throw e
    }
}


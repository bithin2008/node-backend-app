const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');

//GET ALL WEBSITE PAGES
exports.getAllWebsitePages = async (req, res, next, queryOptions) => {
    try {
        let allPages = await db.websitePagesModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(allPages)
    } catch (e) {
        console.log(e);
        throw e
    }
}



//FIND WEBSITE PAGE BY route
exports.findPageByRoute = async (queryOptions) => {
    try {
        let pageDetails = await db.websitePagesModel.findOne(queryOptions);
        return pageDetails?helper.getJsonParseData(pageDetails): null;  
    } catch (e) {
        console.log(e);
    }
}
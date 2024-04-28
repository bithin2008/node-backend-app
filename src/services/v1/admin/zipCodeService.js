const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');


//FIND PLAN TERM BY ID
exports.findZipCodeById = async (val) => {
    try {
        let zipcode = await db.zipcodesModel.findOne({ where: { zip_code_id: val } });
        return zipcode;
    } catch (e) {
        console.log(e);
    }
}

exports.getAllZipCode = async (req, res, next,queryOptions) => {
    try {
        let allZipCodes = await db.zipcodesModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(allZipCodes)
    } catch (e) {
        console.log(e);
        throw e
    }
}

//CREATE WHITELIST IP
exports.createZipCode = async (obj, transaction) => {
    try {
        let createdZipCode = await db.zipcodesModel.create(obj, { transaction });
        return createdZipCode;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

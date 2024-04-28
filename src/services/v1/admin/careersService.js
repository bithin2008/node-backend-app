const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');


//SUBMIT CAREER
exports.submitCareer = async (obj, transaction) => {
    try {
        let submitCareer = await db.careersModel.create(obj, { transaction });
        return submitCareer;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}



//FIND CANDIDATE By ID 
exports.findCandidateById = async (val) => {
    try {
        let career = await db.careersModel.findOne({ where: { career_id: val } });
        return career;
    } catch (e) {
        console.log(e);
    }
}

//GET ALL CAREER
exports.getAllCareer = async (req, res, next, queryOptions = {}) => {
    try {
        let allCareer = await db.careersModel.findAndCountAll(queryOptions);       
        return helper.getJsonParseData(allCareer);
    } catch (e) {
        console.log(e);
        throw e
    }
}




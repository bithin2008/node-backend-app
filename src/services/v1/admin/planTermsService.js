const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');

//FIND PLAN TERM BY ID
exports.findPlanTermById = async (val) => {
    try {
        let planTerm = await db.planTermsModel.findOne({ where: { plan_terms_id: val } });
        return planTerm?helper.getJsonParseData(planTerm):null;
    } catch (e) {
        console.log(e);
    }
}

//CREATE PLAN TERM
exports.createPlanTerm = async (obj, transaction) => {
    try {
        let createdPlanTerm = await db.planTermsModel.create(obj, { transaction });
        return createdPlanTerm;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}


//GET ALL PLAN TERMS
exports.getAllPlanTerms = async (queryOptions) => {
    try {
        let allPlanTerms = await db.planTermsModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(allPlanTerms)
    } catch (e) {
        console.log(e);
        throw e
    }
}

//GET ALL PROPERTY TYPES
exports.getAllPropertyTypes = async (req, res, next, queryOptions) => {
    try {
        let allPropertyType = await db.propertyTypesModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(allPropertyType)
    } catch (e) {
        console.log(e);
        throw e
    }
}

//DELETE PLAN TERM
exports.deletePlanTerm = async (val, ownerId) => {
    try {
        let deletePlanTerm = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.planTermsModel.update(
                { deleted_by: ownerId },
                { where: { plan_terms_id: val.plan_terms_id }, transaction: t }
            )


            deletePlanTerm = await db.planTermsModel.destroy({
                where: {
                    plan_terms_id: val.plan_terms_id
                }, transaction: t
            })
        });
        return deletePlanTerm;
    } catch (e) {
        console.log(e);
        // throw Error('Error while fetching User')
    }
}




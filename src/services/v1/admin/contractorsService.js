const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');


//CREATE CONTRACTOR
exports.createContractor = async (obj, transaction) => {
    try {
        let createdContractor = await db.contractorsModel.create(obj, { transaction });
        return createdContractor;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//CREATE CONTRACTOR Product
exports.createContractorProduct = async (obj, transaction) => {
    try {
        let createdContractorProduct = await db.contractorProductsModel.create(obj, { transaction });
        return createdContractorProduct;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//GET ALL CONTRACTOR
exports.getAllContractors = async (queryOptions = {}) => {
    try {
        let allContractor = await db.contractorsModel.findAndCountAll(queryOptions);       
        return helper.getJsonParseData(allContractor);
    } catch (e) {
        console.log(e);
        throw e
    }
}
//GET One CONTRACTOR
exports.getOneContractor = async (queryOptions = {}) => {
    try {
        let contractor = await db.contractorsModel.findOne(queryOptions);       
        return contractor?helper.getJsonParseData(contractor):contractor;
    } catch (e) {
        console.log(e);
        throw e
    }
}

//GET One CONTRACTOR
exports.updateContractor = async (obj,updateId, transaction) => {
    try {
        let result = await db.contractorsModel.update(obj,{ where: { contractor_id: updateId },transaction });
        return result[0] != 0 ? true : false;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//DELETE PRODUCT PROBLEM

exports.deleteContractorsProduct = async (contractor_id, org_id,transaction) => {
    try {
        let deleteProducts = '';
            deleteProducts = await db.contractorProductsModel.destroy({
                where: {
                    org_id:org_id,
                    contractor_id:contractor_id
                },force: true, transaction
            })
        return deleteProducts;
    } catch (e) {
        console.log(e);
        // throw Error('Error while fetching User')
    }
}




const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');


//FIND COMMISSION TYPE BY ID
exports.findCommissionTypeById = async (commission_type_id, queryOption = {}) => {
    try {
        let commissionType  = await db.commissionsMasterModel.findOne({ where: { commission_type_id: commission_type_id } });
        return helper.getJsonParseData(commissionType);
    } catch (e) {
        throw e
    }
}
//FIND POLICY WISE COMMISSION BY ID
exports.findPolicyWiseCommissionId = async (policy_wise_commission_id, queryOption = {}) => {
    try {
        let commissionType  = await db.policyWiseCommiosionModel.findOne({ where: { policy_wise_commission_id: policy_wise_commission_id } });
        return helper.getJsonParseData(commissionType);
    } catch (e) {
        throw e
    }
}



//FIND POLICY WISE COMMISSION BY ID
exports.findPolicyWiseCommissionById = async (policy_wise_commission_id, queryOption = {}) => {
    try {
        let policyWiseCommissionType  = await db.policyWiseCommiosionModel.findOne({ where: { policy_wise_commission_id: policy_wise_commission_id } });
        return helper.getJsonParseData(policyWiseCommissionType);
    } catch (e) {
        throw e
    }
}

//GET ALL COMMISSION TYPE
exports.getAllcommissionTypes = async (queryOptions) => {
    try {
        let allcommissionTypes = await db.commissionsMasterModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(allcommissionTypes)
    } catch (e) {
        throw e
    }
}

//GET ALL SALES COMMISSIONS
exports.getAllPolicyWiseSalesCommissions = async (queryOptions) => {
    try {
        let allSalesCommission = await db.policyWiseCommiosionModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(allSalesCommission)
    } catch (e) {
        throw e
    }
}

//CREATE COMMISSION TYPE
exports.createCommissionType = async (obj, transaction) => {
    try {
        let createdCommissionType = await db.commissionsMasterModel.create(obj, { transaction });
        return createdCommissionType;
    } catch (e) {
        throw e
    }
}





//DELETE COMMISSION TYPE
exports.deleteCommissionType = async (val, ownerId) => {
    try {
        let deleteCommissionType = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.commissionsMasterModel.update(
                { deleted_by: ownerId },
                { where: { commission_type_id: val.commission_type_id }, transaction: t }
            )


            deleteCommissionType = await db.commissionsMasterModel.destroy({
                where: {
                    commission_type_id: val.commission_type_id
                }, transaction: t
            })
        });
        return deleteCommissionType;
    } catch (e) {
        console.log(e);
        // throw Error('Error while fetching User')
    }
}

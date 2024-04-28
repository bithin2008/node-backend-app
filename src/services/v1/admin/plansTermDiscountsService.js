const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');

//FIND PLAN TERM DISCOUNT BY ID
exports.findPlanTermDiscountById = async (val) => {
    try {
        let planTermDiscount = await db.plansTermDiscountsModel.findOne({ where: { planterm_discount_id: val } });
        return planTermDiscount?helper.getJsonParseData(planTermDiscount):null;
    } catch (e) {
        console.log(e);
    }
}

//CREATE PLAN TERM DISCOUNT
exports.createPlanTermDiscount = async (obj, transaction) => {
    try {
        let createdPlanTermDiscount = await db.plansTermDiscountsModel.create(obj, { transaction });
        return createdPlanTermDiscount;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//GET ALL PLAN TERM DISCOUNT
exports.getAllPlanTermDiscounts = async (req, res, next, queryOptions) => {
    try {
        let getAllPlanTermDiscounts = await db.plansTermDiscountsModel.findAndCountAll(queryOptions)

               // allPayments = helper.getJsonParseData(allPayments);  
               getAllPlanTermDiscounts.rows = await Promise.all(getAllPlanTermDiscounts.rows.map(async (element) => {
                if (element.create_user_type == 2) {
                    element.created_user_info = await helper.getUserInfo(parseInt(element.created_by));
                }
                if (element.update_user_type == 2) {
                    element.updated_user_info = await helper.getUserInfo(parseInt(element.updated_by));
                }
                if (element.create_user_type == 3) {
                    // Handle create_user_type 3 if needed
                } 
                return element;
            }));
            return helper.getJsonParseData(getAllPlanTermDiscounts);
      //  return helper.getJsonParseData(getAllPlanTermDiscounts)
    } catch (e) {
        console.log(e);
        throw e
    }
}


//DELETE PLAN TERM DISCOUNT
exports.deletePlanTermDiscount = async (val, ownerId) => {
    try {
        let deletePlanTermDiscount = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.plansTermDiscountsModel.update(
                { deleted_by: ownerId },
                { where: { planterm_discount_id: val.planterm_discount_id }, transaction: t }
            )
            deletePlanTermDiscount = await db.plansTermDiscountsModel.destroy({
                where: {
                    planterm_discount_id: val.planterm_discount_id
                }, transaction: t
            })
        });
        return deletePlanTermDiscount;
    } catch (e) {
        console.log(e);
        // throw Error('Error while fetching User')
    }
}


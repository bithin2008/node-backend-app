require("dotenv").config();
const helper = require("../../../common/helper");
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index')
const moment = require("moment");
const bcrypt = require('bcryptjs');
const { Sequelize, Op } = require('sequelize');
const plansTermDiscountsService = require("../../../services/v1/admin/plansTermDiscountsService");

//const model =db.sequelize.models// Object.keys(db.sequelize.models);
/*****************************
 *  CREATE USER
 ******************************/
exports.createPlanTermDiscount = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();

    try {

        const data = {
            org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
            plan_term: req.body.planTerm ? req.body.planTerm : null,
            price_percentage: req.body.pricePercentage == 0 ? 0 : 1,
            active_status: parseInt(req.body.activeStatus),
            discount_value: req.body.activeStatus ? parseFloat(req.body.discountValue) : null,
            created_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
            updated_by: null,
            deleted_by: null

        };

        const createdPlanTermDiscount = await plansTermDiscountsService.createPlanTermDiscount(data, transaction);
        if (createdPlanTermDiscount) {
            transaction.commit();
            res.status(200).send({
                status: 1,
                message: "Plan Term discount created Successfully.",
            });
        } else {
            res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
        }
    } catch (error) {
        transaction.rollback()
        next(error);
    }
}


/*****************************
 *  GET ALL PLANS
 ******************************/
exports.getAllPlanTermDiscount = async (req, res, next) => {
    try {
        const sortField = req.query.sortField || 'planterm_discount_id'; // Default to 'org_user_id'
        const sortOrder = req.query.sortOrder || 'DESC';
        const searchingValue = req.query.search || '';
        const filterTerms = req.query.planTerm || '';
        const filterTermsQuery=filterTerms?{
             plan_term:filterTerms
        }:{};
        const searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    discount_value: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                }
            ],

        } : {};
        let queryOptions = {
            where: { ...searchQuery,...filterTermsQuery },
            attributes: { exclude: ['deleted_by', 'deleted_at'] },
            include: [
                {
                    model: db.orgUsersModel,
                    as: 'update_info',
                    attributes: ['first_name', 'last_name'],
                    required: false
                },
                {
                    model: db.orgUsersModel,
                    as: 'create_info',
                    attributes: ['first_name', 'last_name'],
                    required: false
                },
            ],
            order: [
                [sortField, sortOrder]
            ],
        };
        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }

        getAllPlanTermDiscounts = await plansTermDiscountsService.getAllPlanTermDiscounts(req, res, next, queryOptions);
        if (res.pagination) {
            res.pagination.total = getAllPlanTermDiscounts.count
            res.pagination.totalPages = Math.ceil(getAllPlanTermDiscounts.count / queryOptions.limit)
        }
        if (getAllPlanTermDiscounts.count > 0) {
            res.status(200).send({ status: 1, data: getAllPlanTermDiscounts.rows, pagination: res.pagination, message: 'Plan Term discoun list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: getAllPlanTermDiscounts.rows, pagination: res.pagination, message: 'No Plan Term discoun found' })
        }

    } catch (error) {
        next(error)
    }
}


/*****************************
 *  UPDATE PLAN
 ******************************/
exports.updatePlanTermDiscount = async (req, res, next) => {
    try {
        const { planterm_discount_id } = req.params;
        const owner_id = req.tokenData.org_user_id
        const planTermDiscountExists = await plansTermDiscountsService.findPlanTermDiscountById(parseInt(planterm_discount_id));
        if (planTermDiscountExists) {
            let planterm_discount_detail = {
                plan_term: req.body.planTerm ? req.body.planTerm : null,
                price_percentage: req.body.pricePercentage == 0 ? 0 : 1,
                active_status: parseInt(req.body.activeStatus),
                discount_value: req.body.activeStatus ? parseFloat(req.body.discountValue) : null,
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
                deleted_by: null
            }
            const transaction = await db.sequelize.transaction(async (t) => {
                await db.plansTermDiscountsModel.update(
                    { updated_by: owner_id },
                    { where: { planterm_discount_id: planterm_discount_id }, transaction: t })
                await db.plansTermDiscountsModel.update(planterm_discount_detail, { where: { planterm_discount_id: planterm_discount_id }, transaction: t })
                res.status(200).send({ status: 1, message: 'Plan term discount has been successfully updated.' })
            });
        } else {
            res.status(200).send({ status: 0, message: "Plan term discount not found" });
        }
    } catch (error) {
        next(error);
    }
}

/*****************************
 *  DELETE PLAN
 ******************************/

exports.deletePlanTermDiscount = async (req, res, next) => {
    try {
        const { planterm_discount_id } = req.params;
        const ownerId = req.tokenData.org_user_id
        const planTermDiscountExists = await plansTermDiscountsService.findPlanTermDiscountById(parseInt(planterm_discount_id));
        if (!planTermDiscountExists) {
            res.status(200).send({ status: 0, message: "Plan Term Discount not found" });
        } else {
            const deletePlanTermDiscount = await plansTermDiscountsService.deletePlanTermDiscount(planTermDiscountExists, ownerId);
            if (deletePlanTermDiscount) {
                res.status(200).send({ status: 1, message: 'Plan Term Discount deleted sucessfully.' });
            } else {
                res.status(200).send({ status: 0, message: 'Unable to delete Plan term.' });
            }
        }
    } catch (error) {
        next(error);
    }
}


/*****************************
 *  TOGGLE PRODUCTS STATUS
 ******************************/
exports.togglePlanTermDiscountStatus = async (req, res, next) => {
    try {
        const { planterm_discount_id } = req.params;
        const owner_id = req.tokenData.org_user_id
        const planTermDiscountExists = await plansTermDiscountsService.findPlanTermDiscountById(parseInt(planterm_discount_id));
        if (planTermDiscountExists) {
            let planterm_discount_detail = {
                active_status: parseInt(req.body.activeStatus),
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
            }
            const transaction = await db.sequelize.transaction(async (t) => {
                await db.plansTermDiscountsModel.update(
                    { updated_by: owner_id },
                    { where: { planterm_discount_id: planterm_discount_id }, transaction: t })

                await db.plansTermDiscountsModel.update(planterm_discount_detail, { where: { planterm_discount_id: planterm_discount_id }, transaction: t })
                res.status(200).send({ status: 1, message: `Plan Term Discount successfully ${req.body.activeStatus ? 'enabled' : 'disabled'}.` })
            });
        } else {
            res.status(200).send({ status: 0, message: "Sub Module not found" });
        }
    } catch (error) {
        next(error);
    }
}


/*****************************
 *  GET ALL PROPERTY TYPE
 ******************************/
exports.getAllPropertyType = async (req, res, next) => {
    try {
        let queryOptions = {
            attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
            order: [
                ['created_by', 'ASC']
            ],
        };
        allPropertyType = await planTermsService.getAllPropertyTypes(req, res, next, queryOptions);
        if (allPropertyType.count > 0) {
            res.status(200).send({ status: 1, data: allPropertyType.rows, message: 'Property Type found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allPropertyType.rows, message: 'No Property Type found' })
        }
    } catch (error) {
        next(error)
    }
}














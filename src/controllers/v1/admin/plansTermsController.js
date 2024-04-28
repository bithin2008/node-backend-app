require("dotenv").config();
const helper = require("../../../common/helper");
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index')
const moment = require("moment");
const bcrypt = require('bcryptjs');
const { Sequelize, Op } = require('sequelize');
const planTermsService = require("../../../services/v1/admin/planTermsService");

//const model =db.sequelize.models// Object.keys(db.sequelize.models);
/*****************************
 *  CREATE USER
 ******************************/
exports.createPlanTerm = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const data = {
            org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
            plan_id: req.body.planId ? parseInt(req.body.planId) : null,
            plan_term: req.body.planTerm ? req.body.planTerm : null,
            plan_term_month: req.body.planTermMonth ? parseInt(req.body.planTermMonth) : null,
            property_type_id: req.body.propertyType ? parseInt(req.body.propertyType) : null,
            price_below_5000_sqft: parseFloat(req.body.priceBelow5000Sqft),
            price_above_5000_sqft: parseFloat(req.body.priceAbove5000Sqft),
            min_price_above_5000_sqft: parseFloat(req.body.minPriceAbove5000Sqft),
            min_price_below_5000_sqft: parseFloat(req.body.minPriceBelow5000Sqft),
            bonus_month: parseFloat(req.body.bonusMonth),
            show_website:req.body.show_website,
            active_status: req.body.active_status,
            max_split_payment: parseFloat(req.body.max_split_payment),
            created_by: req.tokenData.user_id ? parseInt(req.tokenData.user_id) : null,
            updated_by: null,
            deleted_by: null
        };
        let isExistPlanTerm = await planTermsService.getAllPlanTerms({
            where:{
                plan_id: data.plan_id,
                org_id:req.tokenData.org_id,
                plan_term_month:data.plan_term_month,
                property_type_id:data.property_type_id
            }  
         })
         if (isExistPlanTerm.rows.length>0) {
            throw new CustomError(`Plan term is already exist with the same data`)
         }
        const createdPlanTerm = await planTermsService.createPlanTerm(data, transaction);
        if (createdPlanTerm) {
            transaction.commit();
            res.status(200).send({
                status: 1,
                message: "Plan Term created Successfully.",
            });
        } else {
            transaction.rollback()
            res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
        }
    } catch (error) {
        transaction.rollback()
        next(error);
    }
}


/*****************************
 *  GET PLANS
 ******************************/
exports.getPlansTerm = async (req, res, next) => {
    try {
    
        let result= await db.planTermsModel.findAll({
            attributes: ['plan_term', 'plan_term_month', 'plan_terms_id'], 
            group: ['plan_term', 'plan_term_month', 'plan_terms_id'], 
            raw: true, 
            order: [['plan_term_month', 'ASC']], 
        })
            if (result.length > 0) {
                const uniqueIds = new Set();
                const filteredArray = [];
                result =  await Promise.all(result.map(item=>{
                    const itemId = item.plan_term_month;
                    if (itemId !== undefined && !uniqueIds.has(itemId)) {
                    uniqueIds.add(itemId);
                    filteredArray.push(item);
                    }

                    return filteredArray;
            })
        );    
            res.status(200).send({ status: 1, data: filteredArray, pagination: res.pagination, message: 'Plan Term list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: result, pagination: res.pagination, message: 'No Plan Term found' })
        }
    } catch (error) {
        next(error)
    }
}
exports.getAllPlansTerm = async (req, res, next) => {
    try {
        const sortField = req.query.sortField || 'plan_terms_id'; // Default to 'org_user_id'
        const sortOrder = req.query.sortOrder || 'DESC';
        const searchingValue = req.query.search || '';

        let searchTimestamp =helper.searchTimeStamp(searchingValue)?helper.searchTimeStamp(searchingValue):{}

        let order;
        if (sortField === 'property_type_details.property_type') {
            order = [[{ model: db.propertyTypesModel, as: 'property_type_details' }, 'property_type', sortOrder]];
        } else if (sortField === 'plan_details.plan_name') {
            order = [[{ model: db.plansModel, as: 'plan_details' }, 'plan_name', sortOrder]];
        } else {
            // Default order when sortField doesn't match any associations
            order = [[sortField, sortOrder]];
        }
        const filterByPropertyType = req.query.property_type_id ? { property_type_id: req.query.property_type_id} : {};
        const filterByPlanName = req.query.plan_id ? {plan_id:req.query.plan_id } : {};
        const show_website = req.query.show_website ? { show_website: parseInt(req.query.show_website)==1?true:false } : {};


       const searchQuery = searchingValue ? {
              [Op.or]: [
                  {
                      plan_term: {
                          [Op.iLike]: `%${searchingValue}%`,
                      },
                  },
                  db.Sequelize.literal(`CAST("plan_term_month" AS TEXT) ILIKE '%${searchingValue}%'`),
                  db.Sequelize.literal(`CAST("price_above_5000_sqft" AS TEXT) ILIKE '%${searchingValue}%'`),
                  db.Sequelize.literal(`CAST("price_below_5000_sqft" AS TEXT) ILIKE '%${searchingValue}%'`),
                  {
                      // Search in the associated model columns
                      '$plan_details.plan_name$': {
                          [Op.iLike]: `%${searchingValue}%`,
                      },
                  },
                  {
                      // Search in the associated model columns
                      '$property_type_details.property_type$': {
                          [Op.iLike]: `%${searchingValue}%`,
                      },
                  },
  
              ],
              ...searchTimestamp
          } : {};
        let queryOptions = {
            where: { ...searchQuery,...filterByPropertyType,...filterByPlanName, ...show_website },
            attributes: { exclude: ['deleted_by', 'deleted_at'] },
            include: [
                {
                    model: db.plansModel,
                    as: 'plan_details',
                    attributes: ['plan_id', 'plan_name']
                },
                {
                    model: db.propertyTypesModel,
                    as: 'property_type_details',
                    attributes: ['property_type_id', 'property_type', 'property_icon']

                },
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
            order: order,
        };
        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }

        allPlanTerms = await planTermsService.getAllPlanTerms(queryOptions);
        if (res.pagination) {
            res.pagination.total = allPlanTerms.count
            res.pagination.totalPages = Math.ceil(allPlanTerms.count / queryOptions.limit)
        }
        if (allPlanTerms.count > 0) {
            res.status(200).send({ status: 1, data: allPlanTerms.rows, pagination: res.pagination, message: 'Plan Term list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allPlanTerms.rows, pagination: res.pagination, message: 'No Plan Term found' })
        }

    } catch (error) {
        next(error)
    }
}


/*****************************
 *  UPDATE PLAN
 ******************************/
exports.updatePlansTerm = async (req, res, next) => {
    try {
        const { plan_terms_id } = req.params;
        const owner_id = req.tokenData.org_user_id
        const planTermExists = await planTermsService.findPlanTermById(parseInt(plan_terms_id));
        if (planTermExists) {
            let planterm_detail = {
                plan_id: req.body.planId ? parseInt(req.body.planId) : null,
                plan_term: req.body.planTerm ? req.body.planTerm : null,
                plan_term_month: req.body.planTermMonth ? parseInt(req.body.planTermMonth) : null,
                property_type_id: req.body.propertyType ? parseInt(req.body.propertyType) : null,
                price_below_5000_sqft: parseFloat(req.body.priceBelow5000Sqft),
                price_above_5000_sqft: parseFloat(req.body.priceAbove5000Sqft),
                min_price_above_5000_sqft: parseFloat(req.body.minPriceAbove5000Sqft),
                min_price_below_5000_sqft: parseFloat(req.body.minPriceBelow5000Sqft),
                bonus_month: parseFloat(req.body.bonusMonth),
                show_website:req.body.show_website,
                active_status: req.body.active_status,
                max_split_payment: parseFloat(req.body.max_split_payment),
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
                deleted_by: null
            }
            let isExistPlanTerm = await planTermsService.getAllPlanTerms({
                where:{
                    [Op.not]: [{ plan_terms_id: plan_terms_id },],
                    plan_id: planterm_detail.plan_id,
                    org_id:req.tokenData.org_id,
                    plan_term_month:planterm_detail.plan_term_month,
                    property_type_id:planterm_detail.property_type_id
                }  
             })
             if (isExistPlanTerm.rows.length>0) {
                throw new CustomError(`Plan term is already exist with the same data`)
             }
            const transaction = await db.sequelize.transaction(async (t) => {
                // await db.planTermsModel.update(
                //     { updated_by: owner_id },
                //     { where: { plan_terms_id: plan_terms_id }, transaction: t })
                await db.planTermsModel.update(planterm_detail, { where: { plan_terms_id: plan_terms_id ,org_id:req.tokenData.org_id}, transaction: t })
                res.status(200).send({ status: 1, message: 'Plan term info successfully updated.' })
            });
        } else {
            res.status(200).send({ status: 0, message: "Plan term not found" });
        }
    } catch (error) {
        next(error);
    }
}

/*****************************
 *  DELETE PLAN
 ******************************/

exports.deletePlanTerm = async (req, res, next) => {
    try {
        const { plan_terms_id } = req.params;
        const ownerId = req.tokenData.org_user_id
        const planTermExists = await planTermsService.findPlanTermById(parseInt(plan_terms_id));
        if (!planTermExists) {
            res.status(200).send({ status: 0, message: "Plan term not found" });
        } else {
            const deletePlanTerm = await planTermsService.deletePlanTerm(planTermExists, ownerId);
            if (deletePlanTerm) {
                res.status(200).send({ status: 1, message: 'Plan term deleted sucessfully.' });
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
exports.togglePlanStatus = async (req, res, next) => {
    try {
        const { plan_id } = req.params;
        const owner_id = req.tokenData.org_user_id
        const planExists = await planService.findPlanById(parseInt(plan_id));
        if (planExists) {
            let plan_detail = {
                active_status: parseInt(req.body.activeStatus),
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
            }
            const transaction = await db.sequelize.transaction(async (t) => {
                await db.plansModel.update(
                    { updated_by: owner_id },
                    { where: { plan_id: plan_id }, transaction: t })

                await db.plansModel.update(plan_detail, { where: { plan_id: plan_id }, transaction: t })
                res.status(200).send({ status: 1, message: `Product successfully ${req.body.activeStatus ? 'enabled' : 'disabled'}.` })

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
                ['sequence', 'ASC']
            ],
            where:{
                active_status:1
            }
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











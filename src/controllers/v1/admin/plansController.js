require("dotenv").config();
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index')
const moment = require("moment");
const helper = require("../../../common/helper");
const url = require('url');
const querystring = require('querystring');
const { Op } = require("sequelize");
const planService = require("../../../services/v1/admin/planService");
const productService = require("../../../services/v1/admin/productService");

//const model =db.sequelize.models// Object.keys(db.sequelize.models);
/*****************************
 *  CREATE USER
 ******************************/
exports.createPlan = async (req, res, next) => {
    try {
        const transaction = await db.sequelize.transaction();
        const data = {
            plan_name: req.body.planName,
            org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
            max_price: parseFloat(req.body.maxPrice),
            product_id: req.body.productId,
            sequence:req.body.sequence,
            active_status: parseInt(req.body.activeStatus),
            created_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
            updated_by: null,
            deleted_by: null
        };

        const createdPlan = await planService.createPlan(data, transaction);
        if (createdPlan) {
            transaction.commit();
            res.status(200).send({
                status: 1,
                message: "Plan created Successfully.",
            });
        } else {
            res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
        }
    } catch (error) {
        next(error);
    }
}


/*****************************
 *  GET ALL PLANS
 ******************************/
exports.getAllPlans = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        const sortField = req.query.sortField || 'plan_id'; // Default to 'org_user_id'
        const sortOrder = req.query.sortOrder || 'DESC';
        let activeStatus = parsedQs.active_status ? parsedQs.active_status : ''; 
        const searchingValue = req.query.search || '';
        let searchTimestamp =helper.searchTimeStamp(searchingValue)?helper.searchTimeStamp(searchingValue):{}
      
        const searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    plan_name: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                db.Sequelize.literal(`CAST("max_price" AS TEXT) ILIKE '%${searchingValue}%'`),

            ],
            ...searchTimestamp,

        } : {};
        let queryOptions = {
            where: { ...searchQuery,},       
            attributes: { exclude: [ 'deleted_by', 'deleted_at',] },
            include:[
                {
                    model: db.orgUsersModel,
                    as: 'update_info',
                    attributes: ['first_name','last_name'],
                    required:false
                },
                {
                    model: db.orgUsersModel,
                    as: 'create_info',
                    attributes: ['first_name','last_name'],
                    required:false
                },
            ],
            order: [
                [sortField, sortOrder]
            ],
            distinct: true, 
        };

        if (activeStatus !== '') {
            queryOptions.where[Op.or] = [
                { active_status: activeStatus }
            ];
        }
        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }

        allPlans = await planService.getAllPlans(req, res, next, queryOptions);
        if(allPlans.rows.length>0){
            allPlans.rows.forEach((element, index) => {
                if (element.plan_id) {
                    allPlans.rows[index].product_list = []
                    let productIds = element.product_id.split(',');
                    productIds.forEach(async (item, indx) => {
                        let productDetails = await productService.findProductById(parseInt(item));
                        if (productDetails) {
                            allPlans.rows[index].product_list.push(productDetails);                                            
                        }
    
                      
                        if(productIds.length == (indx+1) && allPlans.rows.length == (index+1)){
                            if (res.pagination) {
                                res.pagination.total = allPlans.count
                                res.pagination.totalPages = Math.ceil(allPlans.count / queryOptions.limit)
                            }
                            if (allPlans.count > 0) {
                                res.status(200).send({ status: 1, data: allPlans.rows, pagination: res.pagination, message: 'Plan list found successfully' })
                            } else {
                                res.status(200).send({ status: 1, data: allPlans.rows, pagination: res.pagination, message: 'No Plan found' })
                            }
                        }
                    });
                }
            });
        }else{
            res.status(200).send({ status: 1, data: allPlans.rows,  message: 'No Plan found' })
        }
    } catch (error) {
        
        next(error)
    }
}


/*****************************
 *  GET ALL PLANS WITH TERM DETAILS
 ******************************/
exports.getAllPlansWithTermDetails = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);

        let activeStatus = parsedQs.active_status ? parsedQs.active_status : ''; 
        let queryOptions = {
            where: {},       
            include: [{
                model: db.planTermsModel,
                as: 'plan_term',
                where: { show_website: true }, // Add this line to filter by show_website
                attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
            }],
            attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
            order: [
                ['sequence', 'ASC']
            ],
        };

        if (activeStatus !== '') {
            queryOptions.where[Op.or] = [
                { active_status: activeStatus }
            ];
        }
      

        allPlans = await planService.getAllPlans(req, res, next, queryOptions);
        if(allPlans.rows.length>0){
            const promises = [];

            allPlans.rows.forEach((element, index) => {
                if (element.plan_id) {
                    allPlans.rows[index].product_list = [];
                    let productIds = element.product_id.split(',');
                    
                    const productPromises = productIds.map(async (item) => {
                        let productDetails = await productService.findProductById(parseInt(item));
                        if (productDetails) {
                            productDetails.product_image = productDetails.product_image?`${helper.api_baseurl}/org_file/hws_${req.tokenData ? req.tokenData.org_id : parseInt(req.headers.org_id)}/media_content/products/${productDetails.product_image}`:null;
                            allPlans.rows[index].product_list.push(productDetails);
                        }
                    });
            
                    promises.push(Promise.all(productPromises));
                  //  allPlans.rows[index].product_list.sort((a, b) => a.sequence - b.sequence);
                }
            });
            Promise.all(promises).then(() => {
                if (res.pagination) {
                    res.pagination.total = allPlans.count;
                    res.pagination.totalPages = Math.ceil(allPlans.count / queryOptions.limit);
                }
            
                if (allPlans.count > 0) {
                    res.status(200).send({
                        status: 1,
                        data: allPlans.rows,
                        pagination: res.pagination,
                        message: 'Plan list found successfully'
                    });
                } else {
                    res.status(200).send({
                        status: 1,
                        data: allPlans.rows,
                        pagination: res.pagination,
                        message: 'No Plan found'
                    });
                }
            }).catch(error => {
                console.error('Error:', error);
                // Handle error
            });
        }else{
            res.status(200).send({ status: 0, message: "Plans not found" });
        }

    } catch (error) {
        
        next(error)
    }
}



/*****************************
 *  UPDATE PLAN
 ******************************/
exports.updatePlan = async (req, res, next) => {
    try {
        const { plan_id } = req.params;
        const owner_id = req.tokenData.org_user_id
        const planExists = await planService.findPlanById(parseInt(plan_id));
        if (planExists) {
            let plan_detail = {
                plan_name: req.body.planName,
                org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
                max_price: parseFloat(req.body.maxPrice),
                sequence:req.body.sequence,
                product_id: req.body.productId,
                active_status: parseInt(req.body.activeStatus),
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
                deleted_by: null
            }
            const transaction = await db.sequelize.transaction(async (t) => {
                await db.plansModel.update(
                    { updated_by: owner_id },
                    { where: { plan_id: plan_id }, transaction: t })
                await db.plansModel.update(plan_detail, { where: { plan_id: plan_id }, transaction: t })
                res.status(200).send({ status: 1, message: 'Plan information has been successfully updated.' })
            });
        } else {
            res.status(200).send({ status: 0, message: "Product not found" });
        }
    } catch (error) {
        next(error);
    }
}

/*****************************
 *  DELETE PLAN
 ******************************/

exports.deletePlan = async (req, res, next) => {
    try {
        const { plan_id } = req.params;
        const ownerId = req.tokenData.org_user_id
        const planExists = await planService.findPlanById(parseInt(plan_id));
        if (!planExists) {
            res.status(200).send({ status: 0, message: "Plan not found" });
        } else {
            const deletePlan = await planService.deletePlan(planExists, ownerId);
            if (deletePlan) {
                res.status(200).send({ status: 1, message: 'Plan deleted sucessfully.' });
            } else {
                res.status(200).send({ status: 0, message: 'Unable to delete Plan.' });
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
                res.status(200).send({ status: 1, message: `Plan ${planExists.plan_name} successfully ${req.body.activeStatus==1 ? 'enabled' : 'disabled'}.` })

            });


        } else {
            res.status(200).send({ status: 0, message: "Plan not found" });
        }
    } catch (error) {
        next(error);
    }
}











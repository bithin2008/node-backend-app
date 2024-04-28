require("dotenv").config();
const helper = require('../../../common/helper');
const db = require('../../../models/index');
const { Op } = require("sequelize");
const CustomError = require("../../../utils/customErrorHandler");
const serviceCallFeesService = require("../../../services/v1/admin/serviceCallFeesService");
const url = require('url');
const querystring = require('querystring');

exports.getServiceCallFeesId = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        const sortField = req.query.sortField || 'scf_value'; // Default to 'scf_value'
        const sortOrder = req.query.sortOrder || 'DESC';
        let activeStatus = parsedQs.active_status ? parsedQs.active_status : '';
        const filterMonth = parsedQs.month ? { month:parsedQs.month } : {};

        // const searchingValue = req.query.search || '';
        // const searchQuery = searchingValue ? {
        //     [Op.or]: [
        //         {
        //             month: searchingValue,  
        //         },
        //         {
        //             scf_value: searchingValue,
        //         }  
        //     ],
        // } : {};

        let queryOptions = {
            where: {org_id:req.tokenData.org_id, ...filterMonth },
            attributes: { exclude: ['deleted_by', 'deleted_at'] },
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
        const result = await serviceCallFeesService.getAllServiceCallFees(queryOptions);  
        if (res.pagination) {
            res.pagination.total = result.count
            res.pagination.totalPages = Math.ceil(result.count / queryOptions.limit)
        }
        if (result.count > 0) {
            res.status(200).send({ status: 1, data: result.rows, pagination: res.pagination, message: 'Service call fees fetch successfully' })
        } else {
            res.status(200).send({ status: 1, data: result.rows, pagination: res.pagination, message: 'Service call fees not found' })
        }
    } catch (error) {
      console.log(error);
      next(error)
    }
}

exports.createAndUpdateSCF = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        let {month,scf_value,updateId}=req.body;
        if (!month && !scf_value) {
            throw new CustomError('Something went wrong.',400)
        }

       
        if (updateId) {
            const data = {   
                month: month,
                scf_value: scf_value,
            };
            const updateScf = await serviceCallFeesService.updateScf(data,updateId, transaction);
            if (updateScf) { 
                res.status(200).send({ status: 1, data: updateScf, message: "Service call fees Updated Successfully." });  
                transaction.commit();
            }else{
                res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
            }
        }else{
            let isExit =  await serviceCallFeesService.findScfByTermAndValue(month,scf_value);
            if (isExit) {
                    throw new CustomError('Value already exist.',400)
            }
            const data = {
                org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
                month: month,
                scf_value: scf_value,
                created_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
                updated_by: null,
                deleted_by: null
            };
            const createdScf = await serviceCallFeesService.createScf(data, transaction);
            if (createdScf) { 
                res.status(200).send({ status: 1, data: createdScf, message: "Service call fees Created Successfully." });  
                transaction.commit();
            }else{
                res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
            }
        }
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}


exports.updateScfStatus = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        let { updateId, active_status } = req.body;
        if (!updateId) {
            throw new CustomError('Something went wrong.', 400)
        }
        if (updateId) {
            const data = {
                active_status: active_status
            }
            const updateScf = await serviceCallFeesService.updateScf(data,updateId, transaction);
            if (updateScf) {
                res.status(200).send({ status: 1, data: updateScf, message: "Updated Successfully." });
                transaction.commit();
            } else {
                res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
            }
        }
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}
// exports.deleteBrand = async (req, res, next) => {
//     try {
//         const { product_brand_id } = req.params;
//         const ownerId = req.tokenData.org_user_id
//         const productBrand = await productBrandService.findProductBrandById(parseInt(product_brand_id));
//         if (!productBrand) {
//             res.status(200).send({ status: 0, message: "Brand not found" });
//         } else {
//             const deleteBrand = await productBrandService.deleteProductBrand(product_brand_id, ownerId);
//             if (deleteBrand) {
//                 res.status(200).send({ status: 1, message: 'Deleted sucessfully.' });
//             } else {
//                 res.status(200).send({ status: 0, message: 'Unable to delete.' });
//             }
//         }
//     } catch (error) {
//         next(error);
//     }
    
// }
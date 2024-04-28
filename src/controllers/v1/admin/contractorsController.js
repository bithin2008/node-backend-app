require("dotenv").config();
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index')
const moment = require("moment");
const helper = require("../../../common/helper");
const os = require('os');
const url = require('url');
const querystring = require('querystring');
const { Op } = require("sequelize");
const contractorsService = require("../../../services/v1/admin/contractorsService");
const contractorAssignedJobService = require("../../../services/v1/admin/contractorAssignedJobService");
const claimsService = require("../../../services/v1/admin/claimsService");
const createFolder = require("../../../middleware/createFolder")
const mailService = require("../../../services/v1/admin/mailService");
const mailConfig = require("../../../config/mailConfig");
//const model =db.sequelize.models// Object.keys(db.sequelize.models);
/*****************************
 *  CREATE CONTRACTOR
 ******************************/
exports.createContractor = async (req, res, next) => {
    try {
        const transaction = await db.sequelize.transaction();
        const data = {
            org_id: req.tokenData ? parseInt(req.tokenData.org_id) :  parseInt(req.headers.org_id),
            company_name: req.body.companyName,
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            email: req.body.emailId,
            mobile: req.body.mobileNo,
            company_phone: req.body.companyPhone,
            license_no: req.body.licenseNumber,
            address1: req.body.addressOne,
            zip: req.body.zipCode,
            state: req.body.state,
            city: req.body.city,
            contractor_count: req.body.contractorsNumber,
            service_location: req.body.serviceCity,
            radial_distance: parseFloat(req.body.radialDistance),
            service_call_fee: parseFloat(req.body.serviceCallFee),
            active_status: 0,
            ip_address: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
            device_id: helper.getDeviceId(req.headers['user-agent']),
            os_platform: os.platform(),
            user_agent: req.headers['user-agent'],
            create_user_type: req.body.createUserType,
            created_by: null,
            updated_by: null,
            deleted_by: null
        };
        let createdContractor = await contractorsService.createContractor(data, transaction);
        createdContractor = helper.getJsonParseData(createdContractor);
        if (createdContractor) {
            if (req.body.selectedServiceTypes.length > 0) {
                const promises = req.body.selectedServiceTypes.map(async prod => {
                    const prodData = {
                        contractor_id: createdContractor.contractor_id,
                        org_id: req.headers.org_id ? parseInt(req.headers.org_id) : null,
                        product_id: prod.product_id,
                        product_name: prod.product_name,
                        create_user_type: req.body.createUserType,
                        created_by: null,
                        updated_by: null,
                        deleted_by: null
                    };
                    const createdContractorProduct = await contractorsService.createContractorProduct(prodData, transaction);
                    return createdContractorProduct;
                });

                // Wait for all promises to resolve
                await Promise.all(promises);
            }
            if (!req.body.dontHaveLicense) {
                const folderPath = `./src/public/org_files/hws_${data.org_id}/contractors`; // Replace this with your folder path template
                let folderRes = await createFolder(folderPath);
            }
            // AUDIT TRAIL PAYLOAD
            let auditData = {
                customer_id: createdContractor.contractor_id,
                name: req.body.firstName + ' ' + req.body.lastName,
                email: req.body.emailId ? req.body.emailId : null,
                section: 'CONTRACTORS',
                table_name: 'hws_contractors',
                source: 0,
                row_id: createdContractor.contractor_id,
                create_user_type: 1,
                created_by: createdContractor.contractor_id,
                device_id: helper.getDeviceId(req.headers['user-agent']),
            }

            let dataObj = createdContractor
            dataObj.company_address = mailConfig.company_address,
            dataObj.company_phone = mailConfig.company_phone,
            dataObj.company_email = mailConfig.company_email,
            dataObj.company_copyright_year = mailConfig.company_copyright_year;
            dataObj.company_website = mailConfig.company_website;
            dataObj.company_website_link = mailConfig.company_website_link;
            dataObj.email_imageUrl =helper.email_imageUrl
            let mailTrigger = await mailService.triggerMail('newContractorTemp.ejs', dataObj, '', createdContractor.email, ' Welcome to First Premier Home Warranty, ' + req.body.firstName + ' ' + req.body.lastName);
            let mailTriggerForAdmin = await mailService.triggerMail('newContractorToAdminTemp.ejs', dataObj, '',helper.testMail, ' New Contractor contacted');
            if (mailTrigger && mailTriggerForAdmin) {
                transaction.commit();
                res.status(200).send({
                    status: 1,
                    data: createdContractor,
                    message: "Your details submitted successfully.",
                });
                auditData.description = 'contractor creation successfull from website';
                await helper.updateAuditTrail(auditData,req)
            }
        } else {
            res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
            auditData.description = 'contractor creation failed from website';
            await helper.updateAuditTrail(auditData,req)
        }
    } catch (error) {
        next(error);
    }
}

/*****************************
 *  UPLOAD BLOG IMAGE
 ******************************/
exports.uploadLicenseDoc = async (req, res, next) => {
    try {
        let licenseFile = null
        if (req.params.contractor_id) {
             org_id = helper.decodeCrypto(decodeURI(req.params.org_id));           
            if (req.file) {
                let data = {
                    license_doc: req.file.filename ? `${req.file.filename}` : null
                }
                let licenseRes = await db.contractorsModel.update(data,
                    { where: { contractor_id: req.params.contractor_id } }
                )
                if (licenseRes[0] == 1) {
                    res.status(200).send({ status: 1, message: 'License successfully uploaded ' })
                } else {
                    throw new CustomError('Failed to upload license.', 500)
                }
            } else {
                throw new CustomError('Something went wrong! The file could not be found.', 500)
            }
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}

exports.updateContractorStatus = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        let { contractor_id, active_status } = req.body;
        if (!contractor_id) {
            throw new CustomError('Something went wrong.', 400)
        }
        if (contractor_id) {
            const data = {
                active_status: active_status
            }
            const updateContractor = await contractorsService.updateContractor(data, contractor_id, transaction);
            if (updateContractor) {
                res.status(200).send({ status: 1, data: updateContractor, message: "Updated Successfully." });
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


exports.updateContractors = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { contractor_id } = req.body;
        const owner_id = req.tokenData.org_user_id;
        const contractorExists = await contractorsService.getOneContractor({where:{contractor_id:parseInt(contractor_id)}});
        if (contractorExists) {
            let contractor_details = {
                org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
                company_name: req.body.companyName?req.body.companyName:null,
                first_name: req.body.firstName?req.body.firstName:null,
                last_name: req.body.lastName?req.body.lastName:null,
                // email: req.body.emailId,
                mobile: req.body.mobileNo? req.body.mobileNo:null,
                company_phone: req.body.companyPhone?req.body.companyPhone:null,
                license_no: req.body.licenseNumber?req.body.licenseNumber:null,
                address1: req.body.address1?req.body.address1:null,
                zip: req.body.zipCode?req.body.zipCode:null,
                state: req.body.state?req.body.state:null,
                city: req.body.city?req.body.city:null,
                contractor_count: req.body.contractorsNumber,
                service_location: req.body.serviceCity?JSON.stringify(req.body.serviceCity):'',
                radial_distance: parseFloat(req.body.radialDistance),
                service_call_fee: parseFloat(req.body.serviceCallFee),
                active_status: req.body.active_status?1:0,
                // ip_address: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
                // device_id: helper.getDeviceId(req.headers['user-agent']),
                // os_platform: os.platform(),
                // user_agent: req.headers['user-agent'],
                update_user_type: req.tokenData.source == 0 ? 4 : 2,
                updated_by: owner_id,
            }
            const updateContractor = await contractorsService.updateContractor(contractor_details, contractor_id, transaction);
            if (updateContractor) {
                const deleteContractorProduct= await contractorsService.deleteContractorsProduct(contractor_id,req.tokenData.org_id,transaction)
                if (req.body.serviceTypes.length > 0) {
                    const promises = req.body.serviceTypes.map(async prod => {
                        const prodData = {
                            contractor_id: contractor_id,
                            org_id: req.tokenData.org_id,
                            product_id: prod.product_id,
                            product_name: prod.product_name,
                            create_user_type: req.body.createUserType,
                            created_by: null,
                            updated_by: null,
                            deleted_by: null
                        };
                        const createdContractorProduct = await contractorsService.createContractorProduct(prodData, transaction);
                        return createdContractorProduct;
                    });
    
                    // Wait for all promises to resolve
                    await Promise.all(promises);
                }
                res.status(200).send({ status: 1, data: updateContractor, message: "Contractor Updated Successfully." });
                transaction.commit();
            } else {
                res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
            }
          
        }
    } catch (error) {
        transaction.rollback()
        next(error)
    }
}

/*****************************
 *  GET ALL CONTRACTOR
 ******************************/
exports.getAllContractors = async (req, res, next) => {
    try {
        // Extract the search term from the query parameters
        const searchingValue = req.query.search || '';
        // Construct the search query
        let nameQueryForSearch = searchingValue ? searchingValue.trim().split(" ") : [];
        let firstName = nameQueryForSearch[0]?.trim();
        let lastName = nameQueryForSearch[1]?.trim();
        const searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    first_name: {
                        [Op.iLike]: `%${firstName}%`,
                    },
                },
                {
                    last_name: {
                        [Op.iLike]: `%${lastName ? lastName : firstName}%`,
                    },
                },
                {
                    email: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    mobile: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    company_name: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    zip: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    state: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    city: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    service_location: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                }
                // Add more columns here for searching
            ],

        } : {};

        const sortField = req.query.sortField || 'created_at'; // Default to 'created_at'
        const sortOrder = req.query.sortOrder || 'ASC'; // Default to ascending order      
        const active_status= req.query.active_status?{active_status:req.query.active_status}:{}
        const service_location= req.query.service_location?{service_location:{ [Op.iLike]: `%${req.query.service_location}%`}}:{}
        const product_id= req.query.product_id?{product_id:req.query.product_id}:{}
        const queryOptions = {
            attributes: { exclude: ['deleted_by', 'deleted_at', 'user_agent', 'device_id', 'ip_address',] },
            where: {
                org_id:req.tokenData.org_id,
                ...searchQuery,
                ...active_status,
                ...service_location,
               
            },
            include:[
                {
                    model: db.contractorProductsModel,
                    as: 'contractor_product_list',
                    attributes: { exclude: ['created_at', 'deleted_at', 'deleted_by'] },
                    where:{
                        ...product_id
                    }
                },
            ],
            order: [
                [sortField, sortOrder],
            ],
            distinct: true,
        };
        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }
        let allContractors = await contractorsService.getAllContractors(queryOptions);
        allContractors.rows.forEach(element => {
            element.license_url = element.license_doc ? `${helper.api_baseurl}/org_file/hws_${req.tokenData ? parseInt(req.tokenData.org_id) : null}/contractors/${element.license_doc}` : null
        });
        if (res.pagination) {
            res.pagination.total = allContractors.count
            res.pagination.totalPages = Math.ceil(allContractors.count / queryOptions.limit)
        }
        if (allContractors.count > 0) {
            res.status(200).send({ status: 1, data: allContractors.rows, pagination: res.pagination, message: 'Contractors list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allContractors.rows, pagination: res.pagination, message: 'No Contractors found' })
        }
    } catch (error) {
        next(error)
    }
}



/*****************************
 *  GET Claim WISE ASSIGN JOB
 ******************************/
exports.getclaimWiseAssignjobs = async (req, res, next) => {
    try {
     const {claim_id} = req.params
        const sortField = req.query.sortField || 'created_at'; // Default to 'created_at'
        const sortOrder = req.query.sortOrder || 'ASC'; // Default to ascending order      
        const queryOptions = {
            attributes: { exclude: ['deleted_by', 'deleted_at', ] },
            where: {
               claim_id:claim_id,
               org_id:req.tokenData.org_id
            },
            include:[
                {
                    model: db.claimsModel,
                    as: 'claim_details',
                    attributes: { exclude: ['created_at', 'deleted_at', 'deleted_by'] }
                },
                {
                    model: db.contractorsModel,
                    as: 'contractor_details',
                    attributes: { exclude: ['created_at', 'deleted_at', 'deleted_by'] }
                },
            ],
            order: [
                [sortField, sortOrder],
            ],
            // logging: console.log,
        };
        // Check if 'limit' and 'offset' are provided in the request query       
        let allAssignedJobs = await contractorAssignedJobService.getAllAssignedJobs(queryOptions);
      
       
        if (allAssignedJobs.length > 0) {
            res.status(200).send({ status: 1, data: allAssignedJobs, pagination: res.pagination, message: 'Contractors assigned job list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allAssignedJobs, pagination: res.pagination, message: 'No Contractors assigned job found' })
        }
    } catch (error) {
        next(error)
    }
}


/*****************************
 *  GET CONTRACTOR ASSIGN JOB
 ******************************/
exports.getContractorAssignjobs = async (req, res, next) => {
    try {
     const {contractor_id} = req.params
        const sortField = req.query.sortField || 'created_at'; // Default to 'created_at'
        const sortOrder = req.query.sortOrder || 'ASC'; // Default to ascending order      
        const queryOptions = {
            attributes: { exclude: ['deleted_by', 'deleted_at', ] },
            where: {
               contractor_id:contractor_id,
               org_id:req.tokenData.org_id
            },
            include:[
                {
                    model: db.contractorAssignedJobModel,
                    as: 'assign_jobs',
                    attributes: { exclude: ['created_at', 'deleted_at', 'deleted_by'] },
                    include:[
                        {
                            model: db.claimsModel,
                            as: 'claim_details',
                            attributes: ['ticket_no','claim_id'],
                            include:[
                                {
                                    model: db.productsModel,
                                    as: 'product_details',
                                    attributes: ['product_name'],
                                },
                                {
                                    model: db.policiesModel,
                                    as: 'policy_details',
                                    attributes: ['policy_number','customer_id'],
                                },
                        ]
                        },
                    ]
                },
                {
                    model: db.contractorProductsModel,
                    as: 'contractor_product_list',
                    attributes: { exclude: ['created_at', 'deleted_at', 'deleted_by'] }
                },
            ],
            order: [
                [sortField, sortOrder],
            ],
            // logging: console.log,
        };
        // Check if 'limit' and 'offset' are provided in the request query       
        let result = await contractorsService.getOneContractor(queryOptions);
        result.assign_jobs = await Promise.all(result?.assign_jobs?.map(async (element) => {

            // if (element.create_user_type == 2) {
               element.created_user_info = await helper.getUserInfo(parseInt(element.created_by));
            // }
            // if (element.update_user_type == 2) {
            //     element.updated_user_info = await helper.getUserInfo(parseInt(element.updated_by));
            // }
            // if (element.create_user_type == 1) {
            //     // Handle create_user_type 3 if needed
            //     element.created_user_info = {
            //         customer_id: element.customer_id,
            //         first_name: element.first_name,
            //         last_name: element.last_name,
            //     }
            // }
          
            await contractorAssignedJobService.getContractorObjectFlagsName(element);
            return element;

        }));
        if (result.create_user_type == 4) {
            // Handle create_user_type 3 if needed
            result.created_user_info = {
                contractor_id: result.contractor_id,
                first_name: result.first_name,
                last_name: result.last_name,
            }
        }
        if (result.update_user_type == 2) {
            result.updated_user_info = await helper.getUserInfo(parseInt(result.updated_by));
        }
        if (result) {
            res.status(200).send({ status: 1, data: result, pagination: res.pagination, message: 'Contractors assigned job list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: result, pagination: res.pagination, message: 'No Contractors assigned job found' })
        }
    } catch (error) {
        next(error)
    }
}


/*****************************
 *  CREATE Assign Job Contractor
 ******************************/
exports.assignJob = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const {contractor_id}= req.params
        let contractorDetails= await contractorsService.getOneContractor({where:{contractor_id}})
        let payload=req.body
        const queryOptions = {
            //  attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'updated_at', 'deleted_at', 'user_agent', 'device_id', 'ip_address', 'password'] },
            where: {
                org_id: req.tokenData.org_id,
                claim_id: payload.claim_id
            },
            include: [
                {
                    model: db.productsModel,
                    as: 'product_details',
                    attributes: { exclude: ['created_at', 'deleted_at', 'deleted_by'] }
                },
                {
                    model: db.policiesModel,
                    as: 'policy_details',
                    attributes: ['first_name', 'policy_id', 'plan_terms_id', 'last_name', 'email', 'mobile', 'policy_number', 'billing_address1', 'billing_city', 'billing_state', 'billing_zip'],
                },
            ],
            distinct: true,
        };
        let claimDetails = await claimsService.getClaimDetails(queryOptions);

        if (!contractorDetails || !claimDetails) {
            throw new CustomError(`Something went wrong, contractor or claim information not found.`,400)
        }
        let assignJobData={
            org_id:req.tokenData.org_id,
            contractor_id:contractor_id,
            claim_id:payload.claim_id,
            create_user_type:1,//admin-user =>1,
            created_by:req.tokenData.org_user_id,
            job_assigned_date:new Date()
        }
        let checkAlreadyAssigned = await contractorAssignedJobService.getAllAssignedJobs({where:{org_id:req.tokenData.org_id,claim_id:payload.claim_id }})
        let assignJob=null
        if (checkAlreadyAssigned.length>0) {   
            assignJob= await contractorAssignedJobService.updateAssignedJob(req.tokenData.org_id,checkAlreadyAssigned[0].contractors_assigned_job_id,assignJobData,transaction);
        }else{
             assignJob= await contractorAssignedJobService.createJob(assignJobData,transaction);
        }
       let updateClaim= await claimsService.updateClaim( payload.claim_id,{claim_ticket_statuses_id:5,update_user_type:2,updated_by:req.tokenData.org_id},transaction); //5=>Dispatched
        if (assignJob) {
            transaction.commit();
            let dataObj = {
                company_name:contractorDetails.company_name,
                customer_email: claimDetails.policy_details.email,
                first_name: claimDetails.policy_details.first_name ,
                last_name:claimDetails.policy_details.last_name,
                customer_phone:claimDetails.policy_details.mobile,
                claim_no: claimDetails.ticket_no,
                policy_number:claimDetails.policy_details.policy_number,
                product_name:claimDetails.product_details.product_name,
                billing_address1:claimDetails.policy_details.billing_address1,
                billing_zip:claimDetails.policy_details.billing_zip,
                billing_city:claimDetails.policy_details.billing_city,
                billing_state:claimDetails.policy_details.billing_state,
                pcf:claimDetails.pcf,
                email_imageUrl:helper.email_imageUrl
            }
            dataObj.company_address = mailConfig.company_address;
            dataObj.company_phone = mailConfig.company_phone;
            dataObj.company_email = mailConfig.company_email;
            dataObj.company_copyright_year = mailConfig.company_copyright_year;
            dataObj.company_website = mailConfig.company_website;
            dataObj.company_website_link = mailConfig.company_website_link;
            let clientEmail = process.env.NODE_ENV == 'prod' ? [helper.clientMail] : []
            let mailTrigger = await mailService.triggerMail('claimAssignedContractor.ejs', dataObj, '',contractorDetails.email, 'Claim Assigned Successfully','', [], clientEmail);
            if (mailTrigger) {
                res.status(200).send({ status: 1, message: "Claim Assigned Successfully.", });
            } else {
                res.status(200).send({ status: 1, message: `The mail server could not deliver mail to ${contractorDetails.email}. Please check your email id` })
            }

        }
    } catch (error) {
        transaction.rollback()
        next(error);
    }
}


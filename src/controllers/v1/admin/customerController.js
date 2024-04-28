const db = require('../../../models/index');
const customerService = require("../../../services/v1/admin/customerService");
const CustomError = require('../../../utils/customErrorHandler');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const path = require("path");
const ejs = require('ejs');
const moment = require('moment');
const os = require('os');
const { Op, where } = require("sequelize");
const jwt = require('jsonwebtoken');
const DeviceDetector = require('node-device-detector');
const mailService = require("../../../services/v1/admin/mailService");
const paymentService = require("../../../services/v1/admin/paymentService");
const policyService = require("../../../services/v1/admin/policyService");
const userService = require("../../../services/v1/admin/userService");
const url = require('url');
const querystring = require('querystring');
const ExcelJS = require('exceljs');
const policyDocumentService = require("../../../services/v1/admin/policyDocumentService");
const policyNoteService = require("../../../services/v1/admin/policyNoteService");
const securePaymentsService = require("../../../services/v1/admin/securePaymentsService");
const customerCardService = require("../../../services/v1/admin/customerCardService");
const mailConfig = require('../../../config/mailConfig');
var ApiContracts = require('authorizenet').APIContracts;
/*****************************
 *  GET ALL CUSTOMERS
 ******************************/
exports.getAllCustomers = async (req, res, next) => {
    try {
        let roleBasedCondition = helper.generateRoleBasedCondition(req.tokenData)

        //console.log('roleBasedCondition', roleBasedCondition);
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        let advanceSearchFields = ['full_name', 'email', 'mobile', 'zip', 'state', 'city', 'address1', 'created_from', 'created_to',]
        parsedQs = helper.convertStringsToNumbers(parsedQs)
        // console.log(parsedQs);

        let advancedSearchQuery = helper.advanceSerachQueryGenrator(parsedQs, advanceSearchFields)
        if (!parsedQs.created_from) {
            if (req.tokenData.user_role_id == helper.userRole.sales_representative) {
                const currentDate = new Date();

                // Generate WHERE condition for created_at >= currentDate
                const created_at_gte = {
                    created_at: {
                        [Op.gte]: helper.getStartOfDay(currentDate)// start date of day 
                    }
                };

                // Generate WHERE condition for created_at <= currentDate
                const created_at_lte = {
                    created_at: {
                        [Op.lte]: helper.getEndOfDay(currentDate)// End  date of day 
                    }
                };
                advancedSearchQuery[Op.and].push(created_at_gte);
                advancedSearchQuery[Op.and].push(created_at_lte);
            }
        }

        //console.log(advancedSearchQuery);
        // return
        // Extract the search term from the query parameters
        const searchingValue = req.query.search || '';
        let nameQueryForSearch = searchingValue ? searchingValue.trim().split(" ") : [];
        let firstName = nameQueryForSearch[0]?.trim();
        let lastName = nameQueryForSearch[1]?.trim();
        // Construct the search query
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
                        [Op.like]: `%${searchingValue}%`,
                    },
                },
                {
                    mobile: {
                        [Op.like]: `%${searchingValue}%`,
                    },
                },
                {
                    alternate_phone: {
                        [Op.like]: `%${searchingValue}%`,
                    },
                },
                {
                    zip: {
                        [Op.like]: `%${searchingValue}%`,
                    },
                },
                {
                    state: {
                        [Op.like]: `%${searchingValue}%`,
                    },
                },
                {
                    city: {
                        [Op.like]: `%${searchingValue}%`,
                    },
                },
                {
                    address1: {
                        [Op.like]: `%${searchingValue}%`,
                    },
                }

                // Add more columns here for searching
            ],

        } : {};
        const activeStatus = req.query.active_status ? { active_status: parseInt(req.query.active_status) } : {};
        const sortField = req.query.sortField || 'created_at'; // Default to 'created_at'
        const sortOrder = req.query.sortOrder || 'ASC'; // Default to ascending order
        const queryOptions = {
            attributes: { exclude: ['deleted_by', 'deleted_at', 'user_agent', 'device_id', 'ip_address', 'password'] },
            where: {
                ...roleBasedCondition,
                ...searchQuery,
                ...activeStatus,
                ...advancedSearchQuery,
            },
            include: [
                {
                    model: db.policiesModel,
                    as: 'policy_list',
                    attributes: ['policy_id', 'policy_number']
                },
                {
                    model: db.claimsModel,
                    as: 'claim_list',
                    attributes: ['claim_id', 'ticket_no',]
                },
            ],
            order: [
                [sortField, sortOrder],
            ],
            distinct: true,
            // logging: console.log
        };


        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }
        let allCustomers = await customerService.getAllCustomers(queryOptions);
        if (allCustomers.rows) {
            allCustomers.rows = await Promise.all(allCustomers.rows.map(async (element) => {
                if (element.create_user_type == 2) {
                    element.created_user_info = await helper.getUserInfo(parseInt(element.created_by));
                }
                if (element.create_user_type == 3) {
                    element.created_user_info = await helper.getRealtorInfo(parseInt(element.created_by));
                }
                if (element.update_user_type == 2) {
                    element.updated_user_info = await helper.getUserInfo(parseInt(element.updated_by));
                }
                if (element.create_user_type == 1) {
                    // Handle create_user_type 3 if needed
                    element.created_user_info = {
                        customer_id: element.customer_id,
                        first_name: element.first_name,
                        last_name: element.last_name,
                    }
                }

                if (element.source == 0  && element.create_user_type==1) {
                    element.source_details = 'Self Customer'
                } else if (element.source == 1) {
                    element.source_details = 'Backend Team'
                } else if (element.source == 0 && element.create_user_type==3 ) {
                    element.source_details = 'RE PROS'
                }
            return element;
            }));
        }

        if (res.pagination) {
            res.pagination.total = allCustomers.count
            res.pagination.totalPages = Math.ceil(allCustomers.count / queryOptions.limit)
        }
        if (allCustomers.count > 0) {
            res.status(200).send({ status: 1, data: allCustomers.rows, pagination: res.pagination, message: 'Customers list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allCustomers.rows, pagination: res.pagination, message: 'No Customers found' })
        }
    } catch (error) {
        next(error)
    }
}

exports.updateCustomer = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { customer_id } = req.params;
        let isExist = await customerService.findCustomerById(customer_id);
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'ADMIN_PORTAL_CUSTOMERS',
            table_name: 'hws_customers',
            source: 1,
            create_user_type: 2,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }

        if (isExist) {
            let customerData = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                mobile: req.body.mobile,
                alternate_phone: req.body.alternate_phone,
                zip: req.body.zip,
                state: req.body.state,
                city: req.body.city,
                address1: req.body.address1,
                address2: req.body.address2,
                active_status: req.body.active_status,
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
                update_user_type: req.tokenData.source == 0 ? 1 : 2
            };
            auditData.customer_id = isExist.customer_id;
            auditData.user_id = req.tokenData.org_user_id;
            auditData.row_id = customerData.customer_id;
            auditData.created_by = req.tokenData.org_user_id;
            let updatedData = [];
            updatedData = await modifiedFieldValue(isExist, customerData);
            let updateRes = await customerService.updateCustomer(customer_id, customerData, transaction);
            transaction.commit();
            if (updateRes) {
                auditData.description = null;
                if (updatedData.length > 0) {
                    let descriptions = [];
                    updatedData.forEach((item, index) => {
                        descriptions.push(`${item.field} value changed ${item.old_val} to ${item.new_val}`);
                    });
                    auditData.description = descriptions.join(', ') + ' from admin portal';
                    await helper.updateAuditTrail(auditData, req);
                }
                res.status(200).send({ status: 1, message: `Customer details has been successfully updated.` })
            } else {
                auditData.description = `unable to update customer details from admin portal`;
                await helper.updateAuditTrail(auditData, req);
                transaction.rollback();
                throw new CustomError(`It briefly explains that there was an issue with updating customer details.`, 400)

            }
        } else {
            throw new CustomError(`Customer not found.`)
        }
    } catch (error) {
        transaction.rollback()
        next(error)
    }
}

function modifiedFieldValue(oldData, newData) {
    let fieldArray = [];
    for (const property in newData) {
        for (const isExistProperty in oldData) {
            if (property == isExistProperty) {
                if (newData[property] != oldData[isExistProperty]) {
                    let properFieldName = null;
                    if (property == 'first_name') {
                        properFieldName = 'First name';
                    }
                    if (property == 'last_name') {
                        properFieldName = 'Last name';
                    }
                    if (property == 'mobile') {
                        properFieldName = 'Mobile number';
                    }
                    if (property == 'zip') {
                        properFieldName = 'Zipcode';
                    }
                    if (property == 'address1') {
                        properFieldName = 'Address';
                    }
                    if (properFieldName) {
                        fieldArray.push({ field: properFieldName, old_val: oldData[isExistProperty], new_val: newData[property] });
                    }
                    // fieldArray.push({ field: properFieldName, old_val: oldData[isExistProperty], new_val: newData[property] });
                }
            }
        }
    }
    return fieldArray;
}
exports.createCustomerPolicyNotes = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { customer_id } = req.params
        const org_user_id = req.tokenData.org_user_id;
        let payload = req.body
        //console.log(payload);
        const existingPolicy = await policyService.findPolicyByPolicyId(payload.policy_id)
        if (!existingPolicy) {
            throw new CustomError(`Policy information not found`, 404)
        }
        let policyNoteData = {
            policy_id: payload.policy_id,
            customer_id: customer_id,
            org_id: req.tokenData.org_id,
            notes: payload.notes ? payload.notes : null,
            policy_number: existingPolicy.policy_number,
            note_type: 0, //policy level notes=>0, claim level note=>1
            create_user_type: 2,
            created_by: org_user_id
        }
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'ADMIN_PORTAL',
            customer_id: existingPolicy.customer_id,
            table_name: 'hws_policy_notes',
            source: 1,
            create_user_type: 2,
            created_by: org_user_id,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        if (payload.assign_to != '' || payload.assign_to != null) {
            policyNoteData.assign_to_org_user_id = payload.assign_to
        }
        const createdPolicyNotes = await policyNoteService.createpolicyNotes(policyNoteData, transaction);
        if (policyNoteData.assign_to_org_user_id) {
            let assgineeUserInfo = await userService.findUserById(policyNoteData.assign_to_org_user_id)
            let noteCreatedByUserInfo = await userService.findUserById(policyNoteData.created_by)
            if (assgineeUserInfo) {
                let dataObj = {
                    name: `${assgineeUserInfo.first_name} ${assgineeUserInfo.last_name}`,
                    notes: createdPolicyNotes.notes,
                    policy_number: existingPolicy.policy_number,
                    created_by: `${noteCreatedByUserInfo.first_name} ${noteCreatedByUserInfo.last_name}`,
                    created_at: moment(createdPolicyNotes.created_at).format('MM-DD-YYYY'),
                    email_imageUrl: helper.email_imageUrl
                }
                dataObj.company_address = mailConfig.company_address,
                    dataObj.company_phone = mailConfig.company_phone,
                    dataObj.company_email = mailConfig.company_email,
                    dataObj.company_copyright_year = mailConfig.company_copyright_year;
                dataObj.company_website = mailConfig.company_website;
                dataObj.company_website_link = mailConfig.company_website_link;
                let clientEmail = process.env.NODE_ENV == 'prod' ? [helper.clientMail] : []
                let mailTrigger = await mailService.triggerMail('assgineeTaskNoteTemp.ejs', dataObj, '', assgineeUserInfo.email, 'Attention! A New Task Has Been Assgined, ', '', [], clientEmail);
            }


        }
        transaction.commit();
        if (createdPolicyNotes) {
            auditData.row_id = createdPolicyNotes.policy_note_id;
            auditData.description = `policy note added against policy number ${existingPolicy.policy_number} from admin portal`;
            await helper.updateAuditTrail(auditData, req);
            res.status(200).send({ status: 1, message: "Policy Note created successfully." });
        } else {
            auditData.description = `unable to add policy note against policy number ${existingPolicy.policy_number} from admin portal`;
            await helper.updateAuditTrail(auditData, req);
            res.status(200).send({ status: 0, message: "The creation of the policy note failed." });
        }
    } catch (error) {
        transaction.rollback()
        next(error)
    }
}
exports.getCustomerPolicyNotes = async (req, res, next) => {
    try {

        const sortField = req.query.sortField || 'created_at'; // Default to 'created_at'
        const sortOrder = req.query.sortOrder || 'DESC'; // Default to ascending order
        const { customer_id } = req.params;
        let note_type = req.query.note_type ? { note_type: parseInt(req.query.note_type) } : {};

        let queryOptions = {
            where: {
                org_id: req.tokenData.org_id,
                ...note_type,
                customer_id: customer_id
            },
            include: [{
                model: db.policiesModel,
                as: 'policy_details'
            }],
            order: [
                [sortField, sortOrder],

            ],
        }
        let noteData = await policyNoteService.getAllPolicyNotes(queryOptions);
        //console.log(noteData.rows);
        if (noteData.rows.length > 0) {
            noteData = await Promise.all(noteData.rows.map(async (element) => {
                if (element.create_user_type == 2) {
                    element.created_user_info = await helper.getUserInfo(parseInt(element.created_by));
                }
                if (element.update_user_type == 2) {
                    element.updated_user_info = await helper.getUserInfo(parseInt(element.updated_by));
                }
                if (element.create_user_type == 1) {
                    // Handle create_user_type 3 if needed
                    element.created_user_info = {
                        customer_id: element.customer_id,
                        first_name: element.first_name,
                        last_name: element.last_name,
                    }
                }

                let data = await policyService.getPolicyObjectFlagsName(element.policy_details);
                //console.log(data);
                element.policy_details = data;
                return element;
            }));
        }
        res.status(200).send({ status: 1, data: noteData ? noteData : [], message: "Policy Note data fetched successfully." });
    } catch (error) {
        next(error);
    }
}
/*****************************
 * UPDATE CUSTOMER ACTIVE STATUS
 ******************************/
exports.updateCustomerActiveStatus = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { customer_id } = req.params;
        let isExist = await customerService.findCustomerById(customer_id);
        if (isExist) {
            const customerData = {
                active_status: parseInt(req.body.active_status),
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
            };
            let updateRes = await customerService.updateCustomer(customer_id, customerData, transaction);
            if (updateRes) {
                transaction.commit();
                res.status(200).send({ status: 1, message: `Customer ${isExist.first_name} ${isExist.last_name} successfully ${req.body.active_status == 1 ? 'enabled' : 'disabled'}.` });
            } else {
                res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
            }
        } else {
            throw new CustomError(`Customer not found.`)
        }
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}
exports.createCustomerPolicyDocument = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { customer_id } = req.params
        const org_user_id = req.tokenData.org_user_id;
        if (!req.file) {
            throw new CustomError('The document file could not be found.', 400)
        }

        var policy_doc = req.file.filename ? `${req.file.filename}` : null
        req.body.policy_doc = policy_doc
        let payload = req.body
        let policyDocumentData = {
            policy_id: payload.policy_id,
            org_id: req.tokenData.org_id,
            customer_id: customer_id,
            title: payload.title,
            document: payload.policy_doc ? payload.policy_doc : null,
            file_extension: helper.getFileExtension(payload.policy_doc),
            create_user_type: 2,
            created_by: org_user_id

        }
        const existingPolicy = await policyService.findPolicyByPolicyId(payload.policy_id)
        if (!existingPolicy) {
            throw new CustomError(`Policy information not found`, 404)
        }
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'ADMIN_PORTAL',
            customer_id: customer_id,
            table_name: 'hws_policy_documents',
            source: 1,
            create_user_type: 2,
            created_by: org_user_id,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        const createpolicyDocument = await policyDocumentService.createpolicyDocument(policyDocumentData, transaction);
        transaction.commit();
        if (createpolicyDocument) {
            auditData.row_id = createpolicyDocument.policy_document_id;
            auditData.description = `policy document uploaded against policy number ${existingPolicy.policy_number} from admin portal`;
            await helper.updateAuditTrail(auditData, req);
            res.status(200).send({ status: 1, message: "Policy Uploaded successfully." });
        } else {
            auditData.description = `failed upload policy document against policy number ${existingPolicy.policy_number} from admin portal`;
            await helper.updateAuditTrail(auditData, req);
            res.status(200).send({ status: 0, message: "The Upload of the policy document failed." });
        }
    } catch (error) {
        transaction.rollback()
        next(error)
    }
}
exports.getCustomerPolicyDocuments = async (req, res, next) => {
    try {
        const sortField = req.query.sortField || 'created_at'; // Default to 'created_at'
        const sortOrder = req.query.sortOrder || 'DESC'; // Default to ascending order
        const { customer_id } = req.params;
        const queryOptions = {
            where: { customer_id },
            include: [
                {
                    model: db.policiesModel,
                    as: 'policy_details',
                    attributes: ['policy_id', 'policy_number', 'policy_status','is_anamaly']
                },
            ],
            order: [
                [sortField, sortOrder],

            ],
        }

        let policyDocument = await policyDocumentService.getAllpolicyDocuments(customer_id, queryOptions);
        if (policyDocument.length > 0) {
            policyDocument = await Promise.all(policyDocument.map(async (element) => {
                if (element.create_user_type == 2) {
                    element.created_user_info = await helper.getUserInfo(parseInt(element.created_by));
                }
                if (element.update_user_type == 2) {
                    element.updated_user_info = await helper.getUserInfo(parseInt(element.updated_by));
                }
                if (element.create_user_type == 1) {
                    // Handle create_user_type 3 if needed
                    element.created_user_info = {
                        customer_id: element.customer_id,
                        first_name: element.first_name,
                        last_name: element.last_name,
                    }
                }
                let data = await policyService.getPolicyObjectFlagsName(element.policy_details);
                //console.log(data);
                element.policy_details = data;
                return element;
            }));
            res.status(200).send({ status: 1, data: policyDocument, message: "All Policy documents fecthed successfully." });
        } else {
            res.status(200).send({ status: 0, data: policyDocument, message: "Policy documents not found." });
        }
    } catch (error) {
        next(error)
    }
}
function genCustomerDetailsQueryOption(payloadQueryOpt) {
    const queryOptions = {
        attributes: { exclude: ['deleted_by', 'deleted_at', 'user_agent', 'device_id', 'ip_address', 'password'] },
        include: [],
    };
    // Check if policy_list inclusion is required
    if (payloadQueryOpt.includePolicyList) {
        queryOptions.include.push({
            model: db.policiesModel,
            as: 'policy_list',
            attributes: payloadQueryOpt.includePolicyList.length > 0 ? payloadQueryOpt.includePolicyList : { exclude: ['deleted_by', 'deleted_at'] },
            include: [
                {
                    model: db.plansModel,
                    as: 'plan_details',
                    attributes: ['plan_name']
                },
                {
                    model: db.propertyTypesModel,
                    as: 'property_type_details',
                    attributes: ['property_type']
                },
                {
                    model: db.policyProductsModel,
                    as: 'policy_product_list',
                    include: {
                        model: db.productsModel,
                        as: 'product_details',
                        attributes: ['product_name', 'product_type',]
                    },
                    attributes: { exclude: ['deleted_by', 'deleted_at'] },
                },
            ],
        });
    }

    // Check if payment_list inclusion is required
    if (payloadQueryOpt.includePaymentList) {
        queryOptions.include.push({
            model: db.paymentsModel,
            as: 'payment_list',
            attributes: payloadQueryOpt.includePaymentList.length > 0 ? payloadQueryOpt.includePaymentList : { exclude: ['deleted_by', 'deleted_at'] },
        });
    }

    return queryOptions;
    // const queryOptions = {
    //     attributes: { exclude: ['deleted_by', 'deleted_at', 'user_agent', 'device_id', 'ip_address', 'password'] },
    //     include: [
    //         {
    //             model: db.policiesModel,
    //             as: 'policy_list',
    //             include: [
    //                 {
    //                     model: db.plansModel,
    //                     as: 'plan_details',
    //                     attributes: ['plan_name']
    //                 },
    //                 {
    //                     model: db.propertyTypesModel,
    //                     as: 'property_type_details',
    //                     attributes: ['property_type']
    //                 },
    //                 {
    //                     model: db.policyProductsModel,
    //                     as: 'policy_product_list',
    //                     include: {
    //                         model: db.productsModel,
    //                         as: 'product_details',
    //                         attributes: ['product_name', 'product_type',]
    //                     },
    //                     attributes: { exclude: ['deleted_by', 'deleted_at'] },
    //                 },
    //             ],
    //             // attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'updated_at', 'deleted_at', 'user_agent', 'device_id', 'ip_address',] },
    //         },
    //         /*  {
    //              model: db.claimsModel,
    //              as: 'claim_list',
    //              attributes: { exclude: ['deleted_by', 'deleted_at'] },
    //              include: [
    //                  {
    //                  model: db.claimTicketStatusesModel,
    //                  as: 'claim_ticket_status_details',
    //                  attributes: ['ticket_status', 'status_description'],

    //                  },
    //                  {
    //                      model: db.policiesModel,
    //                      as: 'policy_details',
    //                      attributes: ['policy_id', 'policy_number', 'policy_status']
    //                  },
    //                  {
    //                      model: db.productsModel,
    //                      as: 'product_details',
    //                      attributes: { exclude: ['created_at', 'deleted_at', 'deleted_by'] }
    //                  },
    //              ]
    //          }, */
    //         {
    //             model: db.paymentsModel,
    //             as: 'payment_list',
    //             attributes: { exclude: ['deleted_by', 'deleted_at'] },
    //             // attributes: ['payment_id']
    //         },
    //         /*  {
    //              model: db.customerCardsModel,
    //              as: 'card_list',
    //              attributes: { exclude: ['deleted_by', 'deleted_at', 'card_number'] },
    //              // attributes: ['payment_id']
    //          }, */
    //     ],
    // };
    return queryOptions
}
/*****************************
 ******************************/
exports.getCustomerDetails = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const paramValue = req.params.param;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let where = {}
        if (emailRegex.test(paramValue)) {
            // It's an email, handle it accordingly
            where = {
                email: paramValue
            }
        } else {
            // It's not an email, treat it as a customer ID
            where = {
                customer_id: paramValue
            }
        }
        const genQueryOptions = genCustomerDetailsQueryOption(req.body.queryOption ? req.body.queryOption : {})

        const queryOptions = {
            where,
            ...genQueryOptions
        };

        let customerDetails = await customerService.findCustomerOne(queryOptions);
        if (customerDetails) {
            if (customerDetails.create_user_type == 2) {
                customerDetails.created_user_info = await helper.getUserInfo(parseInt(customerDetails.created_by));
            }
            if (customerDetails.update_user_type == 2) {
                customerDetails.updated_user_info = await helper.getUserInfo(parseInt(customerDetails.updated_by));
            }
            if (customerDetails.create_user_type == 1) {
                // Handle create_user_type 3 if needed
                customerDetails.created_user_info = {
                    customer_id: customerDetails.customer_id,
                    first_name: customerDetails.first_name,
                    last_name: customerDetails.last_name,
                }
            }

            for (let i = 0; i < customerDetails.policy_list?.length; i++) {
                const item = customerDetails.policy_list[i];
                if (item.create_user_type == 2) {
                    item.created_user_info = await helper.getUserInfo(parseInt(item.created_by));
                }
                if (item.update_user_type == 2) {
                    item.updated_user_info = await helper.getUserInfo(parseInt(item.updated_by));
                }
                if (item.create_user_type == 1) {
                    // Handle create_user_type 3 if needed
                    item.created_user_info = {
                        customer_id: item.customer_id,
                        first_name: item.first_name,
                        last_name: item.last_name,
                    }
                }
                let data = await policyService.getPolicyObjectFlagsName(item);

                customerDetails.policy_list[i] = data;
            }

            if (customerDetails.payment_list && customerDetails.payment_list.length > 0) {
                customerDetails.payment_list = await Promise.all(customerDetails.payment_list.map(async (element) => {
                    element.card_number = element.card_number ? "xxxx xxxx xxxx " + element.card_number : null

                    if (element.create_user_type == 2) {
                        element.created_user_info = await helper.getUserInfo(parseInt(element.created_by));
                    }
                    if (element.update_user_type == 2) {
                        element.updated_user_info = await helper.getUserInfo(parseInt(element.updated_by));
                    }
                    if (element.create_user_type == 1) {
                        // Handle create_user_type 3 if needed
                        element.created_user_info = {
                            customer_id: customerDetails.customer_id,
                            first_name: customerDetails.first_name,
                            last_name: customerDetails.last_name,
                        }
                    }
                    await paymentService.PaymentsFlagStatusName(element)

                    return element;
                }));
            }
            res.status(200).send({ status: 1, message: `Customer Details fetched successfully`, data: customerDetails });
        } else {
            res.status(200).send({ status: 0, message: `Customer Details not found`, });
        }

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}

exports.exportGetAllCustomer = async (req, res, next, data) => {
    try {
        const key = req.params.key
        let customerData = data
        if (key == 'export_xlsx' || key == 'export_csv') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Customers");
            worksheet.columns = [
                { header: "SL", key: "sl_no" },
                // { header: "Id", key: "id" },
                { header: "Full Name", key: "full_name" },
                { header: "First Name", key: "first_name" },
                { header: "Last Name", key: "last_name" },
                { header: "Email", key: "email" },
                { header: "Mobile Number", key: "mobile" },
                { header: "Alternate Mobile Number", key: "alternate_phone" },
                { header: "Zip", key: "zip" },
                { header: "State", key: "state" },
                { header: "City", key: "city" },
                { header: "Address", key: "address1" },
                { header: "Status", key: "active_status" },
                { header: "Policy Count", key: "policy_count" },
                { header: "Claim Count", key: "claim_count" },
                { header: "Source", key: "source" },
                { header: "Created By", key: "created_info" },
                { header: "Updated By", key: "updated_info" },
                { header: "Created On", key: "created_at" },
                { header: "Updated On", key: "updated_at" },
            ]
            worksheet.columns.forEach(function (column, i) {
                var maxLength = 0;
                column["eachCell"]({ includeEmpty: true }, function (cell) {
                    var columnLength = cell.value ? cell.value.toString().length : 20;
                    if (columnLength > maxLength) {
                        maxLength = columnLength;
                    }
                });
                column.width = maxLength < 10 ? 10 : maxLength;
            });
            let counter = 1;
            customerData.forEach(element => {
                element.sl_no = counter;
                element.full_name = `${element.first_name} ${element.last_name}`
                element.policy_count = element.policy_list.length
                element.alternate_phone = element.alternate_phone ? element.alternate_phone : 'N/A'
                element.claim_count = element.claim_list.length
                element.created_info = element.created_user_info ? `${element.created_user_info.first_name} ${element.created_user_info.last_name}` : 'N/A'
                element.updated_info = element.updated_user_info ? `${element.updated_user_info.first_name} ${element.updated_user_info.last_name}` : 'N/A'
                if (element.source == 1) {
                    element.source = 'Backend Team';
                } else if (element.source == 0) {
                    element.source = 'Self Customer';
                }
                if (element.active_status == 1) {
                    element.active_status = 'Active';
                } else if (element.active_status == 0) {
                    element.active_status = 'Inactive';
                }
                element.created_at = element.created_at ? moment(element.created_at).format('MM-DD-YYYY') : 'N/A'
                element.updated_at = element.updated_at ? moment(element.updated_at).format('MM-DD-YYYY') : 'N/A'
                worksheet.addRow(element)
                counter++;
            });
            worksheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true };
            })

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )

            res.setHeader("Content-Disposition", `attachment; filename=customerList.${key == 'export_csv' ? 'csv' : 'xlsx'}`);
            res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

            return workbook.xlsx.write(res).then(() => {
                res.status(200);
            })
        }
        next()
    } catch (error) {
        next(error)
    }
}

/*****************************
 * CUSTOMER DETAILS FOR CUSTOMER PORTAL
 ******************************/
exports.getCustomerDetailsForCustomerPortal = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const paramValue = req.params.param;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let where = {}
        if (emailRegex.test(paramValue)) {
            // It's an email, handle it accordingly
            where = {
                email: paramValue
            }
        } else {
            // It's not an email, treat it as a customer ID
            where = {
                customer_id: paramValue
            }
        }
        // let queryOptions = {
        //     where,
        //     attributes: { exclude: ['deleted_by', 'deleted_at', 'user_agent', 'device_id', 'ip_address', 'password'] },
        //     include: [
        //         {
        //             model: db.policiesModel,
        //             as: 'policy_list',

        //             include: [
        //                 {
        //                     model: db.plansModel,
        //                     as: 'plan_details',
        //                     attributes: ['plan_id', 'plan_name']
        //                 },
        //                 {
        //                     model: db.propertyTypesModel,
        //                     as: 'property_type_details',
        //                     attributes: ['property_type_id', 'property_type']
        //                 },
        //                 {
        //                     model: db.policyProductsModel,
        //                     as: 'policy_product_list',
        //                     include: {
        //                         model: db.productsModel,
        //                         as: 'product_details',
        //                         attributes: ['product_id', 'product_name', 'product_type']
        //                     },
        //                     attributes: { exclude: ['deleted_by', 'deleted_at'] },
        //                 },
        //             ],
        //             attributes: ['first_name', 'last_name', 'email', 'mobile', 'policy_amount', 'order_date', 'policy_start_date', 'policy_expiry_date', 'policy_id', 'pcf', 'policy_number', 'billing_address1', 'billing_city', 'billing_state', 'billing_zip', 'policy_start_date', 'policy_status',
        //                 'policy_term', 'policy_term_month', 'net_amount'],
        //         },
        //         {
        //             model: db.paymentsModel,
        //             as: 'payment_list',
        //             attributes: { exclude: ['deleted_by', 'deleted_at'] },
        //             // attributes: ['payment_id']
        //         },
        //         {
        //             model: db.customerCardsModel,
        //             as: 'card_list',
        //             attributes: { exclude: ['deleted_by', 'deleted_at', 'card_number'] },
        //             // attributes: ['payment_id']
        //         },
        //     ],

        // };
        const queryOptions = {
            where,
            attributes: { exclude: ['created_at', 'lead_id', 'created_by', 'login_otp', 'login_otp_created_at', 'create_user_type', 'deleted_by', 'deleted_at', 'user_agent', 'device_id', 'ip_address', 'password'] },
            include: [
                {
                    model: db.policiesModel,
                    as: 'policy_list',
                    include: [
                        {
                            model: db.plansModel,
                            as: 'plan_details',
                            attributes: ['plan_name']
                        },
                        {
                            model: db.propertyTypesModel,
                            as: 'property_type_details',
                            attributes: ['property_type']
                        },
                        {
                            model: db.policyProductsModel,
                            as: 'policy_product_list',
                            include: {
                                model: db.productsModel,
                                as: 'product_details',
                                attributes: ['product_name', 'product_type', 'monthly_price', 'yearly_price']
                            },
                            attributes: ['policy_id', 'policy_product_id', 'product_id', 'product_quantity'],
                        },
                    ],
                    attributes: { exclude: ['created_by', 'created_at', 'create_user_type', 'coupon_code', 'updated_by', 'update_user_type', 'updated_at', 'deleted_by', 'updated_at', 'deleted_at', 'user_agent', 'device_id', 'ip_address',] },
                },
                {
                    model: db.claimsModel,
                    as: 'claim_list',
                    attributes: ['policy_id', 'claim_id', 'claim_ticket_statuses_id'],
                    //  include: [
                    //      {
                    //      model: db.claimTicketStatusesModel,
                    //      as: 'claim_ticket_status_details',
                    //      attributes: ['ticket_status', 'status_description'],

                    //      },
                    //      {
                    //          model: db.policiesModel,
                    //          as: 'policy_details',
                    //          attributes: ['policy_id', 'policy_number', 'policy_status']
                    //      },
                    //      {
                    //          model: db.productsModel,
                    //          as: 'product_details',
                    //          attributes: { exclude: ['created_at', 'deleted_at', 'deleted_by'] }
                    //      },
                    //  ]
                },
                {
                    model: db.paymentsModel,
                    as: 'payment_list',
                    attributes: { exclude: ['deleted_by', 'deleted_at', 'create_user_type', 'created_at', 'created_by', 'comments', 'cron_payment', 'paypal_AUTHCODE', 'paypal_PROFILEID', 'paypal_RESPMSG', 'paypal_RPREF', 'paypal_TRXRESPMSG', 'update_user_type', 'updated_at', 'updated_by'] },
                    // attributes: ['payment_id']
                },
                // {
                //                  model: db.customerCardsModel,
                //                  as: 'card_list',
                //                  attributes: ['customer_card_id','authorizeNet_payment_profile_id', 'card_expiry_date', 'card_last_4_digit','card_type','primary_card'] ,
                //                  // attributes: ['payment_id']
                //              },
                /*  {
                     model: db.customerCardsModel,
                     as: 'card_list',
                     attributes: { exclude: ['deleted_by', 'deleted_at', 'card_number'] },
                     // attributes: ['payment_id']
                 }, */
            ],

        };
        let customerDetails = await customerService.findCustomerOne(queryOptions);

        // if (customerDetails?.card_list.length > 0) {
        //     customerDetails?.card_list.forEach(element => {
        //         element.card_last_4_digit = element.card_last_4_digit ? "xxxx xxxx xxxx " + element.card_last_4_digit : null
        //         let card_expiry_date = helper.decodeCrypto(element.card_expiry_date)
        //         element.card_expiry_date = card_expiry_date
        //     });
        // }

        if (customerDetails?.payment_list.length > 0) {
            customerDetails.payment_list = await Promise.all(customerDetails.payment_list.map(async (element) => {
                if (element.create_user_type == 2) {
                    element.created_user_info = await helper.getUserInfo(parseInt(element.created_by));
                }
                if (element.update_user_type == 2) {
                    element.updated_user_info = await helper.getUserInfo(parseInt(element.updated_by));
                }
                if (element.create_user_type == 1) {
                    // Handle create_user_type 3 if needed
                    element.created_user_info = {
                        customer_id: customerDetails.customer_id,
                        first_name: customerDetails.first_name,
                        last_name: customerDetails.last_name,
                    }
                }
                return element;
            }));
            customerDetails.policy_list = await Promise.all(customerDetails.policy_list.map(async (element) => {
                return await policyService.getPolicyObjectFlagsName(element);
            }));
        }
        if (customerDetails.payment_list && customerDetails.payment_list.length > 0) {
            customerDetails.payment_list = await Promise.all(customerDetails.payment_list.map(async (element) => {
                element.card_number = element.card_number ? "xxxx xxxx xxxx " + element.card_number : null

                if (element.create_user_type == 2) {
                    element.created_user_info = await helper.getUserInfo(parseInt(element.created_by));
                }
                if (element.update_user_type == 2) {
                    element.updated_user_info = await helper.getUserInfo(parseInt(element.updated_by));
                }
                if (element.create_user_type == 1) {
                    // Handle create_user_type 3 if needed
                    element.created_user_info = {
                        customer_id: customerDetails.customer_id,
                        first_name: customerDetails.first_name,
                        last_name: customerDetails.last_name,
                    }
                }
                await paymentService.PaymentsFlagStatusName(element)

                return element;
            }));
        }
        if (customerDetails) {
            res.status(200).send({ status: 1, message: `Customer Details fetched successfully`, data: customerDetails });

        } else {
            res.status(200).send({ status: 0, message: `Customer Details not found`, });
        }

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}

exports.generateCustomerWelcomeMail = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { customer_id } = req.params
        const queryOptions = {
            where: { customer_id: customer_id, org_id: req.tokenData.org_id },
            attributes: { exclude: ['deleted_by', 'deleted_at', 'user_agent', 'device_id', 'ip_address', 'password'] },
            include: [
                {
                    model: db.policiesModel,
                    as: 'policy_list',

                    include: [
                        {
                            model: db.plansModel,
                            as: 'plan_details',
                            attributes: ['plan_name']
                        },

                    ],
                    order: [['policy_id', 'DESC']]
                }
            ]
        }
        let existingCustomer = await customerService.findCustomerOne(queryOptions);
        if (!existingCustomer) {
            throw new CustomError(`Customer details not found`, 404)
        }
        const sortedData = existingCustomer.policy_list.sort((a, b) => b.policy_id - a.policy_id);
        existingCustomer.policy_list = sortedData
        const password = helper.autoGeneratePassword();
        const newPassword = await bcrypt.hash(password, 10);

        let updatePassword = await customerService.updateCustomer(customer_id, { password: newPassword, update_user_type: 2, updated_by: req.tokenData.org_user_id }, transaction)
        if (!updatePassword) {
            throw new CustomError(`Failed to generate new password! Something went wrong `, 400)
        }
        let dataObj = {
            base_url: `${helper.website_baseUrl}`,
            customer_email: existingCustomer.email,
            customer_password: password,
            customer_name: existingCustomer.first_name + ' ' + existingCustomer.last_name,
            customer_plan: existingCustomer.policy_list[0].plan_details.plan_name,
            company_address: mailConfig.company_address,
            company_phone: mailConfig.company_phone,
            company_email: mailConfig.company_email,
            company_copyright_year: mailConfig.company_copyright_year,
            company_website: mailConfig.company_website,
            company_website_link: mailConfig.company_website_link,
            email_imageUrl: helper.email_imageUrl
        }
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'ADMIN_PORTAL_CUSTOMERS',
            table_name: 'hws_customers',
            created_by: req.tokenData.org_user_id,
            source: 1,
            customer_id: customer_id,
            create_user_type: 2,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        let policyCreateMailTrigger = await mailService.triggerMail('newCustomerTemp.ejs', dataObj, '', existingCustomer.email, 'Policy purchased Successfully. Welcome to our Family!');
        if (policyCreateMailTrigger) {
            auditData.description = `Welcome email send to customer's registered mail ID successfully`;
            await helper.updateAuditTrail(auditData, req);
            transaction.commit()
            res.status(200).send({ status: 1, message: `Send a welcome email on the customer's registered mail ID successfully` })
        } else {
            auditData.description = `Failed to send a welcome email on the customer's registered mail ID`;
            await helper.updateAuditTrail(auditData, req);
            res.status(200).send({ status: 0, message: `Failed to send a welcome email on the customer's registered mail ID` })

        }
    } catch (error) {
        transaction.rollback()
        next(error)
    }
}

exports.rePayment = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        let { payment_id } = req.params;
        let payLoad = req.body;
        let paymentData = {};
        let paymentObj = {};
        let paymentProfileId = null;
        let paymentDetails = await paymentService.getPaymentById(payment_id);
        console.log('paymentDetails', paymentDetails);
        if (!paymentDetails) {
            throw new CustomError(`Something Went wrong! Payment not found`, 400)
        } else {
            console.log('payLoad', payLoad);
            if (payLoad.newOrSavedCard == '2') {
                let isExistCard = await customerCardService.getCustomerCardById({ where: { customer_card_id: payLoad.cardId } });
                console.log('isExistCard', isExistCard);
                if (!isExistCard) {
                    throw new CustomError(`Card Details not found!`, 400)
                } else {
                    let customerDetails = await customerService.findCustomerById(isExistCard.customer_id);
                    if (!customerDetails) {
                        throw new CustomError(`Customer not found!`, 400)
                    } else {
                        paymentObj = {
                            authorizeNet_customer_profile_id: customerDetails.authorizeNet_customer_profile_id ? customerDetails.authorizeNet_customer_profile_id : null,
                            authorizeNet_payment_profile_id: isExistCard.authorizeNet_payment_profile_id ? isExistCard.authorizeNet_payment_profile_id : null,
                            customer_id: isExistCard.customer_id,
                            tax_amount: 0,
                            net_amount: paymentDetails.amount,
                            chargable_amount: paymentDetails.amount,
                            policy_id: paymentDetails.policy_id                        
                        }
                        paymentData.payment_date = moment().format('YYYY-MM-DD');
                    }
                    const chargeCustomerProfileResponse = await securePaymentsService.chargeCustomerProfile(paymentObj);
                    const responseObject = chargeCustomerProfileResponse;
                    const resultCode = responseObject?.messages?.resultCode;
                    const code = responseObject?.messages?.message[0]?.code;
                    const transactionResponse =  responseObject?.transactionResponse;
                    const transactionResponseCode =  responseObject?.transactionResponse?.responseCode;
                    if (resultCode === 'Ok' && code === 'I00001' && transactionResponse && (transactionResponseCode== 1|| transactionResponseCode== 4)) {   
                    // if (chargeCustomerProfileResponse.getTransactionResponse() && chargeCustomerProfileResponse.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
                        paymentData.transaction_no = chargeCustomerProfileResponse.getTransactionResponse().getTransId();
                        paymentData.transaction_response = chargeCustomerProfileResponse//.getTransactionResponse();
                        paymentData.card_number = isExistCard ? isExistCard?.card_last_4_digit ? isExistCard.card_last_4_digit : payLoad.newCardNumber.slice(-4) : payLoad.newCardNumber.slice(-4);
                        paymentData.payment_status = 1 //success=>1
                        paymentData.payment_successfull_date = moment().format('YYYY-MM-DD');
                        let updatePayment = await paymentService.updatePayment(paymentDetails.payment_id, paymentData);
                        console.log('updatePayment', updatePayment);
                        // FOR NOT RECURRING PAYMENT
                        if (paymentDetails.recurring_type == 0) {
                            if (updatePayment) {
                                //CHECK ANY FAILED PAYMENT AGAINST POLICY
                                let policy_id = paymentDetails.policy_id
                                let queryOptions = {
                                    where: {
                                        policy_id: policy_id,
                                        payment_status: 2
                                    }
                                };
                                let allFailedPayments = await paymentService.getAllPayments(queryOptions);
                                console.log('allFailedPayments', allFailedPayments);
                                if (allFailedPayments.rows.length == 0) {
                                    let policyDetails = await policyService.findPolicyByPolicyId(paymentDetails.policy_id);
                                    if (new Date(policyDetails.policy_start_date) > new Date()) {

                                        policyDetails.policy_status = 1;
                                        let updatePayment = await policyService.updatePolicy(paymentDetails.policy_id, policyDetails);
                                        if (updatePayment) {
                                            res.status(200).send({ status: 1, message: `Payment updated successfully` })
                                        } else {
                                            throw new CustomError(`Something wen wrong!.`)
                                        }
                                    } else {
                                        throw new CustomError(`Payment successfull. Your policy is not started yet.`)
                                    }
                                } else {
                                    throw new CustomError(`Please try to pay other payments.`)
                                }
                            } else {
                                throw new CustomError(`Something went wrogn!`, 400)
                            }
                        } else {
                            if (updatePayment) {
                                //CHECK ANY FAILED PAYMENT AGAINST POLICY
                                let policy_id = paymentDetails.policy_id
                                let queryOptions = {
                                    where: {
                                        policy_id: policy_id,
                                        payment_status: 2
                                    }
                                };
                                let allFailedPayments = await paymentService.getAllPayments(queryOptions);
                                if (allFailedPayments.rows.length == 0) {
                                    let policyDetails = await policyService.findPolicyByPolicyId(paymentDetails.policy_id);
                                    if (new Date(policyDetails.policy_start_date) < new Date()) {
                                        let lastSuccessQueryOptions = {
                                            limit: 1,
                                            where: {
                                                policy_id: policy_id,
                                                payment_status: 1
                                            },
                                            order: [['updated_at', 'DESC']]
                                        };
                                        let findLastSuccessFullPayment = await paymentService.getAllPayments(lastSuccessQueryOptions);

                                        const futurePolicyExpiryDate = moment(policyDetails.policy_expiry_date).add(30, 'days');
                                        const futurePolicyExpiryWithBonusDate = moment(policyDetails.expiry_with_bonus).add(30, 'days');

                                        if (futurePolicyExpiryDate.isValid()) {
                                            policyDetails.policy_expiry_date = futurePolicyExpiryDate.format('YYYY-MM-DD');
                                        } else {
                                            const lastValidDate = moment(policyDetails.policy_expiry_date).add(30, 'days').endOf('month');
                                            policyDetails.policy_expiry_date = lastValidDate.format('YYYY-MM-DD');
                                        }


                                        if (futurePolicyExpiryWithBonusDate.isValid()) {
                                            policyDetails.policy_expiry_date = futurePolicyExpiryWithBonusDate.format('YYYY-MM-DD');
                                        } else {
                                            const lastValidExpiryDate = moment(policyDetails.policy_expiry_date).add(30, 'days').endOf('month');
                                            policyDetails.policy_expiry_date = lastValidExpiryDate.format('YYYY-MM-DD');
                                        }

                                        policyDetails.policy_status = 1;
                                        let updatePayment = await policyService.updatePolicy(paymentDetails.policy_id, policyDetails);
                                        if (updatePayment) {
                                            res.status(200).send({ status: 1, message: `Payment updated successfully` })
                                        } else {
                                            throw new CustomError(`Something wen wrong!.`)
                                        }
                                    } else {
                                        res.status(200).send({ status: 0, message: `Payment successfull. Your policy is not started yet.` })
                                    }
                                } else {
                                    throw new CustomError(`Please try to pay other payments.`)
                                }
                            } else {
                                throw new CustomError(`Something went wrogn!`, 400)
                            }
                        }
                    } else {
                        throw new CustomError(`Something wen wrong! Payment failed.`)
                    }
                }
            } else {
                console.log('NEW CARD');
                let customerDetails = await customerService.findCustomerById(paymentDetails.customer_id);
                if (!customerDetails) {
                    throw new CustomError(`Customer not found!`, 400)
                }
                // IF RECURRING TYPE
                if (paymentDetails.recurring_type == 1) {

                    if (!customerDetails.authorizeNet_customer_profile_id) {
                        let customerProfileObj = {
                            customer_id: customerDetails.customer_id,
                            customer_email: customerDetails.email,
                            first_name: customerDetails.first_name ? customerDetails.first_name : null,
                            last_name: customerDetails.last_name ? customerDetails.last_name : null,
                            billing_zip: customerDetails.zip ? customerDetails.zip : null,
                            billing_city: customerDetails.city ? customerDetails.city : null,
                            billing_state: customerDetails.state ? customerDetails.state : null,
                            billing_address: customerDetails.address1 ? customerDetails.address1 : null,
                            card_number: payLoad.cardNumber,
                            card_expiry_date: payLoad.expiryDate ? payLoad.expiryDate.replace(/\//g, "") : null,
                            card_cvv: payLoad.cvv ? payLoad.cvv : null,
                            plan_name: planInfo.plan_name,
                            plan_term: planTermInfo.plan_term,
                            tax_amount: 0,
                            net_amount: paymentDetails.amount
                        }

                        const createCustomerProfileResponse = await securePaymentsService.createCustomerProfile(customerProfileObj);
                        if (createCustomerProfileResponse) {
                            customerDetails.authorizeNet_customer_profile_id = createCustomerProfileResponse.getCustomerProfileId();
                            const paymentProfileIdObject = createCustomerProfileResponse.getCustomerPaymentProfileIdList().getNumericString()[0];
                            // Extract the actual ID from the object
                            paymentProfileId = paymentProfileIdObject.toString();
                            if (createdCustomer.authorizeNet_customer_profile_id) {
                                // The response contains the expected structure and customerProfileId
                                const updateCustomerProfileId = await customerService.updateCustomer(customerDetails.customer_id, {
                                    authorizeNet_customer_profile_id: customerDetails.authorizeNet_customer_profile_id,
                                }, transaction);
                            } else {
                                throw new CustomError('Provided Card Information is Invalid.');
                            }
                        }

                    } else {
                        paymentObj = {
                            authorizeNet_customer_profile_id: customerDetails.authorizeNet_customer_profile_id ? customerDetails.authorizeNet_customer_profile_id : null,
                            authorizeNet_payment_profile_id: isExistCard.authorizeNet_payment_profile_id ? isExistCard.authorizeNet_payment_profile_id : null,
                            customer_id: customerDetails.customer_id,
                            tax_amount: 0,
                            net_amount: paymentDetails.amount,
                            chargable_amount: paymentDetails.amount
                        }
                    }

                    paymentData.payment_date = moment().format('YYYY-MM-DD');

                } else {
                    let obj = {
                        card_number: payLoad.newCardNumber,
                        customer_id: customerDetails.customer_id
                    }
                    let isExistCard = await customerCardService.findCardByCardNumber(obj);
                    if (!customerDetails.authorizeNet_customer_profile_id) {
                        let customerProfileObj = {
                            customer_id: customerDetails.customer_id,
                            customer_email: customerDetails.email,
                            first_name: customerDetails.first_name ? customerDetails.first_name : null,
                            last_name: customerDetails.last_name ? customerDetails.last_name : null,
                            billing_zip: customerDetails.zip ? customerDetails.zip : null,
                            billing_city: customerDetails.city ? customerDetails.city : null,
                            billing_state: customerDetails.state ? customerDetails.state : null,
                            billing_address: customerDetails.address1 ? customerDetails.address1 : null,
                            card_number: payLoad.newCardNumber,
                            card_expiry_date: payLoad.newCardExpiryDate ? payLoad.newCardExpiryDate.replace(/\//g, "") : null,
                            card_cvv: payLoad.newCVV ? payLoad.newCVV : null,
                            tax_amount: 0,
                            net_amount: paymentDetails.amount,
                        }
                        const createCustomerProfileResponse = await securePaymentsService.createCustomerProfile(customerProfileObj);
                        if (createCustomerProfileResponse) {
                            customerDetails.authorizeNet_customer_profile_id = createCustomerProfileResponse.getCustomerProfileId();
                            const paymentProfileIdObject = createCustomerProfileResponse.getCustomerPaymentProfileIdList().getNumericString()[0];
                            // Extract the actual ID from the object
                            paymentProfileId = paymentProfileIdObject.toString();
                            if (createdCustomer.authorizeNet_customer_profile_id) {
                                // The response contains the expected structure and customerProfileId
                                const updateCustomerProfileId = await customerService.updateCustomer(createdCustomer.customer_id, {
                                    authorizeNet_customer_profile_id: createdCustomer.authorizeNet_customer_profile_id,
                                }, transaction);
                            } else {
                                throw new CustomError('Provided Card Information is Invalid.');
                            }
                        } else {
                            throw new CustomError('Invalid response from Authorize.Net');
                        }

                        let customerPaymentProfileObj = {
                            authorizeNet_customer_profile_id: customerDetails.authorizeNet_customer_profile_id,
                            customer_id: customerDetails.customer_id,
                            customer_email: customerDetails.email,
                            first_name: customerDetails.first_name ? customerDetails.first_name : null,
                            last_name: customerDetails.last_name ? customerDetails.last_name : null,
                            billing_zip: customerDetails.zip ? customerDetails.zip : null,
                            billing_city: customerDetails.city ? customerDetails.city : null,
                            billing_state: customerDetails.state ? customerDetails.state : null,
                            billing_address: customerDetails.address1 ? customerDetails.address1 : null,
                            card_number: payLoad.newCardNumber,
                            card_expiry_date: payLoad.newCardExpiryDate ? payLoad.newCardExpiryDate.replace(/\//g, "") : null,
                            card_cvv: payLoad.newCVV ? payLoad.newCVV : null,
                            tax_amount: 0,
                            net_amount: paymentDetails.amount
                        }

                        if (isExistCard == null) {
                            // if customer dosenot have any card stored previously
                            customerCardData.push({
                                org_id: customerDetails.org_id,
                                customer_id: customerDetails.customer_id,
                                card_type: null,
                                card_holder_name: payLoad.newCardHolderName ? payLoad.newCardHolderName : null,
                                card_number: payLoad.newCardNumber ? helper.encodeCrypto(payLoad.newCardNumber) : null,
                                card_last_4_digit: payLoad.newCardNumber ? payLoad.newCardNumber.slice(-4) : null,
                                card_expiry_date: payLoad.newCardExpiryDate ? helper.encodeCrypto(payLoad.newCardExpiryDate.replace(/\//g, "")) : null,
                                ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
                                authorizeNet_payment_profile_id: paymentProfileId ? paymentProfileId : null,
                                create_user_type: 2,
                                created_by: org_user_id,
                            })
                            customerCardData[0].primary_card = true;
                            if (!paymentProfileId) {
                                // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                                const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                                paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
                            }
                        } else {
                            // Verify that the given card's expiry date and card number match those on the customer's stored cards. (customer_card table). 
                            const matchedExpDate = _.find(isExistCard, (obj) => {
                                return obj.card_expiry_date == payLoad.newCardExpiryDate.replace(/\//g, "") && obj.card_number == payLoad.newCardNumber;
                            });

                            if (!matchedExpDate) {
                                // if customer provide different card details which not stored in customer_card table
                                if (!paymentProfileId) {
                                    // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                                    const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                                    paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId();
                                }

                                customerCardData.push({
                                    org_id: createdCustomer.org_id,
                                    customer_id: createdCustomer.customer_id,
                                    card_type: null,
                                    authorizeNet_payment_profile_id: paymentProfileId ? paymentProfileId : null,
                                    card_holder_name: payLoad.cardHolderName ? payLoad.cardHolderName : null,
                                    card_number: payLoad.cardNumber ? helper.encodeCrypto(payLoad.cardNumber) : null,
                                    card_last_4_digit: payLoad.cardNumber ? payLoad.cardNumber.slice(-4) : null,
                                    card_expiry_date: payLoad.expiryDate ? helper.encodeCrypto(payLoad.expiryDate.replace(/\//g, "")) : null,
                                    ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
                                    create_user_type: 1,
                                    created_by: org_user_id,
                                })
                            } else {
                                // if customer provide same card details which already stored in customer_card table
                                customerCardData.push({})
                                selectedCardDetails = await customerCardService.getCustomerCardById({ where: { customer_id: createdCustomer.customer_id, customer_card_id: matchedExpDate.customer_card_id } })
                                paymentProfileId = selectedCardDetails.authorizeNet_payment_profile_id ? selectedCardDetails.authorizeNet_payment_profile_id : null
                            }
                            if (!paymentProfileId) {
                                // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                                const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                                paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
                            }
                        }
                    }
                    if (!paymentProfileId) {
                        let customerPaymentProfileObj = {
                            authorizeNet_customer_profile_id: customerDetails.authorizeNet_customer_profile_id,
                            customer_id: customerDetails.customer_id,
                            customer_email: customerDetails.email,
                            first_name: customerDetails.first_name ? customerDetails.first_name : null,
                            last_name: customerDetails.last_name ? customerDetails.last_name : null,
                            billing_zip: customerDetails.zip ? customerDetails.zip : null,
                            billing_city: customerDetails.city ? customerDetails.city : null,
                            billing_state: customerDetails.state ? customerDetails.state : null,
                            billing_address: customerDetails.address1 ? customerDetails.address1 : null,
                            card_number: payLoad.newCardNumber,
                            card_expiry_date: payLoad.newCardExpiryDate ? payLoad.newCardExpiryDate.replace(/\//g, "") : null,
                            card_cvv: payLoad.newCVV ? payLoad.newCVV : null,
                            tax_amount: 0,
                            net_amount: paymentDetails.amount
                        }
                        // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                        const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                        paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId();
                    }
                    paymentObj = {
                        authorizeNet_customer_profile_id: customerDetails.authorizeNet_customer_profile_id ? customerDetails.authorizeNet_customer_profile_id : null,
                        authorizeNet_payment_profile_id: paymentProfileId ? paymentProfileId : null,
                        customer_id: customerDetails.customer_id,
                        tax_amount: 0,
                        net_amount: paymentDetails.amount,
                        chargable_amount: paymentDetails.amount,
                        policy_id: paymentDetails.policy_id 
                    }
                    paymentData.payment_date = moment().format('YYYY-MM-DD');
                    const chargeCustomerProfileResponse = await securePaymentsService.chargeCustomerProfile(paymentObj);
                    const responseObject = chargeCustomerProfileResponse;
                    const resultCode = responseObject?.messages?.resultCode;
                    const code = responseObject?.messages?.message[0]?.code;
                    const transactionResponse =  responseObject?.transactionResponse;
                    const transactionResponseCode =  responseObject?.transactionResponse?.responseCode;
                    if (resultCode === 'Ok' && code === 'I00001' && transactionResponse && (transactionResponseCode== 1|| transactionResponseCode== 4)) { 
                    // if (chargeCustomerProfileResponse.getTransactionResponse() && chargeCustomerProfileResponse.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
                        paymentData.transaction_no = chargeCustomerProfileResponse.getTransactionResponse().getTransId();
                        paymentData.transaction_response = chargeCustomerProfileResponse//.getTransactionResponse();
                        paymentData.card_number = isExistCard ? isExistCard?.card_last_4_digit ? isExistCard.card_last_4_digit : payLoad.newCardNumber.slice(-4) : payLoad.newCardNumber.slice(-4);
                        paymentData.payment_status = 1 //success=>1
                        paymentData.payment_successfull_date = moment().format('YYYY-MM-DD');
                        let updatePayment = await paymentService.updatePayment(paymentDetails.payment_id, paymentData);
                        // FOR NOT RECURRING PAYMENT
                        if (paymentDetails.recurring_type == 0) {
                            if (updatePayment) {
                                //CHECK ANY FAILED PAYMENT AGAINST POLICY
                                let policy_id = paymentDetails.policy_id
                                let queryOptions = {
                                    where: {
                                        policy_id: policy_id,
                                        payment_status: 2
                                    }
                                };
                                let allFailedPayments = await paymentService.getAllPayments(queryOptions);
                                if (allFailedPayments.rows.length == 0) {
                                    let policyDetails = await policyService.findPolicyByPolicyId(paymentDetails.policy_id);
                                    if (new Date(policyDetails.policy_start_date) > new Date()) {
                                        policyDetails.policy_status = 1;
                                        let updatePayment = await policyService.updatePolicy(paymentDetails.policy_id, policyDetails);
                                        if (updatePayment) {
                                            res.status(200).send({ status: 1, message: `Payment updated successfully` })
                                        } else {
                                            throw new CustomError(`Something wen wrong!.`)
                                        }
                                    } else {
                                        throw new CustomError(`Payment successfull. Your policy is not started yet.`)
                                    }
                                } else {
                                    throw new CustomError(`Please try to pay other payments.`)
                                }
                            } else {
                                throw new CustomError(`Something went wrogn!`, 400)
                            }
                        } else {
                            if (updatePayment) {
                                //CHECK ANY FAILED PAYMENT AGAINST POLICY
                                let policy_id = paymentDetails.policy_id
                                let queryOptions = {
                                    where: {
                                        policy_id: policy_id,
                                        payment_status: 2
                                    }
                                };
                                let allFailedPayments = await paymentService.getAllPayments(queryOptions);
                                if (allFailedPayments.rows.length == 0) {
                                    let policyDetails = await policyService.findPolicyByPolicyId(paymentDetails.policy_id);
                                    if (new Date(policyDetails.policy_start_date) < new Date()) {
                                        let lastSuccessQueryOptions = {
                                            limit: 1,
                                            where: {
                                                policy_id: policy_id,
                                                payment_status: 1
                                            },
                                            order: [['updated_at', 'DESC']]
                                        };
                                        let findLastSuccessFullPayment = await paymentService.getAllPayments(lastSuccessQueryOptions);
                                        console.log('findLastSuccessFullPayment', findLastSuccessFullPayment);

                                        const futurePolicyExpiryDate = moment(policyDetails.policy_expiry_date).add(30, 'days');
                                        const futurePolicyExpiryWithBonusDate = moment(policyDetails.expiry_with_bonus).add(30, 'days');

                                        if (futurePolicyExpiryDate.isValid()) {
                                            policyDetails.policy_expiry_date = futurePolicyExpiryDate.format('YYYY-MM-DD');
                                        } else {
                                            const lastValidDate = moment(policyDetails.policy_expiry_date).add(30, 'days').endOf('month');
                                            policyDetails.policy_expiry_date = lastValidDate.format('YYYY-MM-DD');
                                        }


                                        if (futurePolicyExpiryWithBonusDate.isValid()) {
                                            policyDetails.policy_expiry_date = futurePolicyExpiryWithBonusDate.format('YYYY-MM-DD');
                                        } else {
                                            const lastValidExpiryDate = moment(policyDetails.policy_expiry_date).add(30, 'days').endOf('month');
                                            policyDetails.policy_expiry_date = lastValidExpiryDate.format('YYYY-MM-DD');
                                        }

                                        policyDetails.policy_status = 1;
                                        let updatePayment = await policyService.updatePolicy(paymentDetails.policy_id, policyDetails);
                                        if (updatePayment) {
                                            res.status(200).send({ status: 1, message: `Payment updated successfully` })
                                        } else {
                                            throw new CustomError(`Something wen wrong!.`)
                                        }
                                    } else {
                                        res.status(200).send({ status: 0, message: `Payment successfull. Your policy is not started yet.` })
                                    }
                                } else {
                                    throw new CustomError(`Please try to pay other payments.`)
                                }
                            } else {
                                throw new CustomError(`Something went wrogn!`, 400)
                            }
                        }
                    } else {
                        throw new CustomError(`Something wen wrong! Payment failed.`)
                    }
                }
            }
        }

    } catch (error) {

        next(error);
    }
}

/*****************************
 * CUSTOMER LOGIN
 ******************************/
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if email or password   is missing
        if (!email || !password) {
            throw new CustomError('Email and password are required', 400)
        }
        let customerData = await customerService.findCustomerByEmail(email);
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'CUSTOMER_PORTAL',
            table_name: 'hws_customers',
            source: 0,
            create_user_type: 1,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }

        if (customerData) {
            auditData.customer_id = customerData.customer_id;
            auditData.name = customerData.first_name + ' ' + customerData.last_name;
            auditData.email = customerData.email ? customerData.email : null;
            auditData.row_id = customerData.customer_id;
            auditData.created_by = customerData.customer_id;


            const isMatch = await customerService.comparePassword(password, customerData.password);
            if (isMatch) {
                if (customerData.active_status == 1) {
                    let ipAddrs = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
                    const otp = Math.floor(1000 + Math.random() * 9000);
                    let isOtpUpdated = await customerService.updateOTP(otp, customerData.customer_id);

                    if (isOtpUpdated[0] == 1) {
                        let dataObj = {
                            company_address: mailConfig.company_address,
                            company_phone: mailConfig.company_phone,
                            company_email: mailConfig.company_email,
                            company_copyright_year: mailConfig.company_copyright_year,
                            company_website: mailConfig.company_website,
                            company_website_link: mailConfig.company_website_link,
                            email_imageUrl: helper.email_imageUrl
                        }
                        const templatePath = path.join(__dirname, '../../../view/emailTemplate/otpTemp.ejs');
                        const templatedata = await ejs.renderFile(templatePath, {
                            otp,
                            dataObj
                        })
                        const mailOptions = {
                            from: helper.emailForm,
                            to: email,
                            subject: 'Your Login OTP',
                            html: templatedata
                        };
                        const otpkey = await helper.encodeCrypto(customerData.customer_id)
                        const mailTransporter = helper.nodemailerAuth();
                        mailTransporter.sendMail(mailOptions, async (err) => {
                            if (!err) {
                                const otpkey = helper.encodeCrypto(customerData.customer_id)
                                console.log({ 'login otp': otp, 'otpkey': otpkey });
                                res.status(200).send({ status: 1,  otpkey: otpkey, message: `Your Login OTP was successfully sent to your registered email address.` });
                            } else {
                                console.log('sendmail failed', err);
                                res.status(500).send({ message: `Something went wrong. Please try again later` });
                            }
                        })
                        auditData.description = 'customer send login otp from customer portal';
                        await helper.updateAuditTrail(auditData, req);
                    } else {
                        auditData.description = 'customer unable to login from customer portal';
                        await helper.updateAuditTrail(auditData, req);
                        res.status(200).send({ status: 0, message: `Something went wrong. Please try again` });
                    }
                    //  } 

                } else {
                    auditData.description = 'customer unable to login customer portal due to inactive account';
                    await helper.updateAuditTrail(auditData, req);
                    throw new CustomError(`Customer not activated`, 400)
                }
            } else {
                auditData.description = 'customer unable to login customer portal due to invalid credential';
                await helper.updateAuditTrail(auditData, req);
                throw new CustomError('Invalid credentials', 401)
            }
        } else {
            auditData.email = email ? email : null;
            auditData.description = 'customer unable to login customer portal due to invalid credential';
            await helper.updateAuditTrail(auditData, req);
            throw new CustomError('Invalid credentials', 401)
        }
    } catch (error) {

        next(error);
    }
}

exports.validateCustomerLoginOTP = async (req, res, next) => {
    try {
        const otp = req.body.otp ? req.body.otp : null;
        const otpKey = req.body.otpKey ? req.body.otpKey : null;

        if (!otp) {
            throw new CustomError('OTP is required', 400)
        }
        if (!otpKey) {
            throw new CustomError('Something went wrong otp key is required', 500)
        }
        const customerId = helper.decodeCrypto(otpKey)
        if (!customerId) {
            throw new CustomError('Something went wrong', 500)
        }

        let customerInfo = await db.customersModel.findByPk(customerId);
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'CUSTOMER_PORTAL',
            table_name: 'hws_customers',
            source: 0,
            create_user_type: 1,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        if (!customerInfo) {
            throw new CustomError('Something went wrong! user not found', 404)
        } else {
            auditData.customer_id = customerInfo.customer_id;
            auditData.name = customerInfo.first_name + ' ' + customerInfo.last_name;
            auditData.email = customerInfo.email ? customerInfo.email : null;
            auditData.row_id = customerInfo.customer_id;
            auditData.created_by = customerInfo.customer_id;

            var newTime = moment(customerInfo.otp_gen_time).add(15, 'minutes');
            //new Date(existResult[0].created_at.getTime()+config.otpExpiryTime * 60 * 1000)
            if (moment() <= newTime) {
                if (otp == customerInfo.login_otp) {
                    let customerResponse = await db.customersModel.update({ login_otp: null, last_login: moment() }, { where: { customer_id: customerId } });
                    if (customerResponse[0] == 1) {
                        const tokenData = { customer_id: customerId, org_id: customerInfo.org_id }
                        const token = jwt.sign(tokenData, process.env.ACCESS_TOKEN, { expiresIn: helper.tokenExpireIn })
                        const userAgent = req.headers["user-agent"];
                        const detector = new DeviceDetector({
                            clientIndexes: true,
                            deviceIndexes: true,
                            deviceAliasCode: false,
                        });
                        const deviceRes = detector.detect(userAgent);
                        const tokenTblData = {
                            customer_id: customerId,
                            token: token,
                            ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                            user_agent: req.headers['user-agent'],
                            device_id: deviceRes.device.type ? deviceRes.device.type : null,
                            os_platform: os.platform(),
                        }
                        const tokenRes = await db.orgCustomerLoginActivitiesModel.create(tokenTblData);
                        if (tokenRes.dataValues) {
                            auditData.description = 'customer loggedin successfully from customer portal';
                            await helper.updateAuditTrail(auditData, req);
                            res.status(200).send({ status: 1, token: token, message: 'Logged In Successfully' });
                        } else {
                            auditData.description = 'customer unable to login from customer portal';
                            await helper.updateAuditTrail(auditData, req);
                            res.status(200).send({ status: 0, token: token, message: 'Something Went Wrong! Please Try Again Later' });
                        }
                    }
                } else {
                    auditData.description = 'customer enter invalid otp from customer portal';
                    await helper.updateAuditTrail(auditData, req);
                    throw new CustomError(`Invalid login otp`, 400)
                }
            } else {
                auditData.description = 'login otp expired from customer portal';
                await helper.updateAuditTrail(auditData, req);
                res.status(200).send({ status: 0, message: `OTP Expired` });
            }
        }
    } catch (error) {

        next(error);
    }
}

exports.resendCustomerLoginOtp = async (req, res, next) => {
    try {
        if (!req.body.otpKey) {
            throw new CustomError('Bad request', 400)
        }
        const customerId = helper.decodeCrypto(req.body.otpKey)
        if (!customerId) {
            throw new CustomError('Bad request', 400)
        }
        const customerData = await db.customersModel.findOne({ where: { customer_id: customerId } });

        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'CUSTOMER_PORTAL',
            table_name: 'hws_customers',
            source: 0,
            create_user_type: 1,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        if (customerData) {
            auditData.customer_id = customerData.customer_id;
            auditData.name = customerData.first_name + ' ' + customerData.last_name;
            auditData.email = customerData.email ? customerData.email : null;
            auditData.row_id = customerData.customer_id;
            auditData.created_by = customerData.customer_id;

            const otp = Math.floor(1000 + Math.random() * 9000);
            let isOtpUpdated = await customerService.updateOTP(otp, customerId);
            if (isOtpUpdated[0] == 1) {
                let dataObj = {
                    company_address: mailConfig.company_address,
                    company_phone: mailConfig.company_phone,
                    company_email: mailConfig.company_email,
                    company_copyright_year: mailConfig.company_copyright_year,
                    company_website: mailConfig.company_website,
                    company_website_link: mailConfig.company_website_link,
                    email_imageUrl: helper.email_imageUrl
                }
                const templatePath = path.join(__dirname, '../../../view/emailTemplate/otpTemp.ejs');

                //await userAuthService.resendOtp(otp, userData.id,userData.email,templatePath,)
                console.log('Resend otp', otp);
                const templatedata = await ejs.renderFile(templatePath, {
                    otp,
                    dataObj
                })
                const mailOptions = {
                    from: helper.emailForm,
                    to: customerData.email,
                    subject: 'Your Login OTP',
                    html: templatedata
                };
                const mailTransporter = helper.nodemailerAuth();
                mailTransporter.sendMail(mailOptions, async (err) => {
                    if (!err) {
                        auditData.description = 'customer login otp resend from customer portal';
                        await helper.updateAuditTrail(auditData, req);
                        res.status(200).send({ status: 1, message: `Your Login OTP was successfully sent to your registered email address.` });
                    } else {
                        auditData.description = 'customer login otp unable to send from customer portal';
                        await helper.updateAuditTrail(auditData, req);
                        res.status(500).send({ message: `Something went wrong. Please try again later` });
                    }
                })
            } else {
                auditData.description = 'customer login otp unable to send from customer portal';
                await helper.updateAuditTrail(auditData, req);
                res.status(200).send({ status: 0, message: `Something went wrong. Please try again` });
            }
        } else {
            res.status(200).send({ status: 0, message: `User not Found, invalid credentials...` })
        }
    } catch (error) {
        next(error);
    }
};

exports.generateForgotPassLink = async (req, res, next) => {
    try {
        if (!req.body.email) {
            throw new CustomError('Email is required', 400)
        }
        const data = {
            email: req.body.email,
        }
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'CUSTOMER_PORTAL',
            table_name: 'hws_customers',
            source: 0,
            create_user_type: 1,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        const customerData = await customerService.findCustomerByEmail(data.email);
        if (customerData) {
            auditData.customer_id = customerData.customer_id;
            auditData.name = customerData.first_name + ' ' + customerData.last_name;
            auditData.email = customerData.email ? customerData.email : null;
            auditData.row_id = customerData.customer_id;
            auditData.created_by = customerData.customer_id;

            const tokenData = { customer_email: customerData.email }
            const token = helper.generateToken(tokenData, '10m')
            const forgot_passwordData = {
                customer_id: customerData.customer_id,
                org_id: req.headers.org_id,
                token: token,
                created_at: helper.date('YYYY-MM-DD HH:mm:ss'),
                active_status: 1
            }

            const forgotPasswordResponse = await db.customerForgotPasswordActivitiesModel.create(forgot_passwordData);
            if (forgotPasswordResponse) {
                const url = `${helper.website_baseUrl}customer/reset-password/${token}`

                let dataObj = {
                    url: url,
                    name: customerData.first_name,
                }
                dataObj.company_address = mailConfig.company_address,
                    dataObj.company_phone = mailConfig.company_phone,
                    dataObj.company_email = mailConfig.company_email,
                    dataObj.company_copyright_year = mailConfig.company_copyright_year;
                dataObj.company_website = mailConfig.company_website;
                dataObj.company_website_link = mailConfig.company_website_link;
                dataObj.email_imageUrl = helper.email_imageUrl
                let mailTrigger = await mailService.triggerMail('forgotPasswordTemp.ejs', dataObj, '', customerData.email, 'Create new Password.');
                if (mailTrigger) {
                    auditData.description = 'generate password link from customer portal';
                    await helper.updateAuditTrail(auditData, req);
                    res.status(201).send({ status: 1, message: "Password reset link is sent to your email.", });
                } else {
                    auditData.description = 'unable to generate password link from customer portal';
                    await helper.updateAuditTrail(auditData, req);
                    throw new CustomError(`Something Went Wrong! Try Again Later`, 500)
                }
            } else {
                auditData.description = 'unable to generate password link from customer portal';
                await helper.updateAuditTrail(auditData, req);
                res.status(200).send({ status: 0, message: `Something went wrong. Please try again` });

            }

        } else {
            res.status(200).send({ status: 0, message: `User Not Found` });
        }

    } catch (error) {
        next(error);
    }
}
// AFTER GENEARATE FORGOT PASSWORD LINK UPDATE PASSWORD 
exports.updateCustomerPassword = async (req, res, next) => {
    try {
        if (!req.body.password_key || !req.body.new_password) {
            throw new CustomError('New password are required', 400)
        }
        jwt.verify(req.body.password_key, process.env.ACCESS_TOKEN, async (err, tokenDataResponse) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    // JWT token has expired
                    return res.status(498).json({ status: 0, message: 'Forgot password link has expired' });
                } else {
                    // Other JWT verification errors
                    res.status(498).json({ status: 0, message: 'Invalid Access Token' });
                }
            } else {
                let customerData = await db.customersModel.findOne({ where: { email: tokenDataResponse.customer_email } });
                customerData = helper.getJsonParseData(customerData);

                // AUDIT TRAIL PAYLOAD
                let auditData = {
                    section: 'CUSTOMER_PORTAL',
                    table_name: 'hws_customers',
                    source: 0,
                    create_user_type: 1,
                    device_id: helper.getDeviceId(req.headers['user-agent']),
                }
                if (customerData) {
                    auditData.customer_id = customerData.customer_id;
                    auditData.name = customerData.first_name + ' ' + customerData.last_name;
                    auditData.email = customerData.email ? customerData.email : null;
                    auditData.row_id = customerData.customer_id;
                    auditData.created_by = customerData.customer_id;

                    const customer = customerData
                    let forgotPassRes = await db.customerForgotPasswordActivitiesModel.findOne({
                        where: { customer_id: customer.customer_id }, order: [
                            ['customer_forgot_password_activity_id', 'DESC']
                        ],
                    });
                    forgotPassRes = helper.getJsonParseData(forgotPassRes)
                    if (forgotPassRes.active_status == 1) {
                        const newPassword = await bcrypt.hash(req.body.new_password, 10);
                        const customerModelRes = await db.customersModel.update({ password: newPassword }, { where: { customer_id: customerData.customer_id } })
                        if (customerModelRes[0] == 1) {
                            const updateForgotPasswordRes = await db.customerForgotPasswordActivitiesModel.update({ active_status: 0 }, { where: { customer_id: customerData.customer_id } })
                            if (updateForgotPasswordRes[0] != 0) {
                                let dataObj = {
                                    name: customer.first_name,
                                    password: req.body.new_password,
                                    email_imageUrl: helper.email_imageUrl,
                                    company_address: mailConfig.company_address,
                                    company_phone: mailConfig.company_phone,
                                    company_email: mailConfig.company_email,
                                    company_copyright_year: mailConfig.company_copyright_year,
                                    company_website: mailConfig.company_website,
                                    company_website_link: mailConfig.company_website_link,
                                }
                                let mailTrigger = await mailService.triggerMail('updatePaasswordTemp.ejs', dataObj, '', customer.email, 'Your password has been changed successfully.');
                                if (mailTrigger) {
                                    res.status(201).send({ status: 1, message: "Your password has been changed successfully.", });

                                } else {
                                    throw new CustomError(`Something Went Wrong! Try Again Later`, 500)
                                }

                                auditData.description = 'password changed successfully from customer portal';
                                await helper.updateAuditTrail(auditData, req);
                            } else {
                                auditData.description = 'password not updated from customer portal';
                                await helper.updateAuditTrail(auditData, req);
                                res.status(200).send({ status: 0, message: 'Password Not Updated' })

                            }
                        } else {
                            auditData.description = 'password not updated from customer portal';
                            await helper.updateAuditTrail(auditData, req);
                            res.status(400).send({ status: 0, message: 'Something went wrong' })
                        }
                    } else {
                        auditData.description = 'forgot password link expire from customer portal';
                        await helper.updateAuditTrail(auditData, req);
                        res.status(200).send({ status: 0, message: 'Forgot password link is expire, please generate new one' })
                    }

                } else {
                    res.status(200).send({ status: 0, message: 'Failed! user not found' })
                }

            }
        })
    } catch (error) {

        next(error);
    }
}

//CHANGE PASSWORD FROM PROFILE 
exports.changePassword = async (req, res, next) => {
    try {
        if (!req.body.old_password || !req.body.new_password) {
            throw new CustomError('Old password and new password are required', 400)
        }
        let customerData = await customerService.findCustomerById(req.tokenData.customer_id);
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'CUSTOMER_PORTAL',
            table_name: 'hws_customers',
            source: 0,
            create_user_type: 1,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        if (customerData) {
            auditData.customer_id = customerData.customer_id;
            auditData.name = customerData.first_name + ' ' + customerData.last_name;
            auditData.email = customerData.email ? customerData.email : null;
            auditData.row_id = customerData.customer_id;
            auditData.created_by = customerData.customer_id;
            const isMatch = await customerService.comparePassword(req.body.old_password, customerData.password);
            if (!isMatch) {
                throw new CustomError('Old password is not matched', 400)
            }
            const customer = customerData
            const newPassword = await bcrypt.hash(req.body.new_password, 10);
            const customerModelRes = await db.customersModel.update({ password: newPassword }, { where: { customer_id: customer.customer_id } });

            if (customerModelRes[0] == 1) {

                let dataObj = {
                    name: customer.first_name,
                    password: req.body.new_password,
                    email_imageUrl: helper.email_imageUrl,
                    company_address: mailConfig.company_address,
                    company_phone: mailConfig.company_phone,
                    company_email: mailConfig.company_email,
                    company_copyright_year: mailConfig.company_copyright_year,
                    company_website: mailConfig.company_website,
                    company_website_link: mailConfig.company_website_link,
                }
                let mailTrigger = await mailService.triggerMail('updatePaasswordTemp.ejs', dataObj, '', customer.email, 'Successfully changing the profile password.');
                if (mailTrigger) {
                    res.status(201).send({ status: 1, message: "Successfully changing the profile password.", });
                } else {
                    throw new CustomError(`Something Went Wrong! Try Again Later`, 500)
                }
                auditData.description = 'customer portal profile password changed successfully from customer portal';
                await helper.updateAuditTrail(auditData, req);
            } else {
                auditData.description = 'customer portal profile password unable to changed from customer portal';
                await helper.updateAuditTrail(auditData, req);
                res.status(400).send({ status: 0, message: 'Something went wrong' })
            }
        } else {
            auditData.description = 'customer portal forgot password link expired from customer portal';
            await helper.updateAuditTrail(auditData, req);
            res.status(200).send({ status: 0, message: 'Forgot password link is expire, please generate new one' })
        }
    } catch (error) {

        next(error);
    }
}

exports.verifyCustomerPortalToken = async (req, res, next) => {
    try {
        const customerId = req.tokenData.customer_id
        let queryOptions = {
            //required:false,
            attributes: { exclude: ['password', 'deleted_by', 'deleted_at', 'device_id', 'user_agent', 'os_platform', 'ip_address'] },
        }

        let customerResponse = await customerService.findCustomerById(customerId, queryOptions);
        if (customerResponse) {
            customerResponse.token = req.tokenData.token;
            customerResponse.current_time = moment();
            const response = customerResponse /* your response data */
            res.status(200).send({ status: 1, message: 'Customer Successfully verified', data: customerResponse });
        } else {
            throw new CustomError(`Something went wrong! Customer not found`, 500)
        }
    } catch (error) {

        next(error)
    }
}

exports.getAllPaymentsByCustomerId = async (req, res, next) => {
    try {
        const customerId = req.tokenData.customer_id
        const queryOptions = {
            // attributes: ['policy_id','customer_id'],

            attributes: { exclude: ['deleted_by', 'deleted_at', 'user_agent', 'device_id', 'ip_address',] },
            where: {
                ...searchQuery,
                ...policy_status,
                ...filterPlanTerm,
                ...filterPlanName,
                ...filterByOrderDate,
                ...filterByExpiryWithBonusdate
            },
            include: [

                {
                    model: db.customersModel,
                    as: 'customer_details',
                    attributes: ['customer_id', 'first_name', 'last_name', 'email', 'mobile', 'alternate_phone']
                },

                {
                    model: db.plansModel,
                    as: 'plan_details',
                    attributes: ['plan_id', 'plan_name']
                },
                {
                    model: db.planTermsModel,
                    as: 'plan_term_details',
                    attributes: ['plan_terms_id', 'plan_term', 'plan_term_month']
                },
                {
                    model: db.propertyTypesModel,
                    as: 'property_type_details',
                    attributes: ['property_type_id', 'property_type']
                },
            ],
            order: [
                [sortField, sortOrder],
            ],
            distinct: true,
            // logging: console.log,
        };

        let customerResponse = await customerService.findCustomerById(customerId, queryOptions);
        if (customerResponse) {
            customerResponse.token = req.tokenData.token;
            customerResponse.current_time = moment();
            const response = customerResponse /* your response data */
            res.status(200).send({ status: 1, message: 'Customer Successfully verified', data: customerResponse });
        } else {
            throw new CustomError(`Something went wrong! Customer not found`, 500)
        }
    } catch (error) {

        next(error)
    }
}

//UPDATE CUSTOMER PROFILE
exports.updateCustomerProfie = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        let { customer_id } = req.tokenData;
        let customerData = {
            first_name: req.body.firstName ? req.body.firstName : null,
            last_name: req.body.lastName ? req.body.lastName : null,
            mobile: req.body.mobileNo ? req.body.mobileNo : null,
            alternate_phone: req.body.alternatePhone ? req.body.alternatePhone : null,
            zip: req.body.zip ? req.body.zip : null,
            city: req.body.city ? req.body.city : null,
            state: req.body.state ? req.body.state : null,
            address1: req.body.address1 ? req.body.address1 : null,
        }
        let customerRes = await customerService.updateCustomer(customer_id, customerData, transaction);
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'CUSTOMER_PORTAL',
            table_name: 'hws_customers',
            source: 0,
            create_user_type: 1,
            device_id: helper.getDeviceId(req.headers['user-agent']),
            customer_id: customerRes.customer_id,
            name: customerData.first_name + ' ' + customerData.last_name,
            email: req.body.emailId ? req.body.emailId : null,
            row_id: customerRes.customer_id,
            created_by: customerRes.customer_id
        }

        transaction.commit()
        if (customerRes) {
            auditData.description = 'customer profile information updated successfully from customer portal';
            await helper.updateAuditTrail(auditData, req);
            res.status(200).send({ status: 1, message: 'Successfully updated profile information.' })
        } else {
            auditData.description = 'customer profile information unable to update from customer portal';
            await helper.updateAuditTrail(auditData, req);
            throw new CustomError('Failed to update profile information.', 500)
        }
    } catch (error) {
        transaction.rollback()
        next(error)
    }
}

exports.getCustomerPortalLastLogin = async (req, res, next) => {
    try {
        const customerId = req.tokenData.customer_id
        let queryOptions = {
            where: { customer_id: customerId },
            order: [['updated_at', 'DESC']],
            attributes: ['updated_at', 'customer_id'],
        }
        let customerResponse = await customerService.getCustomerLastLogin(queryOptions);
        if (customerResponse) {
            res.status(200).send({ status: 1, message: 'Fetch Customer login data successfully', data: customerResponse });
        } else {
            throw new CustomError(`Something went wrong! Customer not found`, 500)
        }
    } catch (error) {

        next(error)
    }
}

exports.createReferFriend = async (req, res, next) => {
    try {
        const transaction = await db.sequelize.transaction();
        const data = {
            org_id: req.headers.org_id ? parseInt(req.headers.org_id) : null,
            name: req.body.fullName,
            email: req.body.emailId,
            policy_number: req.body.policyNumber,
            purchase_date: req.body.purchaseDate,
            policy_status: req.body.policyStatus,
            friend_name: req.body.friendFullName,
            friend_email: req.body.friendEmailId,
            friend_mobile: req.body.friendMobileNo,
            active_status: 0,
            ip_address: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
            create_user_type: req.body.createUserType,
            created_by: null,
            updated_by: null,
            deleted_by: null
        };
        let submitedReferFriend = await customerService.submitReferFriend(data, transaction);
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'CUSTOMER_PORTAL_REFFER_A_FIREND',
            table_name: 'hws_refer_friends',
            source: 0,
            create_user_type: 1,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        if (submitedReferFriend) {
            let organizationDetails = await db.organizationsModel.findOne({ where: { org_id: req.headers.org_id } });
            organizationDetails = helper.getJsonParseData(organizationDetails);
            auditData.customer_id = req.tokenData.customer_id;
            auditData.name = req.body.fullName;
            auditData.email = req.body.emailId;
            auditData.row_id = submitedReferFriend.refer_friend_id;
            auditData.created_by = req.tokenData.customer_id;

            let dataObj = submitedReferFriend;
            dataObj.website_baseUrl = helper.website_baseUrl
            dataObj.email_imageUrl = helper.email_imageUrl;
            dataObj.company_address = mailConfig.company_address;
            dataObj.company_phone = mailConfig.company_phone;
            dataObj.company_email = mailConfig.company_email;
            dataObj.company_copyright_year = mailConfig.company_copyright_year;
            dataObj.company_website = mailConfig.company_website;
            company_website_link = mailConfig.company_website_link;
            let mailTrigger = await mailService.triggerMail('referFriendTemp.ejs', dataObj, '', req.body.friendEmailId, `${req.body.friendFullName} - Subscribe to best Home Warranty Rates`, '');
            let mailTriggerForAdmin = await mailService.triggerMail('referFriendAdminTemp.ejs', dataObj, '', 'fphw@mailinator.com', ' Refer A Friend');
            auditData.description = `successfully refered to  ${req.body.friendFullName} (${req.body.friendEmailId}) from customer portal`;
            await helper.updateAuditTrail(auditData, req);
            if (mailTrigger && mailTriggerForAdmin) {
                transaction.commit();
                res.status(200).send({
                    status: 1,
                    message: `Your have refered to ${req.body.friendFullName} successfully.`,
                });
            }

        } else {
            auditData.description = `unable to refered ${req.body.friendFullName} (${req.body.friendEmailId}) from customer portal`;
            await helper.updateAuditTrail(auditData, req);
            res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
        }
    } catch (error) {
        next(error);
    }
}


// For Monthly Payment Cron
exports.amazonGiftCardReminder = async () => {
   // console.log('CALLING');
    // Your logic for processing recurring payments goes here
    const transaction = await db.sequelize.transaction();
    try {
        let whereCondition = { policy_start_date: moment().subtract(2, 'days').format('YYYY-MM-DD') };
        let queryOptions = {
            where: {
                ...whereCondition,
            },
            order: [['updated_at', 'DESC']],
            attributes: { exclude: ['deleted_by', 'deleted_at', 'user_agent', 'device_id', 'ip_address',] },
        }
        let lastCreatedPolicy = await policyService.getAllpolicy(queryOptions);
       // console.log('lastCreatedPolicy',lastCreatedPolicy);

        lastCreatedPolicy.rows.forEach(async (policy) => {
            
            let whereCondition = { friend_email: policy.email };
            let referqueryOptions = {
                where: {
                    ...whereCondition,
                },
                order: [['updated_at', 'DESC']],
                attributes: { exclude: ['deleted_by', 'deleted_at', 'user_agent', 'device_id', 'ip_address',] },
            }
            let referFriendResponse = await customerService.findReferrelFirendByEmailId(referqueryOptions);
            referFriendResponse = referFriendResponse?referFriendResponse:{}
            policy = await policyService.getPolicyObjectFlagsName(policy)
            // console.log('policy',policy);
            // console.log('mailConfig',referFriendResponse);
            referFriendResponse.company_address = mailConfig?.company_address,
            referFriendResponse.company_phone = mailConfig.company_phone,
            referFriendResponse.company_email = mailConfig.company_email,
            referFriendResponse.company_copyright_year = mailConfig.company_copyright_year,
            referFriendResponse.company_website = mailConfig.company_website;
            referFriendResponse.company_website_link = mailConfig.company_website_link;
            referFriendResponse.email_imageUrl =helper.email_imageUrl
            referFriendResponse = {...referFriendResponse, ...policy};
            let organizationDetails = await db.organizationsModel.findOne({ where: { org_id: 3 } });
            organizationDetails = helper.getJsonParseData(organizationDetails);
            let mailTriggerForAdmin = await mailService.triggerMail('referFriendRewardToAdminTemp.ejs', referFriendResponse, '', organizationDetails.contact_email, `Request for Processing Reward for ${referFriendResponse.name}`, '');
            console.log('MAIL SENT');

        });

    } catch (error) {
        transaction.rollback()
    }


}


/*****************************
 *  CUSTOMER LOGOUT
 ******************************/
exports.customerLogOut = async (req, res) => {
    try {
        const token = req.tokenData.token;
        const tokeRes = await db.orgCustomerLoginActivitiesModel.destroy({
            where: {
                token: token
            }
        })

        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'CUSTOMER_PORTAL',
            table_name: 'hws_customers',
            source: 0,
            create_user_type: 1,
            device_id: helper.getDeviceId(req.headers['user-agent']),
            customer_id: req.tokenData.customer_id,
            name: null,
            email: null,
            row_id: req.tokenData.customer_id,
            created_by: req.tokenData.customer_id
        }
        if (tokeRes == 1) {
            auditData.description = 'customer logged out successfully from customer portal';
            await helper.updateAuditTrail(auditData, req);
            res.status(200).send({ status: 1, message: 'Log out Successfully' })
        } else {
            auditData.description = 'customer unable to logged out from customer portal';
            await helper.updateAuditTrail(auditData, req);
            res.status(200).send({ status: 0, message: 'Something went wrong' })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }

}





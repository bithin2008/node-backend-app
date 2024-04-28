require("dotenv").config();
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index')
const helper = require("../../../common/helper");
const os = require('os');
const { Op } = require("sequelize");
const contactsService = require("../../../services/v1/admin/contactsService");
const mailService = require("../../../services/v1/admin/mailService");
const mailConfig = require("../../../config/mailConfig");
//const model =db.sequelize.models// Object.keys(db.sequelize.models);

/*****************************
 *  CREATE CONTACT
 ******************************/
exports.submitContact = async (req, res, next) => {
    try {
        const transaction = await db.sequelize.transaction();
        const data = {
            org_id: req.headers.org_id ? parseInt(req.headers.org_id) : null,
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            email: req.body.emailId,
            mobile: req.body.mobileNo,
            message: req.body.message,
            ip_address: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
            device_id: helper.getDeviceId(req.headers['user-agent']),
            os_platform: os.platform(),
            user_agent: req.headers['user-agent'],
            create_user_type: req.body.createUserType,
            created_by: null,
            updated_by: null,
            deleted_by: null
        };
        let submitedContact = await contactsService.submitContact(data, transaction);
        submitedContact = helper.getJsonParseData(submitedContact);

         // AUDIT TRAIL PAYLOAD
         let auditData = {
            customer_id: submitedContact.contact_id,
            name: req.body.firstName + ' ' + req.body.lastName,
            email: req.body.emailId ? req.body.emailId : null,
            section: 'CONTACT',
            table_name: 'hws_contacts',
            source: 0,
            row_id: submitedContact.contact_id,
            create_user_type: 1,
            created_by: submitedContact.contact_id,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        if (submitedContact) {            
            let organizationDetails = await db.organizationsModel.findOne({ where: { org_id: req.headers.org_id } });
            organizationDetails = helper.getJsonParseData(organizationDetails);
            let dataObj = submitedContact

            dataObj.company_address = mailConfig.company_address,
            dataObj.company_phone = mailConfig.company_phone,
            dataObj.company_email = mailConfig.company_email,
            dataObj.company_copyright_year = mailConfig.company_copyright_year;
            dataObj.company_website = mailConfig.company_website;
            dataObj.company_website_link = mailConfig.company_website_link;
            dataObj.email_imageUrl =helper.email_imageUrl
            let mailTrigger = await mailService.triggerMail('newContactTemp.ejs', dataObj, '', req.body.emailId, 'First Premier Home Warranty | Acknowledgment of Your Request Submission', '');
            let mailTriggerForAdmin = await mailService.triggerMail('newContactToAdminTemp.ejs', dataObj, '', organizationDetails.contact_email, ' New Contact submitted', '');
            if (mailTrigger && mailTriggerForAdmin) {
                transaction.commit();
                res.status(200).send({
                    status: 1,
                    message: "Your details submitted successfully.",
                });
            }
            auditData.description = 'contact creation successfull from_website';
            await helper.updateAuditTrail(auditData,req)
        } else {
            auditData.description = 'contact creation failed from website';
            await helper.updateAuditTrail(auditData,req)
            res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
        }
    } catch (error) {
        next(error);
    }
}


/*****************************
 *  GET ALL CONTACTS
 ******************************/
exports.getAllContacts = async (req, res, next) => {
    try {
        // Extract the search term from the query parameters
        const searchingValue = req.query.search || '';
        let nameQueryForSearch=searchingValue?searchingValue.trim().split(" "):[];
        // Construct the search query
        const searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    first_name: {
                        [Op.iLike]: `%${nameQueryForSearch[0]?.trim()}%`,
                    },
                },
                {
                    last_name: {
                        [Op.iLike]: `%${nameQueryForSearch[1]?.trim()?nameQueryForSearch[1]?.trim():nameQueryForSearch[0]?.trim()}%`,
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
                }
                
                // Add more columns here for searching
            ],

        } : {};

        const sortField = req.query.sortField || 'created_at'; // Default to 'created_at'
        const sortOrder = req.query.sortOrder || 'ASC'; // Default to ascending order      
        const firstNameQry = req.query.firstName ? {
            first_name: {
                [Op.iLike]: `%${req.query.firstName}%`,
            }
        } : {};
        const lastNameQry = req.query.lastName ? {
            last_name: {
                [Op.iLike]: `%${req.query.lastName}%`,
            }
        } : {};
        const emailQry = req.query.email ? {
            email: {
                [Op.iLike]: `%${req.query.email}%`,
            }
        } : {};
        const mobileQry = req.query.mobile ? {
            mobile: {
                [Op.iLike]: `%${req.query.mobile}%`,
            }
        } : {};

        const queryOptions = {
            attributes: { exclude: ['deleted_by', 'deleted_at', 'user_agent', 'device_id', 'ip_address',] },
            where: {
                ...searchQuery,
                ...firstNameQry,
                ...lastNameQry,
                ...emailQry,
                ...mobileQry
            },
            order: [
                [sortField, sortOrder],
            ],
            distinct: true,
            // logging: console.log,
        };
        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }

        let allContacts = await contactsService.getAllConatcts(queryOptions);
        if (allContacts.rows) {
            allContacts.rows = await Promise.all(allContacts.rows.map(async (element) => {
                if (element.create_user_type == 1) {
                    // Handle create_user_type 3 if needed
                    element.create_info = {
                        contact_id: element.contact_id,
                        first_name: element.first_name,
                        last_name: element.last_name,
                    }
                }
            //  element.create_info = await helper.getUserInfo(parseInt(element.created_by));
              if(element.updated_by){
                element.update_info = await helper.getUserInfo(parseInt(element.updated_by));
              }
              return element;
            }));
          }
        if (res.pagination) {
            res.pagination.total = allContacts.count
            res.pagination.totalPages = Math.ceil(allContacts.count / queryOptions.limit)
        }
        if (allContacts.count > 0) {
            res.status(200).send({ status: 1, data: allContacts.rows, pagination: res.pagination, message: 'Contacts list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allContacts.rows, pagination: res.pagination, message: 'No Contacts found' })
        }
    } catch (error) {
        next(error)
    }
}
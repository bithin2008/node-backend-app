require("dotenv").config();
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index')
const helper = require("../../../common/helper");
const os = require('os');
const { Op } = require("sequelize");
const careersService = require("../../../services/v1/admin/careersService");
const createFolder = require("../../../middleware/createFolder")
const mailService = require("../../../services/v1/admin/mailService");
const mailConfig = require('../../../config/mailConfig');
//const model =db.sequelize.models// Object.keys(db.sequelize.models);
/*****************************
 *  CREATE CONTRACTOR
 ******************************/
exports.submitCareer = async (req, res, next) => {
    try {
        const transaction = await db.sequelize.transaction();
        const data = {
            org_id: req.headers.org_id ? parseInt(req.headers.org_id) : null,
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            email: req.body.emailId,
            mobile: req.body.mobileNo,
            has_experience: req.body.experience ? parseInt(req.body.experience) : 0,
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
        let submitedCareer = await careersService.submitCareer(data, transaction);
        submitedCareer = helper.getJsonParseData(submitedCareer);
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            customer_id: submitedCareer.career_id,
            name: req.body.firstName + ' ' + req.body.lastName,
            email: req.body.emailId ? req.body.emailId : null,
            section: 'CAREER',
            table_name: 'hws_careers',
            source: 0,
            row_id: submitedCareer.career_id,
            create_user_type: 1,
            created_by: submitedCareer.career_id,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        if (submitedCareer) {
            const folderPath = `./src/public/org_files/hws_${req.headers.org_id}/careers`; // Replace this with your folder path template
            await createFolder(folderPath);
            transaction.commit();
            res.status(200).send({
                status: 1,
                data: submitedCareer,
                message: "Your details submitted successfully.",
            });
            auditData.description = 'career creation successfull from_website';
            await helper.updateAuditTrail(auditData,req)
        } else {
            auditData.description = 'career creation failed from website';
            await helper.updateAuditTrail(auditData,req)
            res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
           
        }
    } catch (error) {
        next(error);
    }
}

/*****************************
 *  UPLOAD RESUME
 ******************************/
exports.uploadResume = async (req, res, next) => {
    try {
        if (req.params.career_id) {
            // org_id = helper.decodeCrypto(decodeURI(req.params.org_id));           
            if (req.file) {
                let data = {
                    resume_doc: req.file.filename ? `${req.file.filename}` : null
                }
                let careerRes = await db.careersModel.update(data,
                    { where: { career_id: req.params.career_id } }
                )

                let candidateRes = await careersService.findCandidateById(req.params.career_id);
                candidateRes = helper.getJsonParseData(candidateRes);

                let organizationDetails = await db.organizationsModel.findOne({ where: { org_id: req.headers.org_id } });
                organizationDetails = helper.getJsonParseData(organizationDetails);
                if (careerRes[0] == 1) {
                    let dataObj = candidateRes;
                    dataObj.company_address = mailConfig.company_address,
                    dataObj.company_phone = mailConfig.company_phone,
                    dataObj.company_email = mailConfig.company_email,
                    dataObj.company_copyright_year = mailConfig.company_copyright_year;
                    dataObj.company_website = mailConfig.company_website;
                    dataObj.company_website_link = mailConfig.company_website_link;
                    dataObj.email_imageUrl =helper.email_imageUrl
                    let mailTrigger = await mailService.triggerMail('newCareerTemp.ejs', dataObj, '', dataObj.email, ' New Career Information', '');
                    // console.log('mailTrigger', mailTrigger);

                    let mailTriggerForAdmin = await mailService.triggerMail('newCareerToAdminTemp.ejs', dataObj, '', organizationDetails.contact_email, ' New Career contacted', req.file);
                    // console.log('mailTriggerForAdmin', mailTriggerForAdmin);

                    if (mailTrigger && mailTriggerForAdmin) {
                        res.status(200).send({
                            status: 1,
                            message: "Your details submitted successfully.",
                        });
                    } else if (!mailTrigger) {
                        res.status(200).send({ status: 1, message: `The mail server could not deliver mail to ${dataObj.career_email}. Please check your email id` })
                    } else if (!mailTriggerForAdmin) {
                        res.status(200).send({ status: 1, message: `The mail server could not deliver mail to ${organizationDetails.contact_email}. Please check your email id` })
                    } else {
                        res.status(200).send({ status: 1, message: `Something went wrong! The file could not be found.` })
                    }
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

/*****************************
 *  GET ALL CAREER
 ******************************/
exports.getAllCareer = async (req, res, next) => {
    try {
        // Extract the search term from the query parameters
        const searchingValue = req.query.search || '';
        // Construct the search query
        let nameQueryForSearch = searchingValue ? searchingValue.trim().split(" ") : [];
        const searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    first_name: {
                        [Op.iLike]: `%${nameQueryForSearch[0]?.trim()}%`,
                    },
                },
                {
                    last_name: {
                        [Op.iLike]: `%${nameQueryForSearch[1]?.trim() ? nameQueryForSearch[1]?.trim() : nameQueryForSearch[0]?.trim()}%`,
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
                ...mobileQry,
                org_id:req.tokenData.org_id
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
        let allCareers = await careersService.getAllCareer(req, res, next, queryOptions);
        allCareers.rows.forEach(element => {
            element.resume_url = element.resume_doc ? `${helper.api_baseurl}/org_file/hws_${req.tokenData ? parseInt(req.tokenData.org_id) : null}/careers/${element.resume_doc}` : null
        });
        if (res.pagination) {
            res.pagination.total = allCareers.count
            res.pagination.totalPages = Math.ceil(allCareers.count / queryOptions.limit)
        }
        if (allCareers.count > 0) {
            res.status(200).send({ status: 1, data: allCareers.rows, pagination: res.pagination, message: 'Career list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allCareers.rows, pagination: res.pagination, message: 'No Affiliates found' })
        }
    } catch (error) {
        next(error)
    }
}

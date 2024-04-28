require("dotenv").config();
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index')
const helper = require("../../../common/helper");
const url = require('url');
const os = require('os');
const path = require("path");
const ejs = require('ejs');
const jwt = require('jsonwebtoken');
const { Op } = require("sequelize");
const moment = require('moment');
const querystring = require('querystring');
const DeviceDetector = require('node-device-detector');
const realestateProfessionalsService = require("../../../services/v1/admin/realestateProfessionalsService");
const mailService = require("../../../services/v1/admin/mailService");
const bcrypt = require('bcryptjs');
const policyService = require("../../../services/v1/admin/policyService");
const paymentService = require("../../../services/v1/admin/paymentService");
const mailConfig = require("../../../config/mailConfig");

/*****************************
 *  CREATE REALTOR
 ******************************/
exports.submitRealestateProfessional = async (req, res, next) => {
    try {
        const transaction = await db.sequelize.transaction();
        const password = helper.autoGeneratePassword();
        const data = {
            org_id: req.headers.org_id ? parseInt(req.headers.org_id) : null,
            company_name: req.body.companyName,
            contact_name: req.body.contactName,
            email: req.body.emailId,
            mobile: req.body.mobileNo,
            password: await bcrypt.hash(password, 10),
            company_name: req.body.companyName,
            address: req.body.address,
            account_type: req.body.accountType,
            office_location: req.body.officeLocation,
            office_address: req.body.officeAddress,
            office_zip: req.body.officeZip,
            office_state: req.body.officeState,
            office_city: req.body.officeCity,
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
        let submitedRealestateProfessional = await realestateProfessionalsService.submitRealestateProfessional(data, transaction);
        submitedRealestateProfessional = helper.getJsonParseData(submitedRealestateProfessional);
        if (submitedRealestateProfessional) {
            let organizationDetails = await db.organizationsModel.findOne({ where: { org_id: req.headers.org_id } });
            organizationDetails = helper.getJsonParseData(organizationDetails);
            let dataObj = submitedRealestateProfessional;
            dataObj.base_url = `${helper.website_baseUrl}`,
                dataObj.realtor_password = password;
                dataObj.company_address = mailConfig.company_address,
                dataObj.company_phone = mailConfig.company_phone,
                dataObj.company_email = mailConfig.company_email,
                dataObj.company_copyright_year = mailConfig.company_copyright_year,
                dataObj.company_website = mailConfig.company_website,
                dataObj.company_website_link = mailConfig.company_website_link,
                dataObj.email_imageUrl =helper.email_imageUrl
            let mailTrigger = await mailService.triggerMail('newRealestateProfessionalTemp.ejs', dataObj, '', submitedRealestateProfessional.email, ' Welcome to First Premier Home Warranty, ' + req.body.contactName, '');
            let mailTriggerForAdmin = await mailService.triggerMail('newRealestateProfessionalToAdminTemp.ejs', dataObj, '', organizationDetails.contact_email, ' New Real Estate Professional Information', '');
            if (mailTrigger && mailTriggerForAdmin) {
                transaction.commit();
                res.status(200).send({
                    status: 1,
                    message: "Your details submitted successfully.",
                });
            }
        } else {
            res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
        }
    } catch (error) {
        next(error);
    }
}

/*****************************
 *  GET ALL REALTOR
 ******************************/
exports.getAllRealestateProfessionals = async (req, res, next) => {
    try {
        // Extract the search term from the query parameters
        const searchingValue = req.query.search || '';
        // Construct the search query
        const searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    contact_name: {
                        [Op.iLike]: `%${searchingValue}%`,
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
                    address: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    office_location: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    office_address: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    office_zip: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    office_state: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    office_city: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                }
                // Add more columns here for searching
            ],

        } : {};

        const sortField = req.query.sortField || 'created_at'; // Default to 'created_at'
        const sortOrder = req.query.sortOrder || 'ASC'; // Default to ascending order      
        const contactNameQry = req.query.contactName ? {
            contact_name: {
                [Op.iLike]: `%${req.query.contactName}%`,
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
        const companyNameQry = req.query.companyName ? {
            company_name: {
                [Op.iLike]: `%${req.query.companyName}%`,
            }
        } : {};
        const adressQry = req.query.adress ? {
            adress: {
                [Op.iLike]: `%${req.query.adress}%`,
            }
        } : {};
        const officeLocationQry = req.query.officeLocation ? {
            office_location: {
                [Op.iLike]: `%${req.query.officeLocation}%`,
            }
        } : {};
        const officeAddressQry = req.query.officeAddress ? {
            office_address: {
                [Op.iLike]: `%${req.query.officeAddress}%`,
            }
        } : {};
        const officeZipQry = req.query.officeZip ? {
            office_zip: {
                [Op.iLike]: `%${req.query.officeZip}%`,
            }
        } : {};

        const officeStateQry = req.query.officeState ? {
            office_state: {
                [Op.iLike]: `%${req.query.officeState}%`,
            }
        } : {};
        const officeCityQry = req.query.officeCity ? {
            office_city: {
                [Op.iLike]: `%${req.query.officeCity}%`,
            }
        } : {};
        const queryOptions = {
            attributes: { exclude: ['deleted_by', 'deleted_at', 'user_agent', 'device_id', 'ip_address',] },
            where: {
                ...searchQuery,
                ...contactNameQry,
                ...emailQry,
                ...mobileQry,
                ...companyNameQry,
                ...adressQry,
                ...officeLocationQry,
                ...officeAddressQry,
                ...officeZipQry,
                ...officeStateQry,
                ...officeCityQry
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
        let allRealestateProfessionals = await realestateProfessionalsService.getAllRealestateProfessionals(queryOptions);

        if (res.pagination) {
            res.pagination.total = allRealestateProfessionals.count
            res.pagination.totalPages = Math.ceil(allRealestateProfessionals.count / queryOptions.limit)
        }
        if (allRealestateProfessionals.count > 0) {
            res.status(200).send({ status: 1, data: allRealestateProfessionals.rows, pagination: res.pagination, message: 'RealestateProfessionals list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allRealestateProfessionals.rows, pagination: res.pagination, message: 'No RealestateProfessionals found' })
        }
    } catch (error) {
        next(error)
    }
}

exports.getRealStateProfessonalDetailsAdmin = async (req, res, next) => {
    try {
        const realtor_id = req.params.realtor_id;
        let where = {
            realestate_professional_id: realtor_id,
            org_id: req.tokenData.org_id,
        }
        const queryOptions = {
            where,
            attributes: { exclude: ['deleted_by', 'deleted_at', 'os_platform', 'device_id'] },
            include: [
                {
                    model: db.policiesModel,
                    as: 'created_policies',
                    //where:{create_user_type:3},// for backend team =2, realtor =3

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
                            },
                        },
                        {
                            model: db.claimsModel,
                            as: 'claim_list',
                        },
                        {
                            model: db.paymentsModel,
                            as: 'payment_details',
                            attributes: { exclude: ['deleted_by', 'deleted_at'] },
                        },
                    ]
                },

            ],

        };
        let realtorDetails = await realestateProfessionalsService.getRealtorDetailsAdmin(queryOptions);
        if (realtorDetails) {
            //console.log('realtorDetails',realtorDetails);
            realtorDetails.created_policies =  await Promise.all(realtorDetails?.created_policies.map(async(item) => {  
                await policyService.getPolicyObjectFlagsName(item);
                await Promise.all(item.payment_details.map(async el => {
                    await paymentService.PaymentsFlagStatusName(el);
                    return el;
                }));
                return item
                //}
            }))
            if (realtorDetails.create_user_type == helper.create_update_user_type.admin_user) {
                realtorDetails.created_user_info = await helper.getUserInfo(parseInt(realtorDetails.created_by));
            }
            if (realtorDetails.create_user_type == 3) {
                realtorDetails.created_user_info = {
                    contact_name: realtorDetails.contact_name,
                }
            }
            if (realtorDetails.update_user_type == 2) {
                realtorDetails.updated_user_info = await helper.getUserInfo(parseInt(realtorDetails.updated_by));
            }
            res.status(200).send({ status: 1, data: realtorDetails, message: 'Realtor Details fetched successfully.' });

        } else {
            res.status(200).send({ status: 0, message: `Realtor Details not found`, });
        }

    } catch (error) {
        next(error);
    }
}

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Check if email or password   is missing
        if (!email || !password) {
            throw new CustomError('Email and password are required', 400)
        }
        let realtorData = await realestateProfessionalsService.findRealtorByEmail(email);
        console.log('realtorData',realtorData)
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'REALESTATE_PROFESSIONAL_PORTAL',
            table_name: 'hws_realestate_professionals',
            source: 3,
            create_user_type: 3,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }

        if (realtorData) {
            auditData.customer_id = realtorData.realestate_professional_id;
            auditData.name = realtorData.contact_name;
            auditData.email = realtorData.email ? realtorData.email : null;
            auditData.row_id = realtorData.realestate_professional_id;
            auditData.created_by = realtorData.realestate_professional_id;

            console.log('password',password)
            console.log('realtorData.password',realtorData.password)
            const isMatch = await realestateProfessionalsService.comparePassword(password, realtorData.password);
            if (isMatch) {
                if (realtorData.active_status == 1) {
                    let ipAddrs = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
                    const otp = Math.floor(1000 + Math.random() * 9000);
                    let isOtpUpdated = await realestateProfessionalsService.updateOTP(otp, realtorData.realestate_professional_id);

                    if (isOtpUpdated[0] == 1) {
                        let  dataObj={
                            company_address : mailConfig.company_address,
                            company_phone : mailConfig.company_phone,
                            company_email : mailConfig.company_email,
                            company_copyright_year : mailConfig.company_copyright_year,
                            company_website : mailConfig.company_website,
                            company_website_link : mailConfig.company_website_link,
                            email_imageUrl :helper.email_imageUrl
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
                        const otpkey = helper.encodeCrypto(realtorData.realestate_professional_id)
                        const mailTransporter = helper.nodemailerAuth();
                        mailTransporter.sendMail(mailOptions, async (err) => {
                            if (!err) {
                                const otpkey = helper.encodeCrypto(realtorData.realestate_professional_id)
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
                    auditData.description = 'realesate professional unable to login customer portal due to inactive account';
                    await helper.updateAuditTrail(auditData, req);
                    throw new CustomError(`Realesate Professional  not activated`, 400)
                }
            } else {
                auditData.description = 'realesate professional  unable to login realesate professional portal due to invalid credential';
                await helper.updateAuditTrail(auditData, req);
                throw new CustomError('Invalid credentials', 401)
            }
        } else {
            auditData.email = email ? email : null;
            auditData.description = 'realesate professional unable to login realesate professional portal due to invalid credential';
            await helper.updateAuditTrail(auditData, req);
            throw new CustomError('Invalid credentials', 401)
        }
    } catch (error) {

        next(error);
    }
}

exports.validateRealtorLoginOTP = async (req, res, next) => {
    try {
        const otp = req.body.otp ? req.body.otp : null;
        const otpKey = req.body.otpKey ? req.body.otpKey : null;

        if (!otp) {
            throw new CustomError('OTP is required', 400)
        }
        if (!otpKey) {
            throw new CustomError('Something went wrong otp key is required', 500)
        }
        const realestate_professional_id = helper.decodeCrypto(otpKey)
        if (!realestate_professional_id) {
            throw new CustomError('Something went wrong', 500)
        }

        let realtorData = await db.realestateProfessionalsModel.findByPk(realestate_professional_id);
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'REALESTATE_PROFESSIONAL_PORTAL',
            table_name: 'hws_realestate_professionals',
            source: 3,
            create_user_type: 1,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        if (!realtorData) {
            throw new CustomError('Something went wrong! user not found', 404)
        } else {
            auditData.customer_id = realtorData.realestate_professional_id;
            auditData.name = realtorData.contact_name;
            auditData.email = realtorData.email ? realtorData.email : null;
            auditData.row_id = realtorData.realestate_professional_id;
            auditData.created_by = realtorData.realestate_professional_id;

            var newTime = moment(realtorData.otp_gen_time).add(15, 'minutes');
            //new Date(existResult[0].created_at.getTime()+config.otpExpiryTime * 60 * 1000)
            if (moment() <= newTime) {
                if (otp == realtorData.login_otp) {
                    letrealtorResponse = await db.realestateProfessionalsModel.update({ login_otp: null, last_login: moment() }, { where: { realestate_professional_id: realestate_professional_id } });
                    if (letrealtorResponse[0] == 1) {
                        const tokenData = { realestate_professional_id: realestate_professional_id, org_id: realtorData.org_id }
                        const token = jwt.sign(tokenData, process.env.ACCESS_TOKEN, { expiresIn: helper.tokenExpireIn })
                        const userAgent = req.headers["user-agent"];
                        const detector = new DeviceDetector({
                            clientIndexes: true,
                            deviceIndexes: true,
                            deviceAliasCode: false,
                        });
                        const deviceRes = detector.detect(userAgent);
                        const tokenTblData = {
                            realestate_professional_id: realestate_professional_id,
                            token: token,
                            ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                            user_agent: req.headers['user-agent'],
                            device_id: deviceRes.device.type ? deviceRes.device.type : null,
                            os_platform: os.platform(),
                        }
                        const tokenRes = await db.realestateProLoginActivitiesModel.create(tokenTblData);
                        if (tokenRes.dataValues) {
                            auditData.description = 'loggedin successfully from realestate professional portal';
                            await helper.updateAuditTrail(auditData, req);
                            res.status(200).send({ status: 1, token: token, message: 'Logged In Successfully' });
                        } else {
                            auditData.description = 'unable to login from realestate professional portal';
                            await helper.updateAuditTrail(auditData, req);
                            res.status(200).send({ status: 0, token: token, message: 'Something Went Wrong! Please Try Again Later' });
                        }
                    }
                } else {
                    auditData.description = 'Realestate professional enter invalid otp from Realestate professional portal';
                    await helper.updateAuditTrail(auditData, req);
                    throw new CustomError(`Invalid login otp`, 400)
                }
            } else {
                auditData.description = 'login otp expired from Realestate professional portal';
                await helper.updateAuditTrail(auditData, req);
                res.status(200).send({ status: 0, message: `OTP Expired` });
            }
        }
    } catch (error) {

        next(error);
    }
}

exports.resendRealtorLoginOtp = async (req, res, next) => {
    try {
        if (!req.body.otpKey) {
            throw new CustomError('Bad request', 400)
        }
        const realestate_professional_id = helper.decodeCrypto(req.body.otpKey);
        if (!realestate_professional_id) {
            throw new CustomError('Bad request', 400)
        }
        const realtorData = await db.realestateProfessionalsModel.findOne({ where: { realestate_professional_id: realestate_professional_id } });

        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'REALESTATE_PROFESSIONAL_PORTAL',
            table_name: 'hws_realestate_professionals',
            source: 3,
            create_user_type: 1,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        if (realtorData) {
            auditData.customer_id = realtorData.realestate_professional_id;
            auditData.name = realtorData.contact_name;
            auditData.email = realtorData.email ? realtorData.email : null;
            auditData.row_id = realtorData.realestate_professional_id;
            auditData.created_by = realtorData.realestate_professional_id;

            const otp = Math.floor(1000 + Math.random() * 9000);
            let isOtpUpdated = await realestateProfessionalsService.updateOTP(otp, realestate_professional_id);
            if (isOtpUpdated[0] == 1) {
                let  dataObj={
                    company_address : mailConfig.company_address,
                    company_phone : mailConfig.company_phone,
                    company_email : mailConfig.company_email,
                    company_copyright_year : mailConfig.company_copyright_year,
                    company_website : mailConfig.company_website,
                    company_website_link : mailConfig.company_website_link,
                    email_imageUrl :helper.email_imageUrl
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
                    to: realtorData.email,
                    subject: 'Your Login OTP',
                    html: templatedata
                };
                const mailTransporter = helper.nodemailerAuth();
                mailTransporter.sendMail(mailOptions, async (err) => {
                    if (!err) {
                        auditData.description = 'realestate professional login otp resend from realestate professional portal';
                        await helper.updateAuditTrail(auditData, req);
                        res.status(200).send({ status: 1, message: `Your Login OTP was successfully sent to your registered email address.` });
                    } else {
                        auditData.description = 'realestate professional login otp unable to send from realestate professional portal';
                        await helper.updateAuditTrail(auditData, req);
                        res.status(500).send({ message: `Something went wrong. Please try again later` });
                    }
                })
            } else {
                auditData.description = 'realestate professional login otp unable to send from realestate professional portal';
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
            section: 'REALESTATE_PROFESSIONAL_PORTAL',
            table_name: 'hws_realestate_professionals',
            source: 3,
            create_user_type: 3,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        const realtorData = await realestateProfessionalsService.findRealtorProByEmail(data.email);
        if (realtorData) {
            auditData.customer_id = realtorData.realestate_professional_id;
            auditData.name = realtorData.contact_name;
            auditData.email = realtorData.email ? realtorData.email : null;
            auditData.row_id = realtorData.realestate_professional_id;
            auditData.created_by = realtorData.realestate_professional_id;

            const tokenData = { realtor_email: realtorData.email }
            const token = helper.generateToken(tokenData, '30m')
            const forgot_passwordData = {
                realestate_professional_id: realtorData.realestate_professional_id,
                org_id: req.headers.org_id,
                token: token,
                created_at: helper.date('YYYY-MM-DD HH:mm:ss'),
                active_status: 1
            }

            const forgotPasswordResponse = await db.realestateProForgotPasswordActivitesModel.create(forgot_passwordData);
            if (forgotPasswordResponse) {
                const url = `${helper.website_baseUrl}realestate-professional-portal/reset-password/${token}`

                let dataObj = {
                    url: url,
                    name: realtorData.contact_name,
                    email_imageUrl : helper.email_imageUrl,
                    company_address : mailConfig.company_address,
                    company_phone : mailConfig.company_phone,
                    company_email : mailConfig.company_email,
                    company_copyright_year : mailConfig.company_copyright_year,
                    company_website : mailConfig.company_website,
                    company_website_link : mailConfig.company_website_link,
                }
                let mailTrigger = await mailService.triggerMail('realtorForgotPasswordTemp.ejs', dataObj, '', realtorData.email, 'Create new Password.');
                if (mailTrigger) {
                    auditData.description = 'generate password link from realestate professional portal';
                    await helper.updateAuditTrail(auditData, req);
                    res.status(201).send({ status: 1, message: "Password reset link is sent to your email.", });
                } else {
                    auditData.description = 'unable to generate password link from realestate professional portal';
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
exports.updateRealtorPassword = async (req, res, next) => {
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
                console.log('tokenDataResponse', tokenDataResponse);

                let realtorDataRes = await db.realestateProfessionalsModel.findOne({ where: { email: tokenDataResponse.realtor_email } });
                realtorDataRes = helper.getJsonParseData(realtorDataRes);
                // AUDIT TRAIL PAYLOAD
                let auditData = {
                    section: 'REALESTATE_PROFESSIONAL_PORTAL',
                    table_name: 'hws_realestate_professionals',
                    source: 3,
                    create_user_type: 3,
                    device_id: helper.getDeviceId(req.headers['user-agent']),
                }
                if (realtorDataRes) {
                    auditData.customer_id = realtorDataRes.realestate_professional_id;
                    auditData.name = realtorDataRes.contact_name;
                    auditData.email = realtorDataRes.email ? realtorDataRes.email : null;
                    auditData.row_id = realtorDataRes.realestate_professional_id;
                    auditData.created_by = realtorDataRes.realestate_professional_id;

                    let forgotPassRes = await db.realestateProForgotPasswordActivitesModel.findOne({
                        where: { realestate_professional_id: realtorDataRes.realestate_professional_id }, order: [
                            ['realestate_pro_forgot_password_activity_id', 'DESC']
                        ],
                    });
                    forgotPassRes = helper.getJsonParseData(forgotPassRes)
                    if (forgotPassRes.active_status == 1) {
                        console.log('req.body.new_password', req.body.new_password);
                        const newPassword = await bcrypt.hash(req.body.new_password, 10);
                        const realtorModelRes = await db.realestateProfessionalsModel.update({ password: newPassword }, { where: { realestate_professional_id: realtorDataRes.realestate_professional_id } })
                        console.log('realtorModelRes', realtorModelRes);
                        if (realtorModelRes[0] == 1) {
                            const updateForgotPasswordRes = await db.realestateProForgotPasswordActivitesModel.update({ active_status: 0 }, { where: { realestate_professional_id: realtorDataRes.realestate_professional_id } })
                            if (updateForgotPasswordRes[0] != 0) {
                                let dataObj = {
                                    name: realtorDataRes.contact_name,
                                    password: req.body.new_password,
                                    email_imageUrl : helper.email_imageUrl,
                                    company_address : mailConfig.company_address,
                                    company_phone : mailConfig.company_phone,
                                    company_email : mailConfig.company_email,
                                    company_copyright_year : mailConfig.company_copyright_year,
                                    company_website : mailConfig.company_website,
                                    company_website_link : mailConfig.company_website_link,
                                }
                                let mailTrigger = await mailService.triggerMail('updatePaasswordTemp.ejs', dataObj, '', realtorDataRes.email, 'Your password has been changed successfully.');
                                if (mailTrigger) {
                                    res.status(201).send({ status: 1, message: "Your password has been changed successfully.", });

                                } else {
                                    throw new CustomError(`Something Went Wrong! Try Again Later`, 500)
                                }

                                auditData.description = 'password changed successfully from realestate professional portal';
                                await helper.updateAuditTrail(auditData, req);
                            } else {
                                auditData.description = 'password not updated from realestate professional portal';
                                await helper.updateAuditTrail(auditData, req);
                                res.status(200).send({ status: 0, message: 'Password Not Updated' })

                            }
                        } else {
                            auditData.description = 'password not updated from realestate professional portal';
                            await helper.updateAuditTrail(auditData, req);
                            res.status(400).send({ status: 0, message: 'Something went wrong' })
                        }
                    } else {
                        auditData.description = 'forgot password link expire from realestate professional portal';
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

        let realtorData = await realestateProfessionalsService.findRealtorById(req.tokenData.realestate_professional_id);

        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'REAL_ESTATE_PROFESSIONAL_PROTAL',
            table_name: 'hws_realestate_professionals',
            source: 0,
            create_user_type: 1,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        if (realtorData) {
            auditData.customer_id = realtorData.realestate_professional_id;
            auditData.name = realtorData.contact_name;
            auditData.email = realtorData.email ? realtorData.email : null;
            auditData.row_id = realtorData.realestate_professional_id;
            auditData.created_by = realtorData.realestate_professional_id;
            const isMatch = await realestateProfessionalsService.comparePassword(req.body.old_password, realtorData.password);
            if (!isMatch) {
                throw new CustomError('Old password is not matched', 400)
            }
            const realtor = realtorData
            const newPassword = await bcrypt.hash(req.body.new_password, 10);
            const realtorModelRes = await db.realestateProfessionalsModel.update({ password: newPassword }, { where: { realestate_professional_id: realtor.realestate_professional_id } });

            if (realtorModelRes[0] == 1) {

                let dataObj = {
                    name: realtor.contact_name,
                    password: req.body.new_password,
                    email_imageUrl : helper.email_imageUrl,
                    company_address : mailConfig.company_address,
                    company_phone : mailConfig.company_phone,
                    company_email : mailConfig.company_email,
                    company_copyright_year : mailConfig.company_copyright_year,
                    company_website : mailConfig.company_website,
                    company_website_link : mailConfig.company_website_link,
                }
                let mailTrigger = await mailService.triggerMail('updatePaasswordTemp.ejs', dataObj, '', realtor.email, 'Successfully changing the profile password.');
                if (mailTrigger) {
                    res.status(201).send({ status: 1, message: "Successfully changing the profile password.", });
                } else {
                    throw new CustomError(`Something Went Wrong! Try Again Later`, 500)
                }
                auditData.description = 'profile password changed successfully from realestate professional';
                await helper.updateAuditTrail(auditData, req);
            } else {
                auditData.description = 'profile password unable to changed from realestate professional';
                await helper.updateAuditTrail(auditData, req);
                res.status(400).send({ status: 0, message: 'Something went wrong' })
            }
        } else {
            auditData.description = 'forgot password link expired from realestate professional';
            await helper.updateAuditTrail(auditData, req);
            res.status(200).send({ status: 0, message: 'Forgot password link is expire, please generate new one' })
        }
    } catch (error) {

        next(error);
    }
}

exports.verifyRealtorPortalToken = async (req, res, next) => {
    try {
        const realestate_professional_id = req.tokenData.realestate_professional_id
        let queryOptions = {
            attributes: { exclude: ['password', 'deleted_by', 'deleted_at', 'device_id', 'user_agent', 'os_platform', 'ip_address'] },
        }

        let realtorResponse = await realestateProfessionalsService.findRealtorById(realestate_professional_id, queryOptions);
        if (realtorResponse) {
            realtorResponse.token = req.tokenData.token;
            realtorResponse.current_time = moment();
            const response = realtorResponse /* your response data */
            res.status(200).send({ status: 1, message: 'Realestate Professional Successfully verified', data: realtorResponse });
        } else {
            throw new CustomError(`Something went wrong! Customer not found`, 500);
        }
    } catch (error) {

        next(error)
    }
}


//UPDATE REALTOR PROFILE
exports.updateRealtorProfie = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        let { realestate_professional_id } = req.tokenData;
        const realtorData = {
            company_name: req.body.companyName,
            contact_name: req.body.contactName,
            email: req.body.emailId,
            mobile: req.body.mobileNo,
            address: req.body.address,
            account_type: req.body.accountType,
            office_location: req.body.officeLocation,
            office_address: req.body.officeAddress,
            office_zip: req.body.officeZip,
            office_state: req.body.officeState,
            office_city: req.body.officeCity,
            update_user_type: req.body.updatedUserType,
        };
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'REALESTATE_PROFESSIONAL_PORTAL',
            table_name: 'hws_customers',
            source: 3,
            create_user_type: 3,
            device_id: helper.getDeviceId(req.headers['user-agent']),
            customer_id: realestate_professional_id,
            name: req.body.contactName,
            email: req.body.emailId ? req.body.emailId : null,
            row_id: realestate_professional_id,
            created_by: realestate_professional_id
        }
        let updatedRealestateProfessional = await realestateProfessionalsService.updateRealtor(realestate_professional_id, realtorData, transaction);

        transaction.commit()
        if (updatedRealestateProfessional) {
            auditData.description = 'profile information updated successfully from realestate professional portal';
            await helper.updateAuditTrail(auditData, req);
            res.status(200).send({ status: 1, message: 'Successfully updated profile information.', data: updatedRealestateProfessional })
        } else {
            auditData.description = 'profile information unable to update from realestate professional portal';
            await helper.updateAuditTrail(auditData, req);
            throw new CustomError('Failed to update profile information.', 500)
        }
    } catch (error) {
        transaction.rollback()
        next(error)
    }
}


exports.getRealtorPortalLastLogin = async (req, res, next) => {
    try {
        const realestate_professional_id = req.tokenData.realestate_professional_id
        let queryOptions = {
            where: { realestate_professional_id: realestate_professional_id },
            order: [['updated_at', 'DESC']],
            attributes: ['updated_at', 'realestate_professional_id'],
        }
        let realtorResponse = await realestateProfessionalsService.getRealtorLastLogin(queryOptions);
        if (realtorResponse) {
            res.status(200).send({ status: 1, message: 'Fetch Realestate Professional Portal login data successfully', data: realtorResponse });
        } else {
            throw new CustomError(`Something went wrong! Realestate Professional not found`, 500)
        }
    } catch (error) {

        next(error)
    }
}


exports.getAllRealtorPolicies = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        // Extract the search term from the query parameters
        const searchingValue = req.query.search || '';
        let nameQueryForSearch = searchingValue ? searchingValue.trim().split(" ") : [];
        let firstName = nameQueryForSearch[0]?.trim();
        let lastName = nameQueryForSearch[1]?.trim();
        // Construct the search query
        const searchQuery = searchingValue ? {
            [Op.or]: [

                {
                    buyer_first_name: {
                        [Op.iLike]: `%${firstName}%`,
                    },
                },
                {
                    buyer_last_name: {
                        [Op.iLike]: `%${lastName ? lastName : firstName}%`,
                    },
                },
                {
                    seller_first_name: {
                        [Op.iLike]: `%${firstName}%`,
                    },
                },
                {
                    seller_last_name: {
                        [Op.iLike]: `%${lastName ? lastName : firstName}%`,
                    },
                },
                {
                    '$policy_info.billing_address1$': {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    '$policy_info.policy_number$': {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
            ],

        } : {};
        const sortField = req.query.sortField || 'created_at'; // Default to 'created_at'
        const sortOrder = req.query.sortOrder || 'ASC'; // Default to ascending order

        if (sortField === 'policy_info.policy_number') {
            order = [[{ model: db.policiesModel, as: 'policy_info' }, 'policy_number', sortOrder]];
        } else if (sortField === 'policy_info.policy_status') {
            order = [[{ model: db.policiesModel, as: 'policy_info' }, 'policy_status', sortOrder]];
        } else {
            order = [[sortField, sortOrder]];
        }

        const includeArray = [
            {
                model: db.claimsModel,
                as: 'claim_list',
                attributes: ['ticket_no', 'claim_ticket_statuses_id']
            },
            {
                model: db.paymentsModel,
                as: 'payment_details',
            },
        ];

        const queryOptions = {
            attributes: { exclude: ['deleted_by', 'deleted_at', 'user_agent', 'device_id', 'ip_address',] },
            where: {
                org_id: req.tokenData.org_id,
                realestate_professional_id: req.tokenData.realestate_professional_id,
                ...searchQuery
            },
            include: [
                {
                    model: db.policiesModel,
                    as: 'policy_info',
                    attributes: ['first_name', 'policy_id', 'plan_terms_id', 'last_name', 'email', 'mobile', 'policy_number', 'billing_address1', 'billing_city', 'billing_state', 'billing_zip', 'policy_status'],

                    include: searchingValue ? [] : includeArray
                },
            ],
            order: order,
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
        let allPolicyProforma = await realestateProfessionalsService.getAllPolicyProforma(queryOptions);


        allPolicyProforma.rows = await Promise.all(allPolicyProforma.rows.map(async (element) => {
            await policyService.getPolicyObjectFlagsName(element.policy_info);
            return element;
        }));
        if (res.pagination) {
            res.pagination.total = allPolicyProforma.count
            res.pagination.totalPages = Math.ceil(allPolicyProforma.count / queryOptions.limit)
        }

        if (allPolicyProforma.count > 0) {
            res.status(200).send({ status: 1, data: allPolicyProforma.rows, pagination: res.pagination, policy_status: res.policy_status, message: 'Policy list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allPolicyProforma.rows, pagination: res.pagination, policy_status: res.policy_status, message: 'No Policy found' })
        }
    } catch (error) {
        next(error)
    }
}

exports.getAllRealtorPolicyPaidAmount = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        const queryOptions = {
            attributes: { exclude: ['deleted_by', 'deleted_at', 'user_agent', 'device_id', 'ip_address',] },
            where: {
                org_id: req.tokenData.org_id,
                realestate_professional_id: req.tokenData.realestate_professional_id
            },
            include: [
                {
                    model: db.policiesModel,
                    as: 'policy_info',
                    attributes: ['first_name', 'policy_id', 'plan_terms_id', 'last_name', 'email', 'mobile', 'policy_number', 'billing_address1', 'billing_city', 'billing_state', 'billing_zip', 'policy_status'],

                    include: [
                        {
                            model: db.paymentsModel,
                            as: 'payment_details',
                            where: {
                                payment_status: {
                                    [Op.eq]: 1  // Using Op.ne to find payment_status not equal to 1
                                }
                            }
                        },
                    ]
                },
            ],
            distinct: true,
            // logging: console.log,
        };


        let allPaidPolicyList = await realestateProfessionalsService.getAllPolicyProforma(queryOptions);
        // res.status(200).send({ status: 1, paid_amount: allPaidPolicyList,  message: 'Policy list found successfully' })
        // console.log('allPaidPolicyList',allPaidPolicyList);

        let paidAmount = 0;
        allPaidPolicyList.rows.forEach(obj => {
            if (obj.policy_info) {
                if (obj.policy_info.payment_details) {
                    obj.policy_info.payment_details.forEach(item => {
                        paidAmount = paidAmount + item.amount;
                    });
                }
            }
        });

        if (allPaidPolicyList.count > 0) {
            res.status(200).send({ status: 1, paid_amount: paidAmount, message: 'Policy list found successfully' })
        } else {
            res.status(200).send({ status: 1, paid_amount: 0, message: 'No Policy found' })
        }
    } catch (error) {
        next(error)
    }
}

exports.getAllRealtorPolicyDueAmount = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        const queryOptions = {
            attributes: { exclude: ['deleted_by', 'deleted_at', 'user_agent', 'device_id', 'ip_address',] },
            where: {
                org_id: req.tokenData.org_id,
                realestate_professional_id: req.tokenData.realestate_professional_id
            },
            include: [
                {
                    model: db.policiesModel,
                    as: 'policy_info',
                    attributes: ['first_name', 'policy_id', 'plan_terms_id', 'last_name', 'email', 'mobile', 'policy_number', 'billing_address1', 'billing_city', 'billing_state', 'billing_zip', 'policy_status'],

                    include: [
                        {
                            model: db.paymentsModel,
                            as: 'payment_details',
                            where: {
                                payment_status: {
                                    [Op.ne]: 1  // Using Op.ne to find payment_status not equal to 1
                                }
                            }
                        },
                    ]
                },
            ],
            distinct: true,
            // logging: console.log,
        };


        let allPaidPolicyList = await realestateProfessionalsService.getAllPolicyProforma(queryOptions);
        // res.status(200).send({ status: 1, paid_amount: allPaidPolicyList,  message: 'Policy list found successfully' })
        // console.log('allPaidPolicyList',allPaidPolicyList);

        let dueAmount = 0;
        allPaidPolicyList.rows.forEach(obj => {
            if (obj?.policy_info) {
                if (obj.policy_info?.payment_details) {
                    obj?.policy_info.payment_details.forEach(item => {
                        dueAmount = dueAmount + item?.amount;
                    });
                }
            }

        });

        if (allPaidPolicyList.count > 0) {
            res.status(200).send({ status: 1, due_amount: parseFloat(dueAmount.toFixed(2)), message: 'Policy list found successfully' })
        } else {
            res.status(200).send({ status: 1, due_amount: 0, message: 'No Policy found' })
        }
    } catch (error) {
        next(error)
    }
}
/*****************************
 * CUSTOMER DETAILS FOR CUSTOMER PORTAL
 ******************************/
exports.getRealtorDetails = async (req, res, next) => {
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
                realestate_professional_id: paramValue
            }
        }

        const queryOptions = {
            where,

        };
        let realtorDetails = await realestateProfessionalsService.findRealestateProfessionalOne(queryOptions);
        if (realtorDetails) {
            res.status(200).send({ status: 1, message: `Realestate professional Details fetched successfully`, data: realtorDetails });

        } else {
            res.status(200).send({ status: 0, message: `Realestate professional Details not found`, });
        }

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}


/*****************************
 *  TOGGLE REALTOR STATUS
 ******************************/
exports.toggleRealtorStatus = async (req, res, next) => {
    try {
        const { realestate_professional_id } = req.params;
        const realtorExists = await realestateProfessionalsService.findRealtorById(parseInt(realestate_professional_id));
        if (realtorExists) {
            let payload = {
                active_status: parseInt(req.body.activeStatus),
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
            }
            const transaction = await db.sequelize.transaction(async (t) => {
                let updateRes = await db.realestateProfessionalsModel.update(
                    payload,
                    { where: { realestate_professional_id: realestate_professional_id }, transaction: t })
                if (updateRes[0] == 1) {
                    res.status(200).send({ status: 1, message: `Realestate professional successfully ${req.body.activeStatus ? 'enabled' : 'disabled'}.` })
                } else {
                    throw new CustomError(`Something went wrong! Post status not updated .`)
                }
            });
        } else {
            res.status(200).send({ status: 0, message: "Realestate professional not found" });
        }
    } catch (error) {
        next(error);
    }
}


/*****************************
 *  REALTOR LOGOUT
 ******************************/
exports.realtorLogOut = async (req, res) => {
    try {
        const token = req.tokenData.token;
        const { realestate_professional_id } = req.tokenData;
        const tokeRes = await db.realestateProLoginActivitiesModel.destroy({
            where: {
                token: token
            }
        })
        let queryOptions = {
            attributes: { exclude: ['password', 'deleted_by', 'deleted_at', 'device_id', 'user_agent', 'os_platform', 'ip_address'] },
        }

        let realtorResponse = await realestateProfessionalsService.findRealtorById(realestate_professional_id, queryOptions);


        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'REALESTATE_PROFESSIONAL_PORTAL',
            table_name: 'hws_realestate_professionals',
            source: 3,
            create_user_type: 3,
            device_id: helper.getDeviceId(req.headers['user-agent']),
            user_id: null,
            customer_id: realestate_professional_id,
            name: realtorResponse.contact_name,
            email: realtorResponse.email,
            row_id: realestate_professional_id,
            created_by: realestate_professional_id
        }
        if (tokeRes == 1) {
            auditData.description = 'logged out successfully from realestate professional portal';
            await helper.updateAuditTrail(auditData, req);
            res.status(200).send({ status: 1, message: 'Log out Successfully' })
        } else {
            auditData.description = 'unable to logged out from realestate professional portal';
            await helper.updateAuditTrail(auditData, req);
            res.status(200).send({ status: 0, message: 'Something went wrong' })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }

}

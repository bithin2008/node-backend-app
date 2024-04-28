'use strict';
const CustomError = require('../../../utils/customErrorHandler');
const userAuthService = require("../../../services/v1/admin/userAuthService");
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const db = require('../../../models/index')
const path = require("path");
const ejs = require('ejs');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const userService = require("../../../services/v1/admin/userService");
const mailService = require("../../../services/v1/admin/mailService");
const mailConfig = require('../../../config/mailConfig');

//USER LOGIN
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if email or password   is missing
        if (!email || !password) {
            throw new CustomError('Email and password are required', 400)
        }

        let userData = await userAuthService.findUserByEmail(email);
        userData = helper.getJsonParseData(userData)
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'ADMIN_USER_LOGIN',
            table_name: 'hws_org_users',
            source: 1,
            create_user_type: 1,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        if (userData) {
            auditData.user_id = userData.org_user_id;
            auditData.org_id = userData.org_id;
            auditData.name = userData.first_name + ' ' + userData.last_name;
            auditData.email = userData.email ? userData.email : null;
            auditData.row_id = userData.org_user_id;
            auditData.created_by = userData.org_user_id;
            if (!userData.self_activation_at) {
                // throw new CustomError(`Your account is still inactive, please activate your account from the activation email, please check your email`, 400);
                const user_activation_token = jwt.sign({ org_user_id: userData.org_user_id }, process.env.ACCESS_TOKEN, { expiresIn: '60m' })
                const password = helper.autoGeneratePassword();
                let updatepassRes = await db.orgUsersModel.update({ password: await bcrypt.hash(password, 10), }, { where: { org_user_id: userData.org_user_id } });
                if (updatepassRes[0] != 0) {
                    let dataObj = {
                        email_imageUrl : helper.email_imageUrl,
                        company_address : mailConfig.company_address,
                        company_phone : mailConfig.company_phone,
                        company_email : mailConfig.company_email,
                        company_copyright_year : mailConfig.company_copyright_year,
                        company_website : mailConfig.company_website,
                        company_website_link : mailConfig.company_website_link,
                        password: password,
                        org_user_id: userData.org_user_id,
                        url: `${helper.admin_baseUrl}auth/user-activation/${user_activation_token}`
                    }
                    let mailTrigger = await mailService.triggerMail('userCreationWelcomeTemp.ejs', dataObj, '', userData.email, 'Your Account is created. Welcome to our Family!');
                    if (mailTrigger) {
                        throw new CustomError(`Your account is still inactive, please activate your account from the activation email, please check your email`, 400);
                    } else {
                        throw new CustomError(`Something Went Wrong! failed to resend the account activation mail,Please Try Again Later`, 500)
                    }
                } else {
                    throw new CustomError(`Something Went Wrong! Password not generate successfully, Please Try Again Later`, 500)
                }
            }
            const isMatch = await userAuthService.comparePassword(password, userData.password);
            if (isMatch) {
                if (userData.active_status == 1) {
                    let ipAddrs = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
                    // if(ipAddrs.indexOf(',')>-1){
                    //     ipAddrs = ipAddrs.split(', ')[1]
                    // }
                    // console.log(['ipAddrs',ipAddrs]);
                    let isIpExist = await db.whitelistIPsModel.findOne({ where: { ip_address: ipAddrs } });
                    isIpExist = helper.getJsonParseData(isIpExist);

                    // if (isIpExist || userData.user_role_details.is_super_admin==1) {
                    let isEverLoggedIn = await db.orgUserLoginActivitiesModel.findOne({ where: { org_user_id: userData.org_user_id } });
                    isEverLoggedIn = helper.getJsonParseData(isEverLoggedIn);
                    // ENABLE 2 Way AUTH
                   // console.log('userData.user_role_details.is_super_admin',userData.user_role_details.is_super_admin);
                    // if (userData.user_role_details.is_super_admin == 1) {
                    //     const tokenData = { org_user_id: userData.org_user_id, user_role_id: userData.user_role_id, org_id: userData.org_id }
                    //     const token = jwt.sign(tokenData, process.env.ACCESS_TOKEN, { expiresIn: helper.tokenExpireIn })
                    //     const tokenTblData = {
                    //         org_user_id: userData.org_user_id,
                    //         token: token,
                    //         ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                    //         user_agent: req.headers['user-agent'],
                    //         device_id: req.headers['device-id'] ? req.headers['device-id'] : null,
                    //     }
                    //     const tokenRes = await db.orgUserLoginActivitiesModel.create(tokenTblData);
                    //     if (tokenRes.dataValues) {
                    //         auditData.description = `login successfully using email ${auditData.email}`;
                    //         await helper.updateAuditTrail(auditData,req);
                    //         res.status(200).send({ status: 2, token: token, message: 'Logged In Successfully' });
                    //     } else {
                    //         auditData.description = `unable to send login OTP to ${auditData.email}`;
                    //         await helper.updateAuditTrail(auditData,req);
                    //         res.status(200).send({ status: 0, token: token, message: 'Something Went Wrong! Please Try Again Later' });
                    //     }

                    // } else {
                        const otp = Math.floor(1000 + Math.random() * 9000);
                        let isOtpUpdated = await userAuthService.updateOTP(otp, userData.org_user_id);
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
                            const otpkey = await helper.encodeCrypto(userData.org_user_id)
                            const mailTransporter = helper.nodemailerAuth();
                            mailTransporter.sendMail(mailOptions, async (err) => {
                                if (!err) {
                                    const otpkey = await helper.encodeCrypto(userData.org_user_id)
                                    console.log({ 'login otp': otp, 'otpkey': otpkey });
                                    auditData.description = `login OTP successfully send to ${auditData.email}`;
                                    await helper.updateAuditTrail(auditData,req);
                                    if(process.env.NODE_ENV !== 'prod'){
                                        res.status(200).send({ status: 1, otp:otp, otpkey: otpkey, message: `Your Login OTP was successfully sent to your registered email address.` });
                                    }else{
                                        res.status(200).send({ status: 1, otpkey: otpkey, message: `Your Login OTP was successfully sent to your registered email address.` });
                                    }

                                } else {
                                    console.log('sendmail failed', err);
                                    auditData.description = `unable to send login OTP to ${auditData.email}`;
                                    await helper.updateAuditTrail(auditData,req);
                                    res.status(500).send({ message: `Something went wrong. Please try again later` });
                                }
                            })


                        // } else {
                        //     auditData.description = `unable to send login OTP to ${auditData.email}`;
                        //     await helper.updateAuditTrail(auditData,req);
                        //     res.status(200).send({ status: 0, message: `Something went wrong. Please try again` });
                        // }
                    }

                    // } else {                      
                    //     res.status(200).send({ status: 0, message: 'You are not authorized to login from this IP address' });
                    // }

                } else {
                    auditData.description = `unable to send login OTP to ${auditData.email} due to user not activated`;
                    await helper.updateAuditTrail(auditData,req);
                    throw new CustomError(`User not activated`, 400)
                }
            } else {
                auditData.description = `unable to send login OTP to ${auditData.email} due to invalid credential`;
                await helper.updateAuditTrail(auditData,req);
                throw new CustomError('Invalid credentials', 401)
            }
        } else {
            throw new CustomError('User not found wih this email address', 401)
        }
    } catch (error) {
        next(error);
    }
}

exports.validateLoginOtp = async (req, res, next) => {
    try {
        const otp = req.body.otp ? req.body.otp : null;
        const otpKey = req.body.otpKey ? req.body.otpKey : null;

        if (!otp) {
            throw new CustomError('OTP is required', 400)
        }
        if (!otpKey) {
            throw new CustomError('Something went wrong otp key is required', 500)
        }
        const userId = helper.decodeCrypto(otpKey)
        if (!userId) {
            throw new CustomError('Something went wrong', 500)
        }

        let userInfo = await db.orgUsersModel.findByPk(userId);
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'ADMIN_USER_VALIDATE_LOGIN_OTP',
            table_name: 'hws_org_user_login_activities',
            source: 1,
            create_user_type: 1,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        if (!userInfo) {
            throw new CustomError('Something went wrong! user not found', 404)
        } else {
            auditData.user_id = userInfo.org_user_id;
            auditData.org_id = userInfo.org_id;
            auditData.name = userInfo.first_name + ' ' + userInfo.last_name;
            auditData.email = userInfo.email ? userInfo.email : null;
            auditData.row_id = userInfo.org_user_id;
            auditData.created_by = userInfo.org_user_id;

            var newTime = moment(userInfo.otp_gen_time).add(15, 'minutes');
            //new Date(existResult[0].created_at.getTime()+config.otpExpiryTime * 60 * 1000)
            if (moment() <= newTime) {
                if (otp == userInfo.login_otp) {
                    let userRes = await db.orgUsersModel.update({ login_otp: null, last_login: moment() }, { where: { org_user_id: userId } });
                    if (userRes[0] == 1) {
                        const tokenData = { org_user_id: userId, user_role_id: userInfo.user_role_id, org_id: userInfo.org_id }
                        const token = jwt.sign(tokenData, process.env.ACCESS_TOKEN, { expiresIn: helper.tokenExpireIn })
                        const tokenTblData = {
                            org_user_id: userId,
                            token: token,
                            ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                            user_agent: req.headers['user-agent'],
                            device_id: req.headers['device-id'] ? req.headers['device-id'] : null,
                        }
                        const tokenRes = await db.orgUserLoginActivitiesModel.create(tokenTblData);
                        if (tokenRes.dataValues) {
                            auditData.description = `login successfully using email ${auditData.email}`;
                            await helper.updateAuditTrail(auditData,req);
                            res.status(200).send({ status: 1, token: token, message: 'Logged In Successfully' });
                        } else {
                            auditData.description = `unable to login using email ${auditData.email}`;
                            await helper.updateAuditTrail(auditData,req);
                            res.status(200).send({ status: 0, token: token, message: 'Something Went Wrong! Please Try Again Later' });
                        }
                    }
                } else {
                    auditData.description = `unable to login using email ${auditData.email} due to invalid OTP`;
                    await helper.updateAuditTrail(auditData,req);
                    throw new CustomError(`Invalid login otp`, 400)
                }
            } else {
                auditData.description = `unable to login using email ${auditData.email} due to OTP expired`;
                await helper.updateAuditTrail(auditData,req);
                res.status(200).send({ status: 0, message: `OTP Expired` });
            }
        }
    } catch (error) {

        next(error);
    }
}

exports.resendLoginOtp = async (req, res, next) => {
    try {
        if (!req.body.otpKey) {
            throw new CustomError('Bad request', 400)
        }
        const orgUserId = helper.decodeCrypto(req.body.otpKey)
        if (!orgUserId) {
            throw new CustomError('Bad request', 400)
        }
        const userData = await db.orgUsersModel.findOne({ where: { org_user_id: orgUserId } });
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'ADMIN_USER_RESEND_LOGIN_OTP',
            table_name: 'hws_org_user_login_activities',
            source: 1,
            create_user_type: 1,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        if (userData) {
            auditData.user_id = userData.org_user_id;
            auditData.org_id = userData.org_id;
            auditData.name = userData.first_name + ' ' + userData.last_name;
            auditData.email = userData.email ? userData.email : null;
            auditData.row_id = userData.org_user_id;
            auditData.created_by = userData.org_user_id;

            const otp = Math.floor(1000 + Math.random() * 9000);
            let isOtpUpdated = await userAuthService.updateOTP(otp, orgUserId);
            if (isOtpUpdated[0] == 1) {
                const templatePath = path.join(__dirname, '../../../view/emailTemplate/otpTemp.ejs');
                let  dataObj={
                    company_address : mailConfig.company_address,
                    company_phone : mailConfig.company_phone,
                    company_email : mailConfig.company_email,
                    company_copyright_year : mailConfig.company_copyright_year,
                    company_website : mailConfig.company_website,
                    company_website_link : mailConfig.company_website_link,
                    email_imageUrl :helper.email_imageUrl
                }
                //await userAuthService.resendOtp(otp, userData.id,userData.email,templatePath,)

                const templatedata = await ejs.renderFile(templatePath, {
                    otp,
                    dataObj
                })
                const mailOptions = {
                    from: helper.emailForm,
                    to: userData.email,
                    subject: 'Your Login OTP',
                    html: templatedata
                };
                const mailTransporter = helper.nodemailerAuth();
                mailTransporter.sendMail(mailOptions, async (err) => {
                    if (!err) {
                        auditData.description = `login OTP was successfully resend to ${auditData.email}`;
                        await helper.updateAuditTrail(auditData,req);
                        res.status(200).send({ status: 1, message: `Your Login OTP was successfully sent to your registered email address.` });
                    } else {
                        auditData.description = `unable to send login OTP to ${auditData.email}`;
                        await helper.updateAuditTrail(auditData,req);
                        res.status(500).send({ message: `Something went wrong. Please try again later` });
                    }
                })

            } else {
                auditData.description = `unable to send login OTP to ${auditData.email}`;
                await helper.updateAuditTrail(auditData,req);
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
        if (!req.body.emailId) {
            throw new CustomError('Email is required', 400)
        }
        const data = {
            email: req.body.emailId,
        }

        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'ADMIN_USER_GENERATE_FORGOT_PASSWORD_LINK',
            table_name: 'hws_org_user_login_activities',
            source: 1,
            create_user_type: 1,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }

        const userData = await await userAuthService.findUserByEmail(data.email);
        if (userData) {
            const tokenData = { user_email: userData.email }
            const token = helper.generateToken(tokenData, '10m')
            const forgot_passwordData = {
                org_user_id: userData.org_user_id,
                token: token,
                created_at: helper.date('YYYY-MM-DD HH:mm:ss'),
                active_status: 1
            }
            auditData.user_id = userData.org_user_id;
            auditData.org_id = userData.org_id;
            auditData.name = userData.first_name + ' ' + userData.last_name;
            auditData.email = userData.email ? userData.email : null;
            auditData.row_id = userData.org_user_id;
            auditData.created_by = userData.org_user_id;
            const forgotPasswordResponse = await db.orgUserForgotPasswordActivitiesModel.create(forgot_passwordData);
            if (forgotPasswordResponse) {
                const url = `${helper.admin_baseUrl}auth/reset-password/${token}`

                let dataObj = {
                    url: url,
                    name: userData.first_name,
                }
                dataObj.company_address = mailConfig.company_address,
                dataObj.company_phone = mailConfig.company_phone,
                dataObj.company_email = mailConfig.company_email,
                dataObj.company_copyright_year = mailConfig.company_copyright_year;
                dataObj.company_website = mailConfig.company_website;
                dataObj.company_website_link = mailConfig.company_website_link;
                dataObj.email_imageUrl =helper.email_imageUrl
                let mailTrigger = await mailService.triggerMail('forgotPasswordTemp.ejs', dataObj, '', userData.email, 'Create new Password.');
                if (mailTrigger) {
                    auditData.description = `password link successfully send to ${auditData.email}`;
                    await helper.updateAuditTrail(auditData,req);
                    res.status(201).send({ status: 1, message: "Password reset link is sent to your email.", });

                } else {
                    auditData.description = `unable to send password link to ${auditData.email}`;
                    await helper.updateAuditTrail(auditData,req);
                    throw new CustomError(`Something Went Wrong! Try Again Later`, 500)
                }
            } else {
                auditData.description = `unable to send password link to ${auditData.email}`;
                await helper.updateAuditTrail(auditData,req);
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
exports.updatePassword = async (req, res, next) => {
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
                let userData = await db.orgUsersModel.findOne({ where: { email: tokenDataResponse.user_email } });
                userData = helper.getJsonParseData(userData);
                // AUDIT TRAIL PAYLOAD
                let auditData = {
                    section: 'ADMIN_USER_GENERATE_FORGOT_PASSWORD_LINK',
                    table_name: 'hws_org_user_login_activities',
                    source: 1,
                    create_user_type: 1,
                    device_id: helper.getDeviceId(req.headers['user-agent']),
                }
                if (userData) {
                    const user = userData
                    let forgotPassRes = await db.orgUserForgotPasswordActivitiesModel.findOne({
                        where: { org_user_id: user.org_user_id }, order: [
                            ['org_user_forgot_password_activity_id', 'DESC']
                        ],
                    });

                    auditData.user_id = userData.org_user_id;
                    auditData.org_id = userData.org_id;
                    auditData.name = userData.first_name + ' ' + userData.last_name;
                    auditData.email = userData.email ? userData.email : null;
                    auditData.row_id = userData.org_user_id;
                    auditData.created_by = userData.org_user_id;
                    forgotPassRes = helper.getJsonParseData(forgotPassRes)
                    if (forgotPassRes.active_status == 1) {
                        const newPassword = await bcrypt.hash(req.body.new_password, 10);
                        const usersModelRes = await db.orgUsersModel.update({ password: newPassword }, { where: { org_user_id: user.org_user_id } })
                        if (usersModelRes[0] == 1) {
                            const updateForgotPasswordRes = await db.orgUserForgotPasswordActivitiesModel.update({ active_status: 0 }, { where: { org_user_id: user.org_user_id } })
                            if (updateForgotPasswordRes[0] != 0) {
                                let dataObj = {
                                    name: user.first_name,
                                    password: req.body.new_password,
                                    email_imageUrl : helper.email_imageUrl,
                                    company_address : mailConfig.company_address,
                                    company_phone : mailConfig.company_phone,
                                    company_email : mailConfig.company_email,
                                    company_copyright_year : mailConfig.company_copyright_year,
                                    company_website : mailConfig.company_website,
                                    company_website_link : mailConfig.company_website_link,
                                }
                                let mailTrigger = await mailService.triggerMail('updatePaasswordTemp.ejs', dataObj, '', user.email, 'Your Password Has Been Changed Successfully.');
                                if (mailTrigger) {
                                    auditData.description = `unable to send password link to ${auditData.email}`;
                                    await helper.updateAuditTrail(auditData,req);
                                    res.status(201).send({ status: 1, message: "Your password has been changed successfully.", });

                                } else {
                                    auditData.description = `unable to update password`;
                                    await helper.updateAuditTrail(auditData,req);
                                    throw new CustomError(`Something Went Wrong! Try Again Later`, 500)
                                }
                            } else {
                                auditData.description = `unable to update password`;
                                await helper.updateAuditTrail(auditData,req);
                                res.status(200).send({ status: 0, message: 'Password Not Updated' })

                            }
                        } else {
                            auditData.description = `unable to update password`;
                            await helper.updateAuditTrail(auditData,req);
                            res.status(400).send({ status: 0, message: 'Something went wrong' })
                        }
                    } else {
                        auditData.description = `unable to update password due to forgot password link is expire`;
                        await helper.updateAuditTrail(auditData,req);
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
        let userData = await userService.findUserById(req.tokenData.org_user_id);
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'ADMIN_USER_CHANGE_PROFILE_PASSWORD',
            table_name: 'hws_org_users',
            source: 1,
            create_user_type: 1,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        if (userData) {
            auditData.user_id = userData.org_user_id;
            auditData.org_id = userData.org_id;
            auditData.name = userData.first_name + ' ' + userData.last_name;
            auditData.email = userData.email ? userData.email : null;
            auditData.row_id = userData.org_user_id;
            auditData.created_by = userData.org_user_id;
            const isMatch = await userAuthService.comparePassword(req.body.old_password, userData.password);
            if (!isMatch) {
                throw new CustomError('Old password is not matched', 400)
            }
            const user = userData
            const newPassword = await bcrypt.hash(req.body.new_password, 10);
            const usersModelRes = await db.orgUsersModel.update({ password: newPassword }, { where: { org_user_id: user.org_user_id } })
            if (usersModelRes[0] == 1) {
                let dataObj = {
                    name: user.first_name,
                    password: req.body.new_password,
                    email_imageUrl : helper.email_imageUrl,
                    company_address : mailConfig.company_address,
                    company_phone : mailConfig.company_phone,
                    company_email : mailConfig.company_email,
                    company_copyright_year : mailConfig.company_copyright_year,
                    company_website : mailConfig.company_website,
                    company_website_link : mailConfig.company_website_link,
                }
                let mailTrigger = await mailService.triggerMail('updatePaasswordTemp.ejs', dataObj, '', user.email, 'Successfully changing the profile password.');
                if (mailTrigger) {
                    auditData.description = `profile password changed successfully`;
                    await helper.updateAuditTrail(auditData,req);
                    res.status(201).send({ status: 1, message: "Successfully changing the profile password.", });

                } else {
                    auditData.description = `unable to change profile password`;
                    await helper.updateAuditTrail(auditData,req);
                    throw new CustomError(`Something Went Wrong! Try Again Later`, 500)
                }
            } else {
                auditData.description = `unable to change profile password`;
                await helper.updateAuditTrail(auditData,req);
                res.status(400).send({ status: 0, message: 'Something went wrong' })
            }
        } else {
            res.status(200).send({ status: 0, message: 'User not found' })
        }
    } catch (error) {

        next(error);
    }
}

// exports.verifyToken = async (req, res, next) => {
//     const t = await db.sequelize.transaction(); // Start a transaction
//     try {
//         const userId = req.tokenData.org_user_id
//         let queryOptions = {
//             //required:false,
//             attributes: { exclude: ['password', 'deleted_by', 'deleted_at', 'device_id', 'user_agent', 'os_platform', 'ip_address'] },
//             include: [
//                 {
//                     model: db.organizationsModel,
//                     as: 'organization_details',

//                     attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] }
//                 },
//                 {
//                     model: db.orgDepartmentsModel,
//                     as: 'department_details',
//                     attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] }
//                 },
//                 {
//                     model: db.orgUserRolesModel,
//                     as: 'user_role_details',
//                     attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },

//                 },
//                 {
//                     model: db.orgUserAccessPermissionsModel,
//                     as: 'accessable_module_submodules',
//                     // attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
//                     include: [
//                         {
//                             model: db.orgModulesModel,
//                             as: 'module_details',
//                             attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
//                         },
//                         {
//                             model: db.orgSubModulesModel,
//                             as: 'submod_details',
//                             attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
//                         },
//                         {
//                             model: db.permissionCombinationsModel, as: 'permission_details',
//                             attributes: ['combination']
//                         },
//                     ],

//                 },

//             ],
//             //    logging: console.log, // Add this line

//         }

//         let userRes = await userService.findUserById(userId, queryOptions, t);
//         if (userRes) {
//             userRes.token = req.tokenData.token;
//             userRes.current_time = moment();
//             const response = userRes /* your response data */
//             const groupedData = {};
//             response.accessable_module_submodules.forEach(item => {
//                 const moduleKey = item.module_details.org_module_id;
//                 // If the moduleKey doesn't exist in groupedData, create it
//                 if (!groupedData[moduleKey]) {
//                     groupedData[moduleKey] = {
//                         module_details: item.module_details,
//                         submodules: []
//                     };
//                 }
//                 item.submod_details.permission_combination_id = item.permission_combination_id
//                 // Push the submodule_details to the submodules array
//                 item.submod_details.permission_details = { ...item.permission_details, permission_combination_id: item.permission_combination_id }
//                 groupedData[moduleKey].submodules.push({ ...item.submod_details });
//             });
//             // Convert the grouped data object into an array
//             const finalGroupedData = Object.values(groupedData);
//             // Now 'finalGroupedData' contains the data structure you want             
//             userRes.accessable_module_submodules = finalGroupedData;
//             await t.commit();
//             res.status(200).send({ status: 1, message: 'User Successfully verified', data: userRes });
//         } else {
//             throw new CustomError(`Something went wrong! user not found`, 500)
//         }
//     } catch (error) {
//         await t.rollback();
//         next(error)
//     }
// }
exports.verifyToken = async (req, res, next) => {
    let t;
    try {
        t = await db.sequelize.transaction(); // Start a transaction

        const userId = req.tokenData.org_user_id;
        const queryOptions = {
            attributes: { exclude: ['password', 'deleted_by', 'deleted_at', 'device_id', 'user_agent', 'os_platform', 'ip_address'] },
            include: [
                {
                    model: db.organizationsModel,
                    as: 'organization_details',
                    attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] }
                },
                {
                    model: db.orgDepartmentsModel,
                    as: 'department_details',
                    attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] }
                },
                {
                    model: db.orgUserRolesModel,
                    as: 'user_role_details',
                    attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
                },
                {
                    model: db.orgUserAccessPermissionsModel,
                    as: 'accessable_module_submodules',
                    include: [
                        {
                            model: db.orgModulesModel,
                            as: 'module_details',
                            attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
                        },
                        {
                            model: db.orgSubModulesModel,
                            as: 'submod_details',
                            attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
                        },
                        {
                            model: db.permissionCombinationsModel, as: 'permission_details',
                            attributes: ['combination']
                        },
                    ],
                },
            ],
        }

        const userRes = await userService.findUserById(userId, queryOptions, t);
        if (!userRes) {
            throw new CustomError(`User not found`, 404);
        }

        // Process the user response
        userRes.token = req.tokenData.token;
        userRes.current_time = moment();

        // Group the accessable_module_submodules data
        const groupedData = {};
        userRes.accessable_module_submodules.forEach(item => {
            const moduleKey = item.module_details.org_module_id;
            if (!groupedData[moduleKey]) {
                groupedData[moduleKey] = {
                    module_details: item.module_details,
                    submodules: []
                };
            }
            item.submod_details.permission_details = { ...item.permission_details, permission_combination_id: item.permission_combination_id };
            groupedData[moduleKey].submodules.push({ ...item.submod_details });
        });

        // Convert the grouped data object into an array
        const finalGroupedData = Object.values(groupedData);
        userRes.accessable_module_submodules = finalGroupedData;

        // Commit the transaction
        await t.commit();

        res.status(200).send({ status: 1, message: 'User verified successfully', data: userRes });
    } catch (error) {
        // Rollback the transaction if an error occurs
        if (t) await t.rollback();
        next(error);
    }
}

exports.verifyUserSelfActivation = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        jwt.verify(req.params.usertoken, process.env.ACCESS_TOKEN, async (err, userObj) => {
            if (err) {
                res.status(500).send({ status: 0, message: 'Activation Link is expired.' });
            } else {
                if (moment().valueOf() <= moment(userObj.activation_exp_time).valueOf()) {
                    const userExists = await userService.findUserById(userObj.org_user_id);

                    let userExistsObj = JSON.parse(JSON.stringify(userExists));
                    if (!userExistsObj) {
                        res.status(200).send({ status: 0, message: "User not found" });
                    } else if (userExistsObj && userExistsObj.self_activation_at) {
                        res.status(200).send({ status: 1, message: `User already activated` });
                    } else {
                        // userExistsObj.self_activation_at = moment().format("YYYY-MM-DD HH:mm:ss");
                        const userStatus = await userService.togglUserActiveStatus({ self_activation_at: moment().format("YYYY-MM-DD HH:mm:ss"), active_status: 1 }, userExistsObj.org_user_id, transaction);
                        transaction.commit()
                        if (!userStatus) {
                            throw new CustomError('Something went wrong', 500)
                        } else {
                            res.status(200).send({ status: 1, message: `User activated successfully` });
                        }
                    }
                } else {
                    res.status(200).send({ status: 0, message: `Activation Link Expired` });
                }
            }
        })

    } catch (error) {
        transaction.rollback()
        next(error)
        // res.status(500).send(error);
    }
}



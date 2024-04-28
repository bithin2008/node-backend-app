require("dotenv").config();
const config = require("../../../config/config");
const CustomError = require("../../../utils/customErrorHandler");
const helper = require('../../../common/helper');
const systemAdminService = require("../../../services/v1/admin/systemAdminService");
const userAuthService = require("../../../services/v1/admin/userAuthService");
const mailService = require("../../../services/v1/admin/mailService");
const db = require('../../../models/index');
const path = require("path");
const ejs = require('ejs');
const moment = require("moment");
const bcrypt = require('bcryptjs')
const os = require('os');
const jwt = require('jsonwebtoken');
const DeviceDetector = require('node-device-detector');
const mailConfig = require("../../../config/mailConfig");


/*****************************
 *  CREATE SYSTEM ADMIN
 ******************************/
exports.createSystemAdministrator = async (req, res, next) => {
    try {
        const transaction = await db.sequelize.transaction();
        const userAgent = req.headers["user-agent"];
        const password = helper.autoGeneratePassword();
        const detector = new DeviceDetector({
            clientIndexes: true,
            deviceIndexes: true,
            deviceAliasCode: false,
        });
        const deviceRes = detector.detect(userAgent);
        const data = {
            name: req.body.name,
            email: req.body.emailId,
            password: await bcrypt.hash(password, 10),
            mobile: req.body.mobile,
            //last_login: req.body.lastLogin ? req.body.lastLogin : null,
            ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            login_otp: null,//Math.floor(1000 + Math.random() * 9000),
            login_otp_expired_at: null,// moment().add(req.body.loginOTPExpiredAt, 'minutes'),
            device_id: deviceRes.device.type,
            os_platform: os.platform(),
            user_agent: userAgent
        };
        const emailExists = await systemAdminService.findSystemAdminByEmail(req.body.emailId);

        if (!emailExists) {
            let createdSystemAdmin = await db.systemAdministratorsModel.create(data, { transaction });
            if (createdSystemAdmin.system_administrator_id) {
                
                let dataObj = {
                    password: password,
                    email_imageUrl : helper.email_imageUrl,
                }
                let mailTrigger = await mailService.triggerMail('systemAdminPasswordTemp.ejs', dataObj, '', createdSystemAdmin.email, 'Your Account is created. Now you are a System Administrator;');
                if (mailTrigger) {
                    transaction.commit();
                    res.status(201).send({
                        status: 1,
                        message: "System administrator Created Successfully.",
                    });
                } else {
                    await transaction.rollback();
                    res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
                }
            } else {
                res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
            }
        } else {
            res.status(200).send({ status: 0, message: "Email id already exists" });
        }
    } catch (error) {
        next(error);
    }
}



/*****************************
 *  GET ALL SYSTEM ADMIN
 ******************************/
exports.getAllSystemAdmin = async (req, res, next) => {
    try {
        let limit = res.pagination.limit
        let offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * limit)
        let allSystemAdmin = await db.systemAdministratorsModel.findAndCountAll({
            attributes: ['system_administrator_id', 'name', 'email', 'mobile', 'is_system_admin', 'last_login', 'created_at'],
            offset: offset, limit: limit
        })
        res.pagination.total = allSystemAdmin.count
        res.pagination.totalPages = Math.ceil(allSystemAdmin.count / limit)
        res.status(200).send({ status: 1, data: allSystemAdmin.rows, pagination: res.pagination, message: 'System Admin found Successfully' })
    } catch (error) {
        console.log(error);
        next(error)
    }
}


/*****************************
 *  VERIFY SYSTEM ADMIN TOKEN
 ******************************/

exports.verifySystemAdminToken = async (req, res) => {
    try {
        const systemAdministratorId = req.tokenData.system_administrator_id
        let systemAdminRes = await db.systemAdministratorsModel.findByPk(systemAdministratorId);
        systemAdminRes = JSON.parse(JSON.stringify(systemAdminRes))
        systemAdminRes.created_at = moment(systemAdminRes.created_at).format('YYYY-MM-DD');
        systemAdminRes.token = req.tokenData.token;
        systemAdminRes.current_time = moment();
        if (systemAdminRes) {
            res.status(200).send({
                status: 1, message: 'System admin Successfully verified',
                data: systemAdminRes
            });
        } else {
            res.status(200).send({ status: 0, message: 'Something went wrong', });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

/*****************************
 *  LOGIN SYSTEM ADMIN
 ******************************/
exports.systemAdminlogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if email or password   is missing
        if (!email || !password) {
            throw new CustomError('Email and password are required', 400)
        }

        const systemAdminData = await systemAdminService.findSystemAdminByEmail(email);
        if (systemAdminData) {
            const isMatch = await userAuthService.comparePassword(password, systemAdminData.password);
            if (isMatch) {
                const otp = Math.floor(1000 + Math.random() * 9000);
                let isOtpUpdated = await systemAdminService.updateOTP(otp, systemAdminData.system_administrator_id);
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
                    const otpkey = await helper.encodeCrypto(systemAdminData.system_administrator_id)//btoa(userData.id)//userData.id//
                    const mailTransporter = helper.nodemailerAuth();
                    mailTransporter.sendMail(mailOptions, async (err) => {
                        if (!err) {
                            const otpkey = await helper.encodeCrypto(systemAdminData.system_administrator_id)//btoa(userData.id)//userData.id//
                            console.log({ 'system admin login otp': otp, 'otpkey': otpkey });
                            res.status(200).send({ status: 1, otpkey: otpkey, message: `Your Login OTP was successfully sent to your registered email address.` });
                        } else {
                            console.log('sendmail failed', err);
                            res.status(500).send({ message: `Something went wrong. Please try again later` });
                        }
                    })

                } else {
                    res.status(200).send({ status: 0, message: `Something went wrong. Please try again` });
                }

            } else {
                throw new CustomError('Invalid credentials', 401)
            }
        } else {
            throw new CustomError('Invalid credentials', 401)
        }
    } catch (error) {
        next(error);
    }
}


/**************************************
 *  VALIDATE LOGIN OTP  (SYSTEM ADMIN)
 *************************************/
exports.validateLoginOtp = async (req, res, next) => {
    try {
        const otp = req.body.otp ? req.body.otp : null;
        const otpKey = req.body.otpKey ? req.body.otpKey : null;

        if (!otp) {
            throw new CustomError('OTP is required', 400)
        }
        if (!otpKey) {
            throw new CustomError('Something went wrong', 500)
        }
        const system_administrator_id = helper.decodeCrypto(otpKey)
        if (!system_administrator_id) {
            throw new CustomError('Something went wrong', 500)
        }

        let systemAdminInfo = await db.systemAdministratorsModel.findByPk(system_administrator_id)
        if (!systemAdminInfo) {
            throw new CustomError('Something went wrong! user not found', 404)
        } else {
            if (moment(systemAdminInfo.login_otp_expired_at).valueOf() <= moment().valueOf()) {
                if (otp == systemAdminInfo.login_otp) {
                    const tokenData = { system_administrator_id: system_administrator_id, is_system_admin: systemAdminInfo.is_system_admin }
                    const token = jwt.sign(tokenData, process.env.ACCESS_TOKEN, { expiresIn: helper.tokenExpireIn })
                    let systemAdminRes = await db.systemAdministratorsModel.update({ last_login: moment(), token: token }, { where: { system_administrator_id: system_administrator_id } });

                    if (systemAdminRes[0] == 1) {
                        res.status(200).send({ status: 1, token: token, message: 'Logged In Successfully' });
                    } else {
                        res.status(200).send({ status: 0, message: 'Something Went Wrong! Please Try Again Later' });
                    }
                } else {
                    res.status(200).send({ status: 0, message: 'Otp not matched' });
                }
            } else {
                res.status(200).send({ status: 0, message: `OTP Expired` });
            }
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
}

/**************************************
 *  GENERATE FOROT PASSWORD LINK  (SYSTEM ADMIN)
 *************************************/
exports.generateForgotPassLink = async (req, res, next) => {
    try {
        if (!req.body.email) {
            throw new CustomError('Email is required', 400)
        }
        const data = {
            email: req.body.email,
        }

        const resPonseData = await db.systemAdministratorsModel.findOne({ where: { email: data.email } });
        let systemAdminData = JSON.parse(JSON.stringify(resPonseData));
        if (systemAdminData) {
            const tokenData = { system_admin_email: systemAdminData.email }
            const token = helper.generateToken(tokenData, '60m');
            const transaction = await db.sequelize.transaction(async (t) => {
                let forgotPasswordResponse = await db.systemAdministratorsModel.update(
                    { forgot_password_token: token, forgot_password_link_expired_at: moment().add(60, 'minutes') },
                    { where: { system_administrator_id: systemAdminData.system_administrator_id }, transaction: t });

                if (forgotPasswordResponse) {
                    const url = `${helper.admin_baseUrl}auth/system-admin-reset-password/${token}`
                    // const templatePath = path.join(__dirname, '../templates/forgotPassTemp.ejs');    
                    // const templatedata = await ejs.renderFile(templatePath, {
                    //     url
                    // })
                    const mailTransporter = helper.nodemailerAuth();
                    const mailOptions = {
                        from: helper.emailForm,
                        to: systemAdminData.email,
                        subject: 'Create new Password',
                        //text: `Your login OTP is ${otp}; it will expire in 10 minutes.`
                        html: `<p style="font-size: 18px;">If you have lost your password or wish to reset it, use the link below to get started.</p>                       
                                <div align="center" class="btn" style="text-align: center; padding-top: 20px;">
                                    <a href="${url}" target="_blank">Reset Password</a>
                                </div>`//templatedata
                    };
                    mailTransporter.sendMail(mailOptions, async (err) => {
                        if (!err) {
                            res.status(200).send({ status: 1, message: `Password reset link is sent to your email` });
                        } else {
                            console.log('sendmail failed', err);
                            res.status(500).send({ status: 0, message: `Something went wrong. Please try again` });
                        }
                    })

                } else {
                    res.status(200).send({ status: 0, message: `Something went wrong. Please try again` });

                }
            });
            //  const forgotPasswordResponse = await db.userForgotPassActivitesModel.create(forgot_passwordData);


        } else {
            res.status(200).send({ status: 0, message: `User Not Found` });
        }

    } catch (error) {
        console.log(error);
        next(error);
    }
}

/**************************************
 *  CHANGE PASSWORD FROM PROFILE (SYSTEM ADMIN)
 *************************************/

exports.changePassword = async (req, res, next) => {
    try {
        if (!req.body.old_password || !req.body.new_password) {
            throw new CustomError('Old password and new password are required', 400)
        }
        let userData = await db.systemAdministratorsModel.findOne({ where: { system_administrator_id: req.tokenData.system_administrator_id } });

        if (userData) {
            const isMatch = await systemAdminService.comparePassword(req.body.old_password, userData.password);
            if (!isMatch) {
                throw new CustomError('Old password is not matched', 400);
            }
            const user = userData
            const newPassword = await bcrypt.hash(req.body.new_password, 10);
            const usersModelRes = await db.systemAdministratorsModel.update({ password: newPassword }, { where: { system_administrator_id: user.system_administrator_id } })
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
                    res.status(201).send({ status: 1, message: "Successfully changing the profile password.", });

                } else {
                    throw new CustomError(`Something Went Wrong! Try Again Later`, 500)
                }
            } else {
                res.status(400).send({ status: 0, message: 'Something went wrong' })
            }
        } else {
            res.status(200).send({ status: 0, message: 'Forgot password link is expire, please generate new one' })
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
}


/**************************************
 *  UPDATE PASSWORD  (SYSTEM ADMIN)
 *************************************/
exports.updatePassword = async (req, res, next) => {
    try {
        if (!req.body.password_key || !req.body.new_password) {
            throw new CustomError('New password are required', 400)
        }
        jwt.verify(req.body.password_key, process.env.ACCESS_TOKEN, async (err, tokenDataResponse) => {
            if (err) {
                console.log('err', err);
                if (err.name === 'TokenExpiredError') {
                    // JWT token has expired
                    return res.status(498).json({ status: 0, message: 'Forgot password link has expired' });
                } else {
                    // Other JWT verification errors
                    throw new CustomError('Invalid Access Token', 498);
                }
                // throw new CustomError( `Invalid Access Token`,498 )
            } else {

                let response = await db.systemAdministratorsModel.findOne({ where: { email: tokenDataResponse.system_admin_email } });
                let systemAdmin = JSON.parse(JSON.stringify(response))
                if (systemAdmin) {
                    if (systemAdmin.is_system_admin == 1) {
                        const newPassword = await bcrypt.hash(req.body.new_password, 10);
                        const systemAdminRes = await db.systemAdministratorsModel.update({ password: newPassword }, { where: { system_administrator_id: systemAdmin.system_administrator_id } })

                        if (systemAdminRes[0] == 1) {
                            //const templatePath = path.join(__dirname, '../templates/changePassTemp.ejs');
                            let user_name = systemAdmin.name
                            let password = req.body.new_password
                            const url = `${helper.admin_baseUrl}/auth/system-admin-login`
                            // const templatedata = await ejs.renderFile(templatePath, {
                            //     user_name,
                            //     password,
                            //     url
                            // })
                            const mailTransporter = helper.nodemailerAuth();
                            const mailOptions = {
                                from: helper.emailForm,
                                to: systemAdmin.email,
                                subject: 'Your password has been changed successfully',
                                //text: `Its a Test Mail Service,  Your password is ${password}`
                                html: ` <tr>
                                        <td class="wrapper">
                                            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td>
                                                        <h2 style="font-size: 20px;">Hello ${user_name},</h2>
                                                        <p>You have successfully changed your password.</p>
                                                        <br>
                                                        <p>Your new password is : <a style="text-decoration: none; color:#0035f7; font-weight:bold; padding:4px 15px; border-radius: 4px; border:1px solid #0035f7;"> ${password}</a></p>
                                                        <br>
                                                        <p>Use the link given below to enter.</p>
                                                        <div align="center" class="btn" style="text-align: center; padding-top: 20px; margin-bottom: 25px;">
                                                            <a href="${url}" target="_blank" rel="noopener noreferrer">Login Here</a>
                                                        </div>
                                                        <p style="font-size: 12px; text-align: center;">*Please note your password is your own personal gateway into your account.
                                                            Please do not disclose /share this password to anyone.</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>`//templatedata
                            };

                            mailTransporter.sendMail(mailOptions, (err) => {
                                if (!err) {
                                    res.status(200).send({ status: 1, message: 'Password Update Successfully' })
                                } else {
                                    console.log('sendmail failed', err);

                                }
                            })



                            res.status(200).send({ status: 1, message: 'Password Update Successfully' })
                        } else {
                            res.status(200).send({ status: 0, message: 'Password Not Updated' })
                        }
                    } else {
                        res.status(200).send({ status: 0, message: 'User is not super admin' })
                    }

                } else {
                    res.status(200).send({ status: 0, message: 'Failed! system admin not found' })
                }

            }
        })
    } catch (error) {
        console.log(error);
        next(error);
    }
}


/**************************************
 *  RESEND LOGIN OTP  (SYSTEM ADMIN)
 *************************************/

exports.resendLoginOtp = async (req, res, next) => {
    try {
        if (!req.body.otpKey) {
            throw new CustomError('Bad request', 400)
        }
        const system_administrator_id = helper.decodeCrypto(req.body.otpKey)
        if (!system_administrator_id) {
            throw new CustomError('Bad request', 400)
        }
        const userData = await db.systemAdministratorsModel.findOne({ where: { system_administrator_id: system_administrator_id } });
        if (userData) {
            const otp = Math.floor(1000 + Math.random() * 9000);
            let isOtpUpdated = await db.systemAdministratorsModel.update({ login_otp: otp }, { where: { system_administrator_id } });
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
                        res.status(200).send({ status: 1, message: `Your Login OTP was successfully sent to your registered email address.` });
                    } else {
                        console.log('sendmail failed', err);
                        res.status(500).send({ message: `Something went wrong. Please try again later` });
                    }
                })

            } else {
                res.status(200).send({ status: 0, message: `Something went wrong. Please try again.` });
            }
        } else {
            res.status(200).send({ status: 0, message: `User not Found, invalid credentials` })
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
};
/*****************************
 *  SYSTEM ADMIN LOGOUT
 ******************************/
exports.logOut = async (req, res) => {
    try {
        const token = req.tokenData.token;
        if (token) {
            let systemAdminRes = await db.systemAdministratorsModel.update({ token: null }, { where: { token: token } });
            if (systemAdminRes == 1) {
                res.status(200).send({ status: 1, message: 'Log out Successfully' })
            } else {
                res.status(200).send({ status: 0, message: 'Something went wrong' })
            }
        } else {
            res.status(200).send({ status: 0, message: 'Something went wrong' })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }

}




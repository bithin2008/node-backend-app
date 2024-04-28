const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');
const jwt = require('jsonwebtoken');

//FIND USER BY EMAIL ADDRESS
exports.findUserByEmail = async (val) => {
    try {
        var user = await db.orgUsersModel.findOne({ where: { email: db.Sequelize.where(db.Sequelize.fn('LOWER', db.Sequelize.col('email')), '=', val.toLowerCase()) },
            include: [            
            {
                model: db.orgUserRolesModel,
                as: 'user_role_details',
                attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },

            }         

        ] });
        return user;
    } catch (e) {
        console.log(e);
        throw e
        // throw Error('Error while fetching User')
    }
}

//COMPARE PASSWORD
exports.comparePassword = async (pass, userPass) => {
    try {
        var users = await bcrypt.compare(pass, userPass);
        return users;
    } catch (e) {
        throw Error('Error while comparing password')
    }
}

//UPDATE OTP
exports.updateOTP = async (otp, orgUserId) => {
    try {
        var updateRes = await db.orgUsersModel.update({ login_otp: otp, login_otp_created_at: helper.date("YYYY-MM-DD HH:mm:ss") }, { where: { org_user_id: orgUserId } });
        return updateRes;
    } catch (e) {
        throw Error('Error while updating OTP')
    }
}

// RESEND OTP

exports.resendOtp = async (templatePath) => {
    try {
        const templatedata = await ejs.renderFile(templatePath, {
            otp
        })
        const mailOptions = {
            from: helper.emailForm,
            to: email,
            subject: 'Your Login OTP',
            html: templatedata
        };
        return users;
    } catch (e) {
        throw new CustomError('Something went wrong!', 500)
    }
}
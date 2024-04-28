const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');
const jwt = require('jsonwebtoken');

//FIND SYSTEM ADMIN BY EMAIL ADDRESS
exports.findSystemAdminByEmail = async (val) => {
    try {
        var user = await db.systemAdministratorsModel.findOne({ where: { email: val } });
        return user;
    } catch (e) {
        console.log(e);
        // throw Error('Error while fetching User')
    }
}

//UPDATE OTP
exports.updateOTP = async (otp, system_administrator_id) => {
    try {
        var users = await db.systemAdministratorsModel.update({ login_otp: otp, login_otp_expired_at: helper.date("YYYY-MM-DD HH:mm:ss ") }, { where: { system_administrator_id: system_administrator_id } });
        return users;
    } catch (e) {
        throw Error('Error while updating OTP')
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




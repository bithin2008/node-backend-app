const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');

//FIND REALTOR BY EMAIL ID
exports.findRealtorProByEmail = async (email) => {
    try {
        let realtorPro = await db.realestateProfessionalsModel.findOne({ where: { email: db.Sequelize.where(db.Sequelize.fn('LOWER', db.Sequelize.col('email')), '=', email.toLowerCase()) } });
        return realtorPro ? helper.getJsonParseData(realtorPro) : null
    } catch (e) {
        throw e
    }
}


exports.findRealestateProfessionalOne= async (queryOption) => {
    try {
        let realtor = await db.realestateProfessionalsModel.findOne(queryOption);
        return realtor?helper.getJsonParseData(realtor):null;

    } catch (e) {
        throw e
    }
}



//SUBMIT AFFILIATE
exports.submitRealestateProfessional = async (obj, transaction) => {
    try {

        let submittedRealestateProfessional = await db.realestateProfessionalsModel.create(obj, { transaction });
        return submittedRealestateProfessional;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//GET ALL AFFILIATE
exports.getAllRealestateProfessionals = async (queryOptions = {}) => {
    try {
        let allRealestateProfessionals = await db.realestateProfessionalsModel.findAndCountAll(queryOptions)
        return allRealestateProfessionals ? helper.getJsonParseData(allRealestateProfessionals) : null
    } catch (e) {
        console.log(e);
        throw e
    }
}

exports.getRealtorDetailsAdmin = async (queryOptions = {}) => {
    try {
        let result = await db.realestateProfessionalsModel.findOne(queryOptions)
        return result ? helper.getJsonParseData(result) : null
    } catch (e) {
        console.log(e);
        throw e
    }
}

//FIND REALTOR BY ID
exports.findRealtorById = async (realestate_professional_id, queryOption = {}) => {
    try {
        let realtor = await db.realestateProfessionalsModel.findByPk(realestate_professional_id, queryOption);
        return helper.getJsonParseData(realtor);
    } catch (e) {
        throw e
    }
}


//FIND REALTOR BY EMAIL ID
exports.findRealtorByEmail = async (email) => {
    try {

        let realtor = await db.realestateProfessionalsModel.findOne({ where: { email: email } });
        return realtor ? helper.getJsonParseData(realtor) : null
    } catch (e) {
        throw e
    }
}


//COMPARE PASSWORD
exports.comparePassword = async (pass, userPass) => {
    try {

        var users = await bcrypt.compare(pass, userPass);
        console.log('pass', pass);
        console.log('userPass', userPass);
        console.log('users', users);
        return users;
    } catch (e) {
        throw Error('Error while comparing password')
    }
}

//UPDATE OTP
exports.updateOTP = async (otp, realestate_professional_id) => {
    try {
        var updateRes = await db.realestateProfessionalsModel.update({ login_otp: otp, login_otp_created_at: helper.date("YYYY-MM-DD HH:mm:ss") }, { where: { realestate_professional_id: realestate_professional_id } });
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

//CREATE POLICY PROFORMA
exports.createPolicyProforma = async (obj, transaction) => {
    try {
        let createdPolicyProforma = await db.policyProformaInfoModel.create(obj, { transaction });
        return createdPolicyProforma ? helper.getJsonParseData(createdPolicyProforma) : null
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}


//UPDATE REAALTOR
exports.updateRealtor = async (realestate_professional_id, obj, transaction) => {
    try {
        let updatedRealtor = await db.realestateProfessionalsModel.update(obj, { where: { realestate_professional_id }, transaction });
        return updatedRealtor[0] == 0 ? false : true;
    } catch (e) {
        throw e
    }
}

exports.getRealtorLastLogin = async (queryOption = {}) => {
    try {
        var realtorLogin = await db.realestateProfessionalsModel.findOne(queryOption);
        return realtorLogin;
    } catch (e) {
        console.log(e);
        throw e
    }
}


exports.getAllPolicyProforma = async (queryOptions = {}) => {
    try {

        let policyProforma = await db.policyProformaInfoModel.findAndCountAll(queryOptions)
        return policyProforma ? helper.getJsonParseData(policyProforma) : null
    } catch (e) {
        console.log(e);
        throw e
    }
}



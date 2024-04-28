const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');


//FIND CUSTOMER BY ID
exports.findCustomerById = async (customer_id, queryOption = {}) => {
    try {
        let customer = await db.customersModel.findByPk(customer_id, queryOption);
        customer = helper.getJsonParseData(customer)
        return customer;
    } catch (e) {
        throw e
    }
}

//FIND CUSTOMER BY EMAIL ID
exports.findCustomerByEmail = async (email) => {
    try {
        let customer = await db.customersModel.findOne({ where: { email: db.Sequelize.where(db.Sequelize.fn('LOWER', db.Sequelize.col('email')), '=', email.toLowerCase()) } });
        return customer?helper.getJsonParseData(customer):null
    } catch (e) {
        throw e
    }
}

exports.findCustomerOne= async (queryOption) => {
    try {
        let customer = await db.customersModel.findOne(queryOption);
        customer = helper.getJsonParseData(customer)
        return customer;
    } catch (e) {
        throw e
    }
}


exports.getAllCustomers = async (queryOptions = {}, transaction = null) => {
    try {
        let allCustomers = await db.customersModel.findAndCountAll(queryOptions, transaction ? { transaction } : {})
        return helper.getJsonParseData(allCustomers)
    } catch (e) {
        throw e
    }
}




exports.getAllClaims = async (queryOptions = {}, transaction = null) => {
    try {
        let allClaims = await db.claimsModel.findAndCountAll(queryOptions, transaction ? { transaction } : {})
        return allClaims
    } catch (e) {
        throw e
    }
}

//CREATE CUSTOMER
exports.createCustomer = async (obj, transaction) => {
    try {
        let createdCustomer = await db.customersModel.create(obj, { transaction });
        return createdCustomer;
    } catch (e) {
        throw e
    }
}


//CREATE REFER FRIEND
exports.submitReferFriend = async (obj, transaction) => {
    try {
        let createdReferFriend= await db.referFriendsModel.create(obj, { transaction });
        return helper.getJsonParseData(createdReferFriend);
    } catch (e) {
        throw e
    }
}


//UPDATE CUSTOMER
exports.updateCustomer = async (customer_id, obj, transaction) => {
    try {
        let updatedCustomer = await db.customersModel.update(obj, { where: { customer_id }, transaction });
        return updatedCustomer[0] == 0 ? false : true;
    } catch (e) {
        throw e
    }
}
exports.updateWithoutTransCustomer = async (customer_id, obj, ) => {
    try {
        let updatedCustomer = await db.customersModel.update(obj, { where: { customer_id }, });
        return updatedCustomer[0] == 0 ? false : true;
    } catch (e) {
        throw e
    }
}


//UPDATE LEAD
exports.updateLead = async (req, obj, transaction) => {
    try {
        let leadData = {
            customer_id: obj.customer_id,
            is_conversion_done: 1
        };
        let updatedLead = await db.leadsModel.update(leadData, { where: { lead_id: req.body.leadId }, transaction });
        return updatedLead[0] == 0 ? false : true;
    } catch (e) {
        throw e
    }
}


//DELETE CUSTOMER
exports.deleteCustomer = async (val, ownerId) => {
    try {
        let deleteCustomer = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.customersModel.update(
                { deleted_by: ownerId },
                { where: { customer_id: val.customer_id }, t }
            )
            deleteCustomer = await db.customersModel.destroy({
                where: {
                    customer_id: val.customer_id
                }, transaction: t
            })
        });
        return deleteCustomer;
    } catch (e) {
        throw e
        // throw Error('Error while fetching Customer')
    }
}

exports.togglCustomerActvation = async (obj) => {
    try {
        let updateRes = '';
        let customerObj = JSON.parse(JSON.stringify(obj))
        const transaction = await db.sequelize.transaction(async (t) => {
            updateRes = await db.customersModel.update({ active_status: 1 }, {
                where: {
                    email: customerObj.email
                },
                t
            })

        });
        return updateRes;
    } catch (e) {
        throw e;
    }
}

//COMPARE PASSWORD
exports.comparePassword = async (pass, userPass) => {
    try {
    
        var users = await bcrypt.compare(pass, userPass);
        console.log('pass',pass);
        console.log('userPass',userPass);
        console.log('users',users);
        return users;
    } catch (e) {
        throw Error('Error while comparing password')
    }
}

//UPDATE OTP
exports.updateOTP = async (otp, customerId) => {
    try {
        var updateRes = await db.customersModel.update({ login_otp: otp, login_otp_created_at: helper.date("YYYY-MM-DD HH:mm:ss") }, { where: { customer_id: customerId } });
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


exports.getCustomerLastLogin = async (queryOption = {}) => {
    try {
        var customerLogin = await db.orgCustomerLoginActivitiesModel.findOne(queryOption);
        return customerLogin;
    } catch (e) {
        console.log(e);
        throw e
    }
}

exports.findReferrelFirendByEmailId = async (queryOption = {}) => {
    try {
        var referFirend = await db.referFriendsModel.findOne(queryOption);
        return referFirend?helper.getJsonParseData(referFirend):null;
    } catch (e) {
        console.log(e);
        throw e
    }
}




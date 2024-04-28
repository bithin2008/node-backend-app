const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');

//FIND PLAN TERM BY ID
exports.findIPAddressById = async (val) => {
    try {
        let whitelistIP = await db.whitelistIPsModel.findOne({ where: { whitelist_ip_id: val } });
        return whitelistIP;
    } catch (e) {
        console.log(e);
    }
}

//CREATE WHITELIST IP
exports.createWhitelistIP = async (obj, transaction) => {
    try {
        let createdWhitelistIp = await db.whitelistIPsModel.create(obj, { transaction });
        return createdWhitelistIp;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}


//GET ALL WHITELIST IPS
exports.getAllWhitelistIPs = async (req, res, next, queryOptions) => {
    try {
        let allWhitelistIps = await db.whitelistIPsModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(allWhitelistIps)
    } catch (e) {
        console.log(e);
        throw e
    }
}


exports.deleteIPAddress = async (val, ownerId) => {
    try {
        let deleteIPAddress = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.whitelistIPsModel.update(
                { deleted_by: ownerId },
                { where: { whitelist_ip_id: val.whitelist_ip_id }, transaction: t }
            )


            deleteIPAddress = await db.whitelistIPsModel.destroy({
                where: {
                    whitelist_ip_id: val.whitelist_ip_id
                }, transaction: t
            })
        });
        return deleteIPAddress;
    } catch (e) {
        console.log(e);
        // throw Error('Error while fetching User')
    }
}

const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');

exports.getAllReferFriends = async (queryOptions = {}, transaction = null) => {
    try {
        let getAllRefers = await db.referFriendsModel.findAndCountAll(queryOptions, transaction ? { transaction } : {})
        getAllRefers =  await helper.getJsonParseData(getAllRefers);

        getAllRefers.rows.forEach(async element => {
            element.create_info= element.created_by?await helper.getUserInfo(parseInt(element.created_by)):null;
            element.updated_info= element.updated_by?await helper.getUserInfo(parseInt(element.updated_by)):null;
        });
        
        return getAllRefers
    } catch (e) {
        throw e
    }
}
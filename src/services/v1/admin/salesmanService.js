const db = require('../../../models/index');
const helper = require('../../../common/helper');


//FIND USER BY ID
exports.findUserById = async (org_user_id,queryOptions={}) => {
    try {
        queryOptions.attributes= { exclude: ['created_by','password', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] }
        let user = await db.orgUsersModel.findByPk(org_user_id,queryOptions);
        user.profile_image?user.profile_image=`${helper.api_baseurl}/org_file/hws_${user.org_id}/users/${user.profile_image}`:null
        user = user? helper.getJsonParseData(user):null
        return user;
    } catch (e) {
        console.log(e);
        throw e
    }
}
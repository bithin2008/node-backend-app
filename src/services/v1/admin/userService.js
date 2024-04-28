const db = require('../../../models/index');
const helper = require('../../../common/helper');



//FIND USER BY ID
exports.findUserById = async (org_user_id,queryOptions={},transaction = null) => {
    try {
        // 'user_role_id', 'department_id', 'first_name', 'last_name', 'email', 'mobile', 'residential_phone','profile_image', 'gender', 'date_of_birth', 'joining_date', 'zip', 'state', 'city', 'address1', 'address2', 'active_status', 'login_otp_created_at', 'last_login',
        // queryOptions.attributes= { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] }
        let user = await db.orgUsersModel.findByPk(org_user_id,queryOptions,transaction);
        user.profile_image?user.profile_image=`${helper.api_baseurl}/org_file/hws_${user.org_id}/users/${user.profile_image}`:null
        user = user? helper.getJsonParseData(user):null
        return user;
    } catch (e) {
        console.log(e);
        throw e
    }
}


//FIND USER BY NAME
exports.findUserByName = async (req, res, next, queryOptions) => {
    try {
        let allUser = await db.orgUsersModel.findAll(queryOptions)
        return helper.getJsonParseData(allUser)
    } catch (e) {
        console.log(e);
        throw e
    }
}


//DELETE USER
exports.deleteUser = async (val, ownerId) => {
    try {
        let deleteUser = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.userModel.update(
                { deleted_by: ownerId },
                { where: { org_user_id: val.org_user_id }, t }
            )
            deleteUser = await db.userModel.destroy({
                where: {
                    org_user_id: val.org_user_id
                }, transaction: t
            })
        });
        return deleteUser;
    } catch (e) {
        console.log(e);
        throw e
        // throw Error('Error while fetching User')
    }
}


exports.togglUserActiveStatus = async (obj, org_user_id, transaction) => {
    try {     
        let updateStatus = await db.orgUsersModel.update(obj, { where: { org_user_id }, transaction });
        return updateStatus[0]==0?false:true;
    } catch (e) {
        console.log(e); 
        throw e
    }
}


exports.getAllUsers = async (queryOptions={}) => {
    try {
      let allUser = await db.orgUsersModel.findAndCountAll(queryOptions)
        allUser=helper.getJsonParseData(allUser);
        allUser.rows.map(el=>el.profile_image?el.profile_image=`${helper.api_baseurl}/org_file/hws_${el.org_id}/users/${el.profile_image}`:null );
        return allUser
    } catch (error) {
      console.log(error);
      throw error
    }
}

exports.createUser = async (req,res,next,obj, transaction)=>{
    try {
        let createdUserData = await db.orgUsersModel.create(obj, {transaction});
        return createdUserData?helper.getJsonParseData(createdUserData):null
    } catch (error) {
        console.log(error);
        throw error
    }
}

exports.updateUser = async (org_user_id,obj, transaction)=>{
    try {
        let updatedUserData = await db.orgUsersModel.update(obj, { where:{org_user_id:org_user_id},transaction});
        return updatedUserData
    } catch (error) {
        console.log(error);
        throw error
    }
}
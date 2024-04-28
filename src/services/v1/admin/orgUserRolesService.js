const db = require('../../../models/index');
const helper = require('../../../common/helper');
const CustomError = require('../../../utils/customErrorHandler');
const {Op} = require("sequelize");

//FIND ORG USER Role BY ID
exports.findRoleById = async (user_role_id,queryOption={}) => {
    try {
    let userRole = await db.orgUserRolesModel.findByPk(user_role_id,queryOption);
        return userRole;
    } catch (e) {
        throw e
    }
}
//CREATE ORG USER ROLE
exports.createOrgUserRole = async (obj, transaction) => {
    try {
        let isExistRole = await db.orgUserRolesModel.findOne({ where: { org_id: obj.org_id, role_type: obj.role_type } })
        if (isExistRole) {
            throw new CustomError(`Role type is already exist on this organaization`, 400)
        }
        let createdSubModule = await db.orgUserRolesModel.create(obj, { transaction });
        createdSubModule = createdSubModule ? helper.getJsonParseData(createdSubModule) : createdSubModule
        return createdSubModule;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//UPDATE roles
exports.updateOrgUserRole = async (obj, user_role_id, transaction) => {
    try {
        isExistorgUserRoleType = await db.orgUserRolesModel.findAll({ where: { [Op.not]: [  { user_role_id: user_role_id }, ], org_id: obj.org_id, role_type: obj.role_type } })
        if (isExistorgUserRoleType.length == 0) {
            let updateRole = await db.orgUserRolesModel.update(obj,{ where: { user_role_id: user_role_id },transaction })
            return updateRole;
        } else { throw new CustomError(`Role Type is already exist on this organaization`, 400) }
        

    } catch (e) {
        console.log(e);
        throw e
    }
}
//DELETE ORG ROLE 
exports.deleteOrgUserRole = async (val, ownerId) => {
    try {
        let deleteRole = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.orgUserRolesModel.update(
                { deleted_by: ownerId },
                { where: { user_role_id: val.user_role_id }, transaction: t }
            )
            deleteRole = await db.orgUserRolesModel.destroy({
                where: {
                    user_role_id: val.user_role_id
                }, transaction: t
            })
        });
        return deleteRole;
    } catch (e) {
        console.log(e);
        // throw Error('Error while fetching User')
    }
}

exports.togglUserActvation = async (obj) => {
    try {
        var user = await db.userModel.update({ where: { email: val } });

        let updateRes = await db.userModel.update({ active_status: obj.activeStatus }, {
            where: {
                email: obj.emailId
            },
            transaction: t
        })
        return user;
    } catch (e) {
        throw Error('Error while fetching User')
    }
}


// Role permission

exports.createOrgUserRolePermission= async(req,res,next,arrayObj,transaction)=>{
    try {
        let rolePermissionRes=  await db.orgUserRolePermissionsModel.bulkCreate(arrayObj,{transaction});
        return helper.getJsonParseData(rolePermissionRes)
    } catch (error) {
        throw error
    }
}
exports.deleteUserRolePermission= async(req,res,next,user_role_id,transaction)=>{
    try {
        await db.orgUserRolePermissionsModel.update( { deleted_by: req.tokenData.org_user_id },{ where: { user_role_id: user_role_id }, transaction } )
        let rolePermissionRes=  await db.orgUserRolePermissionsModel.destroy({
            where: {
                user_role_id: user_role_id
            }, transaction,
            paranoid: false,
        })
        return rolePermissionRes
    } catch (error) {
        throw error
    }
}
exports.getAllOrgUserRoles =async (queryOption={})=>{
    try {
      let roles=  await db.orgUserRolesModel.findAndCountAll(queryOption);
        roles= helper.getJsonParseData(roles);
        return roles
    } catch (error) {
        throw error
    }


}
exports.getOrgUserRolePermission =async (queryOption={},transaction)=>{
    try {
      let permissionRes=  await db.orgUserRolePermissionsModel.findAll(queryOption,{transaction})
        return helper.getJsonParseData(permissionRes)
    } catch (error) {
        throw error
    }
}

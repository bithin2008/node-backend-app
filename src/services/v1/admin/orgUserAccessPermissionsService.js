const db = require('../../../models/index');
const helper = require('../../../common/helper');


//CREATE ORGANAIZATION USER ACCESS PERMISSION
exports.createOrgUserAccessPermission = async (arrObj, transaction) => {
    try {
        let orgUserAccessPermissionsModelRes = await db.orgUserAccessPermissionsModel.bulkCreate(arrObj, transaction)
        return helper.getJsonParseData(orgUserAccessPermissionsModelRes)
    } catch (e) {
        console.log(e);
        throw e
    }
}
//CREATE ORGANAIZATION USER ACCESS PERMISSION
exports.getOrgUserAccessPermissions = async (queryOptions, transaction=null) => {
    try {
        let orgUserAccessPermissionsModelRes = await db.orgUserAccessPermissionsModel.findAll(queryOptions,transaction ? { transaction } : {})
        return helper.getJsonParseData(orgUserAccessPermissionsModelRes)
    } catch (e) {
        console.log(e);
        throw e
    }
}

exports.deleteOrgUserAccessPermissions = async (user_access_permissions_id,  transaction=null) => {
    try {
        let deleteRes = await db.orgUserAccessPermissionsModel.destroy({
            where: {
                user_access_permissions_id: user_access_permissions_id
            }, 
            transaction
        })
        return deleteRes > 0 ? true : false
    } catch (error) {
        console.log(error);
        throw error
    }
}

exports.updateOrgUserAccessPermissions = async (org_user_id, orguserAccessPermissionData, transaction) => {
    //console.log('orguserAccessPermissionData', orguserAccessPermissionData);
    try {
        let updatedRes = []
        let existingPermissions = await this.getOrgUserAccessPermissions({ where: { org_user_id: org_user_id }, paranoid: false }, transaction);
        if (existingPermissions.length > 0) {
            let existingUserAccessPermissionIdArr = existingPermissions.map(permission => permission.user_access_permissions_id);
            let deleteRes = await this.deleteOrgUserAccessPermissions(existingUserAccessPermissionIdArr, transaction);
           /*  const matchedPermissionsSubmodules = orguserAccessPermissionData.filter((subModule) => {
                return existingPermissions.some((dataPermissions) => dataPermissions.org_sub_module_id == subModule.org_sub_module_id);
            }).map((subModule) => {
                const matchedPermission = existingPermissions.find((dataPermissions) => dataPermissions.org_sub_module_id == subModule.org_sub_module_id);
                return { ...subModule, user_access_permissions_id: matchedPermission.user_access_permissions_id };
            });
            // console.log('matchedPermissionsSubmodules', matchedPermissionsSubmodules);*/

            let matchedPermissionsSubmodules = []
            orguserAccessPermissionData.forEach(element => {
                existingPermissions.forEach(el=>{
                    if (element.org_sub_module_id==el.org_sub_module_id) {
                        el.permission_combination_id=element.permission_combination_id
                        matchedPermissionsSubmodules.push(el)
                    }
                })
            });
            let matchedUserAccessPermissionsIdArray = matchedPermissionsSubmodules.map(permission => permission.user_access_permissions_id); 
            let restoreRes = await db.orgUserAccessPermissionsModel.restore({ where: { user_access_permissions_id: matchedUserAccessPermissionsIdArray }, transaction });
            if (restoreRes) {
                for (const element of matchedPermissionsSubmodules) {
                    // console.log('user_access_permissions_id',element.user_access_permissions_id,',permission_combination_id',element.permission_combination_id,'org_sub_module_id',element.org_sub_module_id );
                    const updatePermissionRes = await db.orgUserAccessPermissionsModel.update(
                        { permission_combination_id: element.permission_combination_id },
                        { where: { user_access_permissions_id: element.user_access_permissions_id }, transaction: transaction }
                    );
                }
                updatedRes.push(...matchedPermissionsSubmodules);
            }
        }
        const missingPermissionsSubmodules = orguserAccessPermissionData.filter((subModule) => {
            return !existingPermissions.some((dataPermissions) => dataPermissions.org_sub_module_id == subModule.org_sub_module_id);
        });
        if (missingPermissionsSubmodules.length>0) {
            let orgUserAccessPermissionsModelRes = await this.createOrgUserAccessPermission(missingPermissionsSubmodules, transaction);
            if (orgUserAccessPermissionsModelRes.length>0) {  
                updatedRes.push(...orgUserAccessPermissionsModelRes)
            }
        } 
        return updatedRes
    } catch (error) {
        throw error
    }

}

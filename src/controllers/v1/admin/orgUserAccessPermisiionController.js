
const db = require('../../../models/index')
const orgUserAccessPermissionsService = require("../../../services/v1/admin/orgUserAccessPermissionsService");
const CustomError = require('../../../utils/customErrorHandler');
const userService = require("../../../services/v1/admin/userService");
const helper = require('../../../common/helper');



exports.setOrgUserAccessPermission = async(req,res,next)=>{
    const transaction = await db.sequelize.transaction();
    try {
        const { org_user_id } = req.params;

        let selectedAccessPermissionData= req.body.selectedAccessPermissionData;
        if (selectedAccessPermissionData.length==0) {
            throw new CustomError(`please select atleast one permission`, 400)
        };
        const userExists = await userService.findUserById(org_user_id,{include:{model: db.orgUserRolesModel,as: 'user_role_details',attributes:['is_super_admin'],

        },});
        if (userExists) {
            if (userExists.user_role_details.is_super_admin!=1) {
            
            selectedAccessPermissionData.forEach(element => {
                let permission_combination_id = helper.getMatchedPermissionCombination(element.combination);
                if (!permission_combination_id) {
                    throw new CustomError('Something went wrong! Permission id not found', 400);
                };
                element.org_user_id=org_user_id;
                element.org_id= req.tokenData.org_id;
                element.permission_combination_id = permission_combination_id.id;
                element.created_by = req.tokenData.org_user_id;
                delete element.combination;
            });
           // console.log('selectedAccessPermissionData',selectedAccessPermissionData);
           let accessPermissionRes= await orgUserAccessPermissionsService.updateOrgUserAccessPermissions(org_user_id,selectedAccessPermissionData,transaction);
            transaction.commit();
            return accessPermissionRes;
        } else{
            throw new CustomError(`The access permissions are unchangeable. ${userExists.first_name} belongs to as a Super Admin role type user.`,400)
        }
        } else {
            throw new CustomError(`User not found.`,400)
        }
    } catch (error) {
        transaction.rollback()
        next(error)
    }
}
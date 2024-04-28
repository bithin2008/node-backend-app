const db = require('../../../models/index');
const helper = require('../../../common/helper');
const CustomError = require('../../../utils/customErrorHandler');
const subModuleController = require("../../../controllers/v1/system_admin/subModuleController")
const _ = require("lodash");
const userService = require("../../../services/v1/admin/userService");
const orgUserAccessPermissionsService = require("../../../services/v1/admin/orgUserAccessPermissionsService");
const orgSubModuleService = require("../../../services/v1/admin/orgSubModuleService");

exports.createOrgModuleSubModulePermission = async (req, res, next, payload, transaction) => {
    try {
        if (payload.length > 0) {
            payload = _.unionBy(payload, 'module_id')
            let moduleData = []
            payload.forEach(element => {

                moduleData.push({
                    org_id: element.org_id,
                    module_id: element.module_id,
                    org_module_name: element.module_name ? element.module_name : null,
                    org_module_slug: element.module_slug ? element.module_slug : null,
                    route_path: element.module_slug ? element.route_path : null,
                    descriptions: element.module_descriptions ? element.module_descriptions : null,
                    icon: element.module_icon ? element.module_icon : null,
                    sequence: element.module_sequence ? element.module_sequence : null,
                    created_by: req.tokenData.system_administrator_id ? parseInt(req.tokenData.system_administrator_id) : null,
                })
            });

            /******MODULES******/

            let findIsExistOrgIdInmodule = await db.orgModulesModel.unscoped().findAll({ where: { org_id: payload[0].org_id } })
            findIsExistOrgIdInmodule = helper.getJsonParseData(findIsExistOrgIdInmodule)

            if (findIsExistOrgIdInmodule) {
                let updateRes = await db.orgModulesModel.update({ s_admin_active_status: 0 }, { where: { org_id: payload[0].org_id }, transaction })
            }

            const missingModules = moduleData.filter((module) => {
                return !findIsExistOrgIdInmodule.some((dataModule) => dataModule.module_id === module.module_id);
            });
            const matchedModules = moduleData.filter((module) => {
                return findIsExistOrgIdInmodule.some((dataModule) => dataModule.module_id === module.module_id);
            });
            let orgModulesModelRes = []
            if (matchedModules.length > 0) {
                let moduleIdArray = []
                matchedModules.forEach(element => {
                    moduleIdArray.push(element.module_id)
                });
                let affectedRowsCount = await db.orgModulesModel.unscoped().update({ s_admin_active_status: 1 }, {
                    where: {
                        org_id: matchedModules[0].org_id,
                        module_id: moduleIdArray
                    }, transaction
                })
                let updatedRows = await db.orgModulesModel.unscoped().findAll({
                    where: {
                        org_id: matchedModules[0].org_id,
                        module_id: moduleIdArray
                    }
                });
                updatedRows = helper.getJsonParseData(updatedRows)

                orgModulesModelRes.push(...updatedRows)
            }

            if (missingModules.length > 0) {
                let orgModulesModelCreatedRes = await db.orgModulesModel.bulkCreate(missingModules, { transaction })
                orgModulesModelCreatedRes = helper.getJsonParseData(orgModulesModelCreatedRes)
                orgModulesModelRes.push(...orgModulesModelCreatedRes)
            }


            /****** SUB-MODULES ******/
            let findIsExistOrgIdinsubModule = await db.orgSubModulesModel.unscoped().findAll({ where: { org_id: payload[0].org_id } })
            findIsExistOrgIdinsubModule = helper.getJsonParseData(findIsExistOrgIdinsubModule)
            if (findIsExistOrgIdinsubModule) {
                let updateRes = await db.orgSubModulesModel.update({ s_admin_active_status: 0 }, { where: { org_id: payload[0].org_id }, transaction })
            }

            let submoduleData = []
            payload.forEach(element => {
                element.sub_modules.forEach((el, i) => {
                    submoduleData.push({
                        org_id: element.org_id,
                        module_id: orgModulesModelRes.find(item => item.module_id === element.module_id).org_module_id,
                        sub_module_id: el.sub_module_id,
                        org_sub_module_name: el.sub_module_name,
                        org_sub_module_slug: el.sub_module_slug,
                        route_path: el.route_path,
                        descriptions: el.descriptions,
                        icon: el.icon,
                        sequence: el.sequence ? el.sequence : null,
                        created_by: req.tokenData.system_administrator_id ? parseInt(req.tokenData.system_administrator_id) : null,
                    })
                })
            });
            const missingSubModules = submoduleData.filter((subModule) => {
                return !findIsExistOrgIdinsubModule.some((dataSubModule) => dataSubModule.sub_module_id === subModule.sub_module_id);
            });
            const matchedSubModules = submoduleData.filter((subModule) => {
                return findIsExistOrgIdinsubModule.some((dataSubModule) => dataSubModule.sub_module_id === subModule.sub_module_id);
            });
            let orgSubModulesModelRes = []
            if (matchedSubModules.length > 0) {
                let subModuleIdArray = []
                matchedSubModules.forEach(element => {
                    subModuleIdArray.push(element.sub_module_id)
                });
                let affectedRowsCount = await db.orgSubModulesModel.unscoped().update({ s_admin_active_status: 1 }, {
                    where: {
                        org_id: matchedSubModules[0].org_id,
                        sub_module_id: subModuleIdArray
                    }, transaction
                })
                let updatedRows = await db.orgSubModulesModel.unscoped().findAll({
                    where: {
                        org_id: matchedModules[0].org_id,
                        module_id: subModuleIdArray
                    }
                });
                updatedRows = helper.getJsonParseData(updatedRows)
                orgSubModulesModelRes.push(...updatedRows)
            }
            if (missingSubModules.length > 0) {
                let orgSubModulesModelCreatedRes = await db.orgSubModulesModel.bulkCreate(missingSubModules, { transaction })
                orgSubModulesModelCreatedRes = helper.getJsonParseData(orgSubModulesModelCreatedRes)
                orgSubModulesModelRes.push(...orgSubModulesModelCreatedRes)
            }

            let orgSubModulesList = []
            setTimeout(async () => {
                orgSubModulesList = await orgSubModuleService.getOrgSubModules({
                    where: {
                        org_id: payload[0].org_id,
                        s_admin_active_status: 1
                    }
                });
                orgSubModulesList = orgSubModulesList.rows
                if (orgSubModulesList.length > 0) {
                    /**** CHECK EXISTING ACCESS PERMISSION ****/
                    let existingPermissions = await orgUserAccessPermissionsService.getOrgUserAccessPermissions({
                        where: { org_id: payload[0].org_id }, order: [['user_access_permissions_id', 'ASC']
                        ], paranoid: false
                    }, transaction);

                    /*  let existingPermissions = await orgUserAccessPermissionsService.getOrgUserAccessPermissions({
                         where: { org_id: payload[0].org_id },
                         attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
                         include: [
                             {
                                 model: db.orgUsersModel,
                                 attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
                                 include: {
                                     model: db.orgUserRolesModel,
                                     as: 'user_role_details',
                                     attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
                                     where: {
                                         is_super_admin: 1
                                     }
                                 },
                             }
                         ],
                         paranoid: false,
                     }, transaction); */
                    if (existingPermissions.length > 0) {
                        let user_access_permissions_idArr = existingPermissions.map(permission => permission.user_access_permissions_id);
                        // console.log('existingPermissions',user_access_permissions_idArr);
                        let deleteRes = await orgUserAccessPermissionsService.deleteOrgUserAccessPermissions(user_access_permissions_idArr);
                        let user_access_permissions_id_array = []
                        orgSubModulesList.forEach(element => {
                            existingPermissions.forEach(el => {
                                if (element.org_sub_module_id == el.org_sub_module_id) {
                                    user_access_permissions_id_array.push(el.user_access_permissions_id)
                                }
                            })
                        });

                        // console.log('user_access_permissions_id_array',user_access_permissions_id_array);
                        await db.orgUserAccessPermissionsModel.restore({ where: { user_access_permissions_id: user_access_permissions_id_array } });

                    }
                    const missingPermissionsSubmodules = orgSubModulesList.filter((subModule) => {
                        return !existingPermissions.some((dataPermissions) => dataPermissions.org_sub_module_id == subModule.org_sub_module_id);
                    });

                    /**** UPDATE ALL SUPER-ADMIN ACCESS PERMISSION ****/
                    let superAdminUsers = await db.orgUsersModel.findAll({
                        where: {
                            org_id: payload[0].org_id
                        },
                        include: [
                            {
                                model: db.orgUserRolesModel,
                                as: 'user_role_details',
                                attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
                                where: {
                                    is_super_admin: 1
                                }
                            },
                        ]
                    })
                    superAdminUsers = helper.getJsonParseData(superAdminUsers)
                    let orguserAccessPermissionData = []
                    let updateOrguserAccessPermissionData = []
                    if (superAdminUsers.length > 0) {
                        superAdminUsers.forEach(el => {
                            // for (let i = 0; i < orgSubModulesModelRes.length; i++) {
                            //     const element = orgSubModulesModelRes[i];
                            //     updateOrguserAccessPermissionData.push({
                            //         org_id: el.org_id,
                            //         org_user_id: el.org_user_id,
                            //         org_module_id: element.module_id,
                            //         org_sub_module_id: element.org_sub_module_id,
                            //         permission_combination_id: 9,
                            //         updated_by: null
                            //     })

                            // }
                            for (let i = 0; i < missingPermissionsSubmodules.length; i++) {
                                const element = missingPermissionsSubmodules[i];
                                orguserAccessPermissionData.push({
                                    org_id: el.org_id,
                                    org_user_id: el.org_user_id,
                                    org_module_id: element.module_id,
                                    org_sub_module_id: element.org_sub_module_id,
                                    permission_combination_id: 9,
                                    created_by: null
                                })
                            }

                        })
                        let orgUserAccessPermissionsModelRes = await orgUserAccessPermissionsService.createOrgUserAccessPermission(orguserAccessPermissionData, transaction)
                      //  await updateOrgUserAccessPermissionsInLoop(updateOrguserAccessPermissionData)
                    }

                }
            }, 600);


            if (orgModulesModelRes && orgSubModulesModelRes) {
                return { createdOrgModules: orgModulesModelRes, createdOrgSubModules: orgSubModulesModelRes }
            } else {
                return false
            }
        } else {
            throw new CustomError(`You must choose a minimum of one module or submodule.`, 400)
        }

    } catch (error) {
        // next(error)

        throw error
    }
}
async function updateOrgUserAccessPermissionsInLoop(updateOrguserAccessPermissionData) {
    for (let i = 0; i < updateOrguserAccessPermissionData.length; i++) {
        const element = updateOrguserAccessPermissionData[i];

        // Start a new transaction for each iteration
        const transaction = await db.sequelize.transaction();

        try {
            // Perform your database operation here
            const permissionRes = await orgUserAccessPermissionsService.updateOrgUserAccessPermissions(element.org_user_id, updateOrguserAccessPermissionData, transaction);

            // If the operation is successful, commit the transaction
            await transaction.commit();
        } catch (error) {
            console.error(`Error in iteration ${i}: ${error.message}`);
            // If there's an error, rollback the transaction
            await transaction.rollback();
            throw error
        }
    }
}
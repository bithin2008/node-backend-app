const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index')
const helper = require('../../../common/helper');
const orgUserRolesService = require("../../../services/v1/admin/orgUserRolesService");
const { Op } = require("sequelize");

/*****************************
 *  CREATE ORG ROLE
 ******************************/
exports.createOrgUserRole = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const data = {
            org_id: req.body.orgId ? req.body.orgId : null,
            role_type: req.body.roleType ? req.body.roleType : null,
            descriptions: req.body.descriptions,
            active_status: parseInt(req.body.activeStatus),
            created_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
            updated_by: null,
            deleted_by: null
        };
        const createdOrgRole = await orgUserRolesService.createOrgUserRole(data, transaction);
        if (req.body.selectedRolePermissionData.length == 0) {
            throw new CustomError(`please select atleast one permission`, 400)
        }
        let selectedRolePermissionData = [...req.body.selectedRolePermissionData];
        selectedRolePermissionData.forEach(element => {
            let permission_combination_id = helper.getMatchedPermissionCombination(element.combination);
            if (!permission_combination_id) {
                throw new CustomError('Something went wrong! Permission id not found', 400)
            }
            element.user_role_id = createdOrgRole.user_role_id,
                element.org_id = req.tokenData.org_id,
                element.permission_combination_id = permission_combination_id?.id,
                element.created_by = req.tokenData.org_user_id,
                delete element.combination
        });

        let deletedRes = await orgUserRolesService.deleteUserRolePermission(req, res, next, createdOrgRole.user_role_id, transaction)
        let createdRes = await orgUserRolesService.createOrgUserRolePermission(req, res, next, selectedRolePermissionData, transaction);
        // const createdOrgRolePermissionRes = await orgUserRolesService.createOrgUserRolePermission(data, transaction);
        if (createdOrgRole && createdRes.length > 0) {
            transaction.commit();
            res.status(200).send({
                status: 1, message: "Organization  role created Successfully.",
            });
        } else {
            res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
        }
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}

/*****************************
 *  UPDATE ORG ROLE
 ******************************/
exports.updateOrgUserRole = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { user_role_id } = req.params;
        const roleExists = await orgUserRolesService.findRoleById(parseInt(user_role_id));
        if (roleExists) {
            let role_detail = {
                org_id: req.body.orgId,
                role_type: req.body.roleType,
                description: req.body.description,
                active_status: req.body.activeStatus ? parseInt(req.body.activeStatus) : roleExists.active_staus,
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
            }
            const updateOrgRole = await orgUserRolesService.updateOrgUserRole(role_detail, user_role_id, transaction);
            if (updateOrgRole) {
                res.status(200).send({ status: 1, message: 'Organization user role information has been successfully updated.' })
            } else {
                res.status(200).send({ status: 0, message: 'There was a problem. the . The user role update was unsuccessful.' })
            }
            transaction.commit();
        } else {
            res.status(200).send({ status: 0, message: "Organization user role not found" });
        }
    } catch (error) {
        console.log(error);
        transaction.rollback();
        next(error);
    }
}


/*****************************
 *  GET ALL ORG ROLES
 ******************************/
exports.getAllOrgUserRoles = async (req, res, next) => {
    try {
        let orgId = req.body.orgId ? req.body.orgId : null;
        let whereCond = {};
        if (orgId) {
            whereCond = {
                org_id: orgId
            };
        }
        const search = req.query.search || '';
        // Construct the search query
        const searchQuery = search ? { role_type: { [Op.iLike]: `%${search}%` } } : {};
        const activeStatus = req.query.active_status ?{ active_status:parseInt(req.query.active_status)   } : {};
        const sortField = req.query.sortField || 'user_role_id'; // Default to 'user_role_id'
        const sortOrder = req.query.sortOrder || 'ASC'; // Default to ascending order
        let queryOptions = {
            where: { ...whereCond, ...searchQuery,...activeStatus },

            include: [
                {
                    model: db.organizationsModel,
                    as: 'organization',
                    attributes: ['org_name', 'org_id']
                },
                {
                    model: db.orgUserRolePermissionsModel,
                    as: 'role_permission_details',
                    required: false ,
                    include: [
                        {
                            model: db.orgModulesModel, as: 'module_details',
                            attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at', 'module_id'] },
                            required: false 
                        },
                        {
                            model: db.orgSubModulesModel, as: 'submodule_details',
                            attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at', 'sub_module_id'] },
                            required: false 
                        },
                        {
                            model: db.permissionCombinationsModel, as: 'permission_details',
                            attributes: ['combination'],
                            required: false 
                        },
                    ],
                    attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] }
                },
                {
                    model: db.orgUsersModel,
                    as: 'update_info',
                    attributes: ['first_name', 'last_name'],
                    required: false
                },
                {
                    model: db.orgUsersModel,
                    as: 'create_info',
                    attributes: ['first_name', 'last_name'],
                    required: false
                },
            ],
            order: [
                [sortField, sortOrder]
            ],
            // logging:console.log
        };


        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }
        let allOrgRoles = await orgUserRolesService.getAllOrgUserRoles(queryOptions);
        allOrgRoles.rows.map(role => {
            const groupedSubmodules = role.role_permission_details.reduce((acc, permission) => {
                const moduleId = permission.module_details.org_module_id;
                if (!acc[moduleId]) {
                    acc[moduleId] = {
                        module_details: permission.module_details,
                        submodules: [],
                    };
                }

                acc[moduleId].submodules.push({ ...permission.submodule_details, permission_details: { ...permission.permission_details, permission_combination_id: permission.permission_combination_id } });
                return acc;
            }, {});

            role.role_permission_details = Object.values(groupedSubmodules);
        });
        if (res.pagination) {
            res.pagination.total = allOrgRoles.count
            res.pagination.totalPages = Math.ceil(allOrgRoles.count / queryOptions.limit)
        }
        if (allOrgRoles.count > 0) {
            res.status(200).send({ status: 1, data: allOrgRoles.rows, pagination: res.pagination, message: 'Organization Role list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allOrgRoles.rows, pagination: res.pagination, message: 'No Organization Role found' })
        }

    } catch (error) {
        console.log(error);
        next(error)
    }
}

exports.getUserRoleById = async (req, res, next) => {
    try {
        let { user_role_id } = req.params
        let queryOption = {
            include: [{
                model: db.orgUserRolePermissionsModel, as: 'role_permission_details',
                include: [
                    {
                        model: db.orgModulesModel, as: 'module_details',
                        attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] }
                    },
                    {
                        model: db.orgSubModulesModel, as: 'submodule_details',
                        attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] }
                    }
                ],
                attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] }
            },
            ],
            attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] }
        }
        let roleDetails = await orgUserRolesService.findRoleById(user_role_id, queryOption);
        res.status(200).send({ status: 1, message: `Role details fetched successfully.`, data: roleDetails })
    } catch (error) {
        next(error)
    }
}

/*****************************
 *  TOGGLE ORG ROLE STATUS
 ******************************/
exports.toggleOrgUserRoleStatus = async (req, res, next) => {
    try {
        const { user_role_id } = req.params;
        if (!req.body.activeStatus) {
            throw new CustomError(`Active status is required`, 400)
        }
        const owner_id = req.tokenData.org_user_id ? req.tokenData.org_user_id : null
        const roleExists = await orgUserRolesService.findRoleById(parseInt(user_role_id),);
        if (roleExists) {
            let role_detail = {
                active_status: req.body.activeStatus ? parseInt(req.body.activeStatus) : null,
                updated_by: owner_id,
            }
            const transaction = await db.sequelize.transaction(async (t) => {
                await db.orgUserRolesModel.update(role_detail, { where: { user_role_id: user_role_id }, transaction: t })
                res.status(200).send({ status: 1, message: `Role successfully ${req.body.activeStatus == 1 ? 'enabled' : 'disabled'}.` })
            });
        } else {
            res.status(200).send({ status: 0, message: "Role not found" });
        }
    } catch (error) {
        next(error);
    }
}

/*****************************
 *  DELETE ROLES
 ******************************/

exports.deleteOrgUserRole = async (req, res, next) => {
    try {
        const { user_role_id } = req.params;
        const ownerId = req.tokenData.user_id
        const roleExists = await orgUserRolesService.findRoleById(parseInt(user_role_id));
        if (!roleExists) {
            res.status(200).send({ status: 0, message: "Role not found" });
        } else {
            const deleteRole = await orgUserRolesService.deleteOrgUserRole(roleExists, ownerId);
            if (deleteRole) {
                res.status(200).send({ status: 1, message: 'Role deleted sucessfully.' });
            } else {
                res.status(200).send({ status: 0, message: 'Unable to delete role.' });
            }
        }
    } catch (error) {
        next(error);
    }
}
/*****************************
 *  CREATE DELETE ROLES
 ******************************/
exports.setOrgUserRolePermission = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { user_role_id } = req.params;
        let selectedRolePermissionData = req.body.selectedRolePermissionData;

        selectedRolePermissionData.forEach(element => {

            let permission_combination_id = helper.getMatchedPermissionCombination(element.combination);
            if (!permission_combination_id) {
                throw new CustomError('Something went wrong! Permission id not found', 400)
            }
            // console.log(permission_combination_id);
                 element.user_role_id = user_role_id,
                element.org_id = req.tokenData.org_id,
                element.permission_combination_id = permission_combination_id.id,
                element.created_by = req.tokenData.org_user_id,
                delete element.combination
        });

        let deletedRes = await orgUserRolesService.deleteUserRolePermission(req, res, next, user_role_id, transaction)
        let createdRes = await orgUserRolesService.createOrgUserRolePermission(req, res, next, selectedRolePermissionData, transaction);
        //    console.log('createdRes',createdRes);
        transaction.commit()
        return createdRes
    } catch (error) {
        transaction.rollback()
        next(error)
    }
}

/*****************************
 *  GET  ROLES PERMISSION
 *         
 ******************************/
exports.getOrgUserRolePermission = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { user_role_id } = req.params;
        let queryOption = {
            where: {
                org_id: req.tokenData.org_id,
                user_role_id: user_role_id
            },
            include: [
                {
                    model: db.permissionCombinationsModel,
                    as: 'permission_details',
                },
            ]
        }
        let rolePermision = await orgUserRolesService.getOrgUserRolePermission(queryOption, transaction);
        return rolePermision
    } catch (error) {
        transaction.rollback()
        next(error)
    }
}


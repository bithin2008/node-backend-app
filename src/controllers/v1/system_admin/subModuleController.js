require("dotenv").config();
const config = require("../../../config/config");
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index')
const moment = require("moment");
const bcrypt = require('bcryptjs');
const helper = require('../../../common/helper');
const subModuleService = require("../../../services/v1/admin/subModuleService");
//const model =db.sequelize.models// Object.keys(db.sequelize.models);
/*****************************
 *  CREATE MODULE
 ******************************/
exports.createSubModule = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const data = {
            module_id: req.body.moduleId,
            sub_module_name: req.body.subModuleName,
            descriptions: req.body.descriptions ? req.body.descriptions : null,
            route_path: req.body.route_path ? req.body.route_path : null,
            icon: req.body.icon,
            sequence: req.body.sequence ? parseInt(req.body.sequence) : null,
            active_status: parseInt(req.body.activeStatus),
            created_by: req.tokenData.system_administrator_id ? parseInt(req.tokenData.system_administrator_id) : null,
            updated_by: null,
            deleted_by: null
        };
        const createdSubModule = await subModuleService.createSubModule(data, transaction);
        if (createdSubModule) {
            transaction.commit();
            res.status(200).send({
                status: 1,
                message: "Submodule created Successfully.",
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
 *  UPDATE MODULE
 ******************************/
exports.updateSubModule = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { sub_module_id } = req.params;
        const owner_id = req.tokenData.system_administrator_id
        const subModuleExists = await subModuleService.findSubModuleById(parseInt(sub_module_id));
        if (subModuleExists) {
            let sub_module_detail = {
                module_id: req.body.moduleId,
                sub_module_name: req.body.subModuleName,
                descriptions: req.body.descriptions,
                icon: req.body.icon,
                route_path: req.body.route_path ? req.body.route_path : null,
                sequence: req.body.sequence ? parseInt(req.body.sequence) : null,
                active_status: req.body.activeStatus ? parseInt(req.body.activeStatus) : subModuleExists.active_status,
                updated_by: req.tokenData.system_administrator_id ? parseInt(req.tokenData.system_administrator_id) : null,
                deleted_by: null
            }


            let updateRes = await subModuleService.updateSubModule(sub_module_id, sub_module_detail, transaction);

            // here we update all org user submodules module id 
            let orgModules = await db.orgModulesModel.findAll({ where: { module_id: req.body.moduleId } })
            orgModules.length>0? helper.getJsonParseData(orgModules):orgModules

          // console.log('orgModules,',orgModules);
            for (const el of orgModules) {
                let org_sub_module_detail = {
                    module_id: el.org_module_id,
                    org_sub_module_name: req.body.subModuleName,
                    org_sub_module_slug: req.body.subModuleName.toLowerCase().replace(/ /g, '-'),
                    descriptions: req.body.descriptions,
                    icon: req.body.icon,
                    route_path: req.body.route_path ? req.body.route_path : null,
                    sequence: req.body.sequence ? parseInt(req.body.sequence) : null,
                    updated_by: null,
                    deleted_by: null
                }
               // console.log('org_sub_module_detail',org_sub_module_detail);
                let orgSubmoduleUpdateRes = await db.orgSubModulesModel.update(org_sub_module_detail, { where: { sub_module_id: sub_module_id, org_id: el.org_id }, transaction })
                let orgSubModules = await db.orgSubModulesModel.findOne({ where: { sub_module_id: sub_module_id, org_id: el.org_id } })
                let orgUserRolePermissionsModel = await db.orgUserRolePermissionsModel.findAll({ where: {  org_id: el.org_id} })
                orgUserRolePermissionsModel= helper.getJsonParseData(orgUserRolePermissionsModel)
             

                if (orgSubModules) {
                    let orgUserRolesModelUpdateRes = await db.orgUserRolePermissionsModel.update({ org_module_id: el.org_module_id }, { where: { org_sub_module_id: orgSubModules.org_sub_module_id, org_id: el.org_id }, transaction })
                    let orgUserAccessPermissionsModelUpdateRes = await db.orgUserAccessPermissionsModel.update({ org_module_id: el.org_module_id }, { where: { org_sub_module_id: orgSubModules.org_sub_module_id, org_id: el.org_id }, transaction })
            //    console.log('orgUserRolesModelUpdateRes',orgUserRolesModelUpdateRes);
            //    console.log('orgUserAccessPermissionsModelUpdateRes',orgUserAccessPermissionsModelUpdateRes);
                }
            }

            /*  let org_sub_module_detail = {
                 org_sub_module_name: req.body.subModuleName,
                 org_sub_module_slug:req.body.subModuleName.toLowerCase().replace(/ /g, '-'),
                 descriptions: req.body.descriptions,
                 icon: req.body.icon,
                 route_path: req.body.route_path?req.body.route_path:null,
                 sequence: req.body.sequence?parseInt(req.body.sequence):null,
                 updated_by:  null,
                  deleted_by: null
             }*/
            // let orgSubmoduleUpdateRes=await db.orgSubModulesModel.update(org_sub_module_detail, { where: { sub_module_id: sub_module_id }, transaction})
            transaction.commit()
            if (updateRes[0] != 0) {
                res.status(200).send({ status: 1, message: 'Submodule information has been successfully updated.' })
            } else {
                transaction.rollback();
                throw new CustomError(`It briefly explains that there was an issue with updating Submodule.`, 400)

            }
        } else {
            res.status(200).send({ status: 0, message: "Sub Module not found" });
        }
    } catch (error) {
        next(error);
        await transaction.rollback();
    }
}


/*****************************
 *  GET ALL MODULES
 ******************************/
exports.getAllSubModule = async (req, res, next) => {
    try {
        let moduleId = req.query.module_id;
        let whereCond = {};
        if (moduleId) {
            whereCond = {
                module_id: moduleId
            };
        }
        let queryOptions = {
            where: whereCond,
            attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
            include: [{
                model: db.modulesModel,
                as: 'module_details',
                attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] }
            }],
            order: [
                ['sub_module_id', 'ASC']
            ],
        };
        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }

        allSubModules = await subModuleService.getAllSubModule(req, res, next, queryOptions)
        if (res.pagination) {
            res.pagination.total = allSubModules.count
            res.pagination.totalPages = Math.ceil(allSubModules.count / queryOptions.limit)
        }
        if (allSubModules.count > 0) {
            res.status(200).send({ status: 1, data: allSubModules.rows, pagination: res.pagination, message: 'Sub Module list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allSubModules.rows, pagination: res.pagination, message: 'No Sub Module found' })
        }

    } catch (error) {
        console.log(error);
        next(error)
    }
}


/*****************************
 *  GET MODULE BY ID
 ******************************/
exports.getModuleById = async (req, res, next) => {
    try {
        const { module_id } = req.params;
        const moduleExists = await subModuleService.findModuleById(parseInt(module_id),);
        if (!moduleExists) {
            res.status(200).send({ status: 0, message: "Module not found" });
        } else {
            res.status(200).send({ status: 1, data: moduleExists, message: 'Module data fetch sucessfully.' });
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}


/*****************************
 *  TOGGLE SUB MODULE STATUS
 ******************************/
exports.toggleSubModuleStatus = async (req, res, next) => {
    try {
        const { sub_module_id } = req.params;
        const owner_id = req.tokenData.system_administrator_id
        const subModuleExists = await subModuleService.findSubModuleById(parseInt(sub_module_id));
        if (subModuleExists) {
            let sub_module_detail = {
                active_status: parseInt(req.body.activeStatus),
                updated_by: req.tokenData.system_administrator_id ? parseInt(req.tokenData.system_administrator_id) : null,
            }
            const transaction = await db.sequelize.transaction(async (t) => {
                await db.subModulesModel.update(
                    { updated_by: owner_id },
                    { where: { sub_module_id: sub_module_id }, transaction: t })

                await db.subModulesModel.update(sub_module_detail, { where: { sub_module_id: sub_module_id }, transaction: t })
                res.status(200).send({ status: 1, message: `Sub Module successfully ${req.body.activeStatus ? 'enabled' : 'disabled'}.` })

            });


        } else {
            res.status(200).send({ status: 0, message: "Sub Module not found" });
        }
    } catch (error) {
        next(error);
    }
}

/*****************************
 *  DELETE SUB MODULE
 ******************************/

exports.deleteSubModule = async (req, res, next) => {
    try {
        const { sub_module_id } = req.params;
        const ownerId = req.tokenData.user_id
        const subModuleExists = await subModuleService.findSubModuleById(parseInt(sub_module_id));
        if (!subModuleExists) {
            res.status(200).send({ status: 0, message: "Sub Module not found" });
        } else {
            const deleteSubModule = await subModuleService.deleteSubModule(subModuleExists, ownerId);
            if (deleteSubModule) {
                res.status(200).send({ status: 1, message: 'Sub Module deleted sucessfully.' });
            } else {
                res.status(200).send({ status: 0, message: 'Unable to delete Sub Module.' });
            }
        }
    } catch (error) {
        next(error);
    }
}
/*****************************
 *  GET ALL SUB MODULES GROUP BY MODULE ID
 ******************************/
exports.getAllSubModulesGroupByModule = async (req, res, next) => {
    try {
        let queryOptions = {
            where: {
                active_status: 1
            },
            attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
            include: [{
                model: db.modulesModel,
                where: {
                    active_status: 1
                },
                as: 'module_details',
                attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] }
            }],
            order: [
                [{ model: db.modulesModel, as: 'module_details' }, 'module_name', 'ASC']
            ],
        }
        allSubModules = await subModuleService.getAllSubModule(req, res, next, queryOptions)
        // Assuming you have the data in the variable 'data'
        const groupedData = {};
        allSubModules.rows.forEach((item) => {
            const moduleId = item.module_id;
            if (!groupedData[moduleId]) {
                groupedData[moduleId] = {
                    module_id: moduleId,
                    module_name: item.module_details.module_name,
                    module_slug: item.module_details.module_slug,
                    module_descriptions: item.module_details.descriptions,
                    module_icon: item.module_details.icon,
                    module_sequence: item.module_details.sequence,
                    module_active_status: item.module_details.active_status,
                    route_path: item.module_details.route_path,
                    sub_modules: [],
                };
            }

            groupedData[moduleId].sub_modules.push({
                sub_module_id: item.sub_module_id,
                sub_module_name: item.sub_module_name,
                sub_module_slug: item.sub_module_slug,
                descriptions: item.descriptions,
                route_path: item.route_path,
                icon: item.icon,
                sequence: item.sequence,
                active_status: item.active_status,
            });
        });

        const result = Object.values(groupedData);
        return result
        next()
    } catch (e) {
        console.log(e);
        next(e)
    }
}



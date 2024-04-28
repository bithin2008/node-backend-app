const db = require('../../../models/index')

const orgSubModuleService = require("../../../services/v1/admin/orgSubModuleService");

/*****************************
 *  GET ALL SUB MODULES GROUP BY MODULE ID
 ******************************/
exports.getAllSubModulesGroupByModule = async (req, res, next) => {
    try {
        let queryOptions = {
            where: {
                org_id:req.tokenData.org_id,
                active_status:1
                
            },
            attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
            include: [{
                model: db.orgModulesModel,
                where:{
                    active_status:1
                },
                as: 'module_details',
                attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] }
            }],
            order: [
                [{ model: db.orgModulesModel, as: 'module_details' }, 'org_module_name', 'ASC']
            ],
        }
        allSubModules= await orgSubModuleService.getOrgSubModules(queryOptions);       
        // Assuming you have the data in the variable 'data'
        const groupedData = {};
        allSubModules.rows.forEach((item) => {
            const moduleId = item.module_id;
            if (!groupedData[moduleId]) {
                groupedData[moduleId] = {
                    module_id: moduleId,
                    org_module_name: item.module_details.org_module_name,
                    org_module_name: item.module_details.org_module_name,
                    module_descriptions: item.module_details.descriptions,
                    module_icon: item.module_details.icon,
                    module_sequence: item.module_details.sequence,
                    module_active_status: item.module_details.active_status,
                    route_path:item.module_details.route_path,
                    sub_modules: [],
                };
            }

            groupedData[moduleId].sub_modules.push({
                org_sub_module_id: item.org_sub_module_id,
                org_sub_module_name: item.org_sub_module_name,
                org_sub_module_slug: item.org_sub_module_slug,
                descriptions: item.descriptions,
                route_path:item.route_path,
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
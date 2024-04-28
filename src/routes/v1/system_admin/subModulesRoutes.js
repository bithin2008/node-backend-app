const bcrypt = require("bcryptjs");
const express = require("express");
const moment = require("moment");
const subModuleRouter = express.Router();
const verifySystemAdminToken = require("../../../common/verifySystemAdminToken");
const generatePagination = require('../../../middleware/pagination');

const subModuleController = require("../../../controllers/v1/system_admin/subModuleController")

/*******************************
 * CREATE MODULE
 * @method: POST
 * @url: /api/v1/admin/system-admin-sub-modules/create-submodule
 ********************************/
subModuleRouter.post("/create-submodule", verifySystemAdminToken, subModuleController.createSubModule);

/*******************************
 * EDIT MODULE
 * @method: POST
 * @url: /api/v1/admin/system-admin-sub-modules/update-submodule/:sub_module_id
 ********************************/
subModuleRouter.put("/update-submodule/:sub_module_id", verifySystemAdminToken, subModuleController.updateSubModule);

/*******************************
 * GET ALL MODULES
 * @method: GET
 * @url: /api/v1/admin/system-admin-sub-modules/get-all-submodules
 ********************************/
subModuleRouter.get("/get-all-submodules", verifySystemAdminToken, generatePagination(), subModuleController.getAllSubModule);


/*******************************
 * GET ALL SUB MODULE BY ID
 * @method: GET
 * @url: /api/v1/admin/system-admin-sub-modules/module-details/:module_id
 ********************************/
subModuleRouter.get("/submodule-details/:sub_module_id", verifySystemAdminToken, generatePagination(), subModuleController.getModuleById);



/*******************************
 * TOGGLE SUB MODULE STATUS
 * @method: POST
 * @url: /api/v1/admin/system-admin-modules/toggle-submodule-status
 ********************************/
subModuleRouter.put("/toggle-submodule-status/:sub_module_id", verifySystemAdminToken, subModuleController.toggleSubModuleStatus);


/*******************************
* DELETE ADD ON CATEGORIES
* @method: DELETE
 * @url: /api/v1/admin/system-admin-sub-modules/delete-module
********************************/
subModuleRouter.delete("/delete-submodule/:sub_module_id", verifySystemAdminToken, subModuleController.deleteSubModule);


/*******************************
*  GET ALL SUB MODULES GROUP BY MODULE
* @method: DELETE
 * @url: /api/v1/admin/system-admin-sub-modules/delete-module
********************************/
subModuleRouter.get("/get-all-submodule-groupby-module", verifySystemAdminToken,async(req, res, next) => {
   try {
  let result = await  subModuleController.getAllSubModulesGroupByModule(req, res, next)
  res.status(200).send({status:1,data:result})

   } catch (e) {
    next(e)
   }
  }, );



module.exports = subModuleRouter;

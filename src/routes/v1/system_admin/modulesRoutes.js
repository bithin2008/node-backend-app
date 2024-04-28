const bcrypt = require("bcryptjs");
const express = require("express");
const moment = require("moment");
const moduleRouter = express.Router();
const verifySystemAdminToken = require("../../../common/verifySystemAdminToken");
const generatePagination = require('../../../middleware/pagination');

const moduleController = require("../../../controllers/v1/system_admin/moduleController")

/*******************************
 * CREATE MODULE
 * @method: POST
 * @url: /api/v1/admin/system-admin-modules/create-module
 ********************************/
moduleRouter.post("/create-module", verifySystemAdminToken, moduleController.createModule);

/*******************************
 * EDIT MODULE
 * @method: POST
 * @url: /api/v1/admin/system-admin-modules/update-module/:module_id
 ********************************/
moduleRouter.put("/update-module/:module_id", verifySystemAdminToken, moduleController.updateModule);

/*******************************
 * GET ALL MODULES
 * @method: GET
 * @url: /api/v1/admin/system-admin-modules/get-all-modules
 ********************************/
moduleRouter.get("/get-all-modules", verifySystemAdminToken, generatePagination(), moduleController.getAllModule);


/*******************************
 * GET ALL MODULE BY ID
 * @method: GET
 * @url: /api/v1/admin/system-admin-modules/module-details/:module_id
 ********************************/
moduleRouter.get("/module-details/:module_id", verifySystemAdminToken, generatePagination(), moduleController.getModuleById);


/*******************************
 * TOGGLE MODULE STATUS
 * @method: POST
 * @url: /api/v1/admin/system-admin-modules/toggle-module-status
 ********************************/
moduleRouter.put("/toggle-module-status/:module_id", verifySystemAdminToken, moduleController.toggleModuleStatus);

/*******************************
* DELETE MODULE
* @method: DELETE
* @url: /api/v1/admin/system-admin-modules/delete-module
********************************/
moduleRouter.delete("/delete-module/:module_id", verifySystemAdminToken, moduleController.deleteModule);






module.exports = moduleRouter;

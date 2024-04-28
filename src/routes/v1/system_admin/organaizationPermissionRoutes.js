const express = require("express");
const router =express.Router();
const verifySystemAdminToken = require("../../../common/verifySystemAdminToken");
const generatePagination = require('../../../middleware/pagination');

const orgModuleSubmodulePermissionController = require("../../../controllers/v1/system_admin/orgModuleSubmodulePermissionController")


/*******************************
 * CREATE OR UPDATE ORGANAIZATION MODULE SUBMODULE PERMISSION
 * @method: POST
 * @url: /api/v1/admin/system-admin-org-permission/set-module-submodule
 ********************************/
router.post("/set-module-submodule", verifySystemAdminToken, orgModuleSubmodulePermissionController.setOrgModuleSubModulePermission);

/*******************************
 * GET ORGANAIZATION MODULE SUBMODULE LIST
 * @method: POST
 * @url: /api/v1/admin/system-admin-org-permission/get-org-submodules
 ********************************/
router.post("/get-org-submodules/:org_id", verifySystemAdminToken, orgModuleSubmodulePermissionController.getOrgSubModuleList);

module.exports = router;

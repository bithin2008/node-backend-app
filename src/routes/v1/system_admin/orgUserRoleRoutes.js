require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const moment = require("moment");
const ogrUserRolesRouter = express.Router();
const verifySystemAdminToken = require("../../../common/verifySystemAdminToken");
const userController = require("../../../controllers/v1/admin/UserController")
const generatePagination = require('../../../middleware/pagination');
const orgUserRolesController = require("../../../controllers/v1/admin/orgUserRolesController")

/*******************************
 * CREATE ORG USER ROLES
 * @method: POST
 * @url: /api/v1/admin/org-user-roles/create-user-role
 ********************************/
ogrUserRolesRouter.post("/create-user-role",verifySystemAdminToken, orgUserRolesController.createOrgUserRole);


/*******************************
 * EDIT ORG USER ROLES
 * @method: POST
 * @url: /api/v1/admin/org-user-roles/update-user-role/:user_role_id
 ********************************/
ogrUserRolesRouter.put("/update-user-role/:user_role_id", verifySystemAdminToken, orgUserRolesController.updateOrgUserRole);


/*******************************
 * GET ALL ORG USER ROLES
 * @method: GET
 * @url: /api/v1/admin/system-admin-roles/get-all-org-user-roles
 ********************************/
ogrUserRolesRouter.post('/get-all-org-user-roles', verifySystemAdminToken, generatePagination(), orgUserRolesController.getAllOrgUserRoles)


/*******************************
 * TOGGLE ORG USER ROLE STATUS
 * @method: POST
 * @url: /api/v1/admin/org-user-roles/toggle-org-user-roles-status
 ********************************/
ogrUserRolesRouter.put("/toggle-org-user-roles-status/:user_role_id", verifySystemAdminToken, orgUserRolesController.toggleOrgUserRoleStatus);

/*******************************
* DELETE MODULE
* @method: DELETE
* @url: /api/v1/admin/org-user-roles/delete-org-user-role
********************************/
ogrUserRolesRouter.delete("/delete-org-user-role/:user_role_id", verifySystemAdminToken, orgUserRolesController.deleteOrgUserRole);

module.exports = ogrUserRolesRouter;

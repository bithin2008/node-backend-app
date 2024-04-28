require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const moment = require("moment");
const router = express.Router();
const verifyToken = require("../../../common/verifyToken");
const userController = require("../../../controllers/v1/admin/UserController")
const generatePagination = require('../../../middleware/pagination');
const orgUserRolesController = require("../../../controllers/v1/admin/orgUserRolesController");
const CustomError = require("../../../utils/customErrorHandler");

/*******************************
 * CREATE ORG USER ROLES
 * @method: POST
 * @url: /api/v1/admin/roles/create-user-role
 ********************************/
router.post("/create-role",verifyToken, orgUserRolesController.createOrgUserRole);


/*******************************
 * EDIT ORG USER ROLES
 * @method: POST
 * @url: /api/v1/admin/roles/up-role/:user_role_id
 ********************************/
router.put("/update-role/:user_role_id", verifyToken, orgUserRolesController.updateOrgUserRole);


/*******************************
 * GET ALL ORG USER ROLES
 * @method: GET
 * @url: /api/v1/admin/roles/get-all-roles
 ********************************/
router.post('/get-all-roles', verifyToken, generatePagination(), orgUserRolesController.getAllOrgUserRoles)

/*******************************
 * GET USER ROLE BY ID
 * @method: POST
 * @url: /api/v1/admin/roles/get-role-details
 ********************************/
router.post('/get-role-details/:user_role_id', verifyToken, orgUserRolesController.getUserRoleById)


/*******************************
 * TOGGLE ORG USER ROLE STATUS
 * @method: POST
 * @url: /api/v1/admin/roles/toggle-roles-status
 ********************************/
router.put("/toggle-roles-status/:user_role_id", verifyToken, orgUserRolesController.toggleOrgUserRoleStatus);

/*******************************
* DELETE MODULE
* @method: DELETE
* @url: /api/v1/admin/roles/delete-role
********************************/
router.delete("/delete-role/:user_role_id", verifyToken, orgUserRolesController.deleteOrgUserRole);


/*******************************
* SET ROLE WISE  MODULE SUBMODULE PERMISSION
* @method: POST
* @url: /api/v1/admin/roles/set-role-permission
********************************/
router.post("/set-role-permission/:user_role_id", verifyToken, async (req, res, next) => {
    try {
        if (req.body.selectedRolePermissionData.length==0) {
            throw new CustomError(`please select atleast one permission`, 400)
        }else{
        let result = await orgUserRolesController.setOrgUserRolePermission(req, res, next)
        res.status(200).send({ status: 1, data: result, message: `Permission set successfully.` })
        }
       
    } catch (e) {
        next(e)
    }
},);
/*******************************
* GET ROLE WISE  MODULE SUBMODULE PERMISSION
* @method: POST
* @url: /api/v1/admin/roles/set-role-permission
********************************/
router.post("/get-role-permission/:user_role_id", verifyToken, async (req, res, next) => {
    try {
        let result = await orgUserRolesController.getOrgUserRolePermission(req, res, next)
        res.status(200).send({ status: 1, data: result, message: `Fetch role permission successfully.` })
    } catch (e) {
        next(e)
    }
},);


module.exports = router;

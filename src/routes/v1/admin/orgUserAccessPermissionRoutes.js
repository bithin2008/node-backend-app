const express = require("express");
const router = express.Router();
const verifyToken = require("../../../common/verifyToken");
const orgUserAccessPermisiionController = require("../../../controllers/v1/admin/orgUserAccessPermisiionController");
const CustomError = require("../../../utils/customErrorHandler");

/*******************************
* SET User MODULE SUBMODULE ACCESS PERMISSION
* @method: POST
* @url: /api/v1/admin/org-user-access-permisiions/set-user-access-permission:org_user_id
********************************/
router.post("/set-user-access-permission/:org_user_id", verifyToken, async (req, res, next) => {
    try {
        if (!req.body.selectedAccessPermissionData) {
            throw new CustomError(`please select atleast one permission`, 400)
        }else{
        let result = await orgUserAccessPermisiionController.setOrgUserAccessPermission(req, res, next);
        if (result) {
            res.status(200).send({ status: 1, data: result, message: `Permission set successfully.` })

        }
        }
       
    } catch (e) {
        next(e)
    }
});

module.exports= router
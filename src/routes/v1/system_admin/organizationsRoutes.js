require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const helper =require("../../../common/helper")
const createFolder = require("../../../middleware/createFolder")
const moment = require("moment");
const router = express.Router();
const multerUpload = require("../../../middleware/multerUpload");
// const config = require('../../../config/config');
// const validation = require('../../../../middleware/validators');
// const authVerify = require("../../../../common/verifyToken");
// const checkRole = require('../../../../middleware/checkRole');
const generatePagination = require('../../../middleware/pagination');
const verifySystemAdminToken = require("../../../common/verifySystemAdminToken");

const OrganizationsController = require("../../../controllers/v1/system_admin/organizationController");
const CustomError = require("../../../utils/customErrorHandler");

/*******************************
 * CREATE  Organizations
 * @method: POST
 * @url: /api/v1/admin/system-admin-org/create-organizations
 ********************************/ 
 router.post("/create-organizations", verifySystemAdminToken, OrganizationsController.createOrganizations);


/*******************************
 * UPDATE  Organizations
 * @method: PUT
 * @url: /api/v1/admin/system-admin-org/update-organizations
 ********************************/ 
 router.put("/update-organizations/:org_id", verifySystemAdminToken, OrganizationsController.updateOrganizations);



 /*******************************
 * GET ALL ORGANIZATIONS
 * @method: POST
 * @url: /api/v1/admin/system-admin-org/get-all-organizations
 ********************************/ 
 router.post("/get-all-organizations", verifySystemAdminToken,generatePagination(), OrganizationsController.getAllOrganizations);


 /*******************************
 * UPDATE Organizations Logo
 * @method: POST
 * @url: /api/v1/admin/system-admin-org/update-logo/:org_id
 ********************************/ 
 router.post(
  "/update-logo/:org_id", async (req, res, next) => {
    const{org_id}  =  req.params;
    if (org_id) {
      const folderPath = `./src/public/org_files/hws_${org_id}/media_content`; // Replace this with your folder path template
      let folderRes = await createFolder(folderPath);
      multerUpload.setMulterUploadValidation(['image/png','image/webp'], 2 * 1024 * 1024, `./public/org_files/hws_${org_id}/media_content`)(req, res, next); 
    } else {
      throw new CustomError( 'Bad request.',400)
    }
  },
  multerUpload.multerUploadSingleFile.single('orgLogo'), OrganizationsController.orgUpdateLogo
);


/*******************************
 * UPDATE Organizations TINY-Logo
 * @method: POST
 * @url: /api/v1/admin/system-admin-org/update-tiny-logo/:org_id
 ********************************/ 
 router.post(
  "/update-tiny-logo/:org_id", async (req, res, next) => {
    const{org_id}  =  req.params;
    if (org_id) {
      const folderPath = `./src/public/org_files/hws_${org_id}/media_content`; // Replace this with your folder path template
      let folderRes = await createFolder(folderPath);
      multerUpload.setMulterUploadValidation(['image/png'], 2 * 1024 * 1024, `./public/org_files/hws_${org_id}/media_content`)(req, res, next); 
    } else {
      throw new CustomError( 'Bad request.',400)
    }
  },
  multerUpload.multerUploadSingleFile.single('orgTinyLogo'), OrganizationsController.orgTinyLogo
);


/*******************************
 * TOGGLE ORGANAIZATION STATUS
 * @method: PUT
 * @url: /api/v1/admin/system-admin-org/toggle-organizations-status/:org_id
 ********************************/
router.put("/toggle-organizations-status/:org_id", verifySystemAdminToken, OrganizationsController.toggleOrganizationsStatus);



module.exports = router;

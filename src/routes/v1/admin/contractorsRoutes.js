require("dotenv").config();
const express = require("express");
const contractorsRouter = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const config = require('../../../config/config');
const contractorsController = require("../../../controllers/v1/admin/contractorsController");
const multerUpload = require("../../../middleware/multerUpload");

/*******************************
 * GET ALL CONTRACTORS
 * @method: POST
 * @url: /api/v1/admin/contractors/get-all-contractors
 ********************************/
contractorsRouter.post("/get-all-contractors", verifyToken,generatePagination(), contractorsController.getAllContractors);

/*******************************
 * UPDATE CONTRACTOR STATUS
 * @method: POST    
 * @url: /api/v1/admin/contractors/update-active-status/:contractor_id
 ********************************/
contractorsRouter.post("/update-active-status", verifyToken, contractorsController.updateContractorStatus);

/*******************************
 * UPDATE CONTRACTOR STATUS
 * @method: POST    
 * @url: /api/v1/admin/contractors/update-active-status/:contractor_id
 ********************************/
contractorsRouter.post("/contractor-assign-job/:contractor_id", verifyToken, contractorsController.getContractorAssignjobs);

/*******************************
 * ASSIGN JOB CONTRACTORS
 * @method: POST    
 * @url: /api/v1/admin/contractors/assign-job/:contractor_id
 ********************************/
contractorsRouter.post("/assign-job/:contractor_id", verifyToken, contractorsController.assignJob);

/*******************************
 * UPDATE CONTRACTORS
 * @method: POST    
 * @url: /api/v1/admin/contractors/update
 ********************************/
contractorsRouter.post("/update", verifyToken, contractorsController.updateContractors);


/*******************************
 * GET ASSIGNED JOBS
 * @method: POST    
 * @url: /api/v1/admin/contractors/get-claim-assign-jobs/:claim_id
 ********************************/
contractorsRouter.post("/get-claim-assign-jobs/:claim_id", verifyToken, contractorsController.getclaimWiseAssignjobs);

   /*******************************
 * UPLOAD LICENSE DOCUMENT
 * @method: POST
 * @url: /api/v1/admin/contractors/upload-license/:contractor_id
 ********************************/ 
   contractorsRouter.post(
    "/upload-license/:contractor_id", verifyToken,(req, res, next) => {
        const{contractor_id}  =  req.params;
        if (contractor_id) {
          multerUpload.setMulterUploadValidation(['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'], 2 * 1024 * 1024, `./public/org_files/hws_${req.tokenData.org_id}/contractors`)(req, res, next); 
        } else {
          throw new CustomError( 'Bad request.',400)
        }
      },
    multerUpload.multerUploadSingleFile.single('licenseFile'), contractorsController.uploadLicenseDoc
  );


module.exports = contractorsRouter;
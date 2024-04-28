require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const contractorRouter = express.Router();
const config = require('../../../config/config');
const checkZipCode =require('../../../middleware/zipcodeValidators')
const generatePagination = require('../../../middleware/pagination');
const contractorsController = require("../../../controllers/v1/admin/contractorsController")
const multerUpload = require("../../../middleware/multerUpload");
/*******************************
 * CREATE CONTRACTOR
 * @method: POST
 * @url: /api/v1/frontend/contractors/create-contractor
 ********************************/
contractorRouter.post("/create-contractor", contractorsController.createContractor);


   /*******************************
 * UPLOAD LICENSE DOCUMENT
 * @method: POST
 * @url: /api/v1/frontend/contractors/upload-license/:contractor_id
 ********************************/ 
   contractorRouter.post(
    "/upload-license/:contractor_id", (req, res, next) => {
        const{contractor_id}  =  req.params;
        if (contractor_id) {
          multerUpload.setMulterUploadValidation(['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'], 2 * 1024 * 1024, `./public/org_files/hws_${req.headers.org_id}/contractors`)(req, res, next); 
        } else {
          throw new CustomError( 'Bad request.',400)
        }
      },
    multerUpload.multerUploadSingleFile.single('licenseFile'), contractorsController.uploadLicenseDoc
  );

module.exports = contractorRouter;

require("dotenv").config();
const express = require("express");
const careerRouter = express.Router();
const config = require('../../../config/config');
const careersController = require("../../../controllers/v1/admin/careersController")
const multerUpload = require("../../../middleware/multerUpload");
/*******************************
 * POST CAREER
 * @method: POST
 * @url: /api/v1/frontend/careers/submit-career
 ********************************/
careerRouter.post("/submit-career", careersController.submitCareer);


   /*******************************
 * UPLOAD RESUME DOCUMENT
 * @method: POST
 * @url: /api/v1/frontend/careers/upload-resumeresume/:career_id
 ********************************/ 
   careerRouter.post(
    "/upload-resume/:career_id", (req, res, next) => {
        const{career_id}  =  req.params;
        if (career_id) {
          multerUpload.setMulterUploadValidation(['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'], 2 * 1024 * 1024, `./public/org_files/hws_${req.headers.org_id}/careers`)(req, res, next); 
        } else {
          throw new CustomError( 'Bad request.',400)
        }
      },
    multerUpload.multerUploadSingleFile.single('resumeFile'), careersController.uploadResume
  );

module.exports = careerRouter;

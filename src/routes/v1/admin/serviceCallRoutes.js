require("dotenv").config();
const express = require("express");
const router = express.Router();
const authVerify = require("../../../common/verifyToken");

const generatePagination = require('../../../middleware/pagination');

const serviceCallFeesController = require("../../../controllers/v1/admin/serviceCallFeesController")


router.get("/get-service-call", authVerify,generatePagination(), serviceCallFeesController.getServiceCallFeesId);

/*******************************
 * CREATE SCF 
 * @method: POST
 * @url: /api/v1/admin/service-call/create-scf
 ********************************/
router.post("/create-scf", authVerify, serviceCallFeesController.createAndUpdateSCF)
router.post("/update-scf-status", authVerify, serviceCallFeesController.updateScfStatus)
//test
module.exports = router;
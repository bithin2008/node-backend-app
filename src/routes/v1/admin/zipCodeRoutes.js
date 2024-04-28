require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const moment = require("moment");
const zipCodeRouter = express.Router();
const config = require('../../../config/config');
const checkPermisiion = require('../../../middleware/checkPermisiion');
const verifyToken = require("../../../common/verifyToken");
const checkRole = require('../../../middleware/checkRole');
const generatePagination = require('../../../middleware/pagination');
const multerUpload = require("../../../middleware/multerUpload");
const helper = require('../../../common/helper');

const zipCodeController = require("../../../controllers/v1/admin/zipCodeController")


/*******************************
 * CREATE WHITELIST IP
 * @method: POST
 * @url: /api/v1/admin/whitelist-ips/create-whitelist-ip
 ********************************/
zipCodeRouter.post("/create-zip-code", verifyToken, zipCodeController.createNewZipCode);

/*******************************
 * GET ALL ZIP CODE
 * @method: POST
 * @url: /api/v1/admin/zip-code/get-all-zip-code
 ********************************/
zipCodeRouter.post("/get-all-zip-code", verifyToken, generatePagination(), zipCodeController.getAllZipCode);


/*******************************
 * UPDATE ZIP CODE
 * @method: PUT
 * @url: /api/v1/admin/zip-code/update-zip-code
 ********************************/
zipCodeRouter.put("/update-zip-code/:zip_code_id", verifyToken, zipCodeController.updateZipCode);


/*******************************
 * ZIP CODE ACTIVATION
 * @method: POST
 * @url: /api/v1/admin/zip-code/toggle-zip-code-status
 ********************************/
zipCodeRouter.put("/toggle-zip-code-status/:zip_code_id", verifyToken, zipCodeController.toggleZipCodeStatus);

module.exports = zipCodeRouter;
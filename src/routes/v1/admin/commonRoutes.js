"use strict";
const express = require("express");
const app = express();
const commonRouter = express.Router();
const verifySystemAdminToken = require("../../../common/verifySystemAdminToken");
const commonController = require("../../../controllers/v1/admin/commonController")
const checkZipCode = require('../../../middleware/zipcodeValidators')
commonRouter.post('/location-by-zip', checkZipCode, commonController.locationByZip)
commonRouter.post('/state-list', commonController.getStates)
commonRouter.post('/is-value-unique', verifySystemAdminToken, commonController.isValueUnique)


module.exports = commonRouter;

require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const config = require('../../../config/config');
const validation = require('../../../middleware/validators');
const authVerify = require("../../../common/verifyToken");
const checkZipCode = require('../../../middleware/zipcodeValidators');


const customerFunnelController = require("../../../controllers/v1/frontend/customerFunnelController")

/*******************************
 * first step of policy buy time customer creation
 * @method: POST
 * @url: /api/v1/frontend/customer-funnel/create-update-lead
 ********************************/
router.post("/create-update-lead", customerFunnelController.createOrUpdateLead);



/*******************************
 * first step of policy buy time customer creation
 * @method: POST
 * @url: /api/v1/frontend/customer-funnel/create-update-lead-by-field
 ********************************/
router.post("/create-update-lead-by-field", customerFunnelController.createOrUpdateLeadByField);


/*******************************
 * first step of policy buy time customer creation
 * @method: POST
 * @url: /api/v1/frontend/customer-funnel/get-lead-details
 ********************************/
router.post("/get-lead-details", customerFunnelController.getLeadDetails);


module.exports = router;

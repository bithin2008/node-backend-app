require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const moment = require("moment");
const whitelistIPRouter = express.Router();
const config = require('../../../config/config');
const validation = require('../../../middleware/validators');
const verifyToken = require("../../../common/verifyToken");
const checkRole = require('../../../middleware/checkRole');
const generatePagination = require('../../../middleware/pagination');
const whitelistIPController = require("../../../controllers/v1/admin/whitelistIPController")

/*******************************
 * CREATE WHITELIST IP
 * @method: POST
 * @url: /api/v1/admin/whitelist-ips/create-whitelist-ip
 ********************************/
whitelistIPRouter.post("/create-whitelist-ip", verifyToken, whitelistIPController.createWhitelistIP);


/*******************************
 * GET ALL WHITELIST IPS
 * @method: GET
 * @url: /api/v1/admin/whitelist-ips/get-all-whitelistip
 ********************************/
whitelistIPRouter.get("/get-all-whitelistip", verifyToken, generatePagination(), whitelistIPController.getAllWhitelistIPs);

/*******************************
 * UPDATE PLAN
 * @method: PUT
 * @url: /api/v1/admin/whitelist-ips/update-ip-address
 ********************************/
whitelistIPRouter.put("/update-ip-address/:whitelist_ip_id", verifyToken, whitelistIPController.updateIPAddress);


/*******************************
* DELETE IP ADDRESS
* @method: DELETE
* @url: /api/v1/admin/whitelist-ips/delete-ip-address
********************************/
whitelistIPRouter.delete("/delete-ip-address/:whitelist_ip_id", verifyToken, whitelistIPController.deleteIPAddress);

/*******************************
 * USER ACTIVATION
 * @method: POST
 * @url: /api/v1/admin/whitelist-ips/toggle-ip-address-status
 ********************************/
whitelistIPRouter.put("/toggle-ip-address-status/:whitelist_ip_id", verifyToken, whitelistIPController.toggleIPAddressStatus);




module.exports = whitelistIPRouter;

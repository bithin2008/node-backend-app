require("dotenv").config();
const express = require("express");
const router = express.Router();
const authVerify = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');

const renewalStatusController = require('../../../controllers/v1/admin/renewalStatusController');

/*******************************
 * CREATE RENEWAL STATUS
 * @method: POST
 * @url: /api/v1/admin/renewal-status-master/create
 ********************************/
router.post("/create", authVerify, renewalStatusController.createRenewalStatus);


/*******************************
* UPDATE RENEWAL STATUS 
* @method: PUT
* @url: /api/v1/admin/renewal-status-master/update/:renewal_status_id
********************************/
router.put("/update/:renewal_status_id", authVerify,  renewalStatusController.updateRenewalStatus);


/*******************************
 * GET ALL RENEWAL STATUS
 * @method: GET
 * @url: /api/v1/admin/renewal-status-master/get-all-status  
 ********************************/
router.get("/get-all-status", authVerify, generatePagination(), renewalStatusController.getAllStatus);


/*******************************
 * GET RENEWAL STATUS BY ID
 * @method: GET
 * @url: /api/v1/admin/renewal-status-master/status-details/:renewal_status_id
 ********************************/
router.get("/status-details/:renewal_status_id", authVerify, renewalStatusController.getRenewalStatusById);


/*******************************
* DELETE RENEWAL STATUS
* @method: DELETE
* @url: /api/v1/admin/renewal-status-master/delete/:renewal_status_id
********************************/
router.delete("/delete/:renewal_status_id", authVerify, renewalStatusController.deleteRenewalStatus);

/*******************************
 * TOGGLE RENEWAL STATUS
 * @method: PUT
 * @url: /api/v1/admin/renewal-status-master/toggle-status/:renewal_status_id
 ********************************/
router.put("/toggle-status/:renewal_status_id", authVerify, renewalStatusController.toggleRenewalStatus);

module.exports = router;
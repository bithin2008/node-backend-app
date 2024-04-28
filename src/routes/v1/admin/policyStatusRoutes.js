require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const policyStatusController = require("../../../controllers/v1/admin/policyStatusController")


/*******************************
 * CREATE POLICY STATUS
 * @method: POST
 * @url: /api/v1/admin/policy-status/create
 ********************************/
router.post("/save", verifyToken, policyStatusController.savePolicyStatus)

/*******************************
 * UPDATE POLICY STATUS
 * @method: POST
 * @url: /api/v1/admin/policy-status/update
 ********************************/
router.post("/update", verifyToken, policyStatusController.updateActiveStatus)


/*******************************
 * GET ALL POLICY STATUS
 * @method: GET
 * @url: /api/v1/admin/policy-status/list
 ********************************/
router.get("/list", verifyToken, generatePagination(), policyStatusController.getStatusList);


/*******************************
* DELETE POLICY STATUS
* @method: DELETE
* @url: /api/v1/admin/policy-status/delete
********************************/
router.delete("/delete/:policy_status_id", verifyToken, policyStatusController.deleteStatus);

module.exports = router;
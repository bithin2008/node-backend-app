require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const claimsPriorityController = require("../../../controllers/v1/admin/claimsPriorityController")


/*******************************
 * CREATE CLIAM PRIORITY
 * @method: POST
 * @url: /api/v1/admin/priority/create-claim-priority
 ********************************/
router.post("/create-claim-priority", verifyToken, claimsPriorityController.createAndUpdateClaimsPriority)

/*******************************
 * CREATE CLIAM PRIORITY
 * @method: POST
 * @url: /api/v1/admin/priority/update-priority-status
 ********************************/
router.post("/update-priority-status", verifyToken, claimsPriorityController.updateClaimsPriorityStatus)



/*******************************
 * GET ALL CLIAM PRIORITY
 * @method: GET
 * @url: /api/v1/admin/priority/get-claim-priority
 ********************************/
router.get("/get-claim-priority", verifyToken, generatePagination(), claimsPriorityController.getClaimsPriority);


/*******************************
* DELETE CLIAM PRIORITY
* @method: DELETE
* @url: /api/v1/admin/priority/delete-claim-priority
********************************/
router.delete("/delete-claim-priority/:claim_priority_id", verifyToken, claimsPriorityController.deleteClaimsPriority);

module.exports = router;
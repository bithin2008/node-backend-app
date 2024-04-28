require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const claimTicketStatusesController = require("../../../controllers/v1/admin/claimTicketStatusesController")


/*******************************
 * CREATE CLAIM STATUS
 * @method: POST
 * @url: /api/v1/admin/claim-status/create
 ********************************/
router.post("/save", verifyToken, claimTicketStatusesController.saveTicketStatus)

/*******************************
 * UPDATE CLAIM STATUS
 * @method: POST
 * @url: /api/v1/admin/claim-status/update
 ********************************/
router.post("/update", verifyToken, claimTicketStatusesController.updateActiveTicketStatus)


/*******************************
 * GET ALL CLAIM STATUS
 * @method: GET
 * @url: /api/v1/admin/claim-status/list
 ********************************/
router.get("/list", verifyToken, generatePagination(), claimTicketStatusesController.getTicketStatusList);


/*******************************
* DELETE CLAIM STATUS
* @method: DELETE
* @url: /api/v1/admin/claim-status/delete
********************************/
router.delete("/delete/:claim_ticket_statuses_id", verifyToken, claimTicketStatusesController.deleteTicketStatus);

module.exports = router;
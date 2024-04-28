require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const holdingPeriodController = require("../../../controllers/v1/admin/holdingPeriodController")


/*******************************
 * CREATE HOLDING PERIOD
 * @method: POST
 * @url: /api/v1/admin/holding/create-holding-period
 ********************************/
router.post("/create-holding-period", verifyToken, holdingPeriodController.createAndUpdate)

/*******************************
 * UPDATE HOLDING PERIOD STATUS
 * @method: POST
 * @url: /api/v1/admin/holding/update-holding-period-status
 ********************************/
router.post("/update-holding-period-status", verifyToken, holdingPeriodController.updateHoldingPeriodStatus)



/*******************************
 * GET ALL HOLDING PERIOD
 * @method: GET
 * @url: /api/v1/admin/holding/get-holding-periods
 ********************************/
router.get("/get-holding-periods", verifyToken, generatePagination(), holdingPeriodController.getHoldingPeriods);


/*******************************
* DELETE HOLDING PERIOD
* @method: DELETE
* @url: /api/v1/admin/holding/delete-holding-period
********************************/
router.delete("/delete-holding-period/:holding_period_id", verifyToken, holdingPeriodController.deleteHoldingPeriod);

module.exports = router;
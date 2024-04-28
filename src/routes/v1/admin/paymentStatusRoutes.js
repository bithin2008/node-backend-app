require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const paymentStatusController = require("../../../controllers/v1/admin/paymentStatusController")


/*******************************
 * CREATE PAYMENT STATUS
 * @method: POST
 * @url: /api/v1/admin/payment-status/create
 ********************************/
router.post("/save", verifyToken, paymentStatusController.savePaymentStatus)

/*******************************
 * UPDATE PAYMENT STATUS
 * @method: POST
 * @url: /api/v1/admin/payment-status/update
 ********************************/
router.post("/update", verifyToken, paymentStatusController.updateActiveStatus)


/*******************************
 * GET ALL PAYMENT STATUS
 * @method: GET
 * @url: /api/v1/admin/payment-status/list
 ********************************/
router.get("/list", verifyToken, generatePagination(), paymentStatusController.getStatusList);


/*******************************
* DELETE PAYMENT STATUS
* @method: DELETE
* @url: /api/v1/admin/payment-status/delete
********************************/
router.delete("/delete/:payment_status_id", verifyToken, paymentStatusController.deleteStatus);

module.exports = router;
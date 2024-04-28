require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const moment = require("moment");
const paymentsRouter = express.Router();
const config = require('../../../config/config');
const validation = require('../../../middleware/validators');
const verifyToken = require("../../../common/verifyToken");
const checkRole = require('../../../middleware/checkRole');
const generatePagination = require('../../../middleware/pagination');
const paymentsController = require("../../../controllers/v1/admin/paymentsController")

/*******************************
 * 
 * GET ALL PAYMENT
 * @method: GET
 * @url: /api/v1/admin/payments/get-all-payments
 ********************************/
paymentsRouter.post("/get-all-payments/:key?", verifyToken, generatePagination(),modifyCustomerResponse, paymentsController.getAllPaymentHistory);
function modifyCustomerResponse (req, res, next) {
    // Capture the response sent by customerController.getAllCustomers
    const originalSend = res.send;
    res.send = async function (body) {
      // Check if req.params.key is "export_excel"
      if (req.params.key === "export_excel" || req.params.key === "export_csv") {
       await paymentsController.exportGetAllPaymentHistory(req, res,next, body.data,);
        return;
      } else {
        // If req.params.key is not "export_excel", proceed with the original response
        originalSend.call(res, body);
      }
    };
    // Proceed to the next middleware or route handler
    next();
  }

/*******************************
 * 
 * GET ALL PAYMENT BY Customer
 * @method: GET
 * @url: /api/v1/admin/payments/get-customer-payments
 ********************************/
paymentsRouter.get("/get-customer-payments/:customer_id", verifyToken, paymentsController.getCustomerAllPayments);

/*******************************
 * 
 * GET ALL PAYMENT
 * @method: GET
 * @url: /api/v1/admin/payments/get-all-failed-payments
 ********************************/
paymentsRouter.get("/get-all-failed-payments", verifyToken, generatePagination(), paymentsController.getAllFailedPayment);


/*******************************
 * 
 * UPDATE PAYMENT
 * @method: GET
 * @url: /api/v1/admin/payments/update-payment/:payment_id
 ********************************/
paymentsRouter.put("/update-payment/:payment_id", verifyToken,  paymentsController.updatePayment);

/*******************************
 * 
 * RETRY FAILED PAYMENT
 * @method: POST
 * @url: /api/v1/admin/payments/retry-failed-payment/:payment_id
 ********************************/
paymentsRouter.post("/retry-failed-payment/:payment_id", verifyToken,  paymentsController.retryFailedPayment);


/*******************************
* DELETE PAYMENTS
* @method: POST    
* @url: api/v1/admin/payments/delete-payment/:payment_id
********************************/
paymentsRouter.post("/delete-payment/:payment_id", verifyToken, paymentsController.deletepayment);

module.exports = paymentsRouter;
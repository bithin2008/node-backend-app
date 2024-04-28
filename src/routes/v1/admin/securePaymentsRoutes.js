const express = require("express");
const router = express.Router();
const securePaymentsController = require("../../../controllers/v1/admin/payment-gateway/securePaymentsController");
const verifyToken = require("../../../common/verifyToken");

 /*******************************
 * CHARGE CREDIT CARD
 * @method: POST    
 * @url: /api/v1/admin/secure-payments/charge-credit-card
 ********************************/ 
 router.post("/charge-credit-card", securePaymentsController.chargeCreditCard);


 /*******************************
 * DEBIT BANK ACCOUNT
 * @method: POST    
 * @url: /api/v1/admin/secure-payments/debit-bank-account
 ********************************/ 
 router.post("/debit-bank-account", securePaymentsController.debitBankAccount);


 /*******************************
 * LINK PAYMENT
 * @method: POST    
 * @url: /api/v1/admin/secure-payments/link-payment
 ********************************/ 
 router.post("/link-payment", securePaymentsController.linkPayment);


  

 module.exports = router;

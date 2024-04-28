require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const moment = require("moment");
const customerPortalRouter = express.Router();
const config = require('../../../config/config');
const checkPermisiion = require('../../../middleware/checkPermisiion');
const authVerify = require("../../../common/verifyToken");
const checkRole = require('../../../middleware/checkRole');
const generatePagination = require('../../../middleware/pagination');
const multerUpload = require("../../../middleware/multerUpload");
const helper = require('../../../common/helper');
const verifyCustomerToken = require("../../../common/verifyCustomerToken");
const customerController = require("../../../controllers/v1/admin/customerController")
const customerCardsController = require("../../../controllers/v1/admin/customerCardsController")
const policyController = require("../../../controllers/v1/admin/policyController")
const claimsController = require("../../../controllers/v1/admin/claimsController")
const productProblemController = require("../../../controllers/v1/admin/productProblemController")

/*******************************
 * LOGIN
 * @method: POST
 * @url: /api/v1/frontend/customer-portal/login-customer-portal
 ********************************/
customerPortalRouter.post("/login-customer-portal", customerController.login);


/*******************************
 * VALIDATE CUSTOMER OTP
 * @method: POST
 * @url: /api/v1/frontend/customer-portal/validate-customer-login-otp
 ********************************/
customerPortalRouter.post("/validate-customer-login-otp", customerController.validateCustomerLoginOTP);


/*******************************
 * RESEND CUSTOMER OTP
 * @method: POST
 * @url: /api/v1/frontend/customer-portal/validate-customer-login-otp
 ********************************/
customerPortalRouter.post("/resend-customer-login-otp", customerController.resendCustomerLoginOtp);


/*******************************
 * VERIFY CUSTOMER PORTAL TOKEN
 * @method: POST
 * @url: /api/v1/frontend/customer-portal/verify-system-admin-token
 ********************************/
customerPortalRouter.post('/verify-customer-portal-token', verifyCustomerToken, customerController.verifyCustomerPortalToken)


/*******************************
 * GENERATE FORGOT PASSWORD LINK FOR SYSTEM ADMIN
 * @method: POST
 * @url: /api/v1/frontend/customer-portal/gen-customer-forgot-pass-link
 ********************************/
customerPortalRouter.post('/gen-customer-forgot-pass-link', customerController.generateForgotPassLink)

/*******************************
 * GENERATE FORGOT PASSWORD LINK FOR SYSTEM ADMIN
 * @method: POST
 * @url: /api/v1/frontend/customer-portal/gen-customer-forgot-pass-link
 ********************************/
customerPortalRouter.post('/update-customer-password', customerController.updateCustomerPassword)


/*******************************
 * UPDATE  USER PROFILE INFORMATION
 * @method: POST
 * @url: /api/v1/frontend/customer-portal/update-customer-profile
 ********************************/
customerPortalRouter.put('/update-customer-profile', verifyCustomerToken, customerController.updateCustomerProfie)

/*******************************
 * CUSTOMER PAYMENT HISTORY
 * @method: POST
 * @url: /api/v1/frontend/customer-portal/customer-details
 ********************************/
customerPortalRouter.post('/customer-details/:param', verifyCustomerToken, customerController.getCustomerDetailsForCustomerPortal)


/*******************************
 * CUSTOMER PAYMENT HISTORY
 * @method: POST
 * @url: /api/v1/frontend/customer-portal/policy-details/:policy_id
 ********************************/
customerPortalRouter.post('/policy-details/:policy_param', verifyCustomerToken, policyController.getPolicyDetails)


/*******************************
 * CUSTOMER PAYMENT HISTORY
 * @method: POST
 * @url: /api/v1/frontend/customer-portal/create-claim
 ********************************/
customerPortalRouter.post("/create-claim", verifyCustomerToken, claimsController.createClaimFromWebsite);


/*******************************
 * UPDATE CUSTOMER PRIMARY CARD
 * @method: GET
 * @url: /api/v1/admin/customer-card/update-primary-card/:customer_card_id
 ********************************/
customerPortalRouter.post("/update-primary-card/:customer_card_id", verifyCustomerToken, customerCardsController.updatePrimaryCard);


/*******************************
 * CUSTOMER PORTAL LAST LOGIN
 * @method: POST
 * @url: /api/v1/frontend/customer-portal/customer-portal-last-login
 ********************************/
customerPortalRouter.get('/customer-portal-last-login', verifyCustomerToken, customerController.getCustomerPortalLastLogin)


/*******************************
 * GET ALL CUSTOMER CARDS
 * @method: POST
 * @url: /api/v1/frontend/customer-portal/get-all-cards/:customer_id
 ********************************/
customerPortalRouter.post("/get-all-cards/:customer_id", verifyCustomerToken, customerCardsController.getAllCards);

/*******************************
 * CREATE NEW CARD
 * @method: GET
 * @url: /api/v1/frontend/customer-portal/create-card/:customer_id
 ********************************/
customerPortalRouter.post("/create-card/:customer_id", verifyCustomerToken, customerCardsController.createCard);


/*******************************
 * GET ALL CUSTOMER CLAIMS
 * @method: POST
 * @url: /api/v1/frontend/customer-portal/get-all-claims/:customer_id
 ********************************/
customerPortalRouter.post("/get-all-claims/:customer_id", verifyCustomerToken, claimsController.getAllClaims);


/*******************************
 * GET ALL CUSTOMER CLAIMS
 * @method: POST
 * @url: /api/v1/frontend/customer-portal/re-payments/:payment_id
 ********************************/
customerPortalRouter.post("/re-payments/:payment_id", verifyCustomerToken, customerController.rePayment);


/*******************************
 * UPDATE 
 * @method: PUT
 * @url: /api/v1/frontend/customer-portal/update-policy-info/:policy_id
 ********************************/
customerPortalRouter.put("/update-policy-info/:policy_id", verifyCustomerToken, policyController.updatePolicyInfo);


/*******************************
 * UPDATE 
 * @method: POST
 * @url: /api/v1/frontend/customer-portal/change-profile-password
 ********************************/
customerPortalRouter.post("/change-profile-password", verifyCustomerToken, customerController.changePassword);

/*******************************
 * CUSTOMER PORTAL LOGOUT
 * @method: POST
 * @url: /api/v1/frontend/customer-portal/logout
 ********************************/
customerPortalRouter.post('/customer-portal-logout', verifyCustomerToken, customerController.customerLogOut)



/*******************************
 * CREATE POLICY BY Customer
 * @method: POST
 * @url: /api/v1/frontend/policies/create-policy
 ********************************/
customerPortalRouter.post('/create-refer-friend',verifyCustomerToken, customerController.createReferFriend);


/*******************************
 * GET ALL PRODUCT PROBLEM BY PRODUCT ID
 * @method: POST
 * @url: /api/v1/frontend/customer-portal/get-product-problems/:product_id
 ********************************/
customerPortalRouter.post("/get-product-problems", verifyCustomerToken, productProblemController.getAllProductsProblems);

/*******************************
 * CREATE POLICY BY Customer FROM CUPO
 * @method: POST
 * @url: /api/v1/frontend/customer-portal/create-policy
 ********************************/
customerPortalRouter.post('/create-policy',  verifyCustomerToken, policyController.createPolicyByCustomerFromCUPO)

module.exports = customerPortalRouter;
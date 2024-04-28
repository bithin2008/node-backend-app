require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const moment = require("moment");
const systemAdministratorRouter = express.Router();
const verifySystemAdminToken = require("../../../common/verifySystemAdminToken");
const userController = require("../../../controllers/v1/admin/UserController")
const generatePagination = require('../../../middleware/pagination');
const systemAdminController = require("../../../controllers/v1/system_admin/systemAdminController");
const zipcodeValidators = require('../../../middleware/zipcodeValidators');

/*******************************
 * CREATE SYSTEM ADMIN
 * @method: POST
 * @url: /api/v1/admin/system-admin/login-system-admin
 ********************************/
systemAdministratorRouter.post("/create-system-admin", systemAdminController.createSystemAdministrator);

/*******************************
 * USER LOGIN
 * @method: POST
 * @url: /api/v1/admin/system-admin/login-system-admin
 ********************************/
systemAdministratorRouter.post("/login-system-admin", systemAdminController.systemAdminlogin);

/*******************************
 * VALIDATE SYSTEM ADMIN LOGIN OTP
 * @method: POST
 * @url: /api/v1/admin/system-admin/validate-login-otp
 ********************************/
systemAdministratorRouter.post('/validate-login-otp', systemAdminController.validateLoginOtp);

/*******************************
 * VALIDATE SYSTEM ADMIN LOGIN RESEND OTP
 * @method: POST
 * @url: /api/v1/admin/system-admin/resend-login-otp
 ********************************/
systemAdministratorRouter.post('/resend-login-otp', systemAdminController.resendLoginOtp);


/*******************************
 * GENERATE FORGOT PASSWORD LINK FOR SYSTEM ADMIN
 * @method: POST
 * @url: /api/v1/admin/system-admin/gen-forgot-pass-link
 ********************************/
systemAdministratorRouter.post('/gen-forgot-pass-link', systemAdminController.generateForgotPassLink)



/*******************************
 * GENERATE FORGOT PASSWORD LINK FOR SYSTEM ADMIN
 * @method: POST
 * @url: /api/v1/admin/system-admin/gen-forgot-pass-link
 ********************************/
systemAdministratorRouter.post('/update-password', systemAdminController.updatePassword)

/*******************************
 * GET ALL SYSTEM ADMIN
 * @method: POST
 * @url: /api/v1/admin/system-admin/get-all-system-admin
 ********************************/
systemAdministratorRouter.get('/get-all-system-admin', verifySystemAdminToken, generatePagination(), systemAdminController.getAllSystemAdmin)


/*******************************
 * VERIFY SYSTEM ADMIN
 * @method: POST
 * @url: /api/v1/admin/system-admin/verify-system-admin-token
 ********************************/
systemAdministratorRouter.post('/verify-system-admin-token', verifySystemAdminToken, systemAdminController.verifySystemAdminToken)

/*******************************
 * USER LOGOUT
 * @method: POST
 * @url: /api/v1/admin/system-admin/logout
 ********************************/
systemAdministratorRouter.post('/logout-system-admin', verifySystemAdminToken, systemAdminController.logOut)


/*******************************
 * CHANGE PROFILE PASSWORD
 * @method: POST
 * @url: /api/v1/admin/system-admin/change-profile-password
 ********************************/
systemAdministratorRouter.post('/change-profile-password',verifySystemAdminToken, systemAdminController.changePassword)


/*******************************
 * CREATE ORGANIZATION USER 
 * @method: POST
 * @url: /api/v1/admin/system-admin/create-org-user
 ********************************/
systemAdministratorRouter.post('/create-org-user', verifySystemAdminToken, zipcodeValidators, userController.createUser)

/*******************************
 * GET ORGANIZATION USER 
 * @method: GET
 * @url: /api/v1/admin/system-admin/get-all-org-users
 ********************************/
systemAdministratorRouter.get('/get-all-org-users', verifySystemAdminToken, generatePagination(), userController.getAllOrgUser)




module.exports = systemAdministratorRouter;

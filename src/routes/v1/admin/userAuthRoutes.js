"use strict";
const express = require("express");
const router = express.Router();
const UserAuthController = require("../../../controllers/v1/admin/userAuthController")
const authVerify = require("../../../common/verifyToken");

router.post('/login', UserAuthController.login)
router.post('/validate-login-otp', UserAuthController.validateLoginOtp)
router.post('/resend-login-otp', UserAuthController.resendLoginOtp)
router.post('/gen-forgot-pass-link', UserAuthController.generateForgotPassLink)
router.post('/update-password', UserAuthController.updatePassword)
router.post('/activate-user/:usertoken', UserAuthController.verifyUserSelfActivation)
router.post('/verify-token',authVerify, UserAuthController.verifyToken)
router.post('/change-profile-password',authVerify, UserAuthController.changePassword)



module.exports = router;

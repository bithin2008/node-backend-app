require("dotenv").config();
const express = require("express");
const router = express.Router();
const authVerify = require("../../../common/verifyToken");


const salesmanController = require("../../../controllers/v1/admin/salesmanController")


router.get("/salesman-details/:org_user_id", authVerify, salesmanController.getUserById);
module.exports = router;
require("dotenv").config();
const express = require("express");
const affiliatesRouter = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const config = require('../../../config/config');
const affiliatesController = require("../../../controllers/v1/admin/affiliatesController");

/*******************************
 * GET ALL AFFILIATES
 * @method: GET
 * @url: /api/v1/admin/affiliates/get-all-affiliates
 ********************************/
affiliatesRouter.post("/get-all-affiliates", verifyToken,generatePagination(), affiliatesController.getAllAffiliates);

module.exports = affiliatesRouter;
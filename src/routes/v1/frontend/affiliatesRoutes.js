require("dotenv").config();
const express = require("express");
const affiliatesRouter = express.Router();
const config = require('../../../config/config');
const affiliatesController = require("../../../controllers/v1/admin/affiliatesController");
/*******************************
 * POST AFFILIATE
 * @method: POST
 * @url: /api/v1/frontend/affiliates/submit-affiliate
 ********************************/
affiliatesRouter.post("/submit-affiliate", affiliatesController.submitAffiliate);

module.exports = affiliatesRouter;
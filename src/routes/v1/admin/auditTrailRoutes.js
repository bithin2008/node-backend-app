require("dotenv").config();
const express = require("express");
const auditTrailRouter = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const config = require('../../../config/config');
const auditTrailController = require("../../../controllers/v1/admin/auditTrailController");

/*******************************
 * GET ALL AFFILIATES
 * @method: GET
 * @url: /api/v1/admin/audit-trail/get-customer-audit
 ********************************/
auditTrailRouter.post("/get-customer-audit/:customer_id", verifyToken, generatePagination(), auditTrailController.getCustomerAudit);

module.exports = auditTrailRouter;
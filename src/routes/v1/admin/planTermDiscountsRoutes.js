require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const moment = require("moment");
const planTermDiscountsRouter = express.Router();
const config = require('../../../config/config');
const validation = require('../../../middleware/validators');
const verifyToken = require("../../../common/verifyToken");
const checkRole = require('../../../middleware/checkRole');
const generatePagination = require('../../../middleware/pagination');
const plansTermDiscountsController = require("../../../controllers/v1/admin/plansTermDiscountsController.js")

/*******************************
 * CREATE PLAN TERM DISCOUNT
 * @method: POST
 * @url: /api/v1/admin/plan-term-discounts/create-plan-term-discount
 ********************************/
planTermDiscountsRouter.post("/create-plan-term-discount", verifyToken, plansTermDiscountsController.createPlanTermDiscount);


/*******************************
 * 
 * GET ALL PLAN TERM DISCOUNT
 * @method: GET
 * @url: /api/v1/admin/plan-term-discounts/get-all-plan-terms
 ********************************/
planTermDiscountsRouter.post("/get-all-plan-term-discounts", verifyToken, generatePagination(), plansTermDiscountsController.getAllPlanTermDiscount);

/*******************************
 * UPDATE PLAN TERM DISCOUNT
 * @method: PUT
 * @url: /api/v1/admin/plan-term-discounts/update-plan
 ********************************/
planTermDiscountsRouter.put("/update-plan-term-discount/:planterm_discount_id", verifyToken, plansTermDiscountsController.updatePlanTermDiscount);


/*******************************
* DELETE PLAN TERM DISCOUNT
* @method: DELETE
* @url: /api/v1/admin/plan-term-discounts/delete-plan-term-discounts
********************************/
 planTermDiscountsRouter.delete("/delete-plan-term-discounts/:planterm_discount_id", verifyToken, plansTermDiscountsController.deletePlanTermDiscount);



/*******************************
 * PLAN TERM DISCOUNT ACTIVATION
 * @method: PUT
 * @url: /api/v1/admin/plan-term-discounts/toggle-plan-term-discount
 ********************************/
planTermDiscountsRouter.put("/toggle-plan-term-discount/:planterm_discount_id", verifyToken, plansTermDiscountsController.togglePlanTermDiscountStatus);




module.exports = planTermDiscountsRouter;

require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const moment = require("moment");
const plansRouter = express.Router();
const config = require('../../../config/config');
const validation = require('../../../middleware/validators');
const verifyToken = require("../../../common/verifyToken");
const checkRole = require('../../../middleware/checkRole');
const generatePagination = require('../../../middleware/pagination');
const plansController = require("../../../controllers/v1/admin/plansController")

/*******************************
 * CREATE PLAN
 * @method: POST
 * @url: /api/v1/admin/plans/create-plan
 ********************************/
plansRouter.post("/create-plan", verifyToken, plansController.createPlan);


/*******************************
 * 
 * GET ALL PLAN
 * @method: GET
 * @url: /api/v1/admin/plans/get-plans
 ********************************/
plansRouter.get("/get-all-plans", verifyToken, generatePagination(), plansController.getAllPlans);

/*******************************
 * UPDATE PLAN
 * @method: PUT
 * @url: /api/v1/admin/plans/update-plan
 ********************************/
plansRouter.put("/update-plan/:plan_id", verifyToken, plansController.updatePlan);


/*******************************
* DELETE MODULE
* @method: DELETE
* @url: /api/v1/admin/plans/delete-plan
********************************/
plansRouter.delete("/delete-plan/:plan_id", verifyToken, plansController.deletePlan);

/*******************************
 * USER ACTIVATION
 * @method: POST
 * @url: /api/v1/admin/user/toggle-plan-status
 ********************************/
plansRouter.put("/toggle-plan-status/:plan_id", verifyToken, plansController.togglePlanStatus);




module.exports = plansRouter;

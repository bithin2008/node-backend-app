require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const planTermsRouter = express.Router();
const planTermsController = require("../../../controllers/v1/admin/plansTermsController")

/*******************************
 * 
 * GET ALL PLAN TERMS
 * @method: GET
 * @url: /api/v1/frontend/plan-terms/get-all-plan-terms
 ********************************/
planTermsRouter.get("/get-all-plan-terms", planTermsController.getAllPlansTerm);

module.exports = planTermsRouter;
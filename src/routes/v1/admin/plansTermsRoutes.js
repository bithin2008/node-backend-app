require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const moment = require("moment");
const planTermsRouter = express.Router();
const config = require('../../../config/config');
const validation = require('../../../middleware/validators');
const verifyToken = require("../../../common/verifyToken");
const checkRole = require('../../../middleware/checkRole');
const generatePagination = require('../../../middleware/pagination');
const planTermsController = require("../../../controllers/v1/admin/plansTermsController")

/*******************************
 * CREATE PLAN TERM
 * @method: POST
 * @url: /api/v1/admin/plan-terms/create-plan
 ********************************/
planTermsRouter.post("/create-plan-terms", verifyToken, planTermsController.createPlanTerm);


/*******************************
 * 
 * GET ALL PLAN
 * @method: GET
 * @url: /api/v1/admin/plan-terms/get-all-plan-terms
 ********************************/
planTermsRouter.get("/get-all-plan-terms", verifyToken, generatePagination(), planTermsController.getAllPlansTerm);

planTermsRouter.get("/get-plan-terms", verifyToken, planTermsController.getPlansTerm);

/*******************************
 * UPDATE PLAN TERM
 * @method: PUT
 * @url: /api/v1/admin/plan-terms/update-plan
 ********************************/
planTermsRouter.put("/update-plan-terms/:plan_terms_id", verifyToken, planTermsController.updatePlansTerm);


/*******************************
* DELETE TERM
* @method: DELETE
* @url: /api/v1/admin/plan-terms/delete-plan
********************************/
 planTermsRouter.delete("/delete-plan-terms/:plan_terms_id", verifyToken, planTermsController.deletePlanTerm);



/*******************************
* GET ALL PROPERTY TYPE
* @method: GET
* @url: /api/v1/admin/plan-terms/get-property-type
********************************/
planTermsRouter.get("/get-property-type", verifyToken, planTermsController.getAllPropertyType);

/*******************************
 * USER ACTIVATION
 * @method: POST
 * @url: /api/v1/admin/plan-terms/toggle-user-activation
 ********************************/
//planTermsRouter.put("/toggle-plan-term-status/:plan_id", verifyToken, planTermsController.toggleplanTermstatus);




module.exports = planTermsRouter;

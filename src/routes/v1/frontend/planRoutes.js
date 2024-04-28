require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const planRouter = express.Router();
const config = require('../../../config/config');
const validation = require('../../../middleware/validators');
const authVerify = require("../../../common/verifyToken");
const checkZipCode =require('../../../middleware/zipcodeValidators')
const generatePagination = require('../../../middleware/pagination');
const plansController = require("../../../controllers/v1/admin/plansController")
const commonController = require("../../../controllers/v1/frontend/commonController")



/*******************************
 * GET ALL PROPERTY SIZE
 * @method: GET
 * @url: /api/v1/frontend/common/property-size
 ********************************/
//commonRouter.get("/property-size",commonController.getAllPropertySize);


/*******************************
 * GET ALL PROPERTY TYPE
 * @method: GET
 * @url: /api/v1/frontend/common/property-size
 ********************************/
//commonRouter.get("/property-type",commonController.getAllPropertyType);



/*******************************
 * 
 * GET ALL PLAN TERM
 * @method: GET
 * @url: /api/v1/frontend/common/get-plan-terms
 ********************************/
//commonRouter.get("/get-plan-terms", planTermsController.getAllPlanTerms);


/*******************************
 * 
 * GET ALL PLAN
 * @method: GET
 * @url: /api/v1/frontend/plans/get-plans
 ********************************/
planRouter.get("/get-plans", plansController.getAllPlansWithTermDetails);


/*******************************
 * GET ALL ADDON ITEMS
 * @method: GET
 * @url: /api/v1/frontend/common/get-addon-items
 ********************************/
planRouter.get("/get-addon-products",  commonController.getAllAddonProducts);



/*******************************
 * GET ALL ITEMS
 * @method: GET
 * @url: /api/v1/frontend/common/get-items
 ********************************/
//commonRouter.get("/get-items",  commonController.getAllItem);



module.exports = planRouter;

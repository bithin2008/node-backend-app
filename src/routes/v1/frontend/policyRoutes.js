require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const policyRouter = express.Router();
const config = require('../../../config/config');
const validation = require('../../../middleware/validators');
const authVerify = require("../../../common/verifyToken");
const checkZipCode =require('../../../middleware/zipcodeValidators')
const generatePagination = require('../../../middleware/pagination');
 const frontendCommonController = require("../../../controllers/v1/frontend/commonController")
// const planTermsController = require("../../../controllers/v1/admin/planTermsController")
//const plansController = require("../../../controllers/v1/admin/plansController")
const policyController = require("../../../controllers/v1/admin/policyController")

/*******************************
 * CREATE POLICY BY Customer
 * @method: POST
 * @url: /api/v1/frontend/policies/create-policy
 ********************************/
policyRouter.post('/create-policy', policyController.createPolicyByCustomer)



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
 * @url: /api/v1/frontend/common/get-plans
 ********************************/
//commonRouter.get("/get-plans", plansController.getAllPlansWithTermDetails);


/*******************************
 * GET ALL ADDON ITEMS
 * @method: GET
 * @url: /api/v1/frontend/common/get-addon-items
 ********************************/
//commonRouter.get("/get-addon-products",  frontendCommonController.getAllAddonProducts);



/*******************************
 * GET ALL ITEMS
 * @method: GET
 * @url: /api/v1/frontend/common/get-items
 ********************************/
//commonRouter.get("/get-items",  commonController.getAllItem);



module.exports = policyRouter;

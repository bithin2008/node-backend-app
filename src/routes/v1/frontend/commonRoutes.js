require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const commonRouter = express.Router();
const config = require('../../../config/config');
const validation = require('../../../middleware/validators');
const authVerify = require("../../../common/verifyToken");
const checkZipCode =require('../../../middleware/zipcodeValidators')
const generatePagination = require('../../../middleware/pagination');
 const frontendCommonController = require("../../../controllers/v1/frontend/commonController")
// const planTermsController = require("../../../controllers/v1/admin/planTermsController")
const plansController = require("../../../controllers/v1/admin/plansController")
const pageSeoController = require("../../../controllers/v1/admin/pageSeoController")
const commonController = require("../../../controllers/v1/admin/commonController");
const customerReviewsController = require("../../../controllers/v1/admin/customerReviewsController");


/*******************************
 * GET ALL ZIP CODE
 * @method: GET
 * @url: /api/v1/frontend/common/property-size
 ********************************/
commonRouter.post('/search-zipcode', commonController.searchZipCode)


/*******************************
 * GET LOCATION BY ZIP CODE
 * @method: GET
 * @url: /api/v1/frontend/common/property-size
 ********************************/
commonRouter.post('/location-by-zip', checkZipCode, commonController.locationByZip)


/*******************************
 * GET ALL POSTS
 * @method: GET
 * @url: /api/v1/frontend/common/get-all-posts
 ********************************/
commonRouter.get("/get-all-posts",  generatePagination(), frontendCommonController.getAllPosts);


/*******************************
 * GET ALL POSTS
 * @method: GET
 * @url: /api/v1/frontend/common/get-post-by-slug/:slug
 ********************************/
commonRouter.get("/get-post-by-slug/:slug",   frontendCommonController.getPostBySlug);


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
commonRouter.get("/property-type",frontendCommonController.getAllPropertyType);


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
commonRouter.get("/get-plans", plansController.getAllPlansWithTermDetails);


/*******************************
 * GET ALL ADDON ITEMS
 * @method: GET
 * @url: /api/v1/frontend/common/get-addon-items
 ********************************/
commonRouter.get("/get-addon-products",  frontendCommonController.getAllAddonProducts);

/*******************************
 * GET PAGE SEO BY ROUTE NAME
 * @method: POST
 * @url: /api/v1/frontend/get-page-seo-by-route-name
 ********************************/
commonRouter.post('/get-page-seo-by-route-name',  pageSeoController.getPageSeoByRouteName);

/*******************************
 * GET ALL ITEMS
 * @method: GET
 * @url: /api/v1/frontend/common/get-all-products
 ********************************/
commonRouter.get("/get-all-products",  frontendCommonController.getAllProducts);


/*******************************
 * 
 * GET ALL CUSTOMER REVIEWS
 * @method: GET
 * @url: /api/v1/frontend/common/get-all-reviews
 ********************************/
commonRouter.post("/get-all-reviews", customerReviewsController.getAllReviewsForWebsite);


/*******************************
 * GET ALL MARKET LEADERS
 * @method: GET
 * @url: /api/v1/frontend/common/get-all-market-leaders
 ********************************/
commonRouter.get("/get-all-market-leaders", frontendCommonController.getAllMarketLeaders);



/*******************************
 * GET ALL MARKET LEADERS
 * @method: GET
 * @url: /api/v1/frontend/common/get-page-details
 ********************************/
commonRouter.get("/get-page-details", frontendCommonController.getPageDetails);


/*******************************
 * VERIFY RECAPTCHA
 * @method: post
 * @url: /api/v1/frontend/common/verify-recaptcha
 ********************************/
commonRouter.post("/verify-recaptcha", frontendCommonController.recaptchaVerification);



module.exports = commonRouter;

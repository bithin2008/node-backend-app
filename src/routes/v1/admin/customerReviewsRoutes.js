require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const moment = require("moment");
const customerReviewRouter = express.Router();
const config = require('../../../config/config');
const validation = require('../../../middleware/validators');
const verifyToken = require("../../../common/verifyToken");
const checkRole = require('../../../middleware/checkRole');
const generatePagination = require('../../../middleware/pagination');
const customerReviewsController = require("../../../controllers/v1/admin/customerReviewsController")

/*******************************
 * CREATE PLAN
 * @method: POST
 * @url: /api/v1/admin/customer-reviews/create-review
 ********************************/
customerReviewRouter.post("/create-review", verifyToken, customerReviewsController.createReview);


/*******************************
 * 
 * GET ALL CUSTOMER REVIEWS
 * @method: GET
 * @url: /api/v1/admin/customer-reviews/get-all-reviews
 ********************************/
customerReviewRouter.post("/get-all-reviews", verifyToken, generatePagination(), customerReviewsController.getAllReviews);


/*******************************
 * UPDATE CUSTOMER REVIEW
 * @method: PUT
 * @url: /api/v1/admin/customer-reviews/update-review
 ********************************/
customerReviewRouter.put("/update-review/:customer_review_id", verifyToken, customerReviewsController.updateReview);


/*******************************
* DELETE CUSTOMER REVIEW
* @method: DELETE
* @url: /api/v1/admin/customer-reviews/delete-review
********************************/
customerReviewRouter.delete("/delete-review/:customer_review_id", verifyToken, customerReviewsController.deleteReview);


module.exports = customerReviewRouter;
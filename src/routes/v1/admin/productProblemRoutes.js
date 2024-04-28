require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const productsProblemController = require("../../../controllers/v1/admin/productProblemController")


/*******************************
 * CREATE PRODUCT PROBLEM
 * @method: POST
 * @url: /api/v1/admin/products/create-product-problem
 ********************************/
router.post("/create-product-problem", verifyToken, productsProblemController.createProductProblem)



/*******************************
 * GET ALL PRODUCTS PROBLEM
 * @method: GET
 * @url: /api/v1/admin/products/get-all-products-problem
 ********************************/
router.get("/get-all-products-problem", verifyToken, generatePagination(), productsProblemController.getAllProductsProblems);

module.exports = router;
require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const productsBrandController = require("../../../controllers/v1/admin/productBrandController")


/*******************************
 * CREATE PRODUCT BRAND
 * @method: POST
 * @url: /api/v1/admin/brands/create-product-brand
 ********************************/
router.post("/create-product-brand", verifyToken, productsBrandController.createAndUpdateBrand)

/*******************************
 * UPDATE PRODUCT BRAND STATUS
 * @method: POST
 * @url: /api/v1/admin/brands/update-product-brand-status
 ********************************/
router.post("/update-product-brand-status", verifyToken, productsBrandController.updateProductBrandStatus)



/*******************************
 * GET ALL PRODUCTS BRAND
 * @method: GET
 * @url: /api/v1/admin/brands/get-all-products-brands
 ********************************/
router.get("/get-product-brands", verifyToken, generatePagination(), productsBrandController.getBrands);


/*******************************
* DELETE PRODUCTS BRAND
* @method: DELETE
* @url: /api/v1/admin/brands/delete-brand
********************************/
router.delete("/delete-brand/:product_brand_id", verifyToken, productsBrandController.deleteBrand);

module.exports = router;
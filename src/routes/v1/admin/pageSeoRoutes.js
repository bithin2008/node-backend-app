const express = require('express');
const router = express.Router();
const verifyToken = require('../../../common/verifyToken'); // Import your authentication middleware
const pageSeoController = require("../../../controllers/v1/admin/pageSeoController"); // Import your pageSeo controller
const generatePagination = require('../../../middleware/pagination');
const bcrypt = require("bcryptjs");

/*******************************
 * CREATE PAGE SEO
 * @method: POST
 * @url: /api/v1/admin/page-seo/create
 ********************************/
router.post("/create-page-seo", verifyToken, pageSeoController.createPageSeo);

/*******************************
 * GET ALL PAGE SEO
 * @method: GET
 * @url: /api/v1/admin/page-seo/get-all
 ********************************/
router.post('/get-all-page-seo', verifyToken, generatePagination(), pageSeoController.getAllPageSeo);



/*******************************
 * UPDATE PAGE SEO
 * @method: PUT
 * @url: /api/v1/admin/page-seo/update-page-seo/:page_seo_id
 ********************************/
router.put("/update-page-seo/:page_seo_id", verifyToken, pageSeoController.updatePageSeo);

/*******************************
 * DELETE PAGE SEO
 * @method: DELETE
 * @url: /api/v1/admin/page-seo/delete-page-seo/:page_seo_id
 ********************************/
router.delete("/delete-page-seo/:page_seo_id", verifyToken, pageSeoController.deletePageSeo);

// Add more routes as needed for your pageSeo model
/*******************************
 * TOGGLE POST STATUS
 * @method: POST
 * @url: /api/v1/admin/blogs/toggle-post-status
 ********************************/
router.put("/toggle-seo-status/:page_seo_id", verifyToken, pageSeoController.toggleActiveStatus);

module.exports = router;
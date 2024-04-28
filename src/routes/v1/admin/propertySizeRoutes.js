require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const propertySizeController = require("../../../controllers/v1/admin/propertySizeController")


/*******************************
 * CREATE PROPERTY SIZE
 * @method: POST
 * @url: /api/v1/admin/property-size/save
 ********************************/
router.post("/save", verifyToken, propertySizeController.savePropertySize)

/*******************************
 * UPDATE PAYMENT STATUS
 * @method: POST
 * @url: /api/v1/admin/property-size/update
 ********************************/
router.post("/update", verifyToken, propertySizeController.updateActiveStatus)

/*******************************
 * GET ALL PROPERTY SIZE
 * @method: GET
 * @url: /api/v1/admin/property-size/list
 ********************************/
router.get("/list", verifyToken, generatePagination(), propertySizeController.getPropertySizeList);


/*******************************
* DELETE PROPERTY SIZE
* @method: DELETE
* @url: /api/v1/admin/property-size/delete
********************************/
router.delete("/delete/:property_size_id", verifyToken, propertySizeController.deletePropertySize);

module.exports = router;
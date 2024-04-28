require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const propertyTypesController = require("../../../controllers/v1/admin/propertyTypesController")


/*******************************
 * CREATE PROPERTY TYPE
 * @method: POST
 * @url: /api/v1/admin/property/create-property-type
 ********************************/
router.post("/create-property-type", verifyToken, propertyTypesController.createAndUpdate)

/*******************************
 * UPDATE PROPERTY TYPE STATUS
 * @method: POST
 * @url: /api/v1/admin/property/update-property-type-status
 ********************************/
router.post("/update-property-type-status", verifyToken, propertyTypesController.updatePropertyTypeStatus)



/*******************************
 * GET ALL PROPERTY TYPE
 * @method: GET
 * @url: /api/v1/admin/property/get-property-types
 ********************************/
router.get("/get-property-types", verifyToken, generatePagination(), propertyTypesController.getPropertyTypes);


/*******************************
* DELETE PROPERTY TYPE
* @method: DELETE
* @url: /api/v1/admin/property/delete-property-type
********************************/
router.delete("/delete-property-type/:property_type_id", verifyToken, propertyTypesController.deletePropertyType);

module.exports = router;
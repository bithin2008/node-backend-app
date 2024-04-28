require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const config = require('../../../config/config');
const realestateProfessionalsController = require("../../../controllers/v1/admin/realestateProfessionalsController");



/*******************************
 * GET ALL REAL ESTATE PROFESSIONALS
 * @method: GET
 * @url: /api/v1/admin/real-estate-professionals/get-all-realestateProfessionals
 ********************************/
router.post("/get-all-realestateProfessionals", verifyToken,generatePagination(), realestateProfessionalsController.getAllRealestateProfessionals);
router.post('/get-realtor-details/:realtor_id', verifyToken, realestateProfessionalsController.getRealStateProfessonalDetailsAdmin)


/*******************************
 * TOGGLE POST STATUS
 * @method: POST
 * @url: /api/v1/admin/blogs/toggle-post-status
 ********************************/
router.put("/toggle-realtor-status/:realestate_professional_id", verifyToken, realestateProfessionalsController.toggleRealtorStatus);

module.exports = router;
require("dotenv").config();
const express = require("express");
const router = express.Router();
const authVerify = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');

const termsController = require('../../../controllers/v1/admin/termsController');

/*******************************
 * CREATE TERM
 * @method: POST
 * @url: /api/v1/admin/master/create-term
 ********************************/
router.post("/create-term", authVerify, termsController.createTerm);


/*******************************
* UPDATE TERM 
* @method: PUT
* @url: /api/v1/admin/master/update-term/:term_master_id
********************************/
router.put("/update-term/:term_master_id", authVerify,  termsController.updateTerm);


/*******************************
 * GET ALL TERM
 * @method: GET
 * @url: /api/v1/admin/master/get-all-terms  
 ********************************/
router.get("/get-all-terms", authVerify, generatePagination(), termsController.getAllTerms);


/*******************************
 * GET TERM BY ID
 * @method: GET
 * @url: /api/v1/admin/master/term-details/:term_master_id
 ********************************/
router.get("/term-details/:term_master_id", authVerify, termsController.getTermById);


/*******************************
* DELETE TERM
* @method: DELETE
* @url: /api/v1/admin/master/delete-term/:term_master_id
********************************/
router.delete("/delete-term/:term_master_id", authVerify, termsController.deleteTerm);

/*******************************
 * TOGGLE USER ACTIVE STATUS
 * @method: PUT
 * @url: /api/v1/admin/master/toggle-term-status/:term_master_id
 ********************************/
router.put("/toggle-term-status/:term_master_id", authVerify, termsController.toggleTermStatus);

module.exports = router;
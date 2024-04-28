require("dotenv").config();
const express = require("express");
const careerRouter = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const config = require('../../../config/config');
const careersController = require("../../../controllers/v1/admin/careersController");

/*******************************
 * GET ALL CAREER
 * @method: GET
 * @url: /api/v1/admin/careers/get-all-career
 ********************************/
careerRouter.post("/get-all-career", verifyToken,generatePagination(), careersController.getAllCareer);

module.exports = careerRouter;
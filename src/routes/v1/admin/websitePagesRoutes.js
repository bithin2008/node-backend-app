require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const websitePagesRouter = express.Router();
const verifyToken = require("../../../common/verifyToken");
const websitePagesController = require("../../../controllers/v1/admin/websitePagesController");
/*******************************
 * GET ALL POSTS
 * @method: GET
 * @url: /api/v1/admin/website-pages/get-all-pages
 ********************************/
websitePagesRouter.get("/get-all-pages", verifyToken, websitePagesController.getAllWebsitePages);


module.exports = websitePagesRouter;
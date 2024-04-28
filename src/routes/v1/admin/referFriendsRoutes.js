const express = require("express");
const referFriendsRoutes = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const referFriendsController = require("../../../controllers/v1/admin/referFriendsController")


/*******************************
 * GET ALL FERER FRIENDS
 * @method: POST
 * @url: /api/v1/admin/refer-friends/get-refer-friends
 ********************************/
referFriendsRoutes.post("/get-refer-friends", verifyToken, generatePagination(), referFriendsController.getAllReferfriends);

module.exports = referFriendsRoutes;
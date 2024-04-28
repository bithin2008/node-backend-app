require("dotenv").config();
const express = require("express");
const contactsRouter = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const config = require('../../../config/config');
const contactsController = require("../../../controllers/v1/admin/contactsController");

/*******************************
 * GET ALL CONTACTS
 * @method: GET
 * @url: /api/v1/admin/contacts/get-all-contacts
 ********************************/
contactsRouter.post("/get-all-contacts", verifyToken,generatePagination(), contactsController.getAllContacts);

module.exports = contactsRouter;
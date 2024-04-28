require("dotenv").config();
const express = require("express");
const contactsRouter = express.Router();
const config = require('../../../config/config');
const contactsController = require("../../../controllers/v1/admin/contactsController")
const multerUpload = require("../../../middleware/multerUpload");
/*******************************
 * POST CONTACTS
 * @method: POST
 * @url: /api/v1/frontend/contacts/submit-contact
 ********************************/
contactsRouter.post("/submit-contact", contactsController.submitContact);

module.exports = contactsRouter;
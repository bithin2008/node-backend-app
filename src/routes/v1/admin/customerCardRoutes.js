require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../../../common/verifyToken");
const customerCardsController = require("../../../controllers/v1/admin/customerCardsController");

/*******************************
 * GET ALL CUSTOMER CARDS
 * @method: GET
 * @url: /api/v1/admin/customer-card/get-all-cards/:customer_id
 ********************************/
router.post("/get-all-cards/:customer_id", verifyToken, customerCardsController.getAllCards);

/*******************************
 * UPDATE CUSTOMER PRIMARY CARD
 * @method: GET
 * @url: /api/v1/admin/customer-card/update-primary-card/:customer_card_id
 ********************************/
router.post("/update-primary-card/:customer_card_id", verifyToken, customerCardsController.updatePrimaryCard);

/*******************************
 * CREATE NEW CARD
 * @method: POST
 * @url: /api/v1/admin/customer-card/create-card/:customer_id
 ********************************/
router.post("/create-card/:customer_id", verifyToken,customerCardsController.createCard);

/*******************************
 * UPDATE CARD INACTIVE
 * @method: POST
 * @url: /api/v1/admin/customer-card/create-card/:customer_id
 ********************************/
router.post("/update-card-inactive-status/:customer_card_id", verifyToken,customerCardsController.updateCardInActiveStatus);

/*******************************
 * DELETE CUSTOMER CARD 
 * @method: POST
 * @url: /api/v1/admin/customer-card/delete-card/:customer_card_id
 ********************************/
router.post("/delete-card/:customer_card_id", verifyToken,customerCardsController.deleteCustomerCard);



module.exports = router;
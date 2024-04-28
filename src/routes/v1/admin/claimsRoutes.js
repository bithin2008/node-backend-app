require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const config = require('../../../config/config');
const claimsController = require("../../../controllers/v1/admin/claimsController");

/*******************************
 * CREATE CLAIM
 * @method: POST
 * @url: /api/v1/admin/claims/create-claim
 ********************************/
router.post("/create-claim", verifyToken, claimsController.createClaimByUser);



/*******************************
 * GET ALL CLAIM TICKET STATUSES
 * @method: GET
 * @url: /api/v1/admin/claims/get-claim-ticket-status
 ********************************/
router.get("/get-all-claim-ticket-status", verifyToken, claimsController.getAllClaimTicketStatus);





/*******************************
 * GET ALL CLAIMS
 * @method: POST
 * @url:  /api/v1/admin/claims/get-all-claims
 ********************************/
router.post("/get-all-claims/:key?", verifyToken,generatePagination(),modifyCustomerResponse, claimsController.getAllClaims);
function modifyCustomerResponse (req, res, next) {
    // Capture the response sent by customerController.getAllCustomers
    const originalSend = res.send;
    res.send = async function (body) {
      // Check if req.params.key is "export_excel"
      if (req.params.key === "export_excel" || req.params.key === "export_csv") {
       await claimsController.exportGetAllClaims(req, res,next, body.data,);
        return;
      } else {
        // If req.params.key is not "export_excel", proceed with the original response
        originalSend.call(res, body);
      }
    };
    // Proceed to the next middleware or route handler
    next();
  }

/*******************************
 * PUT CLAIM DETAILS
 * @method: put
 * @url:  /api/v1/admin/claims/update-claim
 ********************************/
router.put("/update-claim/:claim_id", verifyToken, claimsController.updateClaim);


/*******************************
 * GET CLAIM DETAILS
 * @method: get
 * @url:  /api/v1/admin/claims/get-claim-details
 ********************************/
router.get("/get-claim-details/:claim_id", verifyToken, claimsController.getClaimDetails);

module.exports = router;
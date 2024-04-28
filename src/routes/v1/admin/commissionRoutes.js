require("dotenv").config();
const express = require("express");
const commissionsRouter = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const commissionsController = require("../../../controllers/v1/admin/commissionsController")

/*******************************
 * CREATE COMMISSIoN TYPE
 * @method: POST
 * @url: /api/v1/admin/commissions/create-commission-type
 ********************************/
commissionsRouter.post("/create-commission-type", verifyToken, commissionsController.createcommissionType);


/*******************************
 * 
 * GET ALL COMMISSIoN TYPES
 * @method: GET
 * @url: /api/v1/admin/commissions/get-all-commission-types
 ********************************/
commissionsRouter.get("/get-all-commission-types", verifyToken, generatePagination(), commissionsController.getAllcommissionTypes);

// /*******************************
//  * UPDATE COMMISSIoN TYPES
//  * @method: PUT
//  * @url: /api/v1/admin/commissions/update-commission-type
//  ********************************/
 commissionsRouter.put("/update-commission-type/:commission_type_id", verifyToken, commissionsController.updatecommissionType);


/*******************************
* DELETE COMMISSION TYPE
* @method: DELETE
* @url: /api/v1/admin/commissions/delete-commission-type
********************************/
commissionsRouter.delete("/delete-commission-type/:commission_type_id", verifyToken, commissionsController.deletecommissionType);

/*******************************
 * USER ACTIVATION
 * @method: POST
 * @url: /api/v1/admin/commissions/toggle-policy-wise-commission-status
 ********************************/
commissionsRouter.put("/toggle-policy-wise-commission-status/:policy_wise_commission_id", verifyToken, commissionsController.togglePolicyWisecommissionStatus);

/*******************************
 * USER ACTIVATION
 * @method: POST
 * @url: /api/v1/admin/commissions/toggle-commission-type-status
 ********************************/
commissionsRouter.put("/toggle-commission-type-status/:commission_type_id", verifyToken, commissionsController.togglecommissionTypeStatus);

/*******************************
 * GET RELAVENT COMMISSIONS
 * @method: POST
 * @url: /api/v1/admin/commissions/get-relavent-commission
 ********************************/
commissionsRouter.post("/get-relavent-commission", verifyToken, commissionsController.getRelaventCommission);


/*******************************
 * GET ALL SALES COMMISSION
 * @method: POST
 * @url: /api/v1/admin/commissions/get-all-sales-commission
 ********************************/
commissionsRouter.post("/get-all-sales-commission", verifyToken, generatePagination(), commissionsController.getAllSalesCommission);


/*******************************
 * USER ACTIVATION
 * @method: POST
 * @url: /api/v1/admin/commissions/toggle-commission-type-status
 ********************************/
commissionsRouter.put("/update-sales-commission/:policy_wise_commission_id", verifyToken, commissionsController.updateCommissionValue);


module.exports = commissionsRouter;

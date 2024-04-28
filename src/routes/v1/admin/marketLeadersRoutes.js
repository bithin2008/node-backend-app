require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const moment = require("moment");
const marketleadersRouter = express.Router();
const config = require('../../../config/config');
const checkPermisiion = require('../../../middleware/checkPermisiion');
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const multerUpload = require("../../../middleware/multerUpload");

const marketLeadersController = require("../../../controllers/v1/admin/marketLeadersController")

/*******************************
 * CREATE MARKET LEADERS
 * @method: POST
 * @url: /api/v1/admin/market-leaders/create-market-leader
 ********************************/
marketleadersRouter.post("/create-market-leader", verifyToken, marketLeadersController.createMarketLeaders);




   /*******************************
 * UPLOAD BLOG IMAGE
 * @method: POST
 * @url: /api/v1/admin/market-leaders/upload-market-leader-image/:market_leader_id
 ********************************/ 
 marketleadersRouter.post(
    "/upload-market-leader-image/:market_leader_id",verifyToken, (req, res, next) => {      
        const{market_leader_id}  =  req.params;
        if (market_leader_id) {
            multerUpload.setMulterUploadValidation(['image/png','image/jpg','image/png'], 2 * 1024 * 1024, `./public/org_files/hws_${req.tokenData.org_id}/media_content/market-leaders`)(req, res, next); 
        } else {
          throw new CustomError( 'Bad request.',400)
        }
      },
    multerUpload.multerUploadSingleFile.single('image'), marketLeadersController.uploadImage
  );


/*******************************
 * EDIT POST
 * @method: PUT
 * @url: /api/v1/admin/market-leaders/update-market-leader/:market_leader_id
 ********************************/
marketleadersRouter.put("/update-market-leader/:market_leader_id", verifyToken, marketLeadersController.updateMarketLeaders);


/*******************************
 * GET ALL MARKET LEADERS
 * @method: GET
 * @url: /api/v1/admin/market-leaders/get-all-market-leaders
 ********************************/
marketleadersRouter.get("/get-all-market-leaders", verifyToken, generatePagination(), marketLeadersController.getAllMarketLeaders);




/*******************************
 * DELETE BLOG IMAGE
 * @method: POST
 * @url: /api/v1/admin/market-leaders/delete-existing-image
 ********************************/
marketleadersRouter.post("/delete-existing-image/:market_leader_id", verifyToken, marketLeadersController.deleteExistingImage);

/*******************************
 * TOGGLE POST STATUS
 * @method: POST
 * @url: /api/v1/admin/market-leaders/toggle-post-status
 ********************************/
marketleadersRouter.put("/toggle-market-leader-status/:market_leader_id", verifyToken, marketLeadersController.toggleMarketLeadersStatus);

/*******************************
* DELETE POST
* @method: DELETE
* @url: /api/v1/admin/market-leaders/delete-market-leader
********************************/
marketleadersRouter.delete("/delete-market-leader/:market_leader_id", verifyToken, marketLeadersController.deleteMarketLeaders);

module.exports = marketleadersRouter;

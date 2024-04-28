require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const productsRouter = express.Router();
const fs = require('fs');
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const productsController = require("../../../controllers/v1/admin/productsController")
const multerUpload = require("../../../middleware/multerUpload");
const createFolder = require("../../../middleware/createFolder")
const path = require("path");
const url = require('url');

/*******************************
 * CREATE PRODUCT
 * @method: POST
 * @url: /api/v1/admin/products/create-product
 ********************************/
productsRouter.post("/create-product", verifyToken, productsController.createProduct);


/*******************************
 * EDIT PRODUCT
 * @method: PUT
 * @url: /api/v1/admin/system-admin-sub-modules/update-submodule/:sub_module_id
 ********************************/
productsRouter.put("/update-product/:product_id", verifyToken, productsController.updateProduct);



   /*******************************
 * UPLOAD BLOG IMAGE
 * @method: POST
 * @url: /api/v1/admin/products/upload-product-image/:product_id
 ********************************/ 
   productsRouter.post(
    "/upload-product-image/:product_id",verifyToken, async (req, res, next) => {      
        const{product_id}  =  req.params;
        if (product_id) {
          const folderPath = `./public/org_files/hws_${req.tokenData.org_id}/media_content/products`;
          if (!fs.existsSync(folderPath)) {
            const folderPath = `./src/public/org_files/hws_${req.tokenData.org_id}/media_content/products`; // Replace this with your folder path template
            let folderRes = await createFolder(folderPath);
        }
          multerUpload.setMulterUploadValidation(['image/png','image/jpg','image/png','image/webp'], 2 * 1024 * 1024, `./public/org_files/hws_${req.tokenData.org_id}/media_content/products`)(req, res, next); 
        } else {
          throw new CustomError( 'Bad request.',400)
        }
      },
    multerUpload.multerUploadSingleFile.single('productImage'), productsController.uploadProductImage
  );


  /*******************************
 * DELETE BLOG IMAGE
 * @method: POST
 * @url: /api/v1/admin/products/delete-existing-image
 ********************************/
  productsRouter.post("/delete-existing-image/:product_id", verifyToken, productsController.deleteExistingImage);


/*******************************
 * GET ALL PRODUCTS
 * @method: GET
 * @url: /api/v1/admin/products/get-all-products
 ********************************/
productsRouter.get("/get-all-products", verifyToken, generatePagination(), productsController.getAllProducts);


/*******************************
 * TOGGLE ORG USER ROLE STATUS
 * @method: POST
 * @url: /api/v1/admin/org-user-roles/toggle-org-user-roles-status
 ********************************/
productsRouter.put("/toggle-product-status/:product_id", verifyToken, productsController.toggleProductStatus);

/*******************************
* DELETE MODULE
* @method: DELETE
* @url: /api/v1/admin/org-user-roles/delete-org-user-role
********************************/
productsRouter.delete("/delete-product/:product_id", verifyToken, productsController.deleteProduct);

module.exports = productsRouter;

const express = require("express");
const router = express.Router();
const customerController = require("../../../controllers/v1/admin/customerController");
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const helper = require('../../../common/helper');
const multerUpload = require("../../../middleware/multerUpload");
const CustomError = require("../../../utils/customErrorHandler");
/*******************************
* GET ALL  CUSTOMERS
* @method: POST    
* @url: /api/v1/admin/customers/get-all-customers
********************************/
router.post("/get-all-customers/:key?", verifyToken, generatePagination(), modifyCustomerResponse, customerController.getAllCustomers,);

function modifyCustomerResponse(req, res, next) {
  // Capture the response sent by customerController.getAllCustomers
  const originalSend = res.send;
  res.send = async function (body) {
    // Check if req.params.key is "export_excel"
    if (req.params.key === "export_excel" || req.params.key === "export_csv") {
      await customerController.exportGetAllCustomer(req, res, next, body.data);
      return;
    } else {
      // If req.params.key is not "export_excel", proceed with the original response
      originalSend.call(res, body);
    }
  };

  // Proceed to the next middleware or route handler
  next();
}

// module.exports = modifyCustomerResponse;



/*******************************
* GET  CUSTOMER Details by ID
* @method: POST    
* @url: /api/v1/admin/customers/customer-details/:param  /// customer_id / email
********************************/
router.post("/customer-details/:param", verifyToken, customerController.getCustomerDetails);

/*******************************/

/*******************************
* GET ALL  CUSTOMERS
* @method: POST    
* @url: api/v1/admin/customers/update-customer/:customer_id
********************************/
router.put("/update-customer/:customer_id", verifyToken, customerController.updateCustomer);

/*******************************/

/*******************************
* update  customer   active status
* @method: POST    
* @url: api/v1/admin/customers/update-customer/:customer_id
********************************/
router.put("/toggle-customer-status/:customer_id", verifyToken, customerController.updateCustomerActiveStatus);


/*******************************
* update  customer   active status
* @method: POST    
* @url: api/v1/admin/customers/resened-welcome-mail/:customer_id
********************************/
router.post("/resened-welcome-mail/:customer_id", verifyToken, customerController.generateCustomerWelcomeMail);

/*******************************/
/*******************************
 * CREATE POLICY DOCUMENT
 * @method: POST
 * @url: /api/v1/admin/customers/create-customer-policy-document/:customer_id
 ********************************/
router.post(
  "/create-customer-policy-document/:customer_id", verifyToken, async (req, res, next) => {
    const { customer_id } = req.params;
    if (customer_id) {
      let path = `./public/org_files/hws_${req.tokenData.org_id}/customers/policy_docs`
      try {
        const result = await helper.createfolderIfNotExist(path);
        if (result) {
          multerUpload.setMulterUploadValidation(['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf'],
            2 * 1024 * 1024, path)(req, res, next);
        }
      } catch (error) {
        throw new CustomError('Failed to save the document.', 400);
      }
    } else {
      throw new CustomError('Bad request.', 400);
    }
  }, multerUpload.multerUploadSingleFile.single('policy_doc'), customerController.createCustomerPolicyDocument);


/*******************************
* CREATE POLICY NOTE
* @method: POST
* @url: /api/v1/admin/customers/create-policy-note/:customer_id
********************************/
router.post('/create-customer-policy-note/:customer_id', verifyToken, customerController.createCustomerPolicyNotes)
/*******************************
/*******************************
* GET POLICY NOTE
* @method: POST
* @url: /api/v1/admin/policy/get-all-policy-notes
********************************/
router.post('/get-customer-policy-notes/:customer_id', verifyToken, customerController.getCustomerPolicyNotes)

/*******************************
* GET ALL  polcy documents
* @method: POST    
* @url: api/v1/admin/customers/get-customer-policy-documents/:customer_id
********************************/
router.post("/get-customer-policy-documents/:customer_id", verifyToken, customerController.getCustomerPolicyDocuments);

module.exports = router;


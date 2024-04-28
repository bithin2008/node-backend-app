const express = require("express");
const router = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const getAllPolicyStatus = require('../../../middleware/policyStatus');
const policyController = require("../../../controllers/v1/admin/policyController")
const helper = require('../../../common/helper');
const policyService = require("../../../services/v1/admin/policyService");
const policyDocLogService = require("../../../services/v1/admin/policyDocLogService");
const db = require('../../../models/index');
const mailService = require("../../../services/v1/admin/mailService");
const mailConfig = require("../../../config/mailConfig");

/*******************************
 * GET ALL POLICY
 * @method: POST
 * @url: /api/v1/admin/policy/get-all-policy
 ********************************/
router.post("/get-all-policy/:key?", verifyToken, getAllPolicyStatus(), generatePagination(), modifyCustomerResponse, policyController.getAllpolicy);


router.post("/mark-policy-anamaly", verifyToken, policyController.MarkPolicyAsAnamaly);



/*******************************
 * GET ALL RENEWAL POLICY
 * @method: POST
 * @url: /api/v1/admin/policy/get-all-renewal-policy
 ********************************/
router.post("/get-all-renewal-policy/:param/:key?", verifyToken,  getAllPolicyStatus(), generatePagination(), modifyCustomerResponse, policyController.getAllpolicy);

function modifyCustomerResponse(req, res, next) {
  // Capture the response sent by customerController.getAllCustomers
  const originalSend = res.send;
  res.send = async function (body) {
    // Check if req.params.key is "export_excel"
    if (req.params.key === "export_excel" || req.params.key === "export_csv") {
      await policyController.exportGetAllPolicy(req, res, next, body.data,);
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
 * SENT  PAYMENT  LINK
 * @method: POST
 * @url: /api/v1/admin/policy/create-policy
 ********************************/
// router.post('/create-policy', verifyToken, modifyCreatePolicyByUser, policyController.createPolicyByUser)


/*******************************
 * CREATE POLICY BY USER
 * @method: POST
 * @url: /api/v1/admin/policy/create-policy
 ********************************/
router.post('/create-policy', verifyToken, modifyCreatePolicyByUser, policyController.createPolicyByUser)

function modifyCreatePolicyByUser(req, res, next) {
  /* Capture the response sent by policyController.createPolicyByUser */
  const originalSend = res.send;
  try {
    res.send = function (body) {
      /* For escrow Payment => payment invoice and attachment generate and send mail */
      if (body.createdPolicy && body.createdPolicy.policy_status == 4) {
        (async () => {
          createdPolicy = body.createdPolicy;
          let genEscrowPdfRes = await policyService.generateEscrowAttachment(createdPolicy.org_id, createdPolicy.policy_id);
          let generateEscrowInvoiceData = await policyService.generateEscrowInvoiceData(createdPolicy.org_id, createdPolicy.policy_id);
          let escrowInvoiceData = generateEscrowInvoiceData ? helper.getJsonParseData(generateEscrowInvoiceData) : null;

          if (genEscrowPdfRes) {
            let esccrowBccMail = [];
           /* let policyDocLogData = {
                org_id:createdPolicy.org_id,
                policy_id: createdPolicy.policy_id,
                customer_id: createdPolicy.customer_id,
                file_name: genEscrowPdfRes.filename,
                create_user_type: 2,// admin-user
                created_by: createdPolicy.created_by,
    
              } 
              const result = await db.sequelize.transaction(async (t) => {
                let createpolicyDocLogsRes = await policyDocLogService.createpolicyDocLogs(policyDocLogData,t)
              });
            */
            if (createdPolicy.realtor_email) {
              esccrowBccMail.push(createdPolicy.realtor_email);
            }
            if (createdPolicy.agent_email) {
              esccrowBccMail.push(createdPolicy.agent_email);
            }
            let dataObj = escrowInvoiceData;
            dataObj.company_address = mailConfig.company_address,
            dataObj.company_phone = mailConfig.company_phone,
            dataObj.company_email = mailConfig.company_email,
            dataObj.company_copyright_year = mailConfig.company_copyright_year;
            dataObj.company_website = mailConfig.company_website;
            dataObj.company_website_link = mailConfig.company_website_link;
            let escrowMailTrigger = await mailService.triggerMail('escrowInvoice.ejs', dataObj, '', createdPolicy.email, 'Escrow Pdf', genEscrowPdfRes, esccrowBccMail);

            if (escrowMailTrigger) {
              console.log('Escrow mail triggered successfully');
            } else {
              console.log('Escrow mail trigger failed');
            }
          }
        })();
      } else {
        console.log('Policy status is not 4. Skipping escrow handling.');
      }

      originalSend.call(res, body);
      next(); // Move the `next()` call outside the conditional block
    };
  } catch (error) {
    console.error('Error in modifying create policy:', error);
    next(error); // Pass the error to the error handling middleware
  }
  // console.log('called last next');
  next();
}


/*******************************
 * UPDATE POLICY 
 * @method: PUT
 * @url: /api/v1/admin/policy/update-policy/:policy_id
 ********************************/
router.put('/update-policy/:policy_id', verifyToken, policyController.updatePolicy) 


/*******************************
 * RENEW POLICY 
 * @method: POST
 * @url: /api/v1/admin/policy/renew-policy/:policy_id
 ********************************/
router.post('/renew-policy/:policy_id', verifyToken, policyController.renewPolicy) 

/*******************************
 * UPDATE RENEW POLICY STATUS
 * @method: PUT
 * @url: /api/v1/admin/policy/update-renew-policy-status/:policy_id
 ********************************/
router.put('/update-renew-policy-status/:policy_id', verifyToken, policyController.updateRenewPolicyStatus) 




/*******************************
 * GET POLICY DETAILS
 * @method: POST
 * @url: /api/v1/admin/policy/policy-details/:policy_param
 ********************************/
router.post('/policy-details/:policy_param', verifyToken, policyController.getPolicyDetails)

//FOR ONLY TEST
router.post('/test-payment-link', verifyToken, policyController.testPaymentLink)

router.post('/get-payment-link-data', policyController.GetPaymentLinkData)


/*******************************
 * download or send mail for escrow invoice 
 * @method: POST
 * @url: /api/v1/admin/policy/escrow-invoice-generate/:policy_id
 ********************************/
router.post('/escrow-invoice-generate/:policy_id/:key?', verifyToken, policyController.generateEscrowInvoice)

/*******************************
 * download or send mail for escrow invoice 
 * @method: POST
 * @url: /api/v1/admin/policy/escrow-invoice-generate/:policy_id
 ********************************/
router.post('/payment-receipt-generate/:policy_id/:key?', verifyToken, policyController.generatePaymentReceipt)


router.post('/get-advance-search-data', verifyToken, policyController.GetAvdvanceSearchData)
module.exports = router;

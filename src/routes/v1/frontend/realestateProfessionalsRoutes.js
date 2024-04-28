require("dotenv").config();
const express = require("express");
const realestateProfessionalsRouter = express.Router();
const config = require('../../../config/config');
const verifyRealtorToken = require("../../../common/verifyRealtorToken");
const generatePagination = require('../../../middleware/pagination');
const realestateProfessionalsController = require("../../../controllers/v1/admin/realestateProfessionalsController");
const policyController = require("../../../controllers/v1/admin/policyController");
const policyService = require("../../../services/v1/admin/policyService");
const helper = require('../../../common/helper');
const mailService = require("../../../services/v1/admin/mailService");
const mailConfig = require("../../../config/mailConfig");

/*******************************
 * POST AFFILIATE
 * @method: POST
 * @url: /api/v1/frontend/real-estate-professionals/submit-real-estate-professional
 ********************************/
realestateProfessionalsRouter.post("/submit-real-estate-professional", realestateProfessionalsController.submitRealestateProfessional);

/*******************************
 * LOGIN
 * @method: POST
 * @url: /frontend/real-estate-professionals/login-realestate-pro-portal
 ********************************/
realestateProfessionalsRouter.post("/login-realestate-pro-portal", realestateProfessionalsController.login);


/*******************************
 * UPDATE
 * @method: POST
 * @url: /api/v1/frontend/real-estate-professionals/change-profile-password
 ********************************/
realestateProfessionalsRouter.post("/change-profile-password", verifyRealtorToken, realestateProfessionalsController.changePassword);


/*******************************
 * GENERATE FORGOT PASSWORD LINK FOR SYSTEM ADMIN
 * @method: POST
 * @url: /api/v1/frontend/real-estate-professionals/gen-customer-forgot-pass-link
 ********************************/
realestateProfessionalsRouter.post('/gen-realestate-pro-forgot-pass-link', realestateProfessionalsController.generateForgotPassLink)


/*******************************
 * GENERATE FORGOT PASSWORD LINK FOR SYSTEM ADMIN
 * @method: POST
 * @url: /api/v1/frontend/customer-portal/gen-customer-forgot-pass-link
 ********************************/
realestateProfessionalsRouter.post('/update-realestate-pro-password', realestateProfessionalsController.updateRealtorPassword)

/*******************************
 * VALIDATE REALTOR OTP
 * @method: POST
 * @url: /api/v1/frontend/real-estate-professionals/validate-customer-login-otp
 ********************************/
realestateProfessionalsRouter.post("/validate-realestate-pro-login-otp", realestateProfessionalsController.validateRealtorLoginOTP);


/*******************************
 * RESEND REALTOR OTP
 * @method: POST
 * @url: /api/v1/frontend/real-estate-professionals/validate-customer-login-otp
 ********************************/
realestateProfessionalsRouter.post("/resend-realestate-pro-login-otp", realestateProfessionalsController.resendRealtorLoginOtp);


/*******************************
 * VERIFY REALTOR PORTAL TOKEN
 * @method: POST
 * @url: /api/v1/frontend/real-estate-professionals/verify-system-admin-token
 ********************************/
realestateProfessionalsRouter.post('/verify-realestate-pro-portal-token', verifyRealtorToken, realestateProfessionalsController.verifyRealtorPortalToken)


/*******************************
 * UPDATE  REALTOR PROFILE INFORMATION
 * @method: PUT
 * @url: /api/v1/frontend/real-estate-professionals/update-realestate-pro-profile
 ********************************/
realestateProfessionalsRouter.put('/update-realestate-pro-profile', verifyRealtorToken, realestateProfessionalsController.updateRealtorProfie)


/*******************************
 * REALTOR PORTAL LAST LOGIN
 * @method: POST
 * @url: /api/v1/frontend/real-estate-professionals/realestate-pro-portal-last-login
 ********************************/
realestateProfessionalsRouter.get('/realestate-pro-portal-last-login', verifyRealtorToken, realestateProfessionalsController.getRealtorPortalLastLogin);


/*******************************
 * REALTOR PORTAL POLICY DETAILS
 * @method: POST
 * @url: /api/v1/frontend/real-estate-professionals/policy-details/:policy_param
 ********************************/
realestateProfessionalsRouter.post('/policy-details/:policy_param', verifyRealtorToken, policyController.getPolicyDetails)


/*******************************
 * CREATE POLICY BY FROM REALESTATE PROFESSIONALS
 * @method: POST
 * @url: /api/v1/frontend/real-estate-professionals/create-policy
 ********************************/
realestateProfessionalsRouter.post('/create-policy', verifyRealtorToken, modifyCreatePolicyByRealtor, policyController.createPolicyByRealestatePro)

function modifyCreatePolicyByRealtor(req, res, next) {
    /* Capture the response sent by policyController.createPolicyByUser */
    const originalSend = res.send;
    try {
        // res.send = async (body) => {
        //   //  console.log('body.policy_info',body.policy_info.org_id);
        //     let emailObj = null;
        //     if (typeof body == 'string') {
        //         body = JSON.parse(body);
        //         emailObj = body.emaildata
        //     } else {
        //         emailObj = body.emaildata
        //     }


        //     let genEscrowPdfRes = await policyService.generateEscrowAttachment(body.policy_info.org_id, body.policy_info.policy_id);
        //     let generateEscrowInvoiceData = await policyService.generateEscrowInvoiceData(body.policy_info.org_id, body.policy_info.policy_id);
        //     let escrowInvoiceData = generateEscrowInvoiceData ? helper.getJsonParseData(generateEscrowInvoiceData) : null;
        //     /* For escrow Payment => payment invoice and attachment generate and send mail */
        //     if (body.policy_info && body.policy_info.policy_status == 4) {
        //         (async () => {
        //             policy_info = body.policy_info;


        //             if (genEscrowPdfRes) {
        //                 let esccrowBccMail = [];
        //                 if (policy_info.realtor_email) {
        //                     esccrowBccMail.push(policy_info.realtor_email);
        //                 }
        //                 if (policy_info.agent_email) {
        //                     esccrowBccMail.push(policy_info.agent_email);
        //                 }
        //                 let dataObj = escrowInvoiceData;
        //                 dataObj.company_address = mailConfig.company_address,
        //                     dataObj.company_phone = mailConfig.company_phone,
        //                     dataObj.company_email = mailConfig.company_email,
        //                     dataObj.company_copyright_year = mailConfig.company_copyright_year;
        //                 dataObj.company_website = mailConfig.company_website;
        //                 dataObj.company_website_link = mailConfig.company_website_link;
        //                 let escrowMailTrigger = await mailService.triggerMail('escrowInvoice.ejs', dataObj, '', policy_info.email, 'Escrow Pdf', genEscrowPdfRes, esccrowBccMail);

        //                 if (escrowMailTrigger) {
        //                     console.log('Escrow mail triggered successfully');
        //                 } else {
        //                     console.log('Escrow mail trigger failed');
        //                 }
        //             }
        //         })();
        //     } else {
        //         console.log('Policy status is not 4. Skipping escrow handling.');
        //         let realtorMailTrigger = await mailService.triggerMail('newRealestateProfessionalInvoiceTemp.ejs', { ...emailObj, ...escrowInvoiceData }, '', body.emaildata.realtor_email, 'Your policy order has been processed successfully');

        //         if (realtorMailTrigger) {
        //             console.log('Realtor mail triggered successfully');
        //         } else {
        //             console.log('Realtor mail trigger failed');
        //         }
        //         res.status(200).send({
        //             status: 1,                  
        //             message: "Policy Created Successfully.",
        //         });
        //         return;
        //     }
            

        //     originalSend.call(res, body);
        //     next(); // Move the `next()` call outside the conditional block
        // };




        res.send = (body)=> {
            /* For escrow Payment => payment invoice and attachment generate and send mail */
            if (body.policy_info && body.policy_info.policy_status == 4) {
                (async () => {
                    policy_info = body.policy_info;
                    let genEscrowPdfRes = await policyService.generateEscrowAttachment(policy_info.org_id, policy_info.policy_id);
                    let generateEscrowInvoiceData = await policyService.generateEscrowInvoiceData(policy_info.org_id, policy_info.policy_id);
                    let escrowInvoiceData = generateEscrowInvoiceData ? helper.getJsonParseData(generateEscrowInvoiceData) : null;

                    if (genEscrowPdfRes) {
                        let esccrowBccMail = [];                       
                        if (policy_info.realtor_email) {
                            esccrowBccMail.push(policy_info.realtor_email);
                        }
                        if (policy_info.agent_email) {
                            esccrowBccMail.push(policy_info.agent_email);
                        }
                        let dataObj = escrowInvoiceData;
                        dataObj.company_address = mailConfig.company_address,
                        dataObj.company_phone = mailConfig.company_phone,
                        dataObj.company_email = mailConfig.company_email,
                        dataObj.company_copyright_year = mailConfig.company_copyright_year;
                        dataObj.company_website = mailConfig.company_website;
                        dataObj.company_website_link = mailConfig.company_website_link;
                        let escrowMailTrigger = await mailService.triggerMail('escrowInvoice.ejs', dataObj, '', policy_info.email, 'Escrow Pdf', genEscrowPdfRes, esccrowBccMail);

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
            if (body.policy_info){
                (async () => {
                    policy_info = body.policy_info; 
                    emailObj = body.emaildata                  
                    let generateEscrowInvoiceData = await policyService.generateEscrowInvoiceData(policy_info.org_id, policy_info.policy_id);
                    let escrowInvoiceData = generateEscrowInvoiceData ? helper.getJsonParseData(generateEscrowInvoiceData) : null;
    
                    let realtorMailTrigger = await mailService.triggerMail('newRealestateProfessionalInvoiceTemp.ejs', { ...emailObj, ...escrowInvoiceData }, '', body.emaildata.realtor_email, 'Your policy order has been processed successfully');
                    if (realtorMailTrigger) {
                        console.log('Realtor mail triggered successfully');
                    } else {
                        console.log('Realtor mail trigger failed');
                    }
                   return;
                })();
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
 * CREATE POLICY BY FROM REALESTATE PROFESSIONALS
 * @method: POST
 * @url: /api/v1/frontend/real-estate-professionals/get-all-realestate-pro-policies
 ********************************/
realestateProfessionalsRouter.post('/get-all-realestate-pro-policies', verifyRealtorToken, generatePagination(), realestateProfessionalsController.getAllRealtorPolicies)


/*******************************
 * CREATE POLICY BY FROM REALESTATE PROFESSIONALS
 * @method: POST
 * @url: /api/v1/frontend/real-estate-professionals/get-all-realtor-policy-amount
 ********************************/
realestateProfessionalsRouter.post('/get-all-realtor-policy-paid-amount', verifyRealtorToken, realestateProfessionalsController.getAllRealtorPolicyPaidAmount)



/*******************************
 * CREATE POLICY BY FROM REALESTATE PROFESSIONALS
 * @method: POST
 * @url: /api/v1/frontend/real-estate-professionals/get-all-realtor-policy-amount
 ********************************/
realestateProfessionalsRouter.post('/get-all-realtor-policy-due-amount', verifyRealtorToken, realestateProfessionalsController.getAllRealtorPolicyDueAmount)


/*******************************
 * CUSTOMER PAYMENT HISTORY
 * @method: POST
 * @url: /api/v1/frontend/customer-portal/customer-details
 ********************************/
realestateProfessionalsRouter.post('/realtor-details/:param', verifyRealtorToken, realestateProfessionalsController.getRealtorDetails)

/*******************************
 * REALTOR PORTAL LOGOUT
 * @method: POST
 * @url: /api/v1/frontend/real-estate-professionals/logout
 ********************************/
realestateProfessionalsRouter.post('/realestate-pro-portal-logout', verifyRealtorToken, realestateProfessionalsController.realtorLogOut)



/*******************************
 * download or send mail for escrow invoice 
 * @method: POST
 * @url: /api/v1/admin/policy/escrow-invoice-generate/:policy_id
 ********************************/
realestateProfessionalsRouter.post('/escrow-invoice-generate/:policy_id/:key?', verifyRealtorToken, policyController.generateEscrowInvoice)

/*******************************
 * download or send mail for escrow invoice 
 * @method: POST
 * @url: /api/v1/admin/policy/escrow-invoice-generate/:policy_id
 ********************************/
realestateProfessionalsRouter.post('/payment-receipt-generate/:policy_id/:key?', verifyRealtorToken, policyController.generatePaymentReceipt)


module.exports = realestateProfessionalsRouter;
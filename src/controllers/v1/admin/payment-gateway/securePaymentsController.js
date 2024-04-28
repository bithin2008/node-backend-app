require("dotenv").config();
const config = require("../../../../config/config");
const CustomError = require("../../../../utils/customErrorHandler");
const db = require('../../../../models/index');
var ApiContracts = require('authorizenet').APIContracts;
var ApiControllers = require('authorizenet').APIControllers;
var SDKConstants = require('authorizenet').Constants;
const securePaymentsService = require("../../../../services/v1/admin/securePaymentsService");
const paymentService = require("../../../../services/v1/admin/paymentService");
const customerCardService = require("../../../../services/v1/admin/customerCardService");
const policyService = require("../../../../services/v1/admin/policyService");
const customerService = require("../../../../services/v1/admin/customerService");
const moment = require("moment");
const url = require('url');
const querystring = require('querystring');
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
const helper = require('../../../../common/helper');
const _ = require("lodash");

//const model =db.sequelize.models// Object.keys(db.sequelize.models);
//process.env.ACCESS_TOKEN
/*****************************
 *  CHARGE CREDIT CARD
 ******************************/


exports.chargeCreditCard = async (req, res, next) => {
  try {
    let validateprice = await policyService.validateNetAmount(req);
    if (req.body.netAmount === validateprice) {
      // console.log('req',req.body);
      const transactionResponse = await securePaymentsService.chargeCreditCard(req, res, next);
      res.status(200).send({ response: transactionResponse })
    } else {
      res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
    }
  } catch (error) {
    console.error('Error:', error);
  }



  // ctrl.execute(function(){

  //     var apiResponse = ctrl.getResponse();

  //     var response = new ApiContracts.CreateTransactionResponse(apiResponse);

  //     //pretty print response
  //     console.log(JSON.stringify(response, null, 2));

  //     if(response != null){
  //         if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
  //             if(response.getTransactionResponse().getMessages() != null){
  //                 res.status(200).send({                          
  //                     response:response })
  //                 // console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
  //                 // console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
  //                 // console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
  //                 // console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
  //             }
  //             else {
  //                 console.log('Failed Transaction.');
  //                 if(response.getTransactionResponse().getErrors() != null){
  //                     res.status(200).send({ status: response.getTransactionResponse().getErrors().getError()[0].getErrorCode(), message: response.getTransactionResponse().getErrors().getError()[0].getErrorText(),response:response })
  //                     // console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
  //                     // console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
  //                 }
  //             }
  //         }
  //         else {
  //             console.log('Failed Transaction. ');
  //             if(response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null){
  //                 res.status(200).send({ status: response.getTransactionResponse().getErrors().getError()[0].getErrorCode(), message: response.getTransactionResponse().getErrors().getError()[0].getErrorText(),response:response })
  //                 // console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
  //                 // console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
  //             }
  //             else {
  //                 res.status(200).send({ status: response.getMessages().getMessage()[0].getCode(), message: response.getMessages().getMessage()[0].getText(),response:response })
  //                 // console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
  //                 // console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
  //             }
  //         }
  //     }
  //     else {
  //         res.status(200).send({ status: 0, message:`Null Response.` })
  //        // console.log('Null Response.');
  //     }

  //   //  next(response);
  // });

}

exports.debitBankAccount = async (req, res, next) => {
  try {
    let validateprice = await policyService.validateNetAmount(req);
    if (req.body.netAmount === validateprice) {
      const transactionResponse = await securePaymentsService.debitBankAccount(req, res, next);
      res.status(200).send({ response: transactionResponse })
    } else {
      res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
    }
  } catch (error) {
    console.error('Error:', error);
  }

}

exports.linkPayment = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    ///console.log(req.body);
    let payload = req.body;
    let policyData = {};
    let paymentData = {
      card_holder_name: payload.cardHolderName ? payload.cardHolderName : null,
      card_expiry_date: payload.cardExpiryDate ? helper.encodeCrypto(payload.cardExpiryDate.replace(/\//g, "")) : null,
    };


    let paymentProfileId = null;
    let customerCardData = {};
    let selectedCardDetails = null;

    if (!req.body.payment_link) {
      throw new CustomError('Invalid link', 400)
    }
    const jwtRes = new Promise((resolve, reject) => {
      jwt.verify(req.body.payment_link, process.env.ACCESS_TOKEN, (err, tokenDataResponse) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            // JWT token has expired
            return res.status(498).json({ status: 0, message: 'link has expired' });
          } else {
            // Other JWT verification errors
            res.status(498).json({ status: 0, message: 'Invalid Access Token' });
          }
          // reject(err); // Reject the Promise if there's an error
        } else {
          resolve(tokenDataResponse); // Resolve the Promise with the token data
        }
      });
    });
    const tokenDataResponse = await jwtRes;
    console.log('tokenDataResponse', tokenDataResponse);
    // return
    if (tokenDataResponse) {
      let GetPaymentLink = await db.customerPaymentLinkModel.findOne({
        where: {
          policy_id: tokenDataResponse.policy_id,
          payment_id: tokenDataResponse.payment_id,
          customer_id: tokenDataResponse.customer_id
        }
      });

      if (GetPaymentLink.payment_link_status == 0) {
        res.status(200).send({ status: 0, message: 'Payment already done' })
        return
        //throw new CustomError('Payment already done', 400)
      }
      let policyDetails = await policyService.findPolicyByPolicyId(tokenDataResponse.policy_id);
      if (!policyDetails) {
        throw new CustomError('Policy information not found')
      }

      let queryOptions = {
        where: {
          customer_id: tokenDataResponse.customer_id,
          org_id: tokenDataResponse.org_id,
        }
      }
      let savedCards = await customerCardService.getCustomerAllSavedCards(queryOptions);
      let paymentDetails = await paymentService.getPaymentById(tokenDataResponse.payment_id);
      let customerDetails = await customerService.findCustomerById(tokenDataResponse.customer_id);
      console.log('customerDetails', customerDetails);
      let customerPaymentProfileObj = {
        authorizeNet_customer_profile_id: customerDetails.authorizeNet_customer_profile_id,
        org_id: tokenDataResponse.org_id,
        customer_id: tokenDataResponse.customer_id,
        card_type: null,
        card_holder_name: payload.cardHolderName ? payload.cardHolderName : null,
        card_number: payload.cardNumber ? payload.cardNumber : null,
        card_last_4_digit: payload.cardNumber ? payload.cardNumber.slice(-4) : null,
        card_expiry_date: payload.cardExpiryDate ? payload.cardExpiryDate : null,
        ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        create_user_type: 1,
        created_by: tokenDataResponse.customer_id,
      }
      if (savedCards.length == 0 && !customerDetails.authorizeNet_customer_profile_id) {
        // if customer dosenot have any card stored previously
        customerCardData = {
          org_id: tokenDataResponse.org_id,
          customer_id: tokenDataResponse.customer_id,
          card_type: null,
          card_holder_name: payload.cardHolderName ? payload.cardHolderName : null,
          card_number: payload.cardNumber ? helper.encodeCrypto(payload.cardNumber) : null,
          card_last_4_digit: payload.cardNumber ? payload.cardNumber.slice(-4) : null,
          card_expiry_date: payload.cardExpiryDate ? helper.encodeCrypto(payload.cardExpiryDate.replace(/\//g, "")) : null,
          ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
          authorizeNet_payment_profile_id: paymentProfileId ? paymentProfileId : null,
          create_user_type: 1,
          created_by: tokenDataResponse.customer_id,
        }
        customerCardData.primary_card = true;
       
      } else {
        // Verify that the given card's expiry date and card number match those on the customer's stored cards. (customer_card table). 
        const matchedExpDate = _.find(savedCards, (obj) => {
          return obj.card_expiry_date == payload.cardExpiryDate.replace(/\//g, "") && obj.card_number == payload.cardNumber;
        });
// console.log('matchedExpDate',matchedExpDate);
        if (!matchedExpDate) {
          if (savedCards.length >= 5) {
            throw new CustomError('Maximum card limit exceeds. you have already added five cards');
          } else {
            // if customer provide different card details which not stored in customer_card table
            // if (!paymentProfileId) {
            //   // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
            //   const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
            //   paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId();
            // }

            customerCardData = {
              org_id: tokenDataResponse.org_id,
              customer_id: tokenDataResponse.customer_id,
              card_type: null,
              authorizeNet_payment_profile_id: paymentProfileId ? paymentProfileId : null,
              card_holder_name: payload.cardHolderName ? payload.cardHolderName : null,
              card_number: payload.cardNumber ? helper.encodeCrypto(payload.cardNumber) : null,
              card_last_4_digit: payload.cardNumber ? payload.cardNumber.slice(-4) : null,
              card_expiry_date: payload.cardExpiryDate ? helper.encodeCrypto(payload.cardExpiryDate.replace(/\//g, "")) : null,
              ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
              create_user_type: 1,
              created_by: tokenDataResponse.customer_id,
            }

          }
        } else {
          // if customer provide same card details which already stored in customer_card table
          customerCardData = {};
          selectedCardDetails = await customerCardService.getCustomerCardById({ where: { customer_id: tokenDataResponse.customer_id, customer_card_id: matchedExpDate.customer_card_id } })
          paymentProfileId = selectedCardDetails.authorizeNet_payment_profile_id ? selectedCardDetails.authorizeNet_payment_profile_id : null
        }

        // if (!paymentProfileId) {
        //   // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
        //   const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
        //   paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
        // }
      }
      if (!customerDetails.authorizeNet_customer_profile_id) {
        let customerProfileObj = {
          customer_id: customerDetails.customer_id,
          customer_email: customerDetails.email,
          first_name: customerDetails.first_name ? customerDetails.first_name : null,
          last_name: customerDetails.last_name ? customerDetails.last_name : null,
          billing_zip: customerDetails.zip ? customerDetails.zip : null,
          billing_city: customerDetails.city ? customerDetails.city : null,
          billing_state: customerDetails.state ? customerDetails.state : null,
          billing_address: customerDetails.address1 ? customerDetails.address1 : null,
          card_number: payload.cardNumber,
          card_expiry_date: payload.cardExpiryDate ? payload.cardExpiryDate.replace(/\//g, "") : null,
          card_cvv: payload.cardCVV ? payload.cardCVV : null,
          tax_amount: 0,
          net_amount: paymentDetails.amount,
        }
        const createCustomerProfileResponse = await securePaymentsService.createCustomerProfile(customerProfileObj);
        console.log('createCustomerProfileResponse', createCustomerProfileResponse);

        if (createCustomerProfileResponse.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
          customerDetails.authorizeNet_customer_profile_id = createCustomerProfileResponse.getCustomerProfileId();
          const paymentProfileIdObject = createCustomerProfileResponse.getCustomerPaymentProfileIdList().getNumericString()[0];
          // Extract the actual ID from the object
          paymentProfileId = paymentProfileIdObject.toString();

          const updateCustomerProfileId = await customerService.updateWithoutTransCustomer(customerDetails.customer_id, {
            authorizeNet_customer_profile_id: customerDetails.authorizeNet_customer_profile_id,
          });
          console.log('updateCustomerProfileId', updateCustomerProfileId);
        } else {
          throw new CustomError(`Payment failed`, 402);
          // res.status(402).send({ status: 0, message: 'Payment failed' });
          // await transaction.rollback()
          return
        }

        customerPaymentProfileObj = {
          authorizeNet_customer_profile_id: customerDetails.authorizeNet_customer_profile_id,
          ...customerProfileObj
        }

      
      }
      console.log('paymentProfileId', paymentProfileId);
      if (!paymentProfileId) {
        customerCardData = {
          org_id: tokenDataResponse.org_id,
          customer_id: tokenDataResponse.customer_id,
          card_type: null,
          card_holder_name: payload.cardHolderName ? payload.cardHolderName : null,
          card_number: payload.cardNumber ? helper.encodeCrypto(payload.cardNumber) : null,
          card_last_4_digit: payload.cardNumber ? payload.cardNumber.slice(-4) : null,
          card_expiry_date: payload.cardExpiryDate ? helper.encodeCrypto(payload.cardExpiryDate.replace(/\//g, "")) : null,
          ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
          authorizeNet_payment_profile_id: paymentProfileId ? paymentProfileId : null,
          create_user_type: 1,
          created_by: tokenDataResponse.customer_id,
        }
        // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
        const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
        paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
      }
        // AUDIT TRAIL PAYLOAD
        let auditData = {
          customer_id: tokenDataResponse.customer_id,
          name: customerDetails.first_name + ' ' + customerDetails.last_name,
          email: customerDetails.email,
          section: 'POLICY',
          table_name: 'hws_policies',
          source: 0,
          create_user_type: 1,
          created_by: tokenDataResponse.customer_id,
          device_id: helper.getDeviceId(req.headers['user-agent']),
        }

        let paymentObj = {
          authorizeNet_customer_profile_id: customerDetails.authorizeNet_customer_profile_id,
          authorizeNet_payment_profile_id: paymentProfileId,
          customer_id: tokenDataResponse.customer_id,
          customer_email: customerDetails.email,
          first_name: customerDetails.first_name,
          last_name: customerDetails.last_name,
          billing_zip: customerDetails.zip,
          billing_city: customerDetails.city ? customerDetails.city : null,
          billing_state: customerDetails.state ? customerDetails.state : null,
          billing_address: customerDetails.address1 ? customerDetails.address1 : null,
          card_number: payload.cardNumber,
          card_holder_name: payload.cardHolderName ? payload.cardHolderName : null,
          card_last_4_digit: payload.cardNumber ? payload.cardNumber.slice(-4) : null,
          tax_amount: 0,
          net_amount: paymentDetails.amount,
          chargable_amount: paymentDetails.amount,
          policy_id: paymentDetails.policy_id,
        }
        const chargeCustomerProfileResponse = await securePaymentsService.chargeCustomerProfile(paymentObj);
        policyData.transactionResponse = chargeCustomerProfileResponse//.getTransactionResponse()
        paymentData.transaction_response = chargeCustomerProfileResponse//.getTransactionResponse()
        console.log('chargeCustomerProfileResponse ', chargeCustomerProfileResponse);
        const responseObject = chargeCustomerProfileResponse;
        const resultCode = responseObject?.messages?.resultCode;
        const code = responseObject?.messages?.message[0]?.code;
        const transactionResponse =  responseObject?.transactionResponse;
        const transactionResponseCode =  responseObject?.transactionResponse?.responseCode;
        if (resultCode === 'Ok' && code === 'I00001' && transactionResponse && (transactionResponseCode== 1|| transactionResponseCode== 4)) {   
        // if (chargeCustomerProfileResponse.getTransactionResponse() && chargeCustomerProfileResponse.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
          console.log('Payment was successful ');
          // Payment was successful  
          if (customerCardData && Object.keys(customerCardData).length !== 0) {
            customerCardData.card_type = chargeCustomerProfileResponse.transactionResponse.accountType
             customerCardData.authorizeNet_payment_profile_id=paymentProfileId
            console.log('customerCardData',customerCardData);
            const createdCustomerCard = await customerCardService.createCustomerCard(customerCardData, transaction);
          }
          paymentData.transaction_no = chargeCustomerProfileResponse.getTransactionResponse().getTransId();
          paymentData.card_type = chargeCustomerProfileResponse.transactionResponse.accountType
          paymentData.payment_status = 1 //success=>1
          paymentData.payment_type = 1 //CREDIT CARD=>1
          policyData.payment_status = 1 // success=>1
          policyData.policy_status = 2 // 30 days wait=>1
          paymentData.card_number = payload.cardNumber.slice(-4);
          paymentData.payment_successfull_date = moment().format('YYYY-MM-DD')
          paymentData.transaction_no = chargeCustomerProfileResponse.getTransactionResponse().getTransId();
          paymentData.transaction_response = chargeCustomerProfileResponse.getTransactionResponse();

          paymentData.payment_status = 1 //success=>1
          paymentData.payment_successfull_date = moment().format('YYYY-MM-DD');


          const policyStartDate = moment(paymentData.payment_successfull_date).add(30, 'days').format("YYYY-MM-DD")
          const policyEndDate = moment(policyStartDate).add(policyDetails.policy_term_month, 'month').format("YYYY-MM-DD");
          const endWithBonusDate = moment(policyEndDate).add(policyDetails.bonus_month, 'month').format("YYYY-MM-DD");
          policyData.order_date = moment().format('YYYY-MM-DD')
          policyData.policy_start_date = policyStartDate
          policyData.policy_expiry_date = policyEndDate
          policyData.expiry_with_bonus = endWithBonusDate
        } else {
          paymentData.payment_status = 2 //failed=>2
          policyData.payment_status = 2 //failed=>2
          auditData.description = `Link payment failed for policy number ${policyDetails.policy_number}`;
          await helper.updateAuditTrail(auditData, req)
          // Payment failed or encountered an issue
          throw new CustomError(`Payment failed!`, 402)
        }
        const updatePolicy = await policyService.updatePolicy(tokenDataResponse.policy_id, policyData, transaction);
        let updatePayment = await paymentService.updatePayment(tokenDataResponse.payment_id, paymentData, transaction)
        let updatePaymentLink = await db.customerPaymentLinkModel.update({ payment_link_status: 0 }, {
          where: {
            customer_payment_link_id: GetPaymentLink.customer_payment_link_id
          }
        }, transaction);

        if (updatePaymentLink && updatePolicy && updatePayment) {
          auditData.description = `Link payment success for policy number ${policyDetails.policy_number}`;
          await helper.updateAuditTrail(auditData, req)
          transaction.commit();
          res.status(200).send({ status: 1, message: 'Payment successfully completed' })
        } else {
          res.status(400).send({ status: 0, message: 'Payment Failed' })
        }
      

    }

  } catch (error) {
    console.log('error catch', error);
    transaction.rollback();
    next(error);
  }
}

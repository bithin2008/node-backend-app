require("dotenv").config();
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index');
const moment = require("moment");
const url = require('url');
const querystring = require('querystring');
const _ = require("lodash");
const { Op } = require("sequelize");
const ExcelJS = require('exceljs');
const helper = require('../../../common/helper');
const contractorAssignedJobService = require("../../../services/v1/admin/contractorAssignedJobService");
const customerCardService = require("../../../services/v1/admin/customerCardService");
const claimsService = require("../../../services/v1/admin/claimsService");
const policyService = require("../../../services/v1/admin/policyService");
const paymentService = require("../../../services/v1/admin/paymentService");
const productService = require("../../../services/v1/admin/productService");
const productProblemsService = require("../../../services/v1/admin/productProblemsService");
const userService = require("../../../services/v1/admin/userService");
const mailService = require("../../../services/v1/admin/mailService");
const policyNoteService = require("../../../services/v1/admin/policyNoteService");
const mailConfig = require("../../../config/mailConfig");
var ApiContracts = require('authorizenet').APIContracts;



/*****************************
 *  CREATE CLAIM  BY USER   
 ******************************/
exports.createClaimByUser = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const org_user_id = req.tokenData.org_user_id ? req.tokenData.org_user_id : req.tokenData.customer_id;
        const ticket_no = await this.generateTicketNo();
        // console.log('ticket_no=====',ticket_no);
        let payload = req.body;
        let paymentProfileId = null;
        let selectedCardDetails = null;
        let customerCardData = {};
        let policyDetails = await policyService.findPolicyByPolicyId(payload.policy_id,
            {
                include: [
                    {
                        model: db.customersModel,
                        as: 'customer_details',
                    },
                    {
                        model: db.plansModel,
                        as: 'plan_details',
                        attributes: { exclude: ['deleted_by', 'deleted_at'] },
                    },
                    {
                        model: db.planTermsModel,
                        as: 'plan_term_details',
                        attributes: { exclude: ['deleted_by', 'deleted_at'] },
                    },
                    {
                        model: db.policyProductsModel,
                        as: 'policy_product_list',
                        attributes: { exclude: ['create_user_type', 'update_user_type', 'created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
                    },

                ]
            }
        );
        let checkisExistClaim = await claimsService.getAllClaims({ where: { [Op.not]: [{ claim_ticket_statuses_id: 4 },], policy_id: payload.policy_id, product_id: payload.product_id } })
        // console.log('checkisExistClaim',checkisExistClaim);
        if (checkisExistClaim.rows.length > 0) {
            throw new CustomError('Claim request is already in progress', 400)
        }

        if (!policyDetails) {
            throw new CustomError(`policy not found`, 400)
        }
        let currentpolicyStatus = await policyService.getPolicyStatusFlagName(policyDetails.policy_status);
        if (policyDetails.policy_status == 1 || policyDetails.policy_status == 2) {

            let claimData = {
                org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
                policy_id: payload.policy_id,
                claim_ticket_statuses_id: 2,//payload.claim_ticket_statuses_id,
                customer_id: policyDetails.customer_id,
                product_id: payload.product_id,
                product_problem_id: payload.product_problem_id ? payload.product_problem_id : null,
                other_issue_type: payload.other_issue_type,
                issue_details: payload.issue_details,
                ticket_no: ticket_no,
                priority: payload.priority,
                product_brand: payload.product_brand,
                product_model: payload.product_model,
                product_serial_no: payload.product_serial_no,
                product_issue_date: payload.product_issue_date,
                pcf: policyDetails.pcf,
                unit_age_month:payload.unit_age_month,
                create_user_type: 2,
                created_by: org_user_id,
            }

            // AUDIT TRAIL PAYLOAD
            let auditData = {
                section: 'CUSTOMER_PORTAL_CLAIM_REQUEST',
                table_name: 'hws_claims',
                source: 1,
                create_user_type: 2,
                device_id: helper.getDeviceId(req.headers['user-agent']),
            }
            /**** Claim Payments Section */
            /*       const isExistCard = await customerCardService.getCustomerAllSavedCards({ where: { customer_id: policyDetails.customer_id } })
          
                  // if paymennt type is credit card
                  if (payload.selectedCardId) {
                      selectedCardDetails = await customerCardService.getCustomerCardById({ where: { customer_id: policyDetails.customer_id, customer_card_id: payload.selectedCardId } })
                  } else {
                      if (!policyDetails.customer_details.authorizeNet_customer_profile_id) {
                          // if createdCustomer.authorizeNet_customer_profile_id is null, its means they not have customer profile account in authorize.net
                          let customerProfileObj = {
                              customer_id: policyDetails.customer_id,
                              customer_email: policyDetails.customer_details.email,
                              first_name: policyDetails.customer_details.first_name,
                              last_name: policyDetails.customer_details.last_name,
                              zip: policyDetails.customer_details.zip,
                              city: policyDetails.customer_details.city,
                              state: policyDetails.customer_details.state,
                              address: policyDetails.customer_details.address1,
                              card_number: payload.cardNumber,
                              card_expiry_date: payload.cardExpiryDate ? payload.cardExpiryDate : null,
                              card_cvv: payload.cvv ? payload.cvv : null,
                          }
                          const createCustomerProfileResponse = await securePaymentsService.createCustomerProfile(customerProfileObj);
                          //  console.log('createCustomerProfile', createCustomerProfileResponse);
                          if (createCustomerProfileResponse) {
                              policyDetails.customer_details.authorizeNet_customer_profile_id = createCustomerProfileResponse.getCustomerProfileId();
                              const paymentProfileIdObject = createCustomerProfileResponse.getCustomerPaymentProfileIdList().getNumericString()[0];
                              // Extract the actual ID from the object
                              paymentProfileId = paymentProfileIdObject.toString();
                              if (policyDetails.customer_details.authorizeNet_customer_profile_id) {
                                  // The response contains the expected structure and customerProfileId
                                  const updateCustomerProfileId = await customerService.updateCustomer(policyDetails.customer_id, {
                                      authorizeNet_customer_profile_id: policyDetails.customer_details.authorizeNet_customer_profile_id,
                                  }, transaction);
                              } else {
                                  throw new CustomError('Provided Card Information is Invalid.');
                              }
                          } else {
                              throw new CustomError('Invalid response from Authorize.Net');
                          }
                      }
                      let customerPaymentProfileObj = {
                          authorizeNet_customer_profile_id: policyDetails.customer_details.authorizeNet_customer_profile_id,
                          customer_id: policyDetails.customer_id,
                          customer_email: policyDetails.customer_details.email,
                          first_name: policyDetails.first_name,
                          last_name: policyDetails.last_name,
                          billing_zip: policyDetails.billing_zip,
                          billing_city: policyDetails.billing_city,
                          billing_state: policyDetails.billing_state,
                          billing_address: policyDetails.billing_address1,
                          card_number: payload.cardNumber,
                          card_expiry_date: payload.cardExpiryDate,
                          card_cvv: payload.cvv,
                      }
                      if (isExistCard.length == 0) {
                          // if customer dosenot have any card stored previously
                          customerCardData = {
                              org_id: policyDetails.org_id,
                              customer_id: policyDetails.customer_id,
                              card_type: null,
                              card_holder_name: payload.cardHolderName ? payload.cardHolderName : null,
                              card_number: payload.cardNumber ? helper.encodeCrypto(payload.cardNumber) : null,
                              card_last_4_digit: payload.cardNumber ? payload.cardNumber.slice(-4) : null,
                              card_expiry_date: payload.cardExpiryDate ? helper.encodeCrypto(payload.cardExpiryDate) : null,
                              ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
                              authorizeNet_payment_profile_id: paymentProfileId ? paymentProfileId : null,
                              create_user_type: 2,
                              created_by: org_user_id,
                          }
                          customerCardData.primary_card = true;
                          if (!paymentProfileId) {
                              // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                              const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                              paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
                          }
                      } else {
          
                          // Verify that the given card's expiry date and card number match those on the customer's stored cards. (customer_card table). 
                          const matchedExpDate = _.find(isExistCard, (obj) => {
                              return obj.card_expiry_date == payload.cardExpiryDate && obj.card_number == payload.cardNumber;
                          });
          
                          if (!matchedExpDate) {
                              // if customer provide same card details with differnt expiry date which not stored in customer_card table
                              if (!paymentProfileId) {
                                  // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                                  const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                                  paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
                              }
          
                              customerCardData = {
                                  org_id: policyDetails.org_id,
                                  customer_id: policyDetails.customer_id,
                                  card_type: null,
                                  authorizeNet_payment_profile_id: paymentProfileId ? paymentProfileId : null,
                                  card_holder_name: payload.cardHolderName ? payload.cardHolderName : null,
                                  card_number: payload.cardNumber ? helper.encodeCrypto(payload.cardNumber) : null,
                                  card_last_4_digit: payload.cardNumber ? payload.cardNumber.slice(-4) : null,
                                  card_expiry_date: payload.cardExpiryDate ? helper.encodeCrypto(payload.cardExpiryDate) : null,
                                  ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
                                  create_user_type: 2,
                                  created_by: org_user_id,
                              }
                          } else {
                              // if customer provide same card details which already stored in customer_card table
                              customerCardData = {}
                              selectedCardDetails = await customerCardService.getCustomerCardById({ where: { customer_id: policyDetails.customer_id, customer_card_id: matchedExpDate.customer_card_id } })
                              paymentProfileId = selectedCardDetails.authorizeNet_payment_profile_id ? selectedCardDetails.authorizeNet_payment_profile_id : null
                          }
                          if (!paymentProfileId) {
                              // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                              const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                              paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
                          }
                      }
          
                  }
          
                  let paymentData = {
                      policy_id: payload.policy_id,
                      org_id: policyDetails.org_id,
                      customer_id: policyDetails.customer_id,
                      amount: policyDetails.pcf,
                      state: policyDetails.billing_state,
                      payment_type: payload.payment_type ? payload.payment_type : null,
                      payment_date: moment().format('YYYY-MM-DD'),
                      payment_successfull_date:moment().format('YYYY-MM-DD'),
                      card_holder_name: payload.cardHolderName ? payload.cardHolderName : null,
                      card_number: null,
                      transaction_no: null,
                      card_type: null,
                      card_expiry_date: payload.cardExpiryDate ? helper.encodeCrypto(payload.cardExpiryDate) : null,
                      payment_status: 4,
                      source: 1,
                      create_user_type: 2,
                      created_by: org_user_id,
                      transaction_response: null,
                      payment_type: 1,//credit card payment
                      ticket_no: ticket_no,
                      manual_payment_type: 1
          
                  }
                  let paymentObj = {
                      authorizeNet_customer_profile_id: policyDetails.customer_details.authorizeNet_customer_profile_id,
                      authorizeNet_payment_profile_id: selectedCardDetails ? selectedCardDetails.authorizeNet_payment_profile_id : paymentProfileId,
                      customer_id: policyDetails.customer_id,
                      customer_email: policyDetails.customer_details.email,
                      first_name: payload.first_name ? payload.first_name : null,
                      last_name: payload.last_name ? payload.last_name : null,
                      billing_zip: payload.billing_zip ? payload.billing_zip : null,
                      billing_city: payload.billing_city ? payload.billing_city : null,
                      billing_state: payload.billing_state ? payload.billing_state : null,
                      billing_address: payload.billing_address1 ? payload.billing_address1 : null,
                      chargable_amount: policyDetails.pcf,
                      orderDetails: `Charging Claim fees`
                  }
                  // console.log('paymentObj', paymentObj);
                  const chargeCustomerProfileResponse = await securePaymentsService.chargeCustomerProfile(paymentObj);
                  // console.log(' chargeCustomerProfileResponse Transaction Response:', chargeCustomerProfileResponse);
                  paymentData.transaction_response = chargeCustomerProfileResponse.getTransactionResponse()
                  paymentData.card_number = chargeCustomerProfileResponse.getTransactionResponse()
                  if (chargeCustomerProfileResponse.getTransactionResponse() && chargeCustomerProfileResponse.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
                      // Payment was successful
                      if (customerCardData && Object.keys(customerCardData).length !== 0 && !payload.selectedCardId) {
                          customerCardData.card_type = chargeCustomerProfileResponse.transactionResponse.accountType
                          const createdCustomerCard = await customerCardService.createCustomerCard(customerCardData, transaction);
                      }
                      paymentData.transaction_no = chargeCustomerProfileResponse.getTransactionResponse().getTransId();
                      paymentData.card_type = chargeCustomerProfileResponse.transactionResponse.accountType
                      paymentData.payment_status = 1 //success=>1
                  } else {
                      // Payment failed or encountered an issue
                      paymentData.payment_status = 2 //failed=>2
                      // Payment failed or encountered an issue
                      throw new CustomError(`Payment failed!`, 402)
                  }
          
                  paymentData.card_number = selectedCardDetails ? selectedCardDetails.card_last_4_digit : payload.cardNumber.slice(-4);
          
                  let createdPayments = await paymentService.createPayment(paymentData, transaction); */
            let createdClaim = await claimsService.createClaim(claimData, transaction)
            if (payload.note) {
                /** claim note for customer special instrurction **/
                let claimNotesData = {
                    claim_id: createdClaim?.claim_id ? createdClaim?.claim_id : null,
                    org_id: policyDetails.org_id,
                    note: payload.note,
                    create_user_type: 2,
                    created_by: org_user_id,
                }
                const createdClaimNote = await db.claimNotesModel.create(claimNotesData, { transaction });
            }
            if (payload.policy_notes) {
                /** claim note for internal  **/
                let policyNoteData = {
                    policy_id: payload.policy_id,
                    customer_id: policyDetails.customer_id,
                    org_id: policyDetails.org_id,
                    notes: payload.policy_notes ? payload.policy_notes : null,
                    policy_number: policyDetails.policy_number,
                    claim_ticket_no: ticket_no,
                    note_type: 1, //policy level notes=>0, claim level note=>1
                    create_user_type: 2,//backend user => 2
                    created_by: org_user_id,

                }
                if (payload.assign_to != '' || payload.assign_to != null) {
                    policyNoteData.assign_to_org_user_id = payload.assign_to
                }
                const createdPolicyNotes = await policyNoteService.createpolicyNotes(policyNoteData, transaction);
                if (policyNoteData.assign_to_org_user_id) {
                    let assgineeUserInfo = await userService.findUserById(policyNoteData.assign_to_org_user_id)
                    let noteCreatedByUserInfo = await userService.findUserById(policyNoteData.created_by)
                    if (assgineeUserInfo) {
                        let dataObj = {
                            name: `${assgineeUserInfo.first_name} ${assgineeUserInfo.last_name}`,
                            notes: createdPolicyNotes.notes,
                            policy_number: policyDetails.policy_number,
                            claim_ticket_no: ticket_no,
                            issue_details: payload.issue_details,
                            created_by: `${noteCreatedByUserInfo.first_name} ${noteCreatedByUserInfo.last_name}`,
                            created_at: moment(createdPolicyNotes.created_at).format('MM-DD-YYYY'),

                        }
                        dataObj.company_address = mailConfig.company_address,
                        dataObj.company_phone = mailConfig.company_phone,
                        dataObj.company_email = mailConfig.company_email,
                        dataObj.company_copyright_year = mailConfig.company_copyright_year;
                        dataObj.company_website = mailConfig.company_website;
                        dataObj.company_website_link = mailConfig.company_website_link;
                        dataObj.email_imageUrl =helper.email_imageUrl
                        let clientEmail = process.env.NODE_ENV == 'prod' ? [helper.clientMail] : []
                        let mailTrigger = await mailService.triggerMail('assgineeTaskNoteTemp.ejs', dataObj, '', assgineeUserInfo.email, 'Attention! A New Claim Task Has Been Assgined, ', '', [], clientEmail);
                    }


                }
            }
            let productDetails = await productService.findProductById(parseInt(payload.product_id));
            let productProlemDetails
            if (payload.product_problem_id) {
                productProlemDetails = await productProblemsService.findProductProblemById(parseInt(payload.product_problem_id));
            }

            if (createdClaim) {
                transaction.commit();
                let dataObj = {
                    customer_email: policyDetails.email,
                    customer_name: policyDetails.first_name + ' ' + policyDetails.last_name,
                    ticket_no: ticket_no,
                    policy_number: policyDetails.policy_number,
                    product_name: productDetails.product_name,
                    problem_name: productProlemDetails?.problems ? productProlemDetails.problems : payload.other_issue_type,
                    other_problem: payload.other_issue_type ? payload.other_issue_type : null,
                    issue_details: payload.issue_details ? payload.issue_details : null,
                    ticket_date: moment(createdClaim.created_at).format('YYYY-MM-DD')
                }
                dataObj.company_address = mailConfig.company_address,
                dataObj.company_phone = mailConfig.company_phone,
                dataObj.company_email = mailConfig.company_email,
                dataObj.company_copyright_year = mailConfig.company_copyright_year;
                dataObj.company_website = mailConfig.company_website;
                dataObj.company_website_link = mailConfig.company_website_link;
                dataObj.email_imageUrl =helper.email_imageUrl

                auditData.customer_id = policyDetails.customer_id;
                auditData.name = policyDetails.first_name + ' ' + policyDetails.last_name;
                auditData.user_id = org_user_id;
                auditData.email = policyDetails.email ? policyDetails.email : null;
                auditData.row_id = createdClaim.claim_id;
                auditData.created_by = org_user_id;
                auditData.description = 'claim request raised successfully from admin';
                await helper.updateAuditTrail(auditData,req);
                let mailTrigger = await mailService.triggerMail('claimGeneratedTemp.ejs', dataObj, '', policyDetails.email, 'Claim request raised successfully!');
                if (mailTrigger) {
                    res.status(200).send({ status: 1,data: createdClaim, message: "Claim request raised successfully.", });
                } else {
                    res.status(200).send({ status: 1, message: `The mail server could not deliver mail to ${policyDetails.email}. Please check your email id` })
                }
            } else {
                auditData.description = 'unable to create claim request from customer portal';
                await helper.updateAuditTrail(auditData,req);
                throw new CustomError(`Something went wrong! , please try again later`);
            }
        } else {
            auditData.description = `claim is raised for policy which is still within the ${currentpolicyStatus} policy status mode from admin`;
            await helper.updateAuditTrail(auditData,req);
            throw new CustomError(`The policy for which you are trying to register a claim is still within the ${currentpolicyStatus} policy status mode.`, 400)
        }
    } catch (error) {
        transaction.rollback()
        next(error)
    }
}

exports.createClaimFromWebsite = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const org_user_id = req.tokenData.customer_id;
        const ticket_no = await this.generateTicketNo();
        // console.log('ticket_no=====',ticket_no);
        let payload = req.body;
        let paymentProfileId = null;
        let selectedCardDetails = null;
        let customerCardData = {};
        let policyDetails = await policyService.findPolicyByPolicyId(payload.policy_id,
            {
                include: [
                    {
                        model: db.customersModel,
                        as: 'customer_details',
                    },
                    {
                        model: db.plansModel,
                        as: 'plan_details',
                        attributes: { exclude: ['deleted_by', 'deleted_at'] },
                    },
                    {
                        model: db.planTermsModel,
                        as: 'plan_term_details',
                        attributes: { exclude: ['deleted_by', 'deleted_at'] },
                    },
                    {
                        model: db.policyProductsModel,
                        as: 'policy_product_list',
                        attributes: { exclude: ['create_user_type', 'update_user_type', 'created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
                    },

                ]
            }
        );

        let checkisExistClaim = await claimsService.getAllClaims({ where: { [Op.not]: [{ claim_ticket_statuses_id: 8 },], policy_id: payload.policy_id, product_id: payload.product_id } })
        // console.log('checkisExistClaim',checkisExistClaim);
        if (checkisExistClaim.rows.length > 0) {
            throw new CustomError('Claim request is already in progress', 400)
        }

        if (!policyDetails) {
            throw new CustomError(`policy not found`, 400)
        }
        if (policyDetails.policy_status != 1) {
            //  throw new CustomError(`Policy is not active`,400)
        }

        let claimData = {
            org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
            policy_id: payload.policy_id,
            claim_ticket_statuses_id: payload.ownTechnician ? 8 : 2,//payload.claim_ticket_statuses_id,
            customer_id: policyDetails.customer_id,
            product_id: payload.product_id,
            product_problem_id: payload.issue_type ? payload.issue_type : null,
            other_issue_type: payload.other_issue_type,
            issue_details: payload.issue_details,
            ticket_no: ticket_no,
            priority: payload.priority,
            product_brand: payload.product_brand,
            product_model: payload.product_model,
            product_serial_no: payload.product_serial_no,
            product_issue_date: payload.product_issue_date,
            pcf: policyDetails.pcf,
            create_user_type: 2,
            created_by: org_user_id,
        }   

        let productDetails = await productService.findProductById(parseInt(payload.product_id));
        let productProlemDetails = await productProblemsService.findProductProblemById(parseInt(claimData.product_problem_id));
        let createdClaim = await claimsService.createClaim(claimData, transaction);
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'CUSTOMER_PORTAL_CLAIM_REQUEST',
            table_name: 'hws_claims',
            source: 0,
            create_user_type: 1,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        if (payload.note) {
            let claimNotesData = {
                claim_id: createdClaim?.claim_id ? createdClaim?.claim_id : null,
                org_id: policyDetails.org_id,
                note: payload.note,
                create_user_type: 2,
                created_by: org_user_id,
            }
            const createdClaimNote = await db.claimNotesModel.create(claimNotesData, { transaction });
        }

        if (createdClaim) {
            auditData.customer_id = policyDetails.customer_id;
            auditData.name = policyDetails.first_name + ' ' + policyDetails.last_name;
            auditData.email = policyDetails.email ? policyDetails.email : null;
            auditData.row_id = createdClaim.claim_id;
            auditData.created_by = policyDetails.customer_id;
            transaction.commit();
            let dataObj = {
                customer_email: policyDetails.customer_details.email,
                customer_name: policyDetails.customer_details.first_name + ' ' + policyDetails.customer_details.last_name,
                ticket_no: ticket_no,
                policy_number: policyDetails.policy_number,
                product_name: productDetails.product_name,
                problem_name: productProlemDetails?.problems,
                other_problem: payload.other_issue_type ? payload.other_issue_type : null,
                issue_details: payload.issue_details ? payload.issue_details : null,
                ticket_date: moment(createdClaim.created_at).format('YYYY-MM-DD')
            }
            dataObj.company_address = mailConfig.company_address,
            dataObj.company_phone = mailConfig.company_phone,
            dataObj.company_email = mailConfig.company_email,
            dataObj.company_copyright_year = mailConfig.company_copyright_year;
            dataObj.company_website = mailConfig.company_website;
            dataObj.company_website_link = mailConfig.company_website_link;
            dataObj.email_imageUrl =helper.email_imageUrl
            let mailTrigger = await mailService.triggerMail('claimGeneratedTemp.ejs', dataObj, '', policyDetails.customer_details.email, 'Claim request raised successfully!');
            if (mailTrigger) {
                res.status(200).send({ status: 1, message: "Claim request raised successfully.", });
            } else {
                res.status(200).send({ status: 1, message: `The mail server could not deliver mail to ${policyDetails.customer_details.email}. Please check your email id` })
            }
            auditData.description = 'claim request raised successfully from customer portal';
            await helper.updateAuditTrail(auditData,req);
        } else {
            auditData.description = 'unable to create claim request from customer portal';
            await helper.updateAuditTrail(auditData,req);
            throw new CustomError(`Something went wrong! , please try again later`);
        }

    } catch (error) {
        transaction.rollback()
        next(error)
    }
}

exports.generateTicketNo = async () => {
    let ticket_no = `TN-0000000`;

    let lastClaim = await db.claimsModel.findOne({
        order: [['claim_id', 'DESC']],
    });

    if (lastClaim) {
        let lastTicket = parseInt(lastClaim.ticket_no.substring(3));
        lastTicket++;
        return `TN-${lastTicket.toString().padStart(7, '0')}`;
    } else {
        tt = parseInt(ticket_no.substring(3));
        tt++;
        return `TN-${tt.toString().padStart(7, '0')}`;
    }
}


exports.getAllClaimTicketStatus = async (req, res, next) => {
    try {

        const activeStatus = req.query.active_status ? { active_status: parseInt(req.query.active_status) } : {};

        let claimTicketStatus = await db.claimTicketStatusesModel.findAll({
            where: {
                org_id: req.tokenData.org_id,
                ...activeStatus,
            }
        })
        claimTicketStatus = helper.getJsonParseData(claimTicketStatus)
        res.status(200).send({ status: 1, message: `Successfully fetched the claim ticket status`, data: claimTicketStatus })
    } catch (error) {
        next(error)
    }
}

/*****************************
 *  GET ALL CLAIMS
 ******************************/
exports.getAllClaims = async (req, res, next) => {
    try {
        let roleBasedCondition = helper.generateRoleBasedCondition(req.tokenData)

        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        parsedQs = helper.convertStringsToNumbers(parsedQs);
        let { customer_id } = req.body;
        if (!customer_id) {
            customer_id = req.tokenData.customer_id;
        }
        if (parsedQs.full_name) {
            let nameSearch = parsedQs.full_name.trim().split(" ");
            let firstName = nameSearch[0]?.trim();
            let lastName = nameSearch[1]?.trim();
            parsedQs['$policy_details.first_name$'] = firstName
            parsedQs['$policy_details.last_name$'] = lastName?lastName:firstName
        }
        const advanceSearchFields = ['$policy_details.first_name$', '$policy_details.last_name$', '$policy_details.email$', '$claim_ticket_status_details.ticket_status$', '$policy_details.mobile$', '$policy_details.billing_zip$', '$policy_details.billing_state$', '$policy_details.billing_city$', '$policy_details.billing_address1$', '$policy_details.plan_details.plan_name$', '$policy_details.policy_number$', 'priority', '$product_details.product_name$', 'ticket_no', 'created_from', 'created_to']

        const advancedSearchQuery = helper.advanceSerachQueryGenrator(parsedQs, advanceSearchFields)

        const searchingValue = req.query.search || '';
        // Construct the search query
        let nameQueryForSearch = searchingValue ? searchingValue.trim().split(" ") : [];
        let firstName = nameQueryForSearch[0]?.trim();
        let lastName = nameQueryForSearch[1]?.trim();
      
       

        const searchQuery = searchingValue ? {
            [Op.or]: [

                {
                    '$policy_details.first_name$': {
                        [Op.iLike]: `%${firstName}%`,
                    },
                },
                {
                    '$policy_details.last_name$': {
                        [Op.iLike]: `%${lastName ? lastName : firstName}%`,
                    },
                },
                {
                    '$policy_details.email$': {
                        [Op.like]: `%${searchingValue}%`,
                    },
                },
                {
                    '$policy_details.mobile$': {
                        [Op.like]: `%${searchingValue}%`,
                    },
                },

                {
                    '$policy_details.billing_zip$': {
                        [Op.like]: `%${searchingValue}%`,
                    },
                },
                {
                    '$policy_details.billing_state$': {
                        [Op.like]: `%${searchingValue}%`,
                    },
                },
                {
                    '$policy_details.billing_city$': {
                        [Op.like]: `%${searchingValue}%`,
                    },
                },
                {
                    '$policy_details.billing_address1$': {
                        [Op.like]: `%${searchingValue}%`,
                    },
                },
                {
                    '$policy_details.policy_number$': {
                        [Op.like]: `%${searchingValue}%`,
                    },
                },
                {
                    ticket_no: {
                        [Op.like]: `%${searchingValue}%`,
                    },
                },
                {
                    issue_details: {
                        [Op.like]: `%${searchingValue}%`,
                    },
                },

                // Add more columns here for searching
            ],

        } : {};
        const filterBYCustomerId = customer_id ? { customer_id: parseInt(customer_id) } : {};
        const filterByPolicyId = req.body.policy_id ? { policy_id: req.body.policy_id } : {};
        const activeStatus = req.query.active_status ? { active_status: parseInt(req.query.active_status) } : {};
        const sortField = req.query.sortField || 'created_at'; // Default to 'created_at'
        const sortOrder = req.query.sortOrder || 'DESC'; // Default to ascending order
        let order;
        if (sortField === 'product_details.product_name') {
            order = [[{ model: db.productsModel, as: 'product_details' }, 'product_name', sortOrder]];
        } else {
            order = [[sortField, sortOrder]];
        }
        const queryOptions = {
            //  attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'updated_at', 'deleted_at', 'user_agent', 'device_id', 'ip_address', 'password'] },
            where: {
                ...roleBasedCondition,
                ...searchQuery,
                ...activeStatus,
                ...advancedSearchQuery,
                ...filterBYCustomerId,
                ...filterByPolicyId
            },
            include: [
                {
                    model: db.productsModel,
                    as: 'product_details',
                    attributes: { exclude: ['created_at', 'deleted_at', 'deleted_by'] }
                },
                {
                    model: db.claimTicketStatusesModel,
                    as: 'claim_ticket_status_details',
                    attributes: ['ticket_status', 'status_description','status_color']
                },
                {
                    model: db.productProblemsModel,
                    as: 'product_problem_type',
                    attributes: ['problems']
                },
                {
                    model: db.policiesModel,
                    as: 'policy_details',
                    attributes: ['first_name', 'policy_id', 'plan_terms_id', 'last_name', 'email', 'mobile', 'policy_number', 'billing_address1', 'billing_city', 'billing_state', 'billing_zip','is_anamaly'],
                    include: [{
                        model: db.plansModel,
                        as: 'plan_details',
                        attributes: ['plan_name']
                    },
                    {
                        model: db.planTermsModel,
                        as: 'plan_term_details',
                        attributes: ['plan_term', 'plan_term_month']
                    }]

                },
            ],
            order:order,
            distinct: true,
            // logging: console.log
        };


        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }
        let allClaims = await claimsService.getAllClaims(queryOptions);

        if (res.pagination) {
            res.pagination.total = allClaims.count
            res.pagination.totalPages = Math.ceil(allClaims.count / queryOptions.limit)
        }
        if (allClaims.count > 0) {
            res.status(200).send({ status: 1, data: allClaims.rows, pagination: res.pagination, message: 'Claim list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allClaims.rows, pagination: res.pagination, message: 'No Claim found' })
        }

    } catch (error) {
        next(error)
    }
}
exports.exportGetAllClaims = async (req, res, next, data) => {
    try {
        const key = req.params.key
        let customerData = data
        if (key == 'export_xlsx' || key == 'export_csv') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Claims");
            worksheet.columns = [
                { header: "SL", key: "sl_no" },
                // { header: "Id", key: "id" },
                { header: "Full Name", key: "full_name" },
                { header: "First Name", key: "first_name" },
                { header: "Last Name", key: "last_name" },
                { header: "Email", key: "email" },
                { header: "Mobile Number", key: "mobile" },
                { header: "Zip", key: "billing_zip" },
                { header: "State", key: "billing_state" },
                { header: "City", key: "billing_city" },
                { header: "Address", key: "billing_address1" },
                { header: "Policy No.", key: "policy_number" },
                { header: "Ticket No.", key: "ticket_no" },
                { header: "Claim Ticket Status", key: "claim_ticket_status" },
                { header: "Priority", key: "priority" },
                { header: "Product Name", key: "product_name" },
                { header: "Product Brand", key: "product_brand" },
                { header: "Product Model", key: "product_model" },
                { header: "Product Serial No.", key: "product_serial_no" },
                { header: "Product Purchase Date", key: "product_issue_date" },
                { header: "Source", key: "source" },
                { header: "Created By", key: "created_info" },
                { header: "Updated By", key: "updated_info" },
                { header: "Created On", key: "created_at" },
                { header: "Updated On", key: "updated_at" },
            ]
            worksheet.columns.forEach(function (column, i) {
                var maxLength = 0;
                column["eachCell"]({ includeEmpty: true }, function (cell) {
                    var columnLength = cell.value ? cell.value.toString().length : 20;
                    if (columnLength > maxLength) {
                        maxLength = columnLength;
                    }
                });
                column.width = maxLength < 10 ? 10 : maxLength;
            });
            let counter = 1;
            customerData.forEach(element => {
                element.sl_no = counter;
                element.full_name = `${element.policy_details.first_name} ${element.policy_details.last_name}`
                element.first_name = `${element.policy_details.first_name}`
                element.last_name = `${element.policy_details.last_name}`
                element.billing_zip = `${element.policy_details.billing_zip}`
                element.billing_state = `${element.policy_details.billing_state}`
                element.billing_city = `${element.policy_details.billing_city}`
                element.billing_address1 = `${element.policy_details.billing_address1}`
                element.email = element.policy_details.email ? element.policy_details.email : 'N/A'
                element.mobile = element.policy_details.mobile ? element.policy_details.mobile : 'N/A'
                element.plan_name = element.policy_details.plan_details.plan_name ? element.policy_details.plan_details.plan_name : 'N/A'
                element.policy_number = element.policy_details.policy_number ? element.policy_details.policy_number : 'N/A'
                element.ticket_no = element.ticket_no ? element.ticket_no : 'N/A'
                element.claim_ticket_status = element.claim_ticket_status_details?.ticket_status ? element.claim_ticket_status_details?.ticket_status : 'N/A'
                element.product_name = element.product_details.product_name ? element.product_details.product_name : 'N/A'
                element.product_model = element.product_model ? element.product_model : 'N/A'
                element.product_brand = element.product_brand ? element.product_brand : 'N/A'
                element.product_serial_no = element.product_serial_no ? element.product_serial_no : 'N/A'
                element.priority = element.priority ? element.priority : 'N/A'
                element.issue_details = element.issue_details ? element.issue_details : 'N/A'
                element.created_info = element.created_user_info ? `${element.created_user_info.first_name} ${element.created_user_info.last_name}` : 'N/A'
                element.updated_info = element.updated_user_info ? `${element.updated_user_info.first_name} ${element.updated_user_info.last_name}` : 'N/A'
                if (element.product_issue_date) {
                    element.product_issue_date = element.product_issue_date == null ? 'N/A' : moment(element.product_issue_date).format('MM-DD-YYYY');
                } else {
                    element.product_issue_date = 'N/A';
                }
                // console.log(' element.product_issue_date', element.product_issue_date);
                // element.product_issue_date = element.product_issue_date==null ? 'N/A':moment(element.product_issue_date).format('MM-DD-YYYY');

                element.created_at = element.created_at ? moment(element.created_at).format('MM-DD-YYYY') : 'N/A'
                element.updated_at = element.updated_at ? moment(element.updated_at).format('MM-DD-YYYY') : 'N/A'
                if (element.source == 1) {
                    element.source = 'Backend Team';
                } else if (element.source == 0) {
                    element.source = 'Self Customer';
                }
                worksheet.addRow(element)
                counter++;
            });
            worksheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true };
            })

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )

            res.setHeader("Content-Disposition", `attachment; filename=ClaimList.${key == 'export_csv' ? 'csv' : 'xlsx'}`);
            res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

            return workbook.xlsx.write(res).then(() => {
                res.status(200);
            })
        }
        next()
    } catch (error) {
        next(error)
    }
}
exports.getClaimDetails = async (req, res, next) => {
    try {
        const { claim_id } = req.params;
        const queryOptions = {
            //  attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'updated_at', 'deleted_at', 'user_agent', 'device_id', 'ip_address', 'password'] },
            where: {
                org_id: req.tokenData.org_id,
                claim_id: claim_id
            },
            include: [
                {
                    model: db.productsModel,
                    as: 'product_details',
                    attributes: { exclude: ['created_at', 'deleted_at', 'deleted_by'] }
                },
                {
                    model: db.claimTicketStatusesModel,
                    as: 'claim_ticket_status_details',
                    attributes: ['ticket_status', 'status_description']
                },
                {
                    model: db.policiesModel,
                    as: 'policy_details',
                    //   attributes: ['first_name','policy_id','last_name','email','mobile','policy_number','billing_address1','billing_city','billing_state','billing_zip'],
                    attributes: { exclude: ['created_at', 'deleted_at', 'deleted_by'] },

                    include: {
                        model: db.plansModel,
                        as: 'plan_details',
                        attributes: ['plan_name'],
                    },
                },
                {
                    model: db.claimNotesModel,
                    as: 'claim_note_list',
                    attributes: { exclude: ['deleted_at', 'deleted_by'] }
                },
                {
                    model: db.contractorAssignedJobModel,
                    as: 'assigned_contractors_list',
                    attributes: { exclude: ['deleted_at', 'deleted_by'] },
                    include: {
                        model: db.contractorsModel,
                        as: 'contractor_details',
                        attributes: { exclude: ['created_at', 'deleted_at', 'deleted_by'] }
                    }
                },
                {
                    model: db.productProblemsModel,
                    as: 'product_problem_type',
                    attributes: ['problems']
                },
            ],
        };
        let claimDetails = await claimsService.getClaimDetails(queryOptions);
        if (claimDetails) {
            if (claimDetails.claim_note_list.length > 0) {
                for (let i = 0; i < claimDetails.claim_note_list.length; i++) {
                    const el = claimDetails.claim_note_list[i];
                    if (el.create_user_type == 2) {
                        el.created_user_info = await helper.getUserInfo(parseInt(el.created_by));
                    }

                }
            }
            if (claimDetails.assigned_contractors_list.length > 0) {
                for (let i = 0; i < claimDetails.assigned_contractors_list.length; i++) {
                    const el = claimDetails.assigned_contractors_list[i];
                    contractorAssignedJobService.getContractorObjectFlagsName(el)
                    if (el.create_user_type == 1) {
                        el.created_user_info = await helper.getUserInfo(parseInt(el.created_by));
                    }

                }

            }
            res.status(200).send({ status: 1, message: `Cliam Details fetched successfully`, data: claimDetails });
        } else {
            res.status(200).send({ status: 0, message: `Cliam Details not found` });
        }

    } catch (error) {
        next(error)
    }
}

exports.updateClaim = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { claim_id } = req.params;
        const org_user_id = req.tokenData.org_user_id;
        const isExistClaim = await claimsService.getClaimDetails({ where: { claim_id }, include: { model: db.policiesModel, as: 'policy_details', attributes: ['policy_number', 'first_name', 'last_name'] } });
        if (!isExistClaim) {
            throw new CustomError(`Claim not found`, 400)
        }
        let payload = req.body
        let claimData = {
            product_problem_id: payload.product_problem_id ? payload.product_problem_id : null,
            other_issue_type: payload.other_issue_type,
            issue_details: payload.issue_details,
            priority: payload.priority,
            claim_ticket_statuses_id: payload.claim_ticket_statuses_id,
            product_brand: payload.product_brand,
            product_model: payload.product_model,
            unit_age_month:payload.unit_age_month?payload.unit_age_month:null,
            product_serial_no: payload.product_serial_no,
            product_issue_date: helper.isDate(payload.product_issue_date) ? moment(payload.product_issue_date).format('YYYY-MM-DD') : null,
            update_user_type: 2,
            updated_by: org_user_id,
        }
        if (payload.note) {
            let claimNotesData = {
                claim_id: claim_id,
                org_id: req.tokenData.org_id,
                note: payload.note,
                create_user_type: 2,
                created_by: org_user_id,
            }
            const createdClaimNote = await db.claimNotesModel.create(claimNotesData, { transaction });
        }
        let updateClaim = await claimsService.updateClaim(claim_id, claimData, transaction);
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'CUSTOMER_PORTAL_UPDATE_CLAIM',
            table_name: 'hws_claims',
            source: 1,
            create_user_type: 2,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        if (payload.policy_notes) {
            /** claim note for internal  **/
            let policyNoteData = {
                policy_id: isExistClaim.policy_id,
                customer_id: isExistClaim.customer_id,
                org_id: isExistClaim.org_id,
                notes: payload.policy_notes ? payload.policy_notes : null,
                policy_number: isExistClaim.policy_details.policy_number,
                claim_ticket_no: isExistClaim.ticket_no,
                note_type: 1, //policy level notes=>0, claim level note=>1
                create_user_type: 2,//backend user => 2
                created_by: org_user_id,

            }
            if (payload.assign_to != '' || payload.assign_to != null) {
                policyNoteData.assign_to_org_user_id = payload.assign_to
            }
            const createdPolicyNotes = await policyNoteService.createpolicyNotes(policyNoteData, transaction);
            if (policyNoteData.assign_to_org_user_id) {
                let assgineeUserInfo = await userService.findUserById(policyNoteData.assign_to_org_user_id)
                let noteCreatedByUserInfo = await userService.findUserById(policyNoteData.created_by)
                if (assgineeUserInfo) {
                    let dataObj = {
                        name: `${assgineeUserInfo.first_name} ${assgineeUserInfo.last_name}`,
                        notes: createdPolicyNotes.notes,
                        policy_number: isExistClaim.policy_details.policy_number,
                        claim_ticket_no: isExistClaim.ticket_no,
                        issue_details: payload.issue_details,
                        created_by: `${noteCreatedByUserInfo.first_name} ${noteCreatedByUserInfo.last_name}`,
                        created_at: moment(createdPolicyNotes.created_at).format('MM-DD-YYYY'),


                    }
                    dataObj.company_address = mailConfig.company_address,
                        dataObj.company_phone = mailConfig.company_phone,
                        dataObj.company_email = mailConfig.company_email,
                        dataObj.company_copyright_year = mailConfig.company_copyright_year;
                        dataObj.company_website = mailConfig.company_website;
                        dataObj.company_website_link = mailConfig.company_website_link;
                        dataObj.email_imageUrl =helper.email_imageUrl
                    let clientEmail = process.env.NODE_ENV == 'prod' ? [helper.clientMail] : [];


                    let mailTrigger = await mailService.triggerMail('assgineeTaskNoteTemp.ejs', dataObj, '', assgineeUserInfo.email, 'Attention! A New Claim Task Has Been Assgined, ', '', [], clientEmail);

                }
            }
        }
        auditData.customer_id = isExistClaim.customer_id;
        auditData.user_id = org_user_id;
        auditData.row_id = isExistClaim.claim_id;
        auditData.created_by = org_user_id;

        if (updateClaim) {
            auditData.description = 'claim information updated from admin';
            await helper.updateAuditTrail(auditData,req);
            res.status(200).send({ status: 1, message: `Claim information updated successfully` })
        } else {
            auditData.description = 'unable to update claim information from admin';
            await helper.updateAuditTrail(auditData,req);
            res.status(200).send({ status: 0, message: `Claim information not update` })
        }
        transaction.commit()
    } catch (error) {
        transaction.rollback()
        next(error)
    }
}
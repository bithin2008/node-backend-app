require("dotenv").config();
const config = require("../../../config/config");
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index');
const os = require('os');
const ExcelJS = require('exceljs');
const moment = require("moment");
const bcrypt = require('bcryptjs');
const url = require('url');
const querystring = require('querystring');
const _ = require("lodash");
const fs = require('fs');
const { Op } = require("sequelize");
const helper = require('../../../common/helper');
const customerService = require("../../../services/v1/admin/customerService");
const customerCardService = require("../../../services/v1/admin/customerCardService");
const policyWiseCommissionService = require("../../../services/v1/admin/policyWiseCommissionService");
const policyService = require("../../../services/v1/admin/policyService");
const policyNoteService = require("../../../services/v1/admin/policyNoteService");
const productService = require("../../../services/v1/admin/productService");
const planService = require("../../../services/v1/admin/planService");
const planTermsService = require("../../../services/v1/admin/planTermsService");
const policyDocLogService = require("../../../services/v1/admin/policyDocLogService");
const paymentService = require("../../../services/v1/admin/paymentService");
const policyStatusUpdateLogService = require("../../../services/v1/admin/policyStatusUpdateLogService");
const mailService = require("../../../services/v1/admin/mailService");
const DeviceDetector = require('node-device-detector');
const securePaymentsService = require("../../../services/v1/admin/securePaymentsService");
const customerFunnelService = require('../../../services/v1/frontend/customerFunnelService')
const realestateProfessionalsService = require('../../../services/v1/admin/realestateProfessionalsService')

var ApiContracts = require('authorizenet').APIContracts;
var ApiControllers = require('authorizenet').APIControllers;
const path = require('path');
const jwt = require('jsonwebtoken');
const mailConfig = require("../../../config/mailConfig");


exports.createPolicyByCustomer = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        //const org_user_id = req.tokenData.org_user_id;
        const userAgent = req.headers["user-agent"];
        const password = helper.autoGeneratePassword();
        const detector = new DeviceDetector({
            clientIndexes: true,
            deviceIndexes: true,
            deviceAliasCode: false,
        });
        const deviceRes = detector.detect(userAgent);
        let payload = req.body;
        let policyData = []
        let paymentData = [];
        let policyWiseCommissionData = [];
        let customerCardData = [];
        let policyNoteData = []
        let planInfo = null
        let paymentProfileId = null
        let selectedCardDetails = null
        let policyTerm = null;
        let customerData = {
            org_id: req.headers.org_id ? parseInt(req.headers.org_id) : null,
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            email: req.body.emailId,
            password: await bcrypt.hash(password, 10),
            mobile: req.body.mobileNo,
            zip: req.body.billingZipCode,
            address1: req.body.billingAddress,
            state: req.body.billingState,
            city: req.body.billingCity,
            active_status: 1,
            device_id: deviceRes.device.type,
            os_platform: os.platform(),
            user_agent: userAgent,
            ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            source: 0,// self user
            create_user_type: req.body.createUserType,
            created_by: null,
        }

        let isCustomerExist = await customerService.findCustomerByEmail(customerData.email);
        let createdCustomer;
        if (isCustomerExist) {
            createdCustomer = isCustomerExist;
            createdCustomer.isExistingCustomer = true
        } else {
            createdCustomer = await customerService.createCustomer(customerData, transaction);
            createdCustomer.isExistingCustomer = false
        }
        createdCustomer = helper.getJsonParseData(createdCustomer);

        //  for (let i = 0; i < payload.policyPayamentData.length; i++) {
        // const element = payload.policyPayamentData[i];
        // if (!moment(element.paymentDate).isValid()) {
        //     throw new CustomError('Payment Date is invalid. Please provide the valid payment date')
        // }
        planInfo = await planService.findPlanById(req.body.planId)
        let planTermInfo = await planTermsService.findPlanTermById(parseInt(req.body.planTermId))
        if (!planInfo) {
            throw new CustomError(`plan Information not found`);
        }
        let policyNumber = planInfo.plan_name.toUpperCase().slice(0, 2) + '' + moment().format('MM') * 2 + '' + moment().format('DD') * 2 + '' + moment().format('YYYY') * 2 + '' + createdCustomer.customer_id;
        let checkPolicyNumberIsExist = await policyService.findPolicyByPolicyNumber(policyNumber);
        if (checkPolicyNumberIsExist) {
            policyNumber = policyNumber + Math.floor(Math.random() * 90) + 10 + parseInt(moment().format('ss'));
        }
        let getProducts = await planService.findPlanWithProductByPlanId(req.body.planId);
        getProducts = helper.getJsonParseData(getProducts);;
        if (getProducts.length == 0) {
            throw new CustomError(`Plan product Information not found`);
        }
        planTermResponse = await db.planTermsModel.findOne({ where: { plan_terms_id: req.body.planTermId } });
        planTermResponse = helper.getJsonParseData(planTermResponse);
        // if (planTermInfo.plan_term_month == 1) {
        //     policyTerm = Math.round(30.44);
        // } else {
        //     policyTerm = Math.round(planTermResponse.plan_term_month * 30.44);
        // }
        policyTerm = planTermInfo.plan_term_month
        const policy_start_date = moment().add(30, "days").format('YYYY-MM-DD');
        const policy_expiry_date = moment(policy_start_date).add(policyTerm, "month").format('YYYY-MM-DD');
        const expiry_with_bonus = moment(policy_expiry_date).add(parseInt(req.body.bonusMonth), "month").format('YYYY-MM-DD');
        policyData.push({
            org_id: req.headers.org_id ? parseInt(req.headers.org_id) : null,
            customer_id: createdCustomer.customer_id,
            first_name: req.body.firstName ? req.body.firstName : null,
            last_name: req.body.lastName ? req.body.lastName : null,
            email: req.body.emailId ? req.body.emailId : null,
            mobile: req.body.mobileNo ? req.body.mobileNo : null,
            billing_zip: req.body.zipCode ? req.body.zipCode : null,
            billing_city: req.body.city ? req.body.city : null,
            billing_state: req.body.state ? req.body.state : null,
            billing_address1: req.body.address1 ? req.body.address1 : null,
            policy_number: policyNumber,
            plan_id: req.body.planId ? req.body.planId : null,
            plan_terms_id: req.body.planTermId ? parseInt(req.body.planTermId) : null,
            policy_term: planTermInfo.plan_term,
            policy_term_month: planTermInfo.plan_term_month,
            pcf: planTermInfo.plan_term_month > 12 ? 65 : 75,
            policy_start_date: policy_start_date,
            policy_expiry_date: policy_expiry_date,
            expiry_with_bonus: expiry_with_bonus,
            property_type_id: req.body.propertyType ? req.body.propertyType : null,
            property_size_id: req.body.propertySize ? req.body.propertySize : null,
            order_date: moment().format('YYYY-MM-DD'),
            bonus_month: req.body.bonusMonth,
            policy_amount: req.body.policyAmount,
            addon_coverage_amount: req.body.addonCoverageAmount,
            sub_total_amount: req.body.subTotalAmount,
            tax_type: 3,
            tax_percentage: 0,
            tax_amount: req.body.taxAmount,
            total_price: req.body.totalPrice,
            net_amount: req.body.netAmount,
            policy_status: req.body.paymentType == 3 ? 4 : 2,
            //  policy_status: 2,// Hold
            ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            create_user_type: req.body.createUserType,
            created_by: createdCustomer.customer_id,
            policyProductData: [...req.body.selectdAddOnProducts, ...getProducts],
            payment_status: null,
            source: 0,//self user

        })
        paymentData.push({
            policy_id: null,
            org_id: createdCustomer.org_id,
            customer_id: createdCustomer.customer_id,
            amount: req.body.netAmount,
            state: req.body.billingState ? req.body.billingState : null,
            payment_type: req.body.paymentType ? req.body.paymentType : null,
            acc_holder_name: req.body.bankAccountHolderName ? req.body.bankAccountHolderName : null,
            acc_no: req.body.bankAccountNumber ? req.body.bankAccountNumber : null,
            routing_no: req.body.routingNumber ? req.body.routingNumber : null,
            payment_date: moment().format('YYYY-MM-DD'),
            payment_successfull_date: null,
            card_holder_name: req.body.cardHolderName ? req.body.cardHolderName : null,
            card_number: req.body.cardNumber ? req.body.cardNumber.slice(-4) : null,
            transaction_no: null,
            card_type: null,
            card_expiry_date: req.body.expiryDate ? helper.encodeCrypto(req.body.expiryDate) : null,
            payment_status: 4,
            source: 0,//self user
            create_user_type: req.body.createUserType,
            created_by: createdCustomer.customer_id,
            transaction_response: null,
            recurring_type: planTermInfo.plan_term_month == 1 ? helper.recurring_type.monthly : helper.recurring_type.yearly, //  monthly=>1

        })

        // console.log('createdCustomer.customer_id', createdCustomer.customer_id);
        // policyNoteData.push({
        //     policy_id: null,
        //     org_id: req.headers.org_id ? parseInt(req.headers.org_id) : null,
        //     notes: element.policy_note ? element.policy_note : null,
        //     create_user_type: 2,
        //     created_by: org_user_id,
        // })
        // policyWiseCommissionData.push({
        //     policy_id: null,
        //     org_id: createdCustomer.org_id,
        //     org_user_id: org_user_id,
        //     policy_no: policyNumber,
        //     customer_id: createdCustomer.customer_id,
        //     commission_value: element.commission_value,
        //     commission_type: element.commission_type,
        //     created_by: org_user_id,
        // })
        if (req.body.paymentType == 1) {
            // if paymennt type is credit card
            createdCustomer.authorizeNet_customer_profile_id = createdCustomer.authorizeNet_customer_profile_id
            if (!createdCustomer.authorizeNet_customer_profile_id) {
                // if createdCustomer.authorizeNet_customer_profile_id is null, its means they not have customer profile account in authorize.net
                let customerProfileObj = {
                    customer_id: createdCustomer.customer_id,
                    customer_email: createdCustomer.email,
                    first_name: createdCustomer.first_name ? createdCustomer.first_name : null,
                    last_name: createdCustomer.last_name ? createdCustomer.last_name : null,
                    billing_zip: createdCustomer.zip ? createdCustomer.zip : null,
                    city: createdCustomer.city ? createdCustomer.city : null,
                    state: createdCustomer.state ? createdCustomer.state : null,
                    address: createdCustomer.address1 ? createdCustomer.address1 : null,
                    card_number: req.body.cardNumber ? req.body.cardNumber : null,
                    card_expiry_date: req.body.expiryDate ? req.body.expiryDate : null,
                    card_cvv: req.body.cardCode ? req.body.cardCode : null,
                    policy_no: policyNumber,
                    plan_name: planInfo.plan_name,
                    plan_term: planTermInfo.plan_term,
                    tax_amount: req.body.taxAmount,
                    net_amount: req.body.netAmount,
                    policy_start_date: policy_start_date,
                    policy_expiry_date: policy_expiry_date,
                    expiry_with_bonus: expiry_with_bonus,
                }
                const createCustomerProfileResponse = await securePaymentsService.createCustomerProfile(customerProfileObj);
                //  console.log('createCustomerProfile', createCustomerProfileResponse);
                if (createCustomerProfileResponse) {
                    createdCustomer.authorizeNet_customer_profile_id = createCustomerProfileResponse.getCustomerProfileId();
                    const paymentProfileIdObject = createCustomerProfileResponse.getCustomerPaymentProfileIdList().getNumericString()[0];
                    // Extract the actual ID from the object
                    paymentProfileId = paymentProfileIdObject.toString();
                    if (createdCustomer.authorizeNet_customer_profile_id) {
                        // The response contains the expected structure and customerProfileId
                        const updateCustomerProfileId = await customerService.updateCustomer(createdCustomer.customer_id, {
                            authorizeNet_customer_profile_id: createdCustomer.authorizeNet_customer_profile_id,
                        }, transaction);
                    } else {
                        throw new CustomError('Provided Card Information is Invalid.');
                    }
                } else {
                    throw new CustomError('Invalid response from Authorize.Net');
                }
            }
            let isExistCard = await customerCardService.getCustomerAllSavedCards({ where: { customer_id: createdCustomer.customer_id } })
            let customerPaymentProfileObj = {
                authorizeNet_customer_profile_id: createdCustomer.authorizeNet_customer_profile_id,
                customer_id: createdCustomer.customer_id,
                customer_email: createdCustomer.email,
                first_name: req.body.firstName ? req.body.firstName : null,
                last_name: req.body.lastName ? req.body.lastName : null,
                billing_zip: req.body.billingZipCode ? req.body.billingZipCode : null,
                billing_city: req.body.billingCity ? req.body.billingCity : null,
                billing_state: req.body.billingState ? req.body.billingState : null,
                billing_address: req.body.billingAddress ? req.body.billingAddress : null,
                card_number: req.body.cardNumber ? req.body.cardNumber : null,
                card_expiry_date: req.body.expiryDate ? req.body.expiryDate : null,
                card_cvv: req.body.cardCode ? req.body.cardCode : null,
                policy_no: policyNumber,
                plan_name: planInfo.plan_name,
                plan_term: planTermInfo.plan_term,
                tax_amount: req.body.taxAmount,
                net_amount: req.body.netAmount,
                policy_start_date: policy_start_date,
                policy_expiry_date: policy_expiry_date,
                expiry_with_bonus: expiry_with_bonus,
            }
            if (isExistCard.length == 0) {
                // if customer dosenot have any card stored previously
                customerCardData.push({
                    org_id: createdCustomer.org_id,
                    customer_id: createdCustomer.customer_id,
                    card_type: null,
                    card_holder_name: req.body.cardHolderName ? req.body.cardHolderName : null,
                    card_number: req.body.cardNumber ? helper.encodeCrypto(req.body.cardNumber) : null,
                    card_last_4_digit: req.body.cardNumber ? req.body.cardNumber.slice(-4) : null,
                    card_expiry_date: req.body.expiryDate ? helper.encodeCrypto(req.body.expiryDate) : null,
                    ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
                    authorizeNet_payment_profile_id: paymentProfileId ? paymentProfileId : null,
                    create_user_type: req.body.createUserType,
                    created_by: createdCustomer.customer_id,
                })
                customerCardData[0].primary_card = true;
                if (!paymentProfileId) {
                    // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                    const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                    paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
                }
            } else {

                // Verify that the given card's expiry date and card number match those on the customer's stored cards. (customer_card table).
                const matchedExpDate = _.find(isExistCard, (obj) => {
                    return obj.card_expiry_date == req.body.expiryDate && obj.card_number == req.body.cardNumber;
                });

                if (!matchedExpDate) {
                    // if customer provide different card details which not stored in customer_card table
                    if (!paymentProfileId) {
                        // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                        const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                        paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
                    }

                    customerCardData.push({
                        org_id: createdCustomer.org_id,
                        customer_id: createdCustomer.customer_id,
                        card_type: null,
                        authorizeNet_payment_profile_id: paymentProfileId ? paymentProfileId : null,
                        card_holder_name: req.body.cardHolderName ? req.body.cardHolderName : null,
                        card_number: req.body.cardNumber ? helper.encodeCrypto(req.body.cardNumber) : null,
                        card_last_4_digit: req.body.cardNumber ? req.body.cardNumber.slice(-4) : null,
                        card_expiry_date: req.body.expiryDate ? helper.encodeCrypto(req.body.expiryDate) : null,
                        ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
                        create_user_type: req.body.createUserType,
                        created_by: createdCustomer.customer_id,
                    })
                } else {
                    // if customer provide same card details which already stored in customer_card table
                    customerCardData.push({})
                    selectedCardDetails = await customerCardService.getCustomerCardById({ where: { customer_id: createdCustomer.customer_id, customer_card_id: matchedExpDate.customer_card_id } })
                    paymentProfileId = selectedCardDetails.authorizeNet_payment_profile_id ? selectedCardDetails.authorizeNet_payment_profile_id : null
                }
                if (!paymentProfileId) {
                    // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                    const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                    paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
                }
            }

        }

        // AUDIT TRAIL PAYLOAD
        let auditData = {
            customer_id: createdCustomer.customer_id,
            name: req.body.firstName + ' ' + req.body.lastName,
            email: req.body.emailId ? req.body.emailId : null,
            section: 'POLICY',
            table_name: 'hws_policies',
            source: 0,
            create_user_type: 1,
            created_by: createdCustomer.customer_id,
            device_id: createdCustomer.device_id,
        }
        //  if (moment().format('YYYY-MM-DD') == moment(element.paymentDate).format('YYYY-MM-DD')) {
        // if payment date is same day
        if (req.body.paymentType == 1) {
            // credit card payment
            let paymentObj = {
                authorizeNet_customer_profile_id: createdCustomer.authorizeNet_customer_profile_id,
                authorizeNet_payment_profile_id: paymentProfileId,
                customer_id: createdCustomer.customer_id,
                customer_email: createdCustomer.email,
                first_name: req.body.firstName ? req.body.firstName : null,
                last_name: req.body.lastName ? req.body.lastName : null,
                billing_zip: req.body.billingZipCode ? req.body.billingZipCode : null,
                billing_city: req.body.billingCity ? req.body.billingCity : null,
                billing_state: req.body.billingState ? req.body.billingState : null,
                billing_address: req.body.billingAddress ? req.body.billingAddress : null,
                card_number: req.body.cardNumber ? req.body.cardNumber : req.body.cardNumber,
                card_expiry_date: req.body.expiryDate ? req.body.expiryDate : null,
                card_cvv: req.body.cardCode ? req.body.cardCode : null,
                policy_no: policyNumber,
                plan_name: planInfo.plan_name,
                plan_term: planTermInfo.plan_term,
                tax_amount: req.body.taxAmount,
                net_amount: req.body.netAmount,
                chargable_amount: req.body.netAmount,
                policy_start_date: policy_start_date,
                policy_expiry_date: policy_expiry_date,
                expiry_with_bonus: expiry_with_bonus,
                recurring_type: planTermInfo.plan_term_month == 1 ? 1 : 0, //  monthly=>1
            }

            const chargeCustomerProfileResponse = await securePaymentsService.chargeCustomerProfile(paymentObj);
            policyData[0].transactionResponse = chargeCustomerProfileResponse//.getTransactionResponse()
            paymentData[0].transaction_response = chargeCustomerProfileResponse//.getTransactionResponse()
            const responseObject = chargeCustomerProfileResponse;
            const resultCode = responseObject?.messages?.resultCode;
            const code = responseObject?.messages?.message[0]?.code;
            const transactionResponse =  responseObject?.transactionResponse;
            const transactionResponseCode =  responseObject?.transactionResponse?.responseCode;
            if (resultCode === 'Ok' && code === 'I00001' && transactionResponse && (transactionResponseCode== 1|| transactionResponseCode== 4)) {
                // console.log('chargeCustomerProfileResponse');

                // if (chargeCustomerProfileResponse.getTransactionResponse() && chargeCustomerProfileResponse.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
                // console.log('chargeCustomerProfileResponse 1');
                // Payment was successful
                if (customerCardData[0] && Object.keys(customerCardData[0]).length !== 0) {
                    customerCardData[0].card_type = chargeCustomerProfileResponse.transactionResponse.accountType
                    const createdCustomerCard = await customerCardService.createCustomerCard(customerCardData[0], transaction);
                }
                paymentData[0].transaction_no = chargeCustomerProfileResponse.getTransactionResponse().getTransId();
                paymentData[0].card_type = chargeCustomerProfileResponse.transactionResponse.accountType
                paymentData[0].payment_status = 1 //success=>1
                policyData[0].payment_status = 1 // success=>1
                paymentData[0].payment_successfull_date = moment().format('YYYY-MM-DD')
            } else {
                paymentData[0].payment_status = 2 //failed=>2
                policyData[0].payment_status = 2 //failed=>2
                auditData.description = 'policy creation failed due to payment failed';
                await helper.updateAuditTrail(auditData, req)
                // Payment failed or encountered an issue
                throw new CustomError(`Payment failed! ${chargeCustomerProfileResponse.getTransactionResponse().getErrors() ? chargeCustomerProfileResponse.getTransactionResponse().getErrors().getError()[0].getErrorText() : chargeCustomerProfileResponse.messages.message[0].text}`, 402)
            }
        } else if (req.body.paymentType == 2) {
            // bank payment
            let paymentObj = {
                first_name: req.body.firstName ? req.body.firstName : null,
                last_name: req.body.lastName ? req.body.lastName : null,
                billing_zip: req.body.billingZipCode ? req.body.billingZipCode : null,
                billing_city: req.body.billingCity ? req.body.billingCity : null,
                billing_state: req.body.billingState ? req.body.billingState : null,
                billing_address: req.body.billingAddress ? req.body.billingAddress : null,
                acc_holder_name: req.body.bankAccountHolderName ? req.body.bankAccountHolderName : null,
                acc_no: req.body.bankAccountNumber ? req.body.bankAccountNumber : null,
                routing_no: req.body.routingNumber ? req.body.routingNumber : null,
                policy_no: policyNumber,
                plan_name: planInfo.plan_name,
                plan_term: planTermInfo.plan_term,
                tax_amount: req.body.taxAmount,
                net_amount: req.body.netAmount,
                policy_start_date: policy_start_date,
                policy_expiry_date: policy_expiry_date,
                expiry_with_bonus: expiry_with_bonus,
            }
            const transactionResponse = await securePaymentsService.debitBankAccount(req, res, next, paymentObj);
            policyData[0].transactionResponse = transactionResponse
            paymentData[0].transaction_response = transactionResponse
            if (transactionResponse.transactionResponse && transactionResponse.transactionResponse.responseCode === '1') {
                // Payment was successful
                paymentData[0].transaction_no = transactionResponse.getTransactionResponse().getTransId();
                paymentData[0].payment_status = 1 //success=>1
                policyData[0].payment_status = 1 // success=>1
            } else {
                // Payment failed or encountered an issue
                paymentData[0].payment_status = 2 //failed=>2
                policyData[0].payment_status = 2 //failed=>2
                auditData.description = 'policy creation failed due to payment failed';
                await helper.updateAuditTrail(auditData, req)
                throw new CustomError(`Payment failed! ${transactionResponse.getTransactionResponse().getErrors() ? transactionResponse.getTransactionResponse().getErrors().getError()[0].getErrorText() : transactionResponse.messages.message[0].text}`, 402)
            }
        } else if (req.body.paymentType == 3) {
            /* Escrow Payment */
            paymentData[0].payment_status = 4// pending=>4
            policyData[0].payment_status = 4// pending=>4
        }
        //  }
        // };
        let updateLeadData = {
            billing_zip: req.body.billingZipCode,
            billing_state: req.body.billingState,
            billing_city: req.body.billingCity,
            billing_address1: req.body.billingAddress
        }
        const updateres = await customerFunnelService.updateLeadByLeadId(req.body.leadId, createdCustomer.org_id, updateLeadData);

        await Promise.all(policyData.map(async (data, i) => {
            try {
                if (policyData[0].payment_status == 4 || policyData[0].payment_status == 1) {
                    // Payment was successful
                    // Create the policy record
                    const createdPolicy = await policyService.createPolicy(data, transaction);
                    // Create an array of policy products associated with the policy
                    // let mailTrigger = await mailService.triggerMail('mailError.ejs', JSON.stringify(data.policyProductData), '', 'bithin@sundewsolutions.com', 'productData','');

                    auditData.row_id = createdPolicy.policy_id;
                    let policyProductsData = data.policyProductData.map((productData) => ({
                        org_id: createdPolicy.org_id,
                        policy_id: createdPolicy.policy_id, // Associate the policy product with the policy
                        product_id: productData ? productData.product_id : null,
                        product_name: productData ? productData.product_name : null,
                        monthly_price: productData ? productData.monthly_price : null,
                        yearly_price: productData ? productData.yearly_price : null,
                        product_quantity: 1,
                        create_user_type: req.body.createUserType,
                        created_by: createdCustomer.customer_id
                    }));
                    policyProductsData = _.uniq(policyProductsData);
                    paymentData[0].policy_id = createdPolicy.policy_id;

                    // Bulk insert the policy products associated with the policy
                    if (policyProductsData.length > 0) {
                        let createdPolicyProducts = await planService.createBulkPolicyProducts(policyProductsData, transaction);
                        if (createdPolicyProducts) {
                            if (paymentData.length == 0) {
                                throw new CustomError(`Payment Information not found`);
                            }
                            let createdPayments = await paymentService.createPayment(paymentData[0], transaction);
                            if (createdPolicy.policy_term_month == 1) {
                                for (let p = 0; p < 12; p++) {
                                    const nextPaymentDate = moment(paymentData[0].payment_date).add(1, 'months');
                                    paymentData[0].payment_date = adjustDateForLeapYear(nextPaymentDate);
                                    if (moment().format('YYYY-MM-DD') != moment(paymentData[0].payment_date).format('YYYY-MM-DD')) {
                                        paymentData[0].transaction_no = null;
                                        policyData[0].transactionResponse = null
                                        paymentData[0].transaction_response = null
                                        paymentData[0].payment_status = 4// pending=>4
                                        policyData[0].payment_status = 4// pending=>4
                                    }
                                    createdPayments = await paymentService.createPayment(paymentData[0], transaction);
                                }
                            }
                            //  const createdPolicyWiseCommission = await policyWiseCommissionService.createpolicyWiseCommission(policyWiseCommissionData[i], transaction);
                            //  const createdPolicyNotes = await policyNoteService.createpolicyNotes(policyNoteData[i], transaction);


                            if (createdPayments) {
                                let dataObj = {
                                    base_url: `${helper.website_baseUrl}`,
                                    customer_email: createdCustomer.email,
                                    customer_password: password,
                                    customer_name: createdCustomer.first_name + ' ' + createdCustomer.last_name,
                                    customer_plan: planInfo.plan_name,
                                    company_address: mailConfig.company_address,
                                    company_phone: mailConfig.company_phone,
                                    company_email: mailConfig.company_email,
                                    company_copyright_year: mailConfig.company_copyright_year,
                                    company_website: mailConfig.company_website,
                                    company_website_link: mailConfig.company_website_link,
                                    email_imageUrl: helper.email_imageUrl
                                }

                                //  let mailTrigger = await mailService.triggerMail('newCustomerTemp.ejs', dataObj, '', createdCustomer.email, 'Customer created Successfully. Welcome to our Family!');
                                let mailTrigger = await mailService.triggerMail(createdCustomer.isExistingCustomer ? 'policyPurchaseTemp.ejs' : 'newCustomerTemp.ejs', dataObj, '', createdCustomer.email, 'Policy purchased Successfully. Welcome to our Family!');
                                if (mailTrigger) {
                                    res.status(200).send({
                                        status: 1,
                                        message: "Policy Created Successfully.",
                                    });
                                } else {
                                    res.status(200).send({ status: 1, message: `The mail server could not deliver mail to ${createdCustomer.email}. Please check your email id` })
                                    //  throw new CustomError (`The mail server could not deliver mail to ${createdCustomer.email}. Please check your email id`,500)
                                }
                                auditData.description = 'policy created successfully from website funnel';
                                await helper.updateAuditTrail(auditData, req)

                                let lead_data = {
                                    is_conversion_done: 1
                                }
                                await db.leadsModel.update(lead_data, { where: { lead_id: req.body.leadId, org_id: createdCustomer.org_id } })
                                transaction.commit();
                            } else {
                                auditData.description = 'policy creation failed';
                                await helper.updateAuditTrail(auditData, req)
                                throw new CustomError(`Something went wrong! , please try again later`);
                            }
                        }
                    }
                } else {
                    auditData.description = 'policy creation failed due to payment failed';
                    await helper.updateAuditTrail(auditData, req)
                    throw new CustomError(`Payment failed or encountered an issue`, 402)
                    // Payment failed or encountered an issue
                    // Handle the failure scenario here
                }
            } catch (error) {
                await transaction.rollback();
                next(error);
            }
        }));



    } catch (error) {
        await transaction.rollback()
        next(error)
    }
}

exports.createPolicyByCustomerFromCUPO = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const customer_id = req.tokenData.customer_id;
        const userAgent = req.headers["user-agent"];
        const password = helper.autoGeneratePassword();
        const detector = new DeviceDetector({
            clientIndexes: true,
            deviceIndexes: true,
            deviceAliasCode: false,
        });
        const deviceRes = detector.detect(userAgent);
        let payload = req.body;
        let policyData = []
        let paymentData = [];
        let policyWiseCommissionData = [];
        let customerCardData = [];
        let policyNoteData = []
        let planInfo = null
        let paymentProfileId = null
        let selectedCardDetails = null
        let policyTerm = null;
        // let customerData = {
        //     org_id: req.headers.org_id ? parseInt(req.headers.org_id) : null,
        //     first_name: req.body.firstName,
        //     last_name: req.body.lastName,
        //     email: req.body.emailId,
        //     password: await bcrypt.hash(password, 10),
        //     mobile: req.body.mobileNo,
        //     zip: req.body.zipCode,
        //     address1: req.body.billingAddress,
        //     state: req.body.state,
        //     city: req.body.city,
        //     active_status: 1,
        //     device_id: deviceRes.device.type,
        //     os_platform: os.platform(),
        //     user_agent: userAgent,
        //     ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        //     source: 0,// self user
        //     create_user_type: req.body.createUserType,
        //     created_by: null,
        // }

        let isCustomerExist = await customerService.findCustomerById(customer_id);
        let createdCustomer;
        if (isCustomerExist) {
            createdCustomer = isCustomerExist;
            createdCustomer.isExistingCustomer = true
        } else {
            throw new CustomError(`Sory! Customer Information not found`);
        }
        createdCustomer = helper.getJsonParseData(createdCustomer);

        //  for (let i = 0; i < payload.policyPayamentData.length; i++) {
        // const element = payload.policyPayamentData[i];
        // if (!moment(element.paymentDate).isValid()) {
        //     throw new CustomError('Payment Date is invalid. Please provide the valid payment date')
        // }
        planInfo = await planService.findPlanById(req.body.planId)
        let planTermInfo = await planTermsService.findPlanTermById(parseInt(req.body.planTermId))
        if (!planInfo) {
            throw new CustomError(`plan Information not found`);
        }
        let policyNumber = planInfo.plan_name.toUpperCase().slice(0, 2) + '' + moment().format('MM') * 2 + '' + moment().format('DD') * 2 + '' + moment().format('YYYY') * 2 + '' + createdCustomer.customer_id;
        let checkPolicyNumberIsExist = await policyService.findPolicyByPolicyNumber(policyNumber);
        if (checkPolicyNumberIsExist) {
            policyNumber = policyNumber + Math.floor(Math.random() * 90) + 10 + parseInt(moment().format('ss'));
        }
        let getProducts = await planService.findPlanWithProductByPlanId(req.body.planId);
        getProducts = helper.getJsonParseData(getProducts);
        if (getProducts.length == 0) {
            throw new CustomError(`Plan product Information not found`);
        }
        planTermResponse = await db.planTermsModel.findOne({ where: { plan_terms_id: req.body.planTermId } });
        planTermResponse = helper.getJsonParseData(planTermResponse);

        // if (planTermInfo.plan_term_month == 1) {
        //     policyTerm = Math.round(30.44);
        // } else {
        //     policyTerm = Math.round(planTermResponse.plan_term_month * 30.44);
        // }
        policyTerm = planTermInfo.plan_term_month
        const policy_start_date = moment().add(30, "days").format('YYYY-MM-DD');
        const policy_expiry_date = moment(policy_start_date).add(policyTerm, "month").format('YYYY-MM-DD');
        const expiry_with_bonus = moment(policy_expiry_date).add(parseInt(req.body.bonusMonth), "month").format('YYYY-MM-DD');
        policyData.push({
            org_id: req.headers.org_id ? parseInt(req.headers.org_id) : null,
            customer_id: createdCustomer.customer_id,
            first_name: req.body.firstName ? req.body.firstName : null,
            last_name: req.body.lastName ? req.body.lastName : null,
            email: req.body.emailId ? req.body.emailId : null,
            mobile: req.body.mobileNo ? req.body.mobileNo : null,
            billing_zip: req.body.zipCode ? req.body.zipCode : null,
            billing_city: req.body.city ? req.body.city : null,
            billing_state: req.body.state ? req.body.state : null,
            billing_address1: req.body.address1 ? req.body.address1 : null,
            policy_number: policyNumber,
            plan_id: req.body.planId ? req.body.planId : null,
            plan_terms_id: req.body.planTermId ? parseInt(req.body.planTermId) : null,
            policy_term: planTermInfo.plan_term,
            policy_term_month: planTermInfo.plan_term_month,
            pcf: planTermInfo.plan_term_month > 12 ? 65 : 75,
            policy_start_date: policy_start_date,
            policy_expiry_date: policy_expiry_date,
            expiry_with_bonus: expiry_with_bonus,
            property_type_id: req.body.propertyType ? req.body.propertyType : null,
            property_size_id: req.body.propertySize == 0 ? 0 : req.body.propertySize,
            order_date: moment().format('YYYY-MM-DD'),
            bonus_month: req.body.bonusMonth,
            policy_amount: req.body.policyAmount,
            addon_coverage_amount: req.body.addonCoverageAmount,
            sub_total_amount: req.body.subTotalAmount,
            tax_type: 3,
            tax_percentage: 0,
            tax_amount: req.body.taxAmount,
            total_price: req.body.totalPrice,
            net_amount: req.body.netAmount,
            policy_status: req.body.paymentType == 3 ? 4 : 2,
            //  policy_status: 2,// Hold
            ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            create_user_type: req.body.createUserType,
            created_by: createdCustomer.customer_id,
            policyProductData: [...req.body.selectdAddOnProducts, ...getProducts],
            payment_status: null,
            source: 0,//self user

        })
        paymentData.push({
            policy_id: null,
            org_id: createdCustomer.org_id,
            customer_id: createdCustomer.customer_id,
            amount: req.body.netAmount,
            state: req.body.billingState ? req.body.billingState : null,
            payment_type: req.body.paymentType ? req.body.paymentType : null,
            acc_holder_name: req.body.bankAccountHolderName ? req.body.bankAccountHolderName : null,
            acc_no: req.body.bankAccountNumber ? req.body.bankAccountNumber : null,
            routing_no: req.body.routingNumber ? req.body.routingNumber : null,
            payment_date: moment().format('YYYY-MM-DD'),
            payment_successfull_date: null,
            card_holder_name: req.body.cardHolderName ? req.body.cardHolderName : null,
            card_number: req.body.cardNumber ? req.body.cardNumber.slice(-4) : null,
            transaction_no: null,
            card_type: null,
            card_expiry_date: req.body.expiryDate ? helper.encodeCrypto(req.body.expiryDate) : null,
            payment_status: 4,
            source: 0,//self user
            create_user_type: req.body.createUserType,
            created_by: createdCustomer.customer_id,
            transaction_response: null,
            recurring_type: planTermInfo.plan_term_month == 1 ? 1 : 0 //  monthly=>1

        })

        console.log('createdCustomer.customer_id', createdCustomer.customer_id);
        // policyNoteData.push({
        //     policy_id: null,
        //     org_id: req.headers.org_id ? parseInt(req.headers.org_id) : null,
        //     notes: element.policy_note ? element.policy_note : null,
        //     create_user_type: 2,
        //     created_by: org_user_id,
        // })
        // policyWiseCommissionData.push({
        //     policy_id: null,
        //     org_id: createdCustomer.org_id,
        //     org_user_id: org_user_id,
        //     policy_no: policyNumber,
        //     customer_id: createdCustomer.customer_id,
        //     commission_value: element.commission_value,
        //     commission_type: element.commission_type,
        //     created_by: org_user_id,
        // })

        // AUDIT TRAIL PAYLOAD
        let auditData = {
            customer_id: createdCustomer.customer_id,
            name: req.body.firstName + ' ' + req.body.lastName,
            email: req.body.emailId ? req.body.emailId : null,
            section: 'POLICY',
            table_name: 'hws_policies',
            source: 0,
            create_user_type: 1,
            created_by: createdCustomer.customer_id,
            device_id: createdCustomer.device_id,
        }
        if (req.body.paymentType == 1) {
            // if paymennt type is credit card
            createdCustomer.authorizeNet_customer_profile_id = createdCustomer.authorizeNet_customer_profile_id
            if (!createdCustomer.authorizeNet_customer_profile_id) {
                // if createdCustomer.authorizeNet_customer_profile_id is null, its means they not have customer profile account in authorize.net
                let customerProfileObj = {
                    customer_id: createdCustomer.customer_id,
                    customer_email: createdCustomer.email,
                    first_name: createdCustomer.first_name ? createdCustomer.first_name : null,
                    last_name: createdCustomer.last_name ? createdCustomer.last_name : null,
                    billing_zip: createdCustomer.zip ? createdCustomer.zip : null,
                    city: createdCustomer.city ? createdCustomer.city : null,
                    state: createdCustomer.state ? createdCustomer.state : null,
                    address: createdCustomer.address1 ? createdCustomer.address1 : null,
                    card_number: req.body.cardNumber ? req.body.cardNumber : null,
                    card_expiry_date: req.body.expiryDate ? req.body.expiryDate : null,
                    card_cvv: req.body.cardCode ? req.body.cardCode : null,
                    policy_no: policyNumber,
                    plan_name: planInfo.plan_name,
                    plan_term: planTermInfo.plan_term,
                    tax_amount: req.body.taxAmount,
                    net_amount: req.body.netAmount,
                    policy_start_date: policy_start_date,
                    policy_expiry_date: policy_expiry_date,
                    expiry_with_bonus: expiry_with_bonus,
                }
                console.log('authorizeNet_customer_profile_id', createdCustomer.authorizeNet_customer_profile_id);
                console.log('customerProfileObj', customerProfileObj);
                // console.log('createCustomerProfile', createCustomerProfileResponse);

                const createCustomerProfileResponse = await securePaymentsService.createCustomerProfile(customerProfileObj);

                if (createCustomerProfileResponse) {
                    createdCustomer.authorizeNet_customer_profile_id = createCustomerProfileResponse.getCustomerProfileId();
                    const paymentProfileIdObject = createCustomerProfileResponse.getCustomerPaymentProfileIdList().getNumericString()[0];
                    // Extract the actual ID from the object
                    paymentProfileId = paymentProfileIdObject.toString();
                    if (createdCustomer.authorizeNet_customer_profile_id) {
                        // The response contains the expected structure and customerProfileId
                        const updateCustomerProfileId = await customerService.updateCustomer(createdCustomer.customer_id, {
                            authorizeNet_customer_profile_id: createdCustomer.authorizeNet_customer_profile_id,
                        }, transaction);
                    } else {
                        auditData.description = 'policy creation failed due to invalid credit_card';
                        await helper.updateAuditTrail(auditData, req)
                        throw new CustomError('Provided Card Information is Invalid.');
                    }
                } else {
                    auditData.description = 'policy creation failed due to invalid response from authorize.net';
                    await helper.updateAuditTrail(auditData, req)
                    throw new CustomError('Invalid response from Authorize.Net');
                }
            }
            let isExistCard = await customerCardService.getCustomerAllSavedCards({ where: { customer_id: createdCustomer.customer_id } })
            let customerPaymentProfileObj = {
                authorizeNet_customer_profile_id: createdCustomer.authorizeNet_customer_profile_id,
                customer_id: createdCustomer.customer_id,
                customer_email: createdCustomer.email,
                first_name: req.body.firstName ? req.body.firstName : null,
                last_name: req.body.lastName ? req.body.lastName : null,
                billing_zip: req.body.billingZipCode ? req.body.billingZipCode : null,
                billing_city: req.body.billingCity ? req.body.billingCity : null,
                billing_state: req.body.billingState ? req.body.billingState : null,
                billing_address: req.body.billingAddress ? req.body.billingAddress : null,
                card_number: req.body.cardNumber ? req.body.cardNumber : null,
                card_expiry_date: req.body.expiryDate ? req.body.expiryDate : null,
                card_cvv: req.body.cardCode ? req.body.cardCode : null,
                policy_no: policyNumber,
                plan_name: planInfo.plan_name,
                plan_term: planTermInfo.plan_term,
                tax_amount: req.body.taxAmount,
                net_amount: req.body.netAmount,
                policy_start_date: policy_start_date,
                policy_expiry_date: policy_expiry_date,
                expiry_with_bonus: expiry_with_bonus,
            }
            if (isExistCard.length == 0) {
                // if customer dosenot have any card stored previously
                customerCardData.push({
                    org_id: createdCustomer.org_id,
                    customer_id: createdCustomer.customer_id,
                    card_type: null,
                    card_holder_name: req.body.cardHolderName ? req.body.cardHolderName : null,
                    card_number: req.body.cardNumber ? helper.encodeCrypto(req.body.cardNumber) : null,
                    card_last_4_digit: req.body.cardNumber ? req.body.cardNumber.slice(-4) : null,
                    card_expiry_date: req.body.expiryDate ? helper.encodeCrypto(req.body.expiryDate) : null,
                    ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
                    authorizeNet_payment_profile_id: paymentProfileId ? paymentProfileId : null,
                    create_user_type: req.body.createUserType,
                    created_by: createdCustomer.customer_id,
                })
                customerCardData[0].primary_card = true;
                if (!paymentProfileId) {
                    // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                    const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                    paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
                }
            } else {

                // Verify that the given card's expiry date and card number match those on the customer's stored cards. (customer_card table).
                const matchedExpDate = _.find(isExistCard, (obj) => {
                    return obj.card_expiry_date == req.body.expiryDate && obj.card_number == req.body.cardNumber;
                });

                console.log('matchedExpDate', matchedExpDate);
                if (!matchedExpDate) {
                    // if customer provide different card details which not stored in customer_card table
                    if (!paymentProfileId) {
                        // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                        let cardObj = {
                            card_holder_name: req.body.cardHolderName ? req.body.cardHolderName : null,
                            card_number: req.body.cardNumber ? req.body.cardNumber : null,
                            card_expiry_date: req.body.expiryDate ? req.body.expiryDate : null,
                            card_cvv: req.body.cardCode ? req.body.cardCode : null,

                        }
                        // const authorizeCreditCard = await securePaymentsService.authorizeCreditCard(cardObj);
                        console.log('customerPaymentProfileObj', customerPaymentProfileObj);
                        const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                        paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
                    }

                    customerCardData.push({
                        org_id: createdCustomer.org_id,
                        customer_id: createdCustomer.customer_id,
                        card_type: null,
                        authorizeNet_payment_profile_id: paymentProfileId ? paymentProfileId : null,
                        card_holder_name: req.body.cardHolderName ? req.body.cardHolderName : null,
                        card_number: req.body.cardNumber ? helper.encodeCrypto(req.body.cardNumber) : null,
                        card_last_4_digit: req.body.cardNumber ? req.body.cardNumber.slice(-4) : null,
                        card_expiry_date: req.body.expiryDate ? helper.encodeCrypto(req.body.expiryDate) : null,
                        ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
                        create_user_type: req.body.createUserType,
                        created_by: createdCustomer.customer_id,
                    })
                } else {
                    // if customer provide same card details which already stored in customer_card table
                    customerCardData.push({})
                    selectedCardDetails = await customerCardService.getCustomerCardById({ where: { customer_id: createdCustomer.customer_id, customer_card_id: matchedExpDate.customer_card_id } })
                    paymentProfileId = selectedCardDetails.authorizeNet_payment_profile_id ? selectedCardDetails.authorizeNet_payment_profile_id : null
                }
                if (!paymentProfileId) {
                    // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                    const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                    paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
                }
            }

        }
        //  if (moment().format('YYYY-MM-DD') == moment(element.paymentDate).format('YYYY-MM-DD')) {
        // if payment date is same day
        if (req.body.paymentType == 1) {
            // credit card payment
            let paymentObj = {
                authorizeNet_customer_profile_id: createdCustomer.authorizeNet_customer_profile_id,
                authorizeNet_payment_profile_id: selectedCardDetails ? selectedCardDetails.authorizeNet_payment_profile_id : paymentProfileId,
                customer_id: createdCustomer.customer_id,
                customer_email: createdCustomer.email,
                first_name: req.body.firstName ? req.body.firstName : null,
                last_name: req.body.lastName ? req.body.lastName : null,
                billing_zip: req.body.billingZipCode ? req.body.billingZipCode : null,
                billing_city: req.body.billingCity ? req.body.billingCity : null,
                billing_state: req.body.billingState ? req.body.billingState : null,
                billing_address: req.body.billingAddress ? req.body.billingAddress : null,
                card_number: selectedCardDetails ? selectedCardDetails.card_number : req.body.cardNumber,
                card_expiry_date: selectedCardDetails ? selectedCardDetails.card_expiry_date : req.body.expiryDate,
                card_cvv: selectedCardDetails ? null : req.body.cardCode,
                policy_no: policyNumber,
                plan_name: planInfo.plan_name,
                plan_term: planTermInfo.plan_term,
                tax_amount: req.body.taxAmount,
                net_amount: req.body.netAmount,
                chargable_amount: req.body.netAmount,
                policy_start_date: policy_start_date,
                policy_expiry_date: policy_expiry_date,
                expiry_with_bonus: expiry_with_bonus,
                recurring_type: planTermInfo.plan_term_month == 1 ? 1 : 0, //  monthly=>1
            }
            const chargeCustomerProfileResponse = await securePaymentsService.chargeCustomerProfile(paymentObj);
            policyData[0].transactionResponse = chargeCustomerProfileResponse//.getTransactionResponse()
            paymentData[0].transaction_response = chargeCustomerProfileResponse//.getTransactionResponse()
            const responseObject = chargeCustomerProfileResponse;
            const resultCode = responseObject?.messages?.resultCode;
            const code = responseObject?.messages?.message[0]?.code;
            const transactionResponse =  responseObject?.transactionResponse;
            const transactionResponseCode =  responseObject?.transactionResponse?.responseCode;
            if (resultCode === 'Ok' && code === 'I00001' && transactionResponse && (transactionResponseCode== 1|| transactionResponseCode== 4)) {
                // if (chargeCustomerProfileResponse.getTransactionResponse() && chargeCustomerProfileResponse.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
                // Payment was successful
                if (customerCardData[0] && Object.keys(customerCardData[0]).length !== 0) {
                    customerCardData[0].card_type = chargeCustomerProfileResponse.transactionResponse.accountType
                    const createdCustomerCard = await customerCardService.createCustomerCard(customerCardData[0], transaction);
                }
                paymentData[0].transaction_no = chargeCustomerProfileResponse.getTransactionResponse().getTransId();
                paymentData[0].card_type = chargeCustomerProfileResponse.transactionResponse.accountType
                paymentData[0].payment_status = 1 //success=>1
                policyData[0].payment_status = 1 // success=>1
                paymentData[0].payment_successfull_date = moment().format('YYYY-MM-DD')
            } else {
                paymentData[0].payment_status = 2 //failed=>2
                policyData[0].payment_status = 2 //failed=>2
                // Payment failed or encountered an issue
                auditData.description = 'policy creation failed due to payment failed';
                await helper.updateAuditTrail(auditData, req)
                throw new CustomError(`Payment failed!`, 402)
            }
        } else if (req.body.paymentType == 2) {
            // bank payment
            let paymentObj = {
                first_name: req.body.firstName ? req.body.firstName : null,
                last_name: req.body.lastName ? req.body.lastName : null,
                billing_zip: req.body.billingZipCode ? req.body.billingZipCode : null,
                billing_city: req.body.billingCity ? req.body.billingCity : null,
                billing_state: req.body.billingState ? req.body.billingState : null,
                billing_address: req.body.billingAddress ? req.body.billingAddress : null,
                acc_holder_name: req.body.bankAccountHolderName ? req.body.bankAccountHolderName : null,
                acc_no: req.body.bankAccountNumber ? req.body.bankAccountNumber : null,
                routing_no: req.body.routingNumber ? req.body.routingNumber : null,
                policy_no: policyNumber,
                plan_name: planInfo.plan_name,
                plan_term: planTermInfo.plan_term,
                tax_amount: req.body.taxAmount,
                net_amount: req.body.netAmount,
                policy_start_date: policy_start_date,
                policy_expiry_date: policy_expiry_date,
                expiry_with_bonus: expiry_with_bonus,
            }
            const transactionResponse = await securePaymentsService.debitBankAccount(req, res, next, paymentObj);
            policyData[0].transactionResponse = transactionResponse
            paymentData[0].transaction_response = transactionResponse
            if (transactionResponse.transactionResponse && transactionResponse.transactionResponse.responseCode === '1') {
                // Payment was successful
                paymentData[0].transaction_no = transactionResponse.getTransactionResponse().getTransId();
                paymentData[0].payment_status = 1 //success=>1
                policyData[0].payment_status = 1 // success=>1
            } else {
                // Payment failed or encountered an issue
                paymentData[0].payment_status = 2 //failed=>2
                policyData[0].payment_status = 2 //failed=>2
                auditData.description = 'policy creation failed due to payment failed';
                await helper.updateAuditTrail(auditData, req)
                throw new CustomError(`Payment failed! ${transactionResponse.getTransactionResponse().getErrors() ? transactionResponse.getTransactionResponse().getErrors().getError()[0].getErrorText() : transactionResponse.messages.message[0].text}`, 402)
            }
        } else if (req.body.paymentType == 3) {
            /* Escrow Payment */
            paymentData[0].payment_status = 4// pending=>4
            policyData[0].payment_status = 4// pending=>4
        }
        //  }
        // };
        await Promise.all(policyData.map(async (data, i) => {
            try {
                if (policyData[0].payment_status == 4 || policyData[0].payment_status == 1) {
                    // Payment was successful
                    // Create the policy record
                    const createdPolicy = await policyService.createPolicy(data, transaction);
                    // Create an array of policy products associated with the policy
                    // let mailTrigger = await mailService.triggerMail('mailError.ejs', JSON.stringify(data.policyProductData), '', 'bithin@sundewsolutions.com', 'productData','');


                    let policyProductsData = data.policyProductData.map((productData) => ({
                        org_id: createdPolicy.org_id,
                        policy_id: createdPolicy.policy_id, // Associate the policy product with the policy
                        product_id: productData ? productData.product_id : null,
                        product_name: productData ? productData.product_name : null,
                        monthly_price: productData ? productData.monthly_price : null,
                        yearly_price: productData ? productData.yearly_price : null,
                        product_quantity: 1,
                        create_user_type: req.body.createUserType,
                        created_by: createdCustomer.customer_id
                    }));
                    policyProductsData = _.uniq(policyProductsData);
                    paymentData[0].policy_id = createdPolicy.policy_id;

                    // Bulk insert the policy products associated with the policy
                    if (policyProductsData.length > 0) {
                        let createdPolicyProducts = await planService.createBulkPolicyProducts(policyProductsData, transaction);
                        if (createdPolicyProducts) {
                            if (paymentData.length == 0) {
                                throw new CustomError(`Payment Information not found`);
                            }
                            let createdPayments = await paymentService.createPayment(paymentData[0], transaction);
                            if (createdPolicy.policy_term_month == 1) {
                                for (let p = 0; p < 12; p++) {
                                    const nextPaymentDate = moment(paymentData[0].payment_date).add(1, 'months');
                                    paymentData[0].payment_date = adjustDateForLeapYear(nextPaymentDate);
                                    if (moment().format('YYYY-MM-DD') != moment(paymentData[0].payment_date).format('YYYY-MM-DD')) {
                                        paymentData[0].transaction_no = null;
                                        policyData[0].transactionResponse = null
                                        paymentData[0].transaction_response = null
                                        paymentData[0].payment_status = 4// pending=>4
                                        policyData[0].payment_status = 4// pending=>4
                                    }
                                    createdPayments = await paymentService.createPayment(paymentData[0], transaction);
                                }
                            }
                            //  const createdPolicyWiseCommission = await policyWiseCommissionService.createpolicyWiseCommission(policyWiseCommissionData[i], transaction);
                            //  const createdPolicyNotes = await policyNoteService.createpolicyNotes(policyNoteData[i], transaction);

                            if (createdPayments) {
                                let dataObj = {
                                    base_url: `${helper.website_baseUrl}`,
                                    customer_email: createdCustomer.email,
                                    customer_password: password,
                                    customer_name: createdCustomer.first_name + ' ' + createdCustomer.last_name,
                                    customer_plan: planInfo.plan_name,
                                    company_address: mailConfig.company_address,
                                    company_phone: mailConfig.company_phone,
                                    company_email: mailConfig.company_email,
                                    company_copyright_year: mailConfig.company_copyright_year,
                                    company_website: mailConfig.company_website,
                                    company_website_link: mailConfig.company_website_link,
                                    email_imageUrl: helper.email_imageUrl
                                }

                                //  let mailTrigger = await mailService.triggerMail('newCustomerTemp.ejs', dataObj, '', createdCustomer.email, 'Customer created Successfully. Welcome to our Family!');
                                let mailTrigger = await mailService.triggerMail(isCustomerExist ? 'policyPurchaseTemp.ejs' : 'newCustomerTemp.ejs', dataObj, '', createdCustomer.email, 'Policy purchased Successfully. Welcome to our Family!');
                                if (mailTrigger) {
                                    res.status(200).send({
                                        status: 1,
                                        message: "Policy Created Successfully.",
                                    });
                                } else {
                                    res.status(200).send({ status: 1, message: `The mail server could not deliver mail to ${createdCustomer.email}. Please check your email id` })
                                    //  throw new CustomError (`The mail server could not deliver mail to ${createdCustomer.email}. Please check your email id`,500)
                                }
                                /*  if (mailTrigger) {
                                     res.status(200).send({
                                         status: 1,
                                         message: "Policy Created Successfully.",
                                     });
                                 } */
                                auditData.description = 'policy created successfull from customer portal';
                                await helper.updateAuditTrail(auditData, req)
                                transaction.commit();
                            } else {
                                auditData.description = 'policy creation failed';
                                await helper.updateAuditTrail(auditData, req)
                                throw new CustomError(`Something went wrong! , please try again later`);
                            }
                        }
                    }
                } else {
                    auditData.description = 'policy creation failed due to payment failed';
                    await helper.updateAuditTrail(auditData, req)
                    throw new CustomError(`Payment failed or encountered an issue`, 402)
                    // Payment failed or encountered an issue
                    // Handle the failure scenario here
                }
            } catch (error) {
                await transaction.rollback();
                next(error);
            }
        }));

    } catch (error) {
        await transaction.rollback()
        next(error)
    }
}


exports.createPolicyByRealestatePro = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const realtor_id = req.tokenData.realestate_professional_id;
        const userAgent = req.headers["user-agent"];
        const password = helper.autoGeneratePassword();
        const detector = new DeviceDetector({
            clientIndexes: true,
            deviceIndexes: true,
            deviceAliasCode: false,
        });
        const deviceRes = detector.detect(userAgent);
        let payload = req.body;
        let policyData = []
        let paymentData = [];
        let policyWiseCommissionData = [];
        let customerCardData = [];
        let policyNoteData = []
        let planInfo = null
        let paymentProfileId = null
        let selectedCardDetails = null
        let policyTerm = null;
        let customerData = {
            org_id: req.headers.org_id ? parseInt(req.headers.org_id) : null,
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            email: req.body.emailId,
            password: await bcrypt.hash(password, 10),
            mobile: req.body.mobileNo,
            zip: req.body.billingZipCode,
            address1: req.body.billingAddress,
            state: req.body.billingState,
            city: req.body.billingCity,
            active_status: 1,
            device_id: deviceRes.device.type,
            os_platform: os.platform(),
            user_agent: userAgent,
            ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            source: 0,// self user
            create_user_type: req.body.createUserType,
            created_by: realtor_id,
        }

        let isCustomerExist = await customerService.findCustomerByEmail(customerData.email);
        let createdCustomer;
        if (isCustomerExist) {
            createdCustomer = isCustomerExist;
            createdCustomer.isExistingCustomer = true
        } else {
            createdCustomer = await customerService.createCustomer(customerData, transaction);
            createdCustomer.isExistingCustomer = false
        }
        createdCustomer = helper.getJsonParseData(createdCustomer);


        //  policy_start_date: element.policy_start_date ? moment(element.policy_start_date).format('YYYY-MM-DD') : null,
        //         policy_expiry_date: element.policy_end_date ? moment(element.policy_end_date).format('YYYY-MM-DD') : null,
        //         expiry_with_bonus: element.expiry_with_bonus ? moment(element.expiry_with_bonus).format('YYYY-MM-DD') : null,
        //  for (let i = 0; i < payload.policyPayamentData.length; i++) {
        // const element = payload.policyPayamentData[i];
        // if (!moment(element.paymentDate).isValid()) {
        //     throw new CustomError('Payment Date is invalid. Please provide the valid payment date')
        // }

        planInfo = await planService.findPlanById(req.body.planId)
        let planTermInfo = await planTermsService.findPlanTermById(parseInt(req.body.planTermId))
        if (!planInfo) {
            throw new CustomError(`plan Information not found`);
        }
        let policyNumber = planInfo.plan_name.toUpperCase().slice(0, 2) + '' + moment().format('MM') * 2 + '' + moment().format('DD') * 2 + '' + moment().format('YYYY') * 2 + '' + createdCustomer.customer_id;
        let checkPolicyNumberIsExist = await policyService.findPolicyByPolicyNumber(policyNumber);
        if (checkPolicyNumberIsExist) {
            policyNumber = policyNumber + Math.floor(Math.random() * 90) + 10 + parseInt(moment().format('ss'));
        }
        let getProducts = await planService.findPlanWithProductByPlanId(req.body.planId);
        getProducts = helper.getJsonParseData(getProducts);
        if (getProducts.length == 0) {
            throw new CustomError(`Plan product Information not found`);
        }
        planTermResponse = await db.planTermsModel.findOne({ where: { plan_terms_id: req.body.planTermId } });
        planTermResponse = helper.getJsonParseData(planTermResponse);
        policyTerm = planTermInfo.plan_term_month
        const policy_start_date = moment().add(30, "days").format('YYYY-MM-DD');
        const policy_expiry_date = moment(policy_start_date).add(policyTerm, "month").format('YYYY-MM-DD');
        const expiry_with_bonus = moment(policy_expiry_date).add(parseInt(req.body.bonusMonth), "month").format('YYYY-MM-DD');
        //    console.log(policy_start_date);
        //    console.log(policy_expiry_date);
        //    console.log(expiry_with_bonus);
        //    console.log(policyTerm);

        policyData.push({
            org_id: req.headers.org_id ? parseInt(req.headers.org_id) : null,
            customer_id: createdCustomer.customer_id,
            first_name: req.body.firstName ? req.body.firstName : null,
            last_name: req.body.lastName ? req.body.lastName : null,
            email: req.body.emailId ? req.body.emailId : null,
            mobile: req.body.mobileNo ? req.body.mobileNo : null,
            billing_zip: req.body.zipCode ? req.body.zipCode : null,
            billing_city: req.body.city ? req.body.city : null,
            billing_state: req.body.state ? req.body.state : null,
            billing_address1: req.body.address1 ? req.body.address1 : null,
            policy_number: policyNumber,
            realtor_email: req.body.realtorEmail ? req.body.realtorEmail : null,
            agent_email: req.body.companyEmail ? req.body.companyEmail : null,
            plan_id: req.body.planId ? req.body.planId : null,
            plan_terms_id: req.body.planTermId ? parseInt(req.body.planTermId) : null,
            policy_term: planTermInfo.plan_term,
            policy_term_month: planTermInfo.plan_term_month,
            pcf: planTermInfo.plan_term_month > 12 ? 65 : 75,
            policy_start_date: policy_start_date,
            policy_expiry_date: policy_expiry_date,
            expiry_with_bonus: expiry_with_bonus,




            property_type_id: req.body.propertyType ? req.body.propertyType : null,
            property_size_id: req.body.propertySize == 0 ? 0 : req.body.propertySize,
            order_date: moment().format('YYYY-MM-DD'),
            bonus_month: req.body.bonusMonth,
            policy_amount: req.body.policyAmount,
            addon_coverage_amount: req.body.addonCoverageAmount,
            sub_total_amount: req.body.subTotalAmount,
            tax_type: 3,
            tax_percentage: 0,
            tax_amount: req.body.taxAmount,
            total_price: req.body.totalPrice,
            net_amount: req.body.netAmount,
            policy_status: req.body.paymentType == 3 ? 4 : 2,
            //  policy_status: 2,// Hold
            ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            create_user_type: req.body.createUserType,
            created_by: realtor_id,
            policyProductData: [...req.body.selectdAddOnProducts, ...getProducts],
            payment_status: null,
            source: 0,//self user

        })
        console.log('policy', policyData);
        paymentData.push({
            policy_id: null,
            org_id: createdCustomer.org_id,
            customer_id: createdCustomer.customer_id,
            amount: req.body.netAmount,
            state: req.body.billingState ? req.body.billingState : null,
            payment_type: req.body.paymentType ? req.body.paymentType : null,
            acc_holder_name: req.body.bankAccountHolderName ? req.body.bankAccountHolderName : null,
            acc_no: req.body.bankAccountNumber ? req.body.bankAccountNumber : null,
            routing_no: req.body.routingNumber ? req.body.routingNumber : null,
            payment_date: moment().format('YYYY-MM-DD'),
            payment_successfull_date: null,
            card_holder_name: req.body.cardHolderName ? req.body.cardHolderName : null,
            card_number: req.body.cardNumber ? req.body.cardNumber.slice(-4) : null,
            transaction_no: null,
            card_type: null,
            card_expiry_date: req.body.expiryDate ? helper.encodeCrypto(req.body.expiryDate) : null,
            payment_status: 4,
            source: 0,//self user
            create_user_type: req.body.createUserType,
            created_by: createdCustomer.customer_id,
            transaction_response: null,
            recurring_type: planTermInfo.plan_term_month == 1 ? 1 : 0 //  monthly=>1

        })

        // AUDIT TRAIL PAYLOAD
        let auditData = {
            customer_id: createdCustomer.customer_id,
            name: req.body.firstName + ' ' + req.body.lastName,
            email: req.body.emailId ? req.body.emailId : null,
            section: 'REALESTATE_PROFESSIONAL_POLICY_CREATION',
            table_name: 'hws_policies',
            source: 3,
            create_user_type: 3,
            created_by: createdCustomer.customer_id,
            device_id: createdCustomer.device_id,
        }
        if (req.body.paymentType == 1) {
            // if paymennt type is credit card
            createdCustomer.authorizeNet_customer_profile_id = createdCustomer.authorizeNet_customer_profile_id
            if (!createdCustomer.authorizeNet_customer_profile_id) {
                // if createdCustomer.authorizeNet_customer_profile_id is null, its means they not have customer profile account in authorize.net
                let customerProfileObj = {
                    customer_id: createdCustomer.customer_id,
                    customer_email: createdCustomer.email,
                    first_name: createdCustomer.first_name ? createdCustomer.first_name : null,
                    last_name: createdCustomer.last_name ? createdCustomer.last_name : null,
                    billing_zip: createdCustomer.zip ? createdCustomer.zip : null,
                    city: createdCustomer.city ? createdCustomer.city : null,
                    state: createdCustomer.state ? createdCustomer.state : null,
                    address: createdCustomer.address1 ? createdCustomer.address1 : null,
                    card_number: req.body.cardNumber ? req.body.cardNumber : null,
                    card_expiry_date: req.body.expiryDate ? req.body.expiryDate : null,
                    card_cvv: req.body.cardCode ? req.body.cardCode : null,
                    policy_no: policyNumber,
                    plan_name: planInfo.plan_name,
                    plan_term: planTermInfo.plan_term,
                    tax_amount: req.body.taxAmount,
                    net_amount: req.body.netAmount,
                    policy_start_date: policy_start_date,
                    policy_expiry_date: policy_expiry_date,
                    expiry_with_bonus: expiry_with_bonus,

                }
                const createCustomerProfileResponse = await securePaymentsService.createCustomerProfile(customerProfileObj);
                //  console.log('createCustomerProfile', createCustomerProfileResponse);
                if (createCustomerProfileResponse) {
                    createdCustomer.authorizeNet_customer_profile_id = createCustomerProfileResponse.getCustomerProfileId();
                    const paymentProfileIdObject = createCustomerProfileResponse.getCustomerPaymentProfileIdList().getNumericString()[0];
                    // Extract the actual ID from the object
                    paymentProfileId = paymentProfileIdObject.toString();
                    if (createdCustomer.authorizeNet_customer_profile_id) {
                        // The response contains the expected structure and customerProfileId
                        const updateCustomerProfileId = await customerService.updateCustomer(createdCustomer.customer_id, {
                            authorizeNet_customer_profile_id: createdCustomer.authorizeNet_customer_profile_id,
                        }, transaction);
                    } else {
                        auditData.description = 'policy creation failed due to invalid credit_card';
                        await helper.updateAuditTrail(auditData, req)
                        throw new CustomError('Provided Card Information is Invalid.');
                    }
                } else {
                    auditData.description = 'policy creation failed due to invalid response from authorize.net';
                    await helper.updateAuditTrail(auditData, req)
                    throw new CustomError('Invalid response from Authorize.Net');
                }
            }
            let isExistCard = await customerCardService.getCustomerAllSavedCards({ where: { customer_id: createdCustomer.customer_id } })
            let customerPaymentProfileObj = {
                authorizeNet_customer_profile_id: createdCustomer.authorizeNet_customer_profile_id,
                customer_id: createdCustomer.customer_id,
                customer_email: createdCustomer.email,
                first_name: req.body.firstName ? req.body.firstName : null,
                last_name: req.body.lastName ? req.body.lastName : null,
                billing_zip: req.body.billingZipCode ? req.body.billingZipCode : null,
                billing_city: req.body.billingCity ? req.body.billingCity : null,
                billing_state: req.body.billingState ? req.body.billingState : null,
                billing_address: req.body.billingAddress ? req.body.billingAddress : null,
                card_number: req.body.cardNumber ? req.body.cardNumber : null,
                card_expiry_date: req.body.expiryDate ? req.body.expiryDate : null,
                card_cvv: req.body.cardCode ? req.body.cardCode : null,
                policy_no: policyNumber,
                plan_name: planInfo.plan_name,
                plan_term: planTermInfo.plan_term,
                tax_amount: req.body.taxAmount,
                net_amount: req.body.netAmount,
                policy_start_date: policy_start_date,
                policy_expiry_date: policy_expiry_date,
                expiry_with_bonus: expiry_with_bonus,

            }
            if (isExistCard.length == 0) {
                // if customer dosenot have any card stored previously
                customerCardData.push({
                    org_id: createdCustomer.org_id,
                    customer_id: createdCustomer.customer_id,
                    card_type: null,
                    card_holder_name: req.body.cardHolderName ? req.body.cardHolderName : null,
                    card_number: req.body.cardNumber ? helper.encodeCrypto(req.body.cardNumber) : null,
                    card_last_4_digit: req.body.cardNumber ? req.body.cardNumber.slice(-4) : null,
                    card_expiry_date: req.body.expiryDate ? helper.encodeCrypto(req.body.expiryDate) : null,
                    ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
                    authorizeNet_payment_profile_id: paymentProfileId ? paymentProfileId : null,
                    create_user_type: req.body.createUserType,
                    created_by: createdCustomer.customer_id,
                })
                customerCardData[0].primary_card = true;
                if (!paymentProfileId) {
                    // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                    const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                    paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
                }
            } else {

                // Verify that the given card's expiry date and card number match those on the customer's stored cards. (customer_card table).
                const matchedExpDate = _.find(isExistCard, (obj) => {
                    return obj.card_expiry_date == req.body.expiryDate && obj.card_number == req.body.cardNumber;
                });

                if (!matchedExpDate) {
                    // if customer provide different card details which not stored in customer_card table
                    if (!paymentProfileId) {
                        // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                        const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                        paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
                    }

                    customerCardData.push({
                        org_id: createdCustomer.org_id,
                        customer_id: createdCustomer.customer_id,
                        card_type: null,
                        authorizeNet_payment_profile_id: paymentProfileId ? paymentProfileId : null,
                        card_holder_name: req.body.cardHolderName ? req.body.cardHolderName : null,
                        card_number: req.body.cardNumber ? helper.encodeCrypto(req.body.cardNumber) : null,
                        card_last_4_digit: req.body.cardNumber ? req.body.cardNumber.slice(-4) : null,
                        card_expiry_date: req.body.expiryDate ? helper.encodeCrypto(req.body.expiryDate) : null,
                        ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
                        create_user_type: req.body.createUserType,
                        created_by: createdCustomer.customer_id,
                    })
                } else {
                    // if customer provide same card details which already stored in customer_card table
                    customerCardData.push({})
                    selectedCardDetails = await customerCardService.getCustomerCardById({ where: { customer_id: createdCustomer.customer_id, customer_card_id: matchedExpDate.customer_card_id } })
                    paymentProfileId = selectedCardDetails.authorizeNet_payment_profile_id ? selectedCardDetails.authorizeNet_payment_profile_id : null
                }
                if (!paymentProfileId) {
                    // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                    const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                    paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
                }
            }

        }
        //  if (moment().format('YYYY-MM-DD') == moment(element.paymentDate).format('YYYY-MM-DD')) {
        // if payment date is same day
        if (req.body.paymentType == 1) {
            // credit card payment
            let paymentObj = {
                authorizeNet_customer_profile_id: createdCustomer.authorizeNet_customer_profile_id,
                authorizeNet_payment_profile_id: selectedCardDetails ? selectedCardDetails.authorizeNet_payment_profile_id : paymentProfileId,
                customer_id: createdCustomer.customer_id,
                customer_email: createdCustomer.email,
                first_name: req.body.firstName ? req.body.firstName : null,
                last_name: req.body.lastName ? req.body.lastName : null,
                billing_zip: req.body.billingZipCode ? req.body.billingZipCode : null,
                billing_city: req.body.billingCity ? req.body.billingCity : null,
                billing_state: req.body.billingState ? req.body.billingState : null,
                billing_address: req.body.billingAddress ? req.body.billingAddress : null,
                card_number: selectedCardDetails ? selectedCardDetails.card_number : req.body.cardNumber,
                card_expiry_date: selectedCardDetails ? selectedCardDetails.card_expiry_date : req.body.expiryDate,
                card_cvv: selectedCardDetails ? null : req.body.cardCode,
                policy_no: policyNumber,
                plan_name: planInfo.plan_name,
                plan_term: planTermInfo.plan_term,
                tax_amount: req.body.taxAmount,
                net_amount: req.body.netAmount,
                chargable_amount: req.body.netAmount,
                policy_start_date: policy_start_date,
                policy_expiry_date: policy_expiry_date,
                expiry_with_bonus: expiry_with_bonus,
                recurring_type: planTermInfo.plan_term_month == 1 ? 1 : 0, //  monthly=>1
            }


            const chargeCustomerProfileResponse = await securePaymentsService.chargeCustomerProfile(paymentObj);
            policyData[0].transactionResponse = chargeCustomerProfileResponse//.getTransactionResponse()
            paymentData[0].transaction_response = chargeCustomerProfileResponse//.getTransactionResponse()
            const responseObject = chargeCustomerProfileResponse;
            const resultCode = responseObject?.messages?.resultCode;
            const code = responseObject?.messages?.message[0]?.code;
            const transactionResponse =  responseObject?.transactionResponse;
            const transactionResponseCode =  responseObject?.transactionResponse?.responseCode;
            if (resultCode === 'Ok' && code === 'I00001' && transactionResponse && (transactionResponseCode== 1|| transactionResponseCode== 4)) {
                // if (chargeCustomerProfileResponse.getTransactionResponse() && chargeCustomerProfileResponse.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
                // Payment was successful  
                if (customerCardData[0] && Object.keys(customerCardData[0]).length !== 0) {
                    customerCardData[0].card_type = chargeCustomerProfileResponse.transactionResponse.accountType
                    const createdCustomerCard = await customerCardService.createCustomerCard(customerCardData[0], transaction);
                }
                paymentData[0].transaction_no = chargeCustomerProfileResponse.getTransactionResponse().getTransId();
                paymentData[0].card_type = chargeCustomerProfileResponse.transactionResponse.accountType
                paymentData[0].payment_status = 1 //success=>1
                policyData[0].payment_status = 1 // success=>1
                paymentData[0].payment_successfull_date = moment().format('YYYY-MM-DD')
            } else {
                paymentData[0].payment_status = 2 //failed=>2
                policyData[0].payment_status = 2 //failed=>2
                // Payment failed or encountered an issue
                auditData.description = 'policy creation failed due to payment failed';
                await helper.updateAuditTrail(auditData, req)
                throw new CustomError(`Payment failed!`, 402)
            }
        } else if (req.body.paymentType == 2) {
            // bank payment
            let paymentObj = {
                first_name: req.body.firstName ? req.body.firstName : null,
                last_name: req.body.lastName ? req.body.lastName : null,
                billing_zip: req.body.billingZipCode ? req.body.billingZipCode : null,
                billing_city: req.body.billingCity ? req.body.billingCity : null,
                billing_state: req.body.billingState ? req.body.billingState : null,
                billing_address: req.body.billingAddress ? req.body.billingAddress : null,
                acc_holder_name: req.body.bankAccountHolderName ? req.body.bankAccountHolderName : null,
                acc_no: req.body.bankAccountNumber ? req.body.bankAccountNumber : null,
                routing_no: req.body.routingNumber ? req.body.routingNumber : null,
                policy_no: policyNumber,
                plan_name: planInfo.plan_name,
                plan_term: planTermInfo.plan_term,
                tax_amount: req.body.taxAmount,
                net_amount: req.body.netAmount,
                policy_start_date: policy_start_date,
                policy_expiry_date: policy_expiry_date,
                expiry_with_bonus: expiry_with_bonus,

            }
            const transactionResponse = await securePaymentsService.debitBankAccount(req, res, next, paymentObj);
            policyData[0].transactionResponse = transactionResponse
            paymentData[0].transaction_response = transactionResponse
            if (transactionResponse.transactionResponse && transactionResponse.transactionResponse.responseCode === '1') {
                // Payment was successful
                paymentData[0].transaction_no = transactionResponse.getTransactionResponse().getTransId();
                paymentData[0].payment_status = 1 //success=>1
                policyData[0].payment_status = 1 // success=>1
            } else {
                // Payment failed or encountered an issue
                paymentData[0].payment_status = 2 //failed=>2
                policyData[0].payment_status = 2 //failed=>2
                auditData.description = 'policy creation failed due to payment failed';
                await helper.updateAuditTrail(auditData, req)
                throw new CustomError(`Payment failed! ${transactionResponse.getTransactionResponse().getErrors() ? transactionResponse.getTransactionResponse().getErrors().getError()[0].getErrorText() : transactionResponse.messages.message[0].text}`, 402)
            }
        } else if (req.body.paymentType == 3) {
            /* Escrow Payment */
            paymentData[0].payment_status = 4// pending=>4
            policyData[0].payment_status = 4// pending=>4
        }
        //  } 
        // };
        await Promise.all(policyData.map(async (data, i) => {
            try {
                if (policyData[0].payment_status == 4 || policyData[0].payment_status == 1) {
                    // Payment was successful
                    // Create the policy record
                    const createdPolicy = await policyService.createPolicy(data, transaction);
                    // Create an array of policy products associated with the policy
                    // let mailTrigger = await mailService.triggerMail('mailError.ejs', JSON.stringify(data.policyProductData), '', 'bithin@sundewsolutions.com', 'productData','');


                    let policyProductsData = data.policyProductData.map((productData) => ({
                        org_id: createdPolicy.org_id,
                        policy_id: createdPolicy.policy_id, // Associate the policy product with the policy
                        product_id: productData ? productData.product_id : null,
                        product_name: productData ? productData.product_name : null,
                        monthly_price: productData ? productData.monthly_price : null,
                        yearly_price: productData ? productData.yearly_price : null,
                        product_quantity: 1,
                        create_user_type: req.body.createUserType,
                        created_by: createdCustomer.customer_id
                    }));
                    policyProductsData = _.uniq(policyProductsData);
                    paymentData[0].policy_id = createdPolicy.policy_id;

                    // Bulk insert the policy products associated with the policy
                    if (policyProductsData.length > 0) {
                        let createdPolicyProducts = await planService.createBulkPolicyProducts(policyProductsData, transaction);
                        if (createdPolicyProducts) {
                            if (paymentData.length == 0) {
                                throw new CustomError(`Payment Information not found`);
                            }
                            let createdPayments = await paymentService.createPayment(paymentData[0], transaction);
                            if (createdPolicy.policy_term_month == 1) {
                                for (let p = 0; p < 12; p++) {
                                    const nextPaymentDate = moment(paymentData[0].payment_date).add(1, 'months');
                                    paymentData[0].payment_date = adjustDateForLeapYear(nextPaymentDate);
                                    if (moment().format('YYYY-MM-DD') != moment(paymentData[0].payment_date).format('YYYY-MM-DD')) {
                                        paymentData[0].transaction_no = null;
                                        policyData[0].transactionResponse = null
                                        paymentData[0].transaction_response = null
                                        paymentData[0].payment_status = 4// pending=>4
                                        policyData[0].payment_status = 4// pending=>4
                                    }
                                    createdPayments = await paymentService.createPayment(paymentData[0], transaction);
                                }
                            }
                            //  const createdPolicyWiseCommission = await policyWiseCommissionService.createpolicyWiseCommission(policyWiseCommissionData[i], transaction);
                            //  const createdPolicyNotes = await policyNoteService.createpolicyNotes(policyNoteData[i], transaction);

                            if (createdPayments) {
                                // let generateEscrowInvoiceData = await policyService.generateEscrowInvoiceData(createdPolicy.org_id, createdPolicy.policy_id);    
                                // console.log('generateEscrowInvoiceData', generateEscrowInvoiceData );                            
                                let realtorQueryOptions = {
                                    attributes: { exclude: ['password', 'deleted_by', 'deleted_at', 'device_id', 'user_agent', 'os_platform', 'ip_address'] },
                                }
                                const realtorDetails = await realestateProfessionalsService.findRealtorById(req.body.realtorId, realtorQueryOptions);

                                let dataObj = {
                                    base_url: `${helper.website_baseUrl}`,
                                    customer_email: createdCustomer.email,
                                    policy_number: createdPolicy.policy_number,
                                    customer_password: password,
                                    customer_name: createdCustomer.first_name + ' ' + createdCustomer.last_name,
                                    customer_plan: planInfo.plan_name,
                                    company_address: mailConfig.company_address,
                                    company_phone: mailConfig.company_phone,
                                    company_email: mailConfig.company_email,
                                    company_copyright_year: mailConfig.company_copyright_year,
                                    company_website: mailConfig.company_website,
                                    company_website_link: mailConfig.company_website_link,
                                    realtor_name: realtorDetails.contact_name,
                                    realtor_email: realtorDetails.email,
                                    email_imageUrl: helper.email_imageUrl
                                }
                                let proformaData = {
                                    org_id: createdCustomer.org_id,
                                    policy_id: createdPolicy.policy_id,
                                    customer_id: createdCustomer.customer_id,
                                    buyer_first_name: req.body.buyerFirstName,
                                    buyer_last_name: req.body.buyerLastName,
                                    buyer_email: req.body.buyerEmail,
                                    buyer_mobile: req.body.buyerMobile,
                                    seller_first_name: req.body.sellerFirstName,
                                    seller_last_name: req.body.sellerLastName,
                                    seller_email: req.body.sellerEmail,
                                    seller_mobile: req.body.sellerMobile,
                                    realestate_professional_id: req.body.realtorId,
                                    company_name: req.body.companyName,
                                    company_contact_person: req.body.companyContactPerson,
                                    company_email: req.body.companyEmail,
                                    company_mobile: req.body.companyMobile,
                                    has_company_info: parseInt(req.body.hasCompanyInfo),
                                    active_status: 1,
                                    ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
                                    device_id: deviceRes.device.type,
                                    user_agent: userAgent,
                                    create_user_type: 3,
                                    created_by: req.body.realtorId
                                }
                                const createdPolicyProforma = await realestateProfessionalsService.createPolicyProforma(proformaData, transaction);


                                let mailTrigger = await mailService.triggerMail(isCustomerExist ? 'policyPurchaseTemp.ejs' : 'newCustomerTemp.ejs', dataObj, '', createdCustomer.email, 'Policy purchased Successfully. Welcome to our Family!');
                                // let mrealtorMailTrigger = await this.sendMailToRealtor(helper.getJsonParseData(createdPolicy),dataObj);

                                if (mailTrigger) {
                                    res.status(200).send({
                                        status: 1,
                                        data: { policy_id: createdPolicy.policy_id },
                                        policy_info: helper.getJsonParseData(createdPolicy),
                                        emaildata: dataObj,
                                        message: "Policy Created Successfully.",
                                    });
                                } else {
                                    res.status(200).send({ status: 1, message: `The mail server could not deliver mail to ${createdCustomer.email}. Please check your email id` })
                                }
                                transaction.commit();
                                auditData.description = 'policy created Successfully from realestate professional portal';
                                await helper.updateAuditTrail(auditData, req);
                            } else {
                                auditData.description = 'policy creation failed';
                                await helper.updateAuditTrail(auditData, req)
                                throw new CustomError(`Something went wrong! , please try again later`);
                            }
                        }
                    }
                } else {
                    auditData.description = 'policy creation failed due to payment failed';
                    await helper.updateAuditTrail(auditData, req)
                    throw new CustomError(`Payment failed or encountered an issue`, 402)
                    // Payment failed or encountered an issue
                    // Handle the failure scenario here
                }
            } catch (error) {
                await transaction.rollback();
                next(error);
            }
        }));

    } catch (error) {
        await transaction.rollback()
        next(error)
    }
}

exports.sendMailToRealtor = async (policy_info, emailObj) => {
    let genEscrowPdfRes = null;
    let escrowInvoiceData = null;
    if (policy_info) {
        setTimeout(async () => {
            genEscrowPdfRes = await policyService.generateEscrowAttachment(policy_info.org_id, policy_info.policy_id);
            let generateEscrowInvoiceData = await policyService.generateEscrowInvoiceData(policy_info.org_id, policy_info.policy_id);
            escrowInvoiceData = generateEscrowInvoiceData ? helper.getJsonParseData(generateEscrowInvoiceData) : null;
        }, 1000);

    }
    emailObj = { ...emailObj, ...escrowInvoiceData };
    mailTrigger = await mailService.triggerMail('newRealestateProfessionalInvoiceTemp.ejs', emailObj, '', emailObj.realtor_email, 'Your policy order has been processed successfully');
    if (mailTrigger) {
        res.status(200).send({
            status: 1,
            message: "Policy Created Successfully.",
        });
    }
}

exports.createPolicyProformaByRealestateProfessional = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
    } catch (error) {
        await transaction.rollback()
        next(error)
    }
}


exports.createPolicyByUser = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const org_user_id = req.tokenData.org_user_id;
        const userAgent = req.headers["user-agent"];
        const password = helper.autoGeneratePassword();
        const detector = new DeviceDetector({
            clientIndexes: true,
            deviceIndexes: true,
            deviceAliasCode: false,
        });
        const deviceRes = detector.detect(userAgent);
        let payload = req.body;
        let policyData = []
        let paymentData = [];
        let policyWiseCommissionData = [];
        let customerCardData = [];
        let policyNoteData = []
        let planInfo = null
        let paymentProfileId = null
        let selectedCardDetails = null
        let policyNumber = null;
        let customerData = {
            org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
            first_name: payload.customerData.first_name,
            last_name: payload.customerData.last_name,
            email: payload.customerData.email,
            password: await bcrypt.hash(password, 10),
            mobile: payload.customerData.mobile,
            alternate_phone: payload.customerData.alternate_phone,
            zip: payload.customerData.zip,
            address1: payload.customerData.address1,
            state: payload.customerData.state,
            city: payload.customerData.city,
            active_status: 1,
            device_id: deviceRes.device.type,
            os_platform: os.platform(),
            user_agent: userAgent,
            ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            create_user_type: 2,
            source: 1,
            created_by: org_user_id,
        }

        let isCustomerExist = await customerService.findCustomerByEmail(customerData.email);
        let createdCustomer;
        if (isCustomerExist) {
            createdCustomer = isCustomerExist;
            createdCustomer = helper.getJsonParseData(createdCustomer);
            createdCustomer.isExistingCustomer = true
        } else {
            createdCustomer = await customerService.createCustomer(customerData, transaction);
            createdCustomer = helper.getJsonParseData(createdCustomer);
            createdCustomer.isExistingCustomer = false
        }
        let auditData = {
            customer_id: createdCustomer.customer_id,
            user_id: org_user_id,
            section: 'ADMIN_POLICY',
            table_name: 'hws_policies',
            source: 1,
            create_user_type: 2,
            created_by: org_user_id,
            device_id: createdCustomer.device_id,
        }
        for (let i = 0; i < payload.policyPayamentData.length; i++) {
            const element = payload.policyPayamentData[i];
            if (element.paymentDate && !moment(element.paymentDate).isValid()) {
                throw new CustomError('Payment Date is invalid. Please provide the valid payment date')
            }
            planInfo = await planService.findPlanById(element.plan_id)
            let planTermInfo = await planTermsService.findPlanTermById(parseInt(element.plan_terms_id))
            if (!planInfo) {
                throw new CustomError(`plan Information not found`);
            }
            policyNumber = planInfo.plan_name.toUpperCase().slice(0, 2) + '' + moment().format('MM') * 2 + '' + moment().format('DD') * 2 + '' + moment().format('YYYY') * 2 + '' + org_user_id;
            let checkPolicyNumberIsExist = await policyService.findPolicyByPolicyNumber(policyNumber);
            if (checkPolicyNumberIsExist) {
                policyNumber = policyNumber + Math.floor(Math.random() * 90) + 10 + parseInt(moment().format('ss'));
            }
            let getProducts = await planService.findPlanWithProductByPlanId(element.plan_id);
            getProducts = helper.getJsonParseData(getProducts);
            if (getProducts.length == 0) {
                throw new CustomError(`Plan product Information not found`);
            }
            policyData.push({
                org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
                customer_id: createdCustomer.customer_id,
                first_name: element.first_name ? element.first_name : null,
                last_name: element.last_name ? element.last_name : null,
                email: element.email ? element.email : null,
                mobile: element.mobile ? element.mobile : null,
                alternate_phone: element.alternate_phone ? element.alternate_phone : null,
                billing_zip: element.billing_zip ? element.billing_zip : null,
                billing_city: element.billing_city ? element.billing_city : null,
                billing_state: element.billing_state ? element.billing_state : null,
                billing_address1: element.billing_address1 ? element.billing_address1 : null,
                realtor_email: element.realtor_email ? element.realtor_email : null,
                agent_email: element.agent_email ? element.agent_email : null,
                policy_number: policyNumber,
                plan_id: element.plan_id ? element.plan_id : null,
                plan_terms_id: element.plan_terms_id ? parseInt(element.plan_terms_id) : null,
                policy_term: planTermInfo.plan_term,
                policy_term_month: planTermInfo.plan_term_month,
                pcf: element.pcf ? element.pcf : null,
                policy_start_date: element.policy_start_date ? moment(element.policy_start_date).format('YYYY-MM-DD') : null,
                policy_expiry_date: element.policy_end_date ? moment(element.policy_end_date).format('YYYY-MM-DD') : null,
                expiry_with_bonus: element.expiry_with_bonus ? moment(element.expiry_with_bonus).format('YYYY-MM-DD') : null,
                property_type_id: element.property_type_id ? element.property_type_id : null,
                property_size_id: element.property_size_id ? element.property_size_id : null,
                order_date: moment().format('YYYY-MM-DD'),
                bonus_month: element.bonus_month,
                policy_amount: element.policy_amount,
                addon_coverage_amount: element.addon_coverage_amount,
                sub_total_amount: element.sub_total_amount,
                miscellaneous_charges: element.miscellaneous_charges,
                discount_amount: element.discount_amount,
                first_free_service: element.first_free_service,
                tax_percentage: element.tax_percentage,
                tax_type: element.tax_type,
                tax_amount: element.tax_amount,
                total_price: element.total_price,
                net_amount: element.net_amount,
                policy_status: element.payment_type == 3 ? 4 : element.payment_type == 4 ? 5 : element.payment_type == 5 ? 7 : 2,// payment_type==3 =>4 awaiting for escrow , payment_type==4 => 5 do not charge,else policy_status=>2 Hold
                ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
                create_user_type: 2,
                created_by: org_user_id,
                policyProductData: [...element.selectedAddOnItems, ...getProducts],
                payment_status: null,
                source: 1,

            })

            paymentData.push({
                policy_id: null,
                org_id: createdCustomer.org_id,
                customer_id: createdCustomer.customer_id,
                amount: element.net_amount,
                state: element.billing_state ? element.billing_state : null,
                payment_type: element.payment_type ? element.payment_type : null,
                acc_holder_name: element.bankAccountHolderName ? element.bankAccountHolderName : null,
                acc_no: element.bankAccountNumber ? element.bankAccountNumber : null,
                routing_no: element.routingNumber ? element.routingNumber : null,
                payment_date: element.paymentDate ? moment(element.paymentDate).format('YYYY-MM-DD') : null,
                payment_successfull_date: null,
                card_holder_name: element.cardHolderName ? element.cardHolderName : null,
                card_number: element.cardNumber ? element.cardNumber.slice(-4) : null,
                transaction_no: null,
                card_type: null,
                card_expiry_date: element.cardExpiryDate ? helper.encodeCrypto(element.cardExpiryDate) : null,
                cheque_no: element.cheque_no ? element.cheque_no : null,
                payment_status: 4,
                source: 1,
                create_user_type: 2,
                created_by: org_user_id,
                transaction_response: null,
                recurring_type: planTermInfo.plan_term_month == 1 ? 1 : 0,//  monthly=>1
                splitPlaymentData: element.splitPlaymentData,
                selected_split_payment_count: element.selected_split_payment_count
            })
            // return
            policyNoteData.push({
                policy_id: null,
                policy_number: policyNumber,
                org_id: req.tokenData.org_id,
                notes: element.policy_note ? element.policy_note : null,
                customer_id: createdCustomer.customer_id,
                note_type: 0,//policy level notes=>0, claim level note=>1
                create_user_type: 2,
                created_by: org_user_id,
            })
            policyWiseCommissionData.push({
                policy_id: null,
                org_id: createdCustomer.org_id,
                org_user_id: org_user_id,
                policy_no: policyNumber,
                customer_id: createdCustomer.customer_id,
                commission_value: element.commission_value,
                commission_type: element.commission_type,
                created_by: org_user_id,
            })

            if (element.payment_type == 1 || element.payment_type == 2) {
                /* credit card /  bank payment */
                if (element.payment_type == 1) {
                    // if paymennt type is credit card
                    if (element.selectedCardId) {
                        selectedCardDetails = await customerCardService.getCustomerCardById({ where: { customer_id: createdCustomer.customer_id, customer_card_id: element.selectedCardId } })
                    } else {
                        createdCustomer.authorizeNet_customer_profile_id = createdCustomer.authorizeNet_customer_profile_id
                        if (!createdCustomer.authorizeNet_customer_profile_id) {
                            // if createdCustomer.authorizeNet_customer_profile_id is null, its means they not have customer profile account in authorize.net
                            let customerProfileObj = {
                                customer_id: createdCustomer.customer_id,
                                customer_email: createdCustomer.email,
                                first_name: createdCustomer.first_name ? createdCustomer.first_name : null,
                                last_name: createdCustomer.last_name ? createdCustomer.last_name : null,
                                billing_zip: createdCustomer.zip ? createdCustomer.zip : null,
                                city: createdCustomer.city ? createdCustomer.city : null,
                                state: createdCustomer.state ? createdCustomer.state : null,
                                address: createdCustomer.address1 ? createdCustomer.address1 : null,
                                card_number: element.cardNumber,
                                card_expiry_date: element.cardExpiryDate ? element.cardExpiryDate : null,
                                card_cvv: element.cvv ? element.cvv : null,
                                policy_no: policyNumber,
                                plan_name: planInfo.plan_name,
                                plan_term: planTermInfo.plan_term,
                                tax_amount: element.tax_amount,
                                net_amount: element.net_amount,
                                policy_start_date: element.policy_start_date ? moment(element.policy_start_date).format('YYYY-MM-DD') : null,
                                policy_expiry_date: element.policy_end_date ? moment(element.policy_end_date).format('YYYY-MM-DD') : null,
                                expiry_with_bonus: element.expiry_with_bonus ? moment(element.expiry_with_bonus).format('YYYY-MM-DD') : null,
                            }
                            const createCustomerProfileResponse = await securePaymentsService.createCustomerProfile(customerProfileObj);
                            // console.log('createCustomerProfile', createCustomerProfileResponse);
                            if (createCustomerProfileResponse) {
                                createdCustomer.authorizeNet_customer_profile_id = createCustomerProfileResponse.getCustomerProfileId();
                                const paymentProfileIdObject = createCustomerProfileResponse.getCustomerPaymentProfileIdList().getNumericString()[0];
                                // Extract the actual ID from the object
                                paymentProfileId = paymentProfileIdObject.toString();
                                if (createdCustomer.authorizeNet_customer_profile_id) {
                                    // The response contains the expected structure and customerProfileId
                                    const updateCustomerProfileId = await customerService.updateCustomer(createdCustomer.customer_id, {
                                        authorizeNet_customer_profile_id: createdCustomer.authorizeNet_customer_profile_id,
                                    }, transaction);
                                } else {
                                    auditData.description = 'policy creation failed due to invalid credit_card';
                                    await helper.updateAuditTrail(auditData, req)
                                    throw new CustomError('Provided Card Information is Invalid.');
                                }
                            } else {
                                auditData.description = 'policy creation failed due to invalid response from authorize.net';
                                await helper.updateAuditTrail(auditData, req)
                                throw new CustomError('Invalid response from Authorize.Net');
                            }
                        }
                        let isExistCard = await customerCardService.getCustomerAllSavedCards({ where: { customer_id: createdCustomer.customer_id } })
                        let customerPaymentProfileObj = {
                            authorizeNet_customer_profile_id: createdCustomer.authorizeNet_customer_profile_id,
                            customer_id: createdCustomer.customer_id,
                            customer_email: createdCustomer.email,
                            first_name: element.first_name ? element.first_name : null,
                            last_name: element.last_name ? element.last_name : null,
                            billing_zip: element.billing_zip ? element.billing_zip : null,
                            billing_city: element.billing_city ? element.billing_city : null,
                            billing_state: element.billing_state ? element.billing_state : null,
                            billing_address: element.billing_address1 ? element.billing_address1 : null,
                            card_number: element.cardNumber,
                            card_expiry_date: element.cardExpiryDate ? element.cardExpiryDate : null,
                            card_cvv: element.cvv ? element.cvv : null,
                            policy_no: policyNumber,
                            plan_name: planInfo.plan_name,
                            plan_term: planTermInfo.plan_term,
                            tax_amount: element.tax_amount,
                            net_amount: element.net_amount,
                            policy_start_date: element.policy_start_date ? moment(element.policy_start_date).format('YYYY-MM-DD') : null,
                            policy_expiry_date: element.policy_end_date ? moment(element.policy_end_date).format('YYYY-MM-DD') : null,
                            expiry_with_bonus: element.expiry_with_bonus ? moment(element.expiry_with_bonus).format('YYYY-MM-DD') : null,
                        }
                        if (isExistCard.length == 0) {
                            // if customer dosenot have any card stored previously
                            customerCardData.push({
                                org_id: createdCustomer.org_id,
                                customer_id: createdCustomer.customer_id,
                                card_type: null,
                                card_holder_name: element.cardHolderName ? element.cardHolderName : null,
                                card_number: element.cardNumber ? helper.encodeCrypto(element.cardNumber) : null,
                                card_last_4_digit: element.cardNumber ? element.cardNumber.slice(-4) : null,
                                card_expiry_date: element.cardExpiryDate ? helper.encodeCrypto(element.cardExpiryDate) : null,
                                ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
                                authorizeNet_payment_profile_id: paymentProfileId ? paymentProfileId : null,
                                create_user_type: 2,
                                created_by: org_user_id,
                            })
                            customerCardData[0].primary_card = true;
                            if (!paymentProfileId) {
                                // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                                const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                                paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
                            }
                        } else {

                            // Verify that the given card's expiry date and card number match those on the customer's stored cards. (customer_card table). 
                            const matchedExpDate = _.find(isExistCard, (obj) => {
                                return obj.card_expiry_date == element.cardExpiryDate && obj.card_number == element.cardNumber;
                            });

                            if (!matchedExpDate) {
                                // if customer provide different card details which not stored in customer_card table
                                if (!paymentProfileId) {
                                    // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                                    const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                                    paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
                                }

                                customerCardData.push({
                                    org_id: createdCustomer.org_id,
                                    customer_id: createdCustomer.customer_id,
                                    card_type: null,
                                    authorizeNet_payment_profile_id: paymentProfileId ? paymentProfileId : null,
                                    card_holder_name: element.cardHolderName ? element.cardHolderName : null,
                                    card_number: element.cardNumber ? helper.encodeCrypto(element.cardNumber) : null,
                                    card_last_4_digit: element.cardNumber ? element.cardNumber.slice(-4) : null,
                                    card_expiry_date: element.cardExpiryDate ? helper.encodeCrypto(element.cardExpiryDate) : null,
                                    ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
                                    create_user_type: 2,
                                    created_by: org_user_id,
                                })
                            } else {
                                // if customer provide same card details which already stored in customer_card table
                                customerCardData.push({})
                                selectedCardDetails = await customerCardService.getCustomerCardById({ where: { customer_id: createdCustomer.customer_id, customer_card_id: matchedExpDate.customer_card_id } })
                                paymentProfileId = selectedCardDetails.authorizeNet_payment_profile_id ? selectedCardDetails.authorizeNet_payment_profile_id : null
                            }
                            if (!paymentProfileId) {
                                // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                                const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                                paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
                            }
                        }

                    }

                }
                if (moment().format('YYYY-MM-DD') == moment(element.paymentDate).format('YYYY-MM-DD')) {
                    // if payment date is same day 
                    if (element.payment_type == 1) {
                        // credit card payment
                        if (element.selected_split_payment_count && element.selected_split_payment_count > 1 && paymentData[i].splitPlaymentData.length > 0) {

                            const splitPaymentRes = await calculateSplitPayment(element, createdCustomer, paymentData[i], policyData[i], paymentProfileId, selectedCardDetails, customerCardData[i], planInfo, planTermInfo, auditData, req, transaction);
                            // console.log('splitPaymentRes', splitPaymentRes);
                            if (splitPaymentRes) {
                                paymentData[i] = splitPaymentRes.paymentData
                                policyData[i] = splitPaymentRes.policyData
                                auditData = splitPaymentRes.auditData
                            }
                            //    return
                        } else {
                            let paymentObj = {
                                authorizeNet_customer_profile_id: createdCustomer.authorizeNet_customer_profile_id,
                                authorizeNet_payment_profile_id: selectedCardDetails ? selectedCardDetails.authorizeNet_payment_profile_id : paymentProfileId,
                                customer_id: createdCustomer.customer_id,
                                customer_email: createdCustomer.email,
                                first_name: element.first_name ? element.first_name : null,
                                last_name: element.last_name ? element.last_name : null,
                                billing_zip: element.billing_zip ? element.billing_zip : null,
                                billing_city: element.billing_city ? element.billing_city : null,
                                billing_state: element.billing_state ? element.billing_state : null,
                                billing_address: element.billing_address1 ? element.billing_address1 : null,
                                card_number: selectedCardDetails ? selectedCardDetails.card_number : element.cardNumber,
                                card_expiry_date: element.cardExpiryDate ? element.cardExpiryDate : null,
                                card_cvv: element.cvv ? element.cvv : null,
                                policy_no: policyNumber,
                                plan_name: planInfo.plan_name,
                                plan_term: planTermInfo.plan_term,
                                tax_amount: element.tax_amount,
                                net_amount: element.net_amount,
                                chargable_amount: element.net_amount,
                                policy_start_date: element.policy_start_date ? moment(element.policy_start_date).format('YYYY-MM-DD') : null,
                                policy_expiry_date: element.policy_end_date ? moment(element.policy_end_date).format('YYYY-MM-DD') : null,
                                expiry_with_bonus: element.expiry_with_bonus ? moment(element.expiry_with_bonus).format('YYYY-MM-DD') : null,
                                recurring_type: planTermInfo.plan_term_month == 1 ? 1 : 0,//  monthly=>1
                                orderDetails: `${planInfo.plan_name} plan from  ${element.policy_start_date ? moment(element.policy_start_date).format('YYYY-MM-DD') : null} to ${element.expiry_with_bonus ? moment(element.expiry_with_bonus).format('YYYY-MM-DD') : null}`,
                            }
                            const chargeCustomerProfileResponse = await securePaymentsService.chargeCustomerProfile(paymentObj);
                            policyData[i].transactionResponse = chargeCustomerProfileResponse//.getTransactionResponse()
                            paymentData[i].transaction_response = chargeCustomerProfileResponse//.getTransactionResponse()
                            const responseObject = chargeCustomerProfileResponse;
                            const resultCode = responseObject?.messages?.resultCode;
                            const code = responseObject?.messages?.message[0]?.code;
                            const transactionResponse = responseObject?.transactionResponse;
                            const transactionResponseCode = responseObject?.transactionResponse?.responseCode;
                            if (resultCode === 'Ok' && code === 'I00001' && transactionResponse && (transactionResponseCode== 1|| transactionResponseCode== 4)) {
                                // if (chargeCustomerProfileResponse.getTransactionResponse() && chargeCustomerProfileResponse.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
                                // if (chargeCustomerProfileResponse.getTransactionResponse() && chargeCustomerProfileResponse.getTransactionResponse().getResponseCode() === '1') {
                                // Payment was successful  
                                if (customerCardData[i] && Object.keys(customerCardData[i]).length !== 0 && !element.selectedCardId) {
                                    customerCardData[i].card_type = chargeCustomerProfileResponse.transactionResponse.accountType
                                    const createdCustomerCard = await customerCardService.createCustomerCard(customerCardData[i], transaction);
                                }
                                paymentData[i].transaction_no = chargeCustomerProfileResponse.getTransactionResponse().getTransId();
                                paymentData[i].card_type = chargeCustomerProfileResponse.transactionResponse.accountType
                                paymentData[i].payment_status = 1 //success=>1
                                policyData[i].payment_status = 1 // success=>1
                                paymentData[i].payment_successfull_date = moment().format('YYYY-MM-DD')
                            } else {
                                paymentData[i].payment_status = 2 //failed=>2
                                policyData[i].payment_status = 2 //failed=>2
                                // Payment failed or encountered an issue
                                auditData.description = 'policy creation failed due to payment failed';
                                await helper.updateAuditTrail(auditData, req)
                                throw new CustomError(`Payment failed! `, 402)
                            }

                        }


                    } else if (element.payment_type == 2) {
                        // bank payment
                        let paymentObj = {
                            first_name: element.first_name ? element.first_name : null,
                            last_name: element.last_name ? element.last_name : null,
                            billing_zip: element.billing_zip ? element.billing_zip : null,
                            billing_city: element.billing_city ? element.billing_city : null,
                            billing_state: element.billing_state ? element.billing_state : null,
                            billing_address: element.billing_address1 ? element.billing_address1 : null,
                            acc_holder_name: element.bankAccountHolderName ? element.bankAccountHolderName : null,
                            acc_no: element.bankAccountNumber ? element.bankAccountNumber : null,
                            routing_no: element.routingNumber ? element.routingNumber : null,
                            policy_no: policyNumber,
                            plan_name: planInfo.plan_name,
                            plan_term: planTermInfo.plan_term,
                            tax_amount: element.tax_amount,
                            net_amount: element.net_amount,
                            policy_start_date: element.policy_start_date ? moment(element.policy_start_date).format('YYYY-MM-DD') : null,
                            policy_expiry_date: element.policy_end_date ? moment(element.policy_end_date).format('YYYY-MM-DD') : null,
                            expiry_with_bonus: element.expiry_with_bonus ? moment(element.expiry_with_bonus).format('YYYY-MM-DD') : null,
                        }
                        const transactionResponse = await securePaymentsService.debitBankAccount(req, res, next, paymentObj);
                        policyData[i].transactionResponse = transactionResponse
                        paymentData[i].transaction_response = transactionResponse
                        if (transactionResponse.transactionResponse && transactionResponse.transactionResponse.responseCode === '1') {
                            // Payment was successful
                            paymentData[i].transaction_no = transactionResponse.getTransactionResponse().getTransId();
                            paymentData[i].payment_status = 1 //success=>1
                            policyData[i].payment_status = 1 // success=>1
                        } else {
                            // Payment failed or encountered an issue
                            paymentData[i].payment_status = 2 //failed=>2
                            policyData[i].payment_status = 2 //failed=>2
                            auditData.description = 'policy creation failed due to payment failed';
                            await helper.updateAuditTrail(auditData, req)
                            throw new CustomError(`Payment failed! ${transactionResponse.getTransactionResponse().getErrors() ? transactionResponse.getTransactionResponse().getErrors().getError()[0].getErrorText() : transactionResponse.messages.message[0].text}`, 402)
                        }
                    }
                } else if (moment(element.paymentDate).isAfter(moment())) {
                    // payment date is Future date .
                    if (element.payment_type == 1) {
                        // Card payment  
                        if (customerCardData[i] && Object.keys(customerCardData[i]).length !== 0 && !element.selectedCardId) {
                            const createdCustomerCard = await customerCardService.createCustomerCard(customerCardData[i], transaction);
                        }
                    } else if (element.payment_type == 2) {
                        // bank payment  
                    }
                    paymentData[i].payment_status = 4// pending=>4
                    policyData[i].payment_status = 4// pending=>4
                } else {
                    throw new CustomError(`Payment date should be the current date or future date`, 400)
                }
            } else if (element.payment_type == 3) {
                /* Escrow Payment */
                paymentData[i].payment_status = 4// pending=>4
                policyData[i].payment_status = 4// pending=>4
            } else if (element.payment_type == 4) {
                /* do not charge Payment */
                paymentData[i].payment_status = 4// pending=>4
                policyData[i].payment_status = 4// pending=>4
            } else if (element.payment_type == 5) {
                /* link Payment */
                paymentData[i].payment_status = 4// pending=>4
                policyData[i].payment_status = 4// pending=>4
            }
        };
        await Promise.all(policyData.map(async (data, i) => {
            try {
                if (paymentData[i].payment_status == 4 || paymentData[i].payment_status == 1) {
                    // Payment was successful
                    // Create the policy record
                    const createdPolicy = await policyService.createPolicy(data, transaction);



                    // Create an array of policy products associated with the policy
                    // console.log('data.policyProductData',data.policyProductData);
                    let policyProductsData = data.policyProductData.map((productData) => ({
                        org_id: createdPolicy.org_id,
                        policy_id: createdPolicy.policy_id, // Associate the policy product with the policy
                        product_id: productData.product_id,
                        product_name: productData.product_name,
                        monthly_price: productData.monthly_price,
                        yearly_price: productData.yearly_price,
                        product_quantity: 1,
                        create_user_type: 2,
                        created_by: org_user_id,
                    }));
                    policyProductsData = _.uniq(policyProductsData);
                    paymentData[i].policy_id = createdPolicy.policy_id;
                    policyWiseCommissionData[i].policy_id = createdPolicy.policy_id;
                    policyNoteData[i].policy_id = createdPolicy.policy_id;
                    // Bulk insert the policy products associated with the policy
                    if (policyProductsData.length > 0) {
                        let createdPolicyProducts = await planService.createBulkPolicyProducts(policyProductsData, transaction);
                        if (createdPolicyProducts) {
                            if (paymentData.length == 0) {
                                throw new CustomError(`Payment Information not found`);
                            }
                            let createdPayments = await paymentService.createPayment(paymentData[i], transaction);
                            if (createdPolicy.policy_term_month == 1 && paymentData[i].payment_date) {
                                for (let p = 0; p < 12; p++) {
                                    const nextPaymentDate = moment(paymentData[i].payment_date).add(1, 'months');
                                    paymentData[i].payment_date = adjustDateForLeapYear(nextPaymentDate);
                                    if (moment().format('YYYY-MM-DD') != moment(paymentData[i].payment_date).format('YYYY-MM-DD')) {
                                        paymentData[i].transaction_no = null;
                                        paymentData[i].payment_successfull_date = null;
                                        policyData[i].transactionResponse = null
                                        paymentData[i].transaction_response = null
                                        paymentData[i].payment_status = 4// pending=>4
                                        policyData[i].payment_status = 4// pending=>4
                                    }
                                    createdPayments = await paymentService.createPayment(paymentData[i], transaction);
                                }
                            }
                            // console.log('before callleddd... future paymentttttt=====',createdPolicy.policy_term_month > 1 && paymentData[i].selected_split_payment_count && paymentData[i].selected_split_payment_count > 1 && paymentData[i].splitPlaymentData.length > 0);
                            // return
                            if (createdPolicy.policy_term_month > 1 && paymentData[i].selected_split_payment_count && paymentData[i].selected_split_payment_count > 1 && paymentData[i].splitPlaymentData.length > 0) {

                                for (let p = 0; p < paymentData[i].splitPlaymentData.length; p++) {
                                    const el = paymentData[i].splitPlaymentData[p]

                                    const nextPaymentDate = moment(el.payment_date).format('YYYY-MM-DD');
                                    paymentData[i].payment_date = adjustDateForLeapYear(nextPaymentDate);

                                    if (moment().format('YYYY-MM-DD') != moment(el.payment_date).format('YYYY-MM-DD')) {
                                        paymentData[i].transaction_no = null;
                                        paymentData[i].payment_successfull_date = null;
                                        policyData[i].transactionResponse = null
                                        paymentData[i].transaction_response = null
                                        paymentData[i].payment_status = 4// pending=>4
                                        policyData[i].payment_status = 4// pending=>4
                                        createdPayments = await paymentService.createPayment(paymentData[i], transaction);
                                    }

                                }
                            }
                            //SEND LINK PAYMENT 
                            if (paymentData[i].payment_type == 5) {
                                let sendPaymentObj = {  //PAYMENT LINK OBJECT
                                    org_id: createdPayments.org_id,
                                    policy_id: createdPayments.policy_id,
                                    customer_id: createdPayments.customer_id,
                                    payment_id: createdPayments.payment_id,
                                    created_by: org_user_id
                                }
                                const token = helper.generateToken(sendPaymentObj, '15d') //GENERATING PAYMENT LINK
                                sendPaymentObj.payment_link = `${helper.website_baseUrl}customer-payment-deeplink/${token}`
                                let createdPaymentLink = await policyService.sendPaymentLink(sendPaymentObj, transaction);  //CALLING POLICY SERVICE
                                // console.log(createdPaymentLink);
                                if (createdPaymentLink) {
                                    let dataObj = policyData[i]
                                    dataObj.email_imageUrl = helper.email_imageUrl
                                    dataObj.mobile = helper.setUSFormatPhoneNumber(policyData[i].mobile)
                                    dataObj.policy_start_date = moment(policyData[i].policy_start_date).format('MM-DD-YYYY'),
                                        dataObj.expiry_with_bonus = moment(policyData[i].expiry_with_bonus).format('MM-DD-YYYY'),
                                        dataObj.order_date = moment(policyData[i].order_date).format('MM-DD-YYYY'),
                                        dataObj.company_address = mailConfig.company_address,
                                        dataObj.company_phone = mailConfig.company_phone,
                                        dataObj.company_email = mailConfig.company_email,
                                        dataObj.company_copyright_year = mailConfig.company_copyright_year,
                                        dataObj.company_website = mailConfig.company_website,
                                        dataObj.company_website_link = mailConfig.company_website_link,
                                        dataObj = {
                                            ...dataObj,
                                            payment_link: sendPaymentObj.payment_link,
                                            plan_name: planInfo.plan_name
                                        }
                                    let sendMail = await mailService.triggerMail('sendPaymentLink.ejs', dataObj, '', createdCustomer.email, 'Payment Link');

                                }
                            }

                            const createdPolicyWiseCommission = await policyWiseCommissionService.createpolicyWiseCommission(policyWiseCommissionData[i], transaction);
                            if (policyNoteData[i].notes) {
                                auditData.description = `policy note created with policy number ${policyNumber}`;
                                await helper.updateAuditTrail(auditData, req)
                                const createdPolicyNotes = await policyNoteService.createpolicyNotes(policyNoteData[i], transaction);
                            }


                            if (createdPayments && createdPolicyWiseCommission) {
                                let dataObj = {
                                    base_url: `${helper.website_baseUrl}`,
                                    customer_email: createdCustomer.email,
                                    customer_password: password,
                                    customer_name: createdCustomer.first_name + ' ' + createdCustomer.last_name,
                                    customer_plan: planInfo.plan_name,
                                    company_address: mailConfig.company_address,
                                    company_phone: mailConfig.company_phone,
                                    company_email: mailConfig.company_email,
                                    company_copyright_year: mailConfig.company_copyright_year,
                                    company_website: mailConfig.company_website,
                                    company_website_link: mailConfig.company_website_link,
                                    email_imageUrl: helper.email_imageUrl
                                }
                                let policyCreateMailTrigger = await mailService.triggerMail(createdCustomer.isExistingCustomer ? 'policyPurchaseTemp.ejs' : 'newCustomerTemp.ejs', dataObj, '', createdCustomer.email, 'Policy purchased Successfully. Welcome to our Family!');


                                transaction.commit();
                                if (paymentData[i].payment_type == 3) {
                                    //for esccrow payment send the email Attachment
                                    // const templatePath = path.join(__dirname, `../../../view/emailTemplate/policyPurchaseTemp.ejs`);
                                    // const storagePath = path.join(__dirname, `../../../public/org_files/hws_${req.tokenData.org_id}/documents/customers/policy_docs`);
                                    /*   console.log('current Directory', __dirname);
                                      const projectRoot = path.join(__dirname, '../../..');
                                      console.log('projectRoot', projectRoot);
                                      const templatePath = path.join(projectRoot, 'view', 'emailTemplate', 'policyPurchaseTemp.ejs');
                                      console.log('templatePath', templatePath);
                                      const storagePath = path.join(projectRoot, 'public', `org_files/hws_${req.tokenData.org_id}/documents/customers/policy_docs`);
                                      console.log('storagePath', storagePath);
  
                                      const pdfName = `Escrow-Invoice_${createdPolicy.policy_id}_${new Date().getTime()}` 
                                      let genEscrowPdfRes = await helper.generatePdfFromEjs(templatePath, dataObj, storagePath, pdfName);*/
                                    // const result = await db.sequelize.transaction(async (t) => {
                                    // return escrowMailTrigger;
                                    // });
                                }
                                if (paymentData[i].payment_status == 1) {
                                    // success payment
                                    let generatePaymentReceiptData = await policyService.generatePaymentReceiptData(createdPolicy.org_id, createdPolicy.policy_id);
                                    if (generatePaymentReceiptData) {

                                        let dataObj = generatePaymentReceiptData;
                                        dataObj.company_address = mailConfig.company_address,
                                            dataObj.company_phone = mailConfig.company_phone,
                                            dataObj.company_email = mailConfig.company_email,
                                            dataObj.company_copyright_year = mailConfig.company_copyright_year,
                                            dataObj.company_website = mailConfig.company_website,
                                            dataObj.company_website_link = mailConfig.company_website_link,
                                            dataObj.email_imageUrl = helper.email_imageUrl

                                        let paymentRecipetMailTrigger = await mailService.triggerMail('paymentRecipet.ejs', dataObj, '', createdPolicy.email, 'Receipt: Payment Successfully Received');

                                    }
                                }
                                if (policyCreateMailTrigger) {
                                    res.status(200).send({ status: 1, message: "Policy Created Successfully.", createdPolicy: createdPolicy });
                                } else {
                                    res.status(200).send({ status: 1, message: `The mail server could not deliver mail to ${createdCustomer.email}. Please check your email id` })
                                    //  throw new CustomError (`The mail server could not deliver mail to ${createdCustomer.email}. Please check your email id`,500)
                                }
                                auditData.row_id = createdPolicy.policy_id;
                                auditData.description = 'policy created successfully from admin';
                                await helper.updateAuditTrail(auditData, req)
                                // console.log('createdCustomer.isExistingCustomer',createdCustomer);

                            } else {
                                auditData.description = 'policy creation failed';
                                await helper.updateAuditTrail(auditData, req)
                                throw new CustomError(`Something went wrong! , please try again later`);
                            }
                        }
                    }
                } else {
                    auditData.description = 'policy creation failed due to payment failed';
                    await helper.updateAuditTrail(auditData, req)
                    throw new CustomError(`Payment failed or encountered an issue`, 402)
                    // Payment failed or encountered an issue
                    // Handle the failure scenario here
                }
            } catch (error) {
                console.log('error', error);
                await transaction.rollback();
                next(error);
            }
        }));

    } catch (error) {
        await transaction.rollback()
        next(error)
    }
}
async function calculateSplitPayment(element, createdCustomer, paymentData, policyData, paymentProfileId, selectedCardDetails, customerCardData, planInfo, planTermInfo, auditData, req, transaction) {
    console.log(paymentData);
    if (element.selected_split_payment_count && element.selected_split_payment_count > 1) {
        if (paymentData.splitPlaymentData.length > 0) {
            for (let i = 0; i < paymentData.splitPlaymentData.length; i++) {
                const el = paymentData.splitPlaymentData[i];
                if (moment().format('YYYY-MM-DD') == moment(el.payment_date).format('YYYY-MM-DD')) {
                    paymentData.amount = el.amount
                    paymentData.payment_date = moment(el.payment_date).format('YYYY-MM-DD')

                    let paymentObj = {
                        authorizeNet_customer_profile_id: createdCustomer.authorizeNet_customer_profile_id,
                        authorizeNet_payment_profile_id: selectedCardDetails ? selectedCardDetails.authorizeNet_payment_profile_id : paymentProfileId,
                        customer_id: createdCustomer.customer_id,
                        customer_email: createdCustomer.email,
                        first_name: element.first_name ? element.first_name : null,
                        last_name: element.last_name ? element.last_name : null,
                        billing_zip: element.billing_zip ? element.billing_zip : null,
                        billing_city: element.billing_city ? element.billing_city : null,
                        billing_state: element.billing_state ? element.billing_state : null,
                        billing_address: element.billing_address1 ? element.billing_address1 : null,
                        card_number: selectedCardDetails ? selectedCardDetails.card_number : element.cardNumber,
                        card_expiry_date: element.cardExpiryDate ? element.cardExpiryDate : null,
                        card_cvv: element.cvv ? element.cvv : null,
                        policy_no: policyData.policy_number,
                        plan_name: planInfo.plan_name,
                        plan_term: planTermInfo.plan_term,
                        tax_amount: element.tax_amount,
                        chargable_amount: el.amount,
                        policy_start_date: element.policy_start_date ? moment(element.policy_start_date).format('YYYY-MM-DD') : null,
                        policy_expiry_date: element.policy_end_date ? moment(element.policy_end_date).format('YYYY-MM-DD') : null,
                        expiry_with_bonus: element.expiry_with_bonus ? moment(element.expiry_with_bonus).format('YYYY-MM-DD') : null,
                        recurring_type: planTermInfo.plan_term_month == 1 ? 1 : 0,//  monthly=>1
                        orderDetails: `${planInfo.plan_name} plan from  ${element.policy_start_date ? moment(element.policy_start_date).format('YYYY-MM-DD') : null} to ${element.expiry_with_bonus ? moment(element.expiry_with_bonus).format('YYYY-MM-DD') : null}`,
                    }
                    const chargeCustomerProfileResponse = await securePaymentsService.chargeCustomerProfile(paymentObj);
                    policyData.transactionResponse = chargeCustomerProfileResponse//.getTransactionResponse()
                    paymentData.transaction_response = chargeCustomerProfileResponse//.getTransactionResponse()
                    const responseObject = chargeCustomerProfileResponse;
                    const resultCode = responseObject?.messages?.resultCode;
                    const code = responseObject?.messages?.message[0]?.code;
                    const transactionResponse =  responseObject?.transactionResponse;
                    const transactionResponseCode =  responseObject?.transactionResponse?.responseCode;
                    if (resultCode === 'Ok' && code === 'I00001' && transactionResponse && (transactionResponseCode== 1|| transactionResponseCode== 4)) { 
                        // if (chargeCustomerProfileResponse.getTransactionResponse() && chargeCustomerProfileResponse.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
                        // if (chargeCustomerProfileResponse.getTransactionResponse() && chargeCustomerProfileResponse.getTransactionResponse().getResponseCode() === '1') {
                        // Payment was successful  
                        if (customerCardData && Object.keys(customerCardData).length !== 0 && !element.selectedCardId) {
                            customerCardData.card_type = chargeCustomerProfileResponse.transactionResponse.accountType
                            const createdCustomerCard = await customerCardService.createCustomerCard(customerCardData, transaction);
                        }
                        paymentData.transaction_no = chargeCustomerProfileResponse.getTransactionResponse().getTransId();
                        paymentData.card_type = chargeCustomerProfileResponse.transactionResponse.accountType
                        paymentData.payment_status = 1 //success=>1
                        policyData.payment_status = 1 // success=>1
                        paymentData.payment_successfull_date = moment().format('YYYY-MM-DD')
                    } else {
                        paymentData.payment_status = 2 //failed=>2
                        policyData.payment_status = 2 //failed=>2
                        // Payment failed or encountered an issue
                        auditData.description = 'policy creation failed due to payment failed';
                        await helper.updateAuditTrail(auditData, req)
                        throw new CustomError(`Payment failed! `, 402)
                    }

                }

            }

        }
    }
    return { paymentData, policyData, customerCardData, auditData }

}


exports.getAllpolicy = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        // console.log('req params',req.params);
        const param = req.params.param;
        let parsedQs = querystring.parse(parsedUrl.query);
        if (param == 'renew-policy') {
            parsedQs = helper.convertStringsToNumbers(parsedQs, ['policy_status', 'renewal_status']);
        } else {
            parsedQs = helper.convertStringsToNumbers(parsedQs, ['policy_status']);
        }

        const advanceSearchFields = ['full_name', 'email', 'mobile', 'billing_zip', 'billing_state', 'billing_city', 'billing_address1', 'policy_status', 'renewal_status', 'policy_number', 'created_from', 'created_to']
        const advancedSearchQuery = helper.advanceSerachQueryGenrator(parsedQs, advanceSearchFields)

        // Extract the search term from the query parameters
        const searchingValue = req.query.search || '';
        let nameQueryForSearch = searchingValue ? searchingValue.trim().split(" ") : [];
        let firstName = nameQueryForSearch[0]?.trim();
        let lastName = nameQueryForSearch[1]?.trim();
        // Construct the search query
        const searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    first_name: {
                        [Op.iLike]: `%${firstName}%`,
                    },
                },
                {
                    last_name: {
                        [Op.iLike]: `%${lastName ? lastName : firstName}%`,
                    },
                },
                {
                    policy_number: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    email: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    mobile: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },

                {
                    billing_zip: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    billing_state: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    billing_city: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    billing_address1: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                db.Sequelize.literal(`CAST("net_amount" AS TEXT) ILIKE '%${searchingValue}%'`),

            ],

        } : {};
        const filter = {};
        if (req.query.plan_name) {
            filter['$plan_details.plan_name$'] = {
                [Op.iLike]: `%${req.query.plan_name}%`,
            };
        }

        const filterSource = req.query.source ? { source: parseInt(req.query.source) } : {};
        const filterCreatedBy = req.query.created_by ? { created_by: req.query.created_by } : {};
        const filterPlanTerm = req.query.plan_term ? { '$plan_term_details.plan_term_month$': parseInt(req.query.plan_term) } : {};
        const filterPlanName = req.query.plan_name ? { '$plan_details.plan_name$': { [Op.iLike]: `%${req.query.plan_name}%` } } : {};
        const filterByOrderDate = req.query.filterByOrderDate ? {
            order_date: {
                [Op.between]: [req.query.filterByOrderDate.split(',')[0], req.query.filterByOrderDate.split(',')[1]]
            }
        } : {};

        let filterByExpiryWithin90days = null;
        let renewalPolicyStatusCondition = null;
        if (param == 'renew-policy') {
            filterByExpiryWithin90days = {
                expiry_with_bonus: {
                    [Op.lte]: db.Sequelize.literal(`NOW() + INTERVAL '90 days'`),
                },
                policy_term_month: {
                    [Op.not]: 1
                }
            };
            renewalPolicyStatusCondition = {
                policy_status: {
                    [Op.in]: [1, 3]
                },
            };
        }
        const filterByExpiryWithBonusdate = req.query.filterByExpiryWithBonusdate ? {
            expiry_with_bonus: {
                [Op.between]: [req.query.filterByExpiryWithBonusdate.split(',')[0], req.query.filterByExpiryWithBonusdate.split(',')[1]]
            }
        } : {

        }
        const sortField = req.query.sortField || 'created_at'; // Default to 'created_at'
        const sortOrder = req.query.sortOrder || 'ASC'; // Default to ascending order

        let order;
        if (sortField === 'plan_details.plan_name') {
            order = [[{ model: db.plansModel, as: 'plan_details' }, 'plan_name', sortOrder]];
        } else {
            order = [[sortField, sortOrder]];
        }

        let roleBasedCondition = helper.generateRoleBasedCondition(req.tokenData)
        const queryOptions = {
            // attributes: ['policy_id','customer_id'],

            attributes: { exclude: ['deleted_by', 'deleted_at', 'user_agent', 'device_id', 'ip_address',] },
            where: {
                // ...roleBasedCondition,
                ...searchQuery,
                ...filterPlanTerm,
                ...filterPlanName,
                ...filterByOrderDate,
                ...filterByExpiryWithBonusdate,
                ...filterByExpiryWithin90days,
                ...renewalPolicyStatusCondition,
                ...advancedSearchQuery,
                ...filterSource,
                ...filterCreatedBy,

            },
            include: [

                {
                    model: db.customersModel,
                    as: 'customer_details',
                    attributes: ['customer_id', 'first_name', 'last_name', 'email', 'mobile', 'alternate_phone']
                },

                {
                    model: db.plansModel,
                    as: 'plan_details',
                    attributes: ['plan_id', 'plan_name']
                },
                {
                    model: db.planTermsModel,
                    as: 'plan_term_details',
                    attributes: ['plan_terms_id', 'plan_term', 'plan_term_month']
                },
                {
                    model: db.propertyTypesModel,
                    as: 'property_type_details',
                    attributes: ['property_type_id', 'property_type']
                },
                /* {
                    model: db.policyNotesModel,
                    as: 'policy_note_list',
                    attributes: { exclude: ['deleted_by', 'deleted_at'] },
                }, */
                /*     {
                        model: db.policyProductsModel,
                        as: 'policy_product_list',
                        include: {
                            model: db.productsModel,
                            as: 'product_details',
                            attributes: ['product_id', 'product_name', 'product_type']
                        },
                        attributes: { exclude: ['deleted_by', 'deleted_at'] },
                    }, */

            ],
            order: order,
            distinct: true,
            // logging: console.log,
        };

        if (!searchingValue && !filterPlanName && !filterPlanTerm) {
            queryOptions.include.push({
                model: db.policyProductsModel,
                as: 'policy_product_list',
                include: {
                    model: db.productsModel,
                    as: 'product_details',
                    attributes: ['product_id', 'product_name', 'product_type', 'product_image']
                },
                attributes: { exclude: ['deleted_by', 'deleted_at'] },
            },)
        }
        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }
        let allPolicy = await policyService.getAllpolicy(queryOptions);
        allPolicy.rows = await Promise.all(allPolicy.rows.map(async (element) => {
            if (element.create_user_type == 2) {
                element.created_user_info = await helper.getUserInfo(parseInt(element.created_by));
            }
            if (element.create_user_type == 3) {
                element.created_user_info = await helper.getRealtorInfo(parseInt(element.created_by));
            }
            if (element.update_user_type == 2) {
                element.updated_user_info = await helper.getUserInfo(parseInt(element.updated_by));
            }
            if (element.create_user_type == 1) {
                // Handle create_user_type 3 if needed
                element.created_user_info = {
                    customer_id: element.customer_id,
                    first_name: element.first_name,
                    last_name: element.last_name,
                }
            }
            if (element?.policy_note_list?.length > 0) {
                for (let i = 0; i < element.policy_note_list.length; i++) {
                    const el = element.policy_note_list[i];
                    if (el.create_user_type == 2) {
                        el.created_user_info = await helper.getUserInfo(parseInt(el.created_by));
                    }
                    if (el.update_user_type == 2) {
                        el.updated_user_info = await helper.getUserInfo(parseInt(el.updated_by));
                    }
                }

            }
            await policyService.getPolicyObjectFlagsName(element);
            return element;

        }));
        if (res.pagination) {
            res.pagination.total = allPolicy.count
            res.pagination.totalPages = Math.ceil(allPolicy.count / queryOptions.limit)
        }

        if (allPolicy.count > 0) {
            res.status(200).send({ status: 1, data: allPolicy.rows, pagination: res.pagination, policy_status: res.policy_status, message: 'Policy list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allPolicy.rows, pagination: res.pagination, policy_status: res.policy_status, message: 'No Policy found' })
        }
    } catch (error) {
        next(error)
    }
}
exports.exportGetAllPolicy = async (req, res, next, data) => {
    try {
        const key = req.params.key
        const param = req.params.param
        let customerData = data
        if (key == 'export_xlsx' || key == 'export_csv') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Policies");
            worksheet.columns = [
                { header: "SL", key: "sl_no" },
                // { header: "Id", key: "id" },
                { header: "Full Name", key: "full_name" },
                { header: "First Name", key: "first_name" },
                { header: "Last Name", key: "last_name" },
                { header: "Email", key: "email" },
                { header: "Mobile Number", key: "mobile" },
                { header: "Alternate Mobile Number", key: "alternate_phone" },
                { header: "Zip", key: "billing_zip" },
                { header: "State", key: "billing_state" },
                { header: "City", key: "billing_city" },
                { header: "Address", key: "billing_address1" },
                { header: "Policy No.", key: "policy_number" },
                { header: "Policy Status", key: "policy_status" },
                { header: "Plan Name", key: "plan_name" },
                { header: "Policy Term", key: "policy_term" },
                { header: "Amount", key: "net_amount" },
                { header: "Discount Amount", key: "discount_amount" },
                { header: "Miscellaneous Charges", key: "miscellaneous_charges" },
                { header: "First Free Service", key: "first_free_service" },
                { header: "Order Date", key: "order_date" },
                { header: "Effective From", key: "policy_start_date" },
                { header: "Expiry With Bonus", key: "expiry_with_bonus" },
                { header: "PCF", key: "pcf" },
                { header: "Holding Period", key: "holding_period" },
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
                element.full_name = `${element.first_name} ${element.last_name}`
                element.alternate_phone = element.alternate_phone ? element.alternate_phone : 'N/A'
                element.plan_name = element.plan_details.plan_name
                element.policy_term = element.plan_term_details.plan_term
                element.created_info = element.created_user_info ? `${element.created_user_info.first_name} ${element.created_user_info.last_name}` : 'N/A'
                element.updated_info = element.updated_user_info ? `${element.updated_user_info.first_name} ${element.updated_user_info.last_name}` : 'N/A'

                if (element.source == 1) {
                    element.source = 'Backend Team';
                } else if (element.source == 0) {
                    element.source = 'Self Customer';
                }

                if (element.first_free_service == 1) {
                    element.first_free_service = 'Eligible';
                } else if (element.first_free_service == 0) {
                    element.first_free_service = 'Not Eligible';
                }

                if (element.policy_status == 1) {
                    element.policy_status = 'Active';
                } else if (element.policy_status == 2) {
                    element.policy_status = 'Hold';
                } else if (element.policy_status == 0) {
                    element.policy_status = 'Cancelled';
                } else if (element.policy_status == 3) {
                    element.policy_status = 'In Active';
                }


                element.created_at = element.created_at ? moment(element.created_at).format('MM-DD-YYYY') : 'N/A'
                element.updated_at = element.updated_at ? moment(element.updated_at).format('MM-DD-YYYY') : 'N/A'
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

            res.setHeader("Content-Disposition", `attachment; filename=${param == 'renew-policy' ? 'renew-policy-list' : 'policy-list'}.${key == 'export_csv' ? 'csv' : 'xlsx'}`);
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

exports.getPolicyDetails = async (req, res, next) => {
    try {
        const { policy_param } = req.params;

        if (!policy_param) {
            throw new CustomError(`policy details not find for not getting respective details.`, 400)
        }
        let whereCondition = {}
        // Check if policy_param is a number (policy_id) or not (policy_number)
        if (!isNaN(Number(policy_param))) {
            // If the policy_param is a valid number (policy_id)
            whereCondition = { policy_id: Number(policy_param) };
        } else {
            // If policy_param is not a number (assuming it's policy_number)
            const { policy_param: policy_number } = req.params;
            whereCondition = { policy_number };
        }

        let queryOptions = {
            where: {
                ...whereCondition,
            },
            attributes: { exclude: ['deleted_by', 'deleted_at', 'user_agent', 'device_id', 'ip_address',] },
            include: [
                {
                    model: db.customersModel,
                    as: 'customer_details',
                    attributes: ['customer_id', 'first_name', 'last_name', 'email'],
                    include: {
                        model: db.customerCardsModel,
                        as: 'card_list',
                        attributes: { exclude: ['deleted_by', 'deleted_at', 'card_number'] },
                        // attributes: ['payment_id']
                    },
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
                    model: db.propertyTypesModel,
                    as: 'property_type_details',
                    attributes: { exclude: ['deleted_by', 'deleted_at'] },
                },
                {
                    model: db.policyProductsModel,
                    as: 'policy_product_list',
                    attributes: { exclude: ['deleted_by', 'deleted_at'] },
                    include: {
                        model: db.productsModel,
                        as: 'product_details',
                        attributes: { exclude: ['deleted_by', 'deleted_at'] },
                    }
                },
                {
                    model: db.policyNotesModel,
                    as: 'policy_note_list',
                    attributes: { exclude: ['deleted_by', 'deleted_at'] },
                },
                {
                    model: db.claimsModel,
                    as: 'claim_list',
                    attributes: { exclude: ['deleted_by', 'deleted_at', 'card_number'] },
                    // attributes: ['payment_id']
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
                    ]
                },
            ]
        }
        let policyDetails = await policyService.findOnePolicy(queryOptions);


        if (policyDetails) {
            if (policyDetails.create_user_type == 2) {
                policyDetails.created_user_info = await helper.getUserInfo(parseInt(policyDetails.created_by));
            }
            if (policyDetails.update_user_type == 2) {
                policyDetails.updated_user_info = await helper.getUserInfo(parseInt(policyDetails.updated_by));
            }
            if (policyDetails.create_user_type == 1) {
                // Handle create_user_type 3 if needed
                policyDetails.created_user_info = {
                    customer_id: policyDetails?.customer_details.customer_id,
                    first_name: policyDetails?.customer_details.first_name,
                    last_name: policyDetails?.customer_details.last_name,
                }
            }

            if (policyDetails.customer_details.card_list.length > 0) {
                policyDetails.customer_details?.card_list.forEach(element => {
                    element.card_last_4_digit = element.card_last_4_digit ? "xxxx xxxx xxxx " + element.card_last_4_digit : null
                    let card_expiry_date = helper.decodeCrypto(element.card_expiry_date)
                    element.card_expiry_date = card_expiry_date
                });
            }
            if (policyDetails.policy_note_list.length > 0) {
                for (let I = 0; I < policyDetails.policy_note_list.length; I++) {
                    let element = policyDetails.policy_note_list[I];
                    if (element.create_user_type == 2) {
                        element.created_user_info = await helper.getUserInfo(parseInt(element.created_by));
                    }
                    if (element.update_user_type == 2) {
                        element.updated_user_info = await helper.getUserInfo(parseInt(element.updated_by));
                    }
                }

            }
            await policyService.getPolicyObjectFlagsName(policyDetails);
            res.status(200).send({ status: 1, message: `Policy Details fetched successfully`, data: policyDetails });

        } else {
            throw new CustomError(`Policy data not found`, 404)
        }
    } catch (error) {
        next(error);
    }
}

exports.updatePolicy = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { policy_id } = req.params;
        const org_user_id = req.tokenData.org_user_id;
        let payload = req.body;
        // return 
        let paymentProfileId = null
        let selectedCardDetails = null
        let isExistPolicy = await policyService.findPolicyByPolicyId(policy_id,
            {
                include: [
                    {
                        model: db.customersModel,
                        as: 'customer_details',
                    },
                    {
                        model: db.policyProductsModel,
                        as: 'policy_product_list',
                        attributes: { exclude: ['create_user_type', 'update_user_type', 'created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
                    },
                ]
            }
        );
        const planInfo = await planService.findPlanById(payload.plan_id)
        let policyNumber = isExistPolicy.policy_number;
        if (payload.plan_id != isExistPolicy.plan_id) {
            policyNumber = planInfo.plan_name.toUpperCase().slice(0, 2) + policyNumber.substring(2);
            let checkPolicyNumberIsExist = await policyService.findPolicyByPolicyNumber(policyNumber);
            if (checkPolicyNumberIsExist) {
                policyNumber = policyNumber + Math.floor(Math.random() * 90) + 10 + parseInt(moment().format('ss'));
            }
        }
        if (!isExistPolicy) {
            throw new CustomError(`Someething went wrong! Policy Not Found`, 400);
        }
        const planTermInfo = await planTermsService.findPlanTermById(parseInt(payload.plan_terms_id))
        if (!planInfo) {
            throw new CustomError(`plan Information not found`);
        }
        let getProducts = await planService.findPlanWithProductByPlanId(payload.plan_id);
        getProducts = helper.getJsonParseData(getProducts);
        if (getProducts.length == 0) {
            throw new CustomError(`Plan product Information not found`);
        }
        let policyData = {
            first_name: payload.first_name ? payload.first_name : isExistPolicy.first_name,
            last_name: payload.last_name ? payload.last_name : isExistPolicy.last_name,
            email: payload.email ? payload.email : isExistPolicy.email,
            mobile: payload.mobile ? payload.mobile : isExistPolicy.mobile,
            alternate_phone: payload.alternate_phone ? payload.alternate_phone : null,
            billing_zip: payload.billing_zip ? payload.billing_zip : isExistPolicy.billing_zip,
            billing_city: payload.billing_city ? payload.billing_city : isExistPolicy.billing_city,
            billing_state: payload.billing_state ? payload.billing_state : isExistPolicy.billing_state,
            billing_address1: payload.billing_address1 ? payload.billing_address1 : isExistPolicy.billing_address1,
            policy_number: policyNumber,
            plan_id: payload.plan_id ? payload.plan_id : isExistPolicy.plan_id,
            plan_terms_id: payload.plan_terms_id ? parseInt(payload.plan_terms_id) : isExistPolicy.plan_terms_id,
            policy_term: planTermInfo.plan_term,
            policy_term_month: planTermInfo.plan_term_month,
            pcf: payload.pcf ? parseFloat(payload.pcf) : isExistPolicy.pcf,
            policy_start_date: payload.policy_start_date ? moment(payload.policy_start_date).format('YYYY-MM-DD') : isExistPolicy.policy_start_date,
            policy_expiry_date: payload.policy_end_date ? moment(payload.policy_end_date).format('YYYY-MM-DD') : isExistPolicy.policy_expiry_date,
            expiry_with_bonus: payload.expiry_with_bonus ? moment(payload.expiry_with_bonus).format('YYYY-MM-DD') : isExistPolicy.expiry_with_bonus,
            property_type_id: payload.property_type_id ? payload.property_type_id : isExistPolicy.property_type_id,
            property_size_id: payload.property_size_id ? payload.property_size_id : isExistPolicy.property_size_id,
            bonus_month: payload.bonus_month ? payload.bonus_month : isExistPolicy.bonus_month,
            policy_amount: payload.policy_amount ? payload.policy_amount : isExistPolicy.policy_amount,
            addon_coverage_amount: payload.addon_coverage_amount,
            sub_total_amount: payload.sub_total_amount,
            tax_type: payload.tax_type,
            tax_percentage: payload.tax_percentage,
            tax_amount: payload.tax_amount,
            total_price: payload.total_price,
            net_amount: payload.net_amount,
            holding_period: payload.holding_period,
            // ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            update_user_type: 2,
            updated_by: org_user_id,

            //payment_status:  null
        }
        let policyProductsData = [...payload.selectedAddOnItems, ...getProducts];
        policyProductsData = policyProductsData.map((productData) => ({
            org_id: isExistPolicy.org_id,
            policy_id: policy_id, // Associate the policy product with the policy
            product_id: productData.product_id,
            product_name: productData.product_name,
            monthly_price: productData.monthly_price,
            yearly_price: productData.yearly_price,
            product_quantity: 1,
            create_user_type: 2,
            created_by: org_user_id,
        }));
        policyProductsData = _.uniq(policyProductsData);

        let policyNoteData = {
            policy_id: policy_id,
            policy_number: isExistPolicy.policy_number,
            org_id: req.tokenData.org_id,
            customer_id: isExistPolicy.customer_id,
            notes: payload.policy_note ? payload.policy_note : null,
            create_user_type: 2,
            created_by: org_user_id,
        }
        let policyAmountUpdateLogData = {
            policy_id: policy_id,
            org_id: req.tokenData.org_id,
            customer_id: isExistPolicy.customer_id,
            plan_terms_id: payload.plan_terms_id ? parseInt(payload.plan_terms_id) : isExistPolicy.plan_terms_id,
            policy_term_months: planTermInfo.plan_term_month,
            previous_policy_term_months: isExistPolicy.policy_term_month,
            previous_plan_id: isExistPolicy.plan_id,
            plan_id: payload.plan_id ? payload.plan_id : isExistPolicy.plan_id,
            policy__amount_update_sale_type: payload.net_amount > isExistPolicy.net_amount ? 1 : 0,// "Up Sale=>1, Down Sale=>0",
            amount: Math.abs(parseFloat(Number(payload.net_amount - isExistPolicy.net_amount).toFixed(2))),
            ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            create_user_type: 2,
            created_by: org_user_id,
        }
        let policyWiseCommissionData = {
            policy_id: policy_id,
            org_id: isExistPolicy.org_id,
            org_user_id: org_user_id,
            policy_no: policyNumber,
            customer_id: isExistPolicy.customer_id,
            commission_value: payload.commission_value,
            commission_type: payload.commission_type,
            created_by: org_user_id,
        }

        let auditData = {
            customer_id: isExistPolicy.customer_id,
            user_id: org_user_id,
            row_id: policy_id,
            section: 'ADMIN_POLICY_UPDATE',
            table_name: 'hws_policies',
            source: 1,
            create_user_type: 2,
            created_by: org_user_id,
            device_id: isExistPolicy.device_id,
        }

        const updatePolicy = await policyService.updatePolicy(policy_id, policyData, transaction);
        const createOrDeletePolicyProducts = await policyService.createOrDeletePolicyProducts(req, res, next, policy_id, isExistPolicy.customer_id, policyProductsData, transaction);
        if (policyNoteData.notes) {
            auditData.description = `policy note created while update policy with policy number ${policyNumber}`;
            await helper.updateAuditTrail(auditData, req)
            const createdPolicyNotes = await policyNoteService.createpolicyNotes(policyNoteData, transaction);
        }

        if (updatePolicy && createOrDeletePolicyProducts) {
            let paymentData = {
                policy_id: policy_id,
                org_id: isExistPolicy.org_id,
                customer_id: isExistPolicy.customer_id,
                amount: payload.updatePaymentAmount,
                state: payload.billing_state ? payload.billing_state : null,
                payment_type: payload.payment_type ? payload.payment_type : null,
                acc_holder_name: payload.bankAccountHolderName ? payload.bankAccountHolderName : null,
                acc_no: payload.bankAccountNumber ? payload.bankAccountNumber : null,
                routing_no: payload.routingNumber ? payload.routingNumber : null,
                payment_date: payload.paymentDate ? moment(payload.paymentDate).format('YYYY-MM-DD') : null,
                payment_successfull_date: null,
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
                recurring_type: planTermInfo.plan_term_month == 1 ? 1 : 0,//  monthly=>1
                cheque_no: payload.cheque_no ? payload.cheque_no : null,
            }
            if (policyData.net_amount != isExistPolicy.net_amount) {
                const isExistCard = await customerCardService.getCustomerAllSavedCards({ where: { customer_id: isExistPolicy.customer_id } })
                // if upsale or downgrade policy
                const createPolicyAmountUpdateLog = await policyService.createPolicyAmountUpdateLog(policyAmountUpdateLogData, transaction);


                if (policyData.policy_term_month == 1 && isExistPolicy.policy_term_month == 1) {
                    // if existing policy term and updated policy term is same then update the amount
                    let updatePayment = await db.paymentsModel.update({ amount: payload.net_amount }, { where: { policy_id: policy_id, customer_id: isExistPolicy.customer_id, payment_status: 4 }, transaction });

                }

                if (policyData.policy_term_month == 1 && isExistPolicy.policy_term_month > 1) {
                    // if policy term yearly to monthly
                    if (isExistCard.length == 0 && paymentData.payment_type == null) {
                        throw new CustomError(`Policy updating has  failedsince the customer does not have a Save Credit Card.`)
                    }
                    // deactivate previous pending transaction
                    let updatePayment = await db.paymentsModel.update({ payment_status: 5 }, { where: { policy_id: policy_id, customer_id: isExistPolicy.customer_id, payment_status: 4 }, transaction });
                    if (paymentData.payment_type == null) {
                        // if payment type null means  its downgraded update policy because if is it upsale policy then it should have payment information
                        // payment information null then bydefault payment mode is  primary credit card
                        selectedCardDetails = await customerCardService.getCustomerCardById({ where: { customer_id: isExistPolicy.customer_id, primary_card: true } })
                        let futurePaymentData = { ...paymentData }
                        futurePaymentData.payment_type = 1
                        futurePaymentData.card_holder_name = selectedCardDetails.card_holder_name
                        futurePaymentData.card_number = selectedCardDetails.card_last_4_digit
                        futurePaymentData.card_expiry_date = helper.encodeCrypto(selectedCardDetails.card_expiry_date)
                        futurePaymentData.card_type = selectedCardDetails.card_type;
                        futurePaymentData.amount = payload.net_amount


                        for (let p = 0; p < 12; p++) {
                            // create 12 monthly recurring payment data.
                            const nextPaymentDate = moment().add(1, 'months');
                            futurePaymentData.payment_date = adjustDateForLeapYear(nextPaymentDate);
                            if (moment().format('YYYY-MM-DD') != moment(futurePaymentData.payment_date).format('YYYY-MM-DD')) {
                                futurePaymentData.transaction_no = null;
                                policyData.transactionResponse = null
                                futurePaymentData.transaction_response = null
                                futurePaymentData.payment_status = 4// pending=>4
                                policyData.payment_status = 4// pending=>4
                            }
                            createdPayments = await paymentService.createPayment(futurePaymentData, transaction);
                        }
                    }
                } else if (policyData.policy_term_month > 1 && isExistPolicy.policy_term_month == 1) {
                    // if current policy term is monthly and update to any yearly policy
                    // deactivate monthly recurring
                    let updatePayment = await db.paymentsModel.update({ payment_status: 5 }, { where: { policy_id: policy_id, customer_id: isExistPolicy.customer_id, payment_status: 4 }, transaction });
                } {
                    // if current term 
                }

                if (policyData.net_amount > isExistPolicy.net_amount) {
                    // if up
                    let customerCardData
                    if (payload.payment_type == 1) {
                        // if paymennt type is credit card
                        if (payload.selectedCardId) {
                            selectedCardDetails = await customerCardService.getCustomerCardById({ where: { customer_id: isExistPolicy.customer_id, customer_card_id: payload.selectedCardId } })
                        } else {
                            if (!isExistPolicy.customer_details.authorizeNet_customer_profile_id) {
                                // if createdCustomer.authorizeNet_customer_profile_id is null, its means they not have customer profile account in authorize.net
                                let customerProfileObj = {
                                    customer_id: isExistPolicy.customer_id,
                                    customer_email: isExistPolicy.customer_details.email,
                                    first_name: isExistPolicy.customer_details.first_name ? isExistPolicy.customer_details.first_name : null,
                                    last_name: isExistPolicy.customer_details.last_name ? isExistPolicy.customer_details.last_name : null,
                                    zip: isExistPolicy.customer_details.zip ? isExistPolicy.customer_details.zip : null,
                                    city: isExistPolicy.customer_details.city ? isExistPolicy.customer_details.city : null,
                                    state: isExistPolicy.customer_details.state ? isExistPolicy.customer_details.state : null,
                                    address: isExistPolicy.customer_details.address1 ? isExistPolicy.customer_details.address1 : null,
                                    card_number: payload.cardNumber,
                                    card_expiry_date: payload.cardExpiryDate ? payload.cardExpiryDate : null,
                                    card_cvv: payload.cvv ? payload.cvv : null,
                                    policy_no: policyNumber,
                                    plan_name: planInfo.plan_name,
                                    plan_term: planTermInfo.plan_term,
                                    tax_amount: payload.tax_amount,
                                    net_amount: payload.net_amount,
                                    policy_start_date: payload.policy_start_date ? moment(payload.policy_start_date).format('YYYY-MM-DD') : null,
                                    policy_expiry_date: payload.policy_end_date ? moment(payload.policy_end_date).format('YYYY-MM-DD') : null,
                                    expiry_with_bonus: payload.expiry_with_bonus ? moment(payload.expiry_with_bonus).format('YYYY-MM-DD') : null,
                                }
                                const createCustomerProfileResponse = await securePaymentsService.createCustomerProfile(customerProfileObj);
                                //console.log('createCustomerProfile', createCustomerProfileResponse);
                                if (createCustomerProfileResponse) {
                                    isExistPolicy.customer_details.authorizeNet_customer_profile_id = createCustomerProfileResponse.getCustomerProfileId();
                                    const paymentProfileIdObject = createCustomerProfileResponse.getCustomerPaymentProfileIdList().getNumericString()[0];
                                    // Extract the actual ID from the object
                                    paymentProfileId = paymentProfileIdObject.toString();
                                    if (isExistPolicy.customer_details.authorizeNet_customer_profile_id) {
                                        // The response contains the expected structure and customerProfileId
                                        const updateCustomerProfileId = await customerService.updateCustomer(isExistPolicy.customer_id, {
                                            authorizeNet_customer_profile_id: isExistPolicy.customer_details.authorizeNet_customer_profile_id,
                                        }, transaction);
                                    } else {
                                        auditData.description = 'policy creation failed due to invalid credit_card';
                                        await helper.updateAuditTrail(auditData, req)
                                        throw new CustomError('Provided Card Information is Invalid.');
                                    }
                                } else {
                                    auditData.description = 'policy creation failed due to invalid response from authorize.net';
                                    await helper.updateAuditTrail(auditData, req)
                                    throw new CustomError('Invalid response from Authorize.Net');
                                }
                            }
                            let customerPaymentProfileObj = {
                                authorizeNet_customer_profile_id: isExistPolicy.customer_details.authorizeNet_customer_profile_id,
                                customer_id: isExistPolicy.customer_id,
                                customer_email: isExistPolicy.customer_details.email,
                                first_name: payload.first_name ? payload.first_name : null,
                                last_name: payload.last_name ? payload.last_name : null,
                                billing_zip: payload.billing_zip ? payload.billing_zip : null,
                                billing_city: payload.billing_city ? payload.billing_city : null,
                                billing_state: payload.billing_state ? payload.billing_state : null,
                                billing_address: payload.billing_address1 ? payload.billing_address1 : null,
                                card_number: payload.cardNumber,
                                card_expiry_date: payload.cardExpiryDate ? payload.cardExpiryDate : null,
                                card_cvv: payload.cvv ? payload.cvv : null,
                                policy_no: policyNumber,
                                plan_name: planInfo.plan_name,
                                plan_term: planTermInfo.plan_term,
                                tax_amount: payload.tax_amount,
                                net_amount: payload.net_amount,
                                policy_start_date: payload.policy_start_date ? moment(payload.policy_start_date).format('YYYY-MM-DD') : null,
                                policy_expiry_date: payload.policy_end_date ? moment(payload.policy_end_date).format('YYYY-MM-DD') : null,
                                expiry_with_bonus: payload.expiry_with_bonus ? moment(payload.expiry_with_bonus).format('YYYY-MM-DD') : null,
                            }
                            if (isExistCard.length == 0) {
                                // if customer dosenot have any card stored previously
                                customerCardData = {
                                    org_id: isExistPolicy.org_id,
                                    customer_id: isExistPolicy.customer_id,
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
                                    // if customer provide different card details which not stored in customer_card table
                                    if (!paymentProfileId) {
                                        // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                                        const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                                        paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
                                    }

                                    customerCardData = {
                                        org_id: isExistPolicy.org_id,
                                        customer_id: isExistPolicy.customer_id,
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
                                    selectedCardDetails = await customerCardService.getCustomerCardById({ where: { customer_id: isExistPolicy.customer_id, customer_card_id: matchedExpDate.customer_card_id } })
                                    paymentProfileId = selectedCardDetails.authorizeNet_payment_profile_id ? selectedCardDetails.authorizeNet_payment_profile_id : null
                                }
                                if (!paymentProfileId) {
                                    // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                                    const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                                    paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
                                }
                            }

                        }


                    } else if (payload.payment_type == 2) {
                        // bank payment
                    } else if (payload.payment_type == 3) {
                        // escrow payment
                        paymentData.payment_status = 4// pending=>4
                        policyData.payment_status = 4// pending=>4
                    } else if (payload.payment_type == 4) {
                        /* do not charge Payment */
                        paymentData.payment_status = 4// pending=>4
                        policyData.payment_status = 4// pending=>4
                    }
                    if (payload.paymentDate) {
                        // if payment date is current day 
                        if (moment().format('YYYY-MM-DD') == moment(payload.paymentDate).format('YYYY-MM-DD')) {
                            if (payload.payment_type == 1) {
                                // credit card payment
                                if (payload.selectedCardId) {
                                    selectedCardDetails = await customerCardService.getCustomerCardById({ where: { customer_id: isExistPolicy.customer_id, customer_card_id: payload.selectedCardId } })
                                }
                                let paymentObj = {
                                    authorizeNet_customer_profile_id: isExistPolicy.customer_details.authorizeNet_customer_profile_id,
                                    authorizeNet_payment_profile_id: selectedCardDetails ? selectedCardDetails.authorizeNet_payment_profile_id : paymentProfileId,
                                    customer_id: isExistPolicy.customer_id,
                                    customer_email: isExistPolicy.customer_details.email,
                                    first_name: payload.first_name ? payload.first_name : null,
                                    last_name: payload.last_name ? payload.last_name : null,
                                    billing_zip: payload.billing_zip ? payload.billing_zip : null,
                                    billing_city: payload.billing_city ? payload.billing_city : null,
                                    billing_state: payload.billing_state ? payload.billing_state : null,
                                    billing_address: payload.billing_address1 ? payload.billing_address1 : null,
                                    card_number: selectedCardDetails ? selectedCardDetails.card_number : payload.cardNumber,
                                    card_expiry_date: payload.cardExpiryDate ? payload.cardExpiryDate : null,
                                    card_cvv: payload.cvv ? payload.cvv : null,
                                    policy_no: policyNumber,
                                    plan_name: planInfo.plan_name,
                                    plan_term: planTermInfo.plan_term,
                                    tax_amount: payload.tax_amount,
                                    net_amount: payload.updatePaymentAmount,
                                    chargable_amount: payload.updatePaymentAmount,
                                    policy_start_date: payload.policy_start_date ? moment(payload.policy_start_date).format('YYYY-MM-DD') : null,
                                    policy_expiry_date: payload.policy_end_date ? moment(payload.policy_end_date).format('YYYY-MM-DD') : null,
                                    expiry_with_bonus: payload.expiry_with_bonus ? moment(payload.expiry_with_bonus).format('YYYY-MM-DD') : null,
                                }
                                // console.log('paymentObj', paymentObj);
                                const chargeCustomerProfileResponse = await securePaymentsService.chargeCustomerProfile(paymentObj);
                                // console.log(' chargeCustomerProfileResponse Transaction Response:', chargeCustomerProfileResponse);
                                policyData.transactionResponse = chargeCustomerProfileResponse//.getTransactionResponse()
                                paymentData.transaction_response = chargeCustomerProfileResponse//.getTransactionResponse()
                                const responseObject = chargeCustomerProfileResponse;
                                const resultCode = responseObject?.messages?.resultCode;
                                const code = responseObject?.messages?.message[0]?.code;
                                const transactionResponse =  responseObject?.transactionResponse;
                                const transactionResponseCode =  responseObject?.transactionResponse?.responseCode;
                                if (resultCode === 'Ok' && code === 'I00001' && transactionResponse && (transactionResponseCode== 1|| transactionResponseCode== 4)) { 
                                    // if (chargeCustomerProfileResponse.getTransactionResponse() && chargeCustomerProfileResponse.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
                                    // Payment was successful
                                    if (customerCardData && Object.keys(customerCardData).length !== 0 && !payload.selectedCardId) {
                                        customerCardData.card_type = chargeCustomerProfileResponse.transactionResponse.accountType
                                        const createdCustomerCard = await customerCardService.createCustomerCard(customerCardData, transaction);
                                    }
                                    paymentData.transaction_no = chargeCustomerProfileResponse.getTransactionResponse().getTransId();
                                    paymentData.card_type = chargeCustomerProfileResponse.transactionResponse.accountType
                                    paymentData.payment_status = 1 //success=>1
                                    policyData.payment_status = 1 // success=>1
                                    paymentData.payment_successfull_date = moment().format('YYYY-MM-DD')
                                } else {
                                    // Payment failed or encountered an issue
                                    paymentData.payment_status = 2 //failed=>2
                                    policyData.payment_status = 2 //failed=>2
                                    // Payment failed or encountered an issue
                                    auditData.description = 'policy creation failed due to payment failed';
                                    await helper.updateAuditTrail(auditData, req)
                                    throw new CustomError(`Payment failed!`, 402)
                                }
                            } else if (payload.payment_type == 2) {
                                // bank payment
                                paymentData.payment_status = 4 //Pending
                                policyData.payment_status = 4 //Pending                            

                            } else if (payload.payment_type == 3) {
                                // escrow payment
                                paymentData.payment_status = 4 //Pending
                                policyData.payment_status = 4 //Pending                        

                            } else if (payload.payment_type == 4) {
                                /* do not charge Payment */
                                paymentData.payment_status = 4 //Pending
                                policyData.payment_status = 4 //Pending      
                            }
                        } else if (moment(payload.paymentDate).isAfter(moment())) {
                            //**** */ payment date is future date
                            if (payload.payment_type == 1) {
                                // Card payment  
                                if (customerCardData && Object.keys(customerCardData).length !== 0 && !payload.selectedCardId) {
                                    const createdCustomerCard = await customerCardService.createCustomerCard(customerCardData, transaction);
                                }
                            } else if (payload.payment_type == 2) {
                                // bank payment  
                                paymentData.payment_status = 4// pending=>4
                                policyData.payment_status = 4// pending=>4
                            } else if (payload.payment_type == 3) {
                                // ESCROW payment  
                                paymentData.payment_status = 4 //Pending
                                policyData.payment_status = 4 //Pending      
                            } else if (payload.payment_type == 4) {
                                /* do not charge Payment */
                                paymentData.payment_status = 4 //Pending
                                policyData.payment_status = 4 //Pending      
                            }


                        } else {
                            // console.log('payload.paymentDate', payload.paymentDate);
                            auditData.description = 'policy creation failed due to payment date is less than current date or future date';
                            await helper.updateAuditTrail(auditData, req)
                            throw new CustomError(`Payment date should be the current date or future date`, 400)
                        }

                    }
                    if (paymentData.payment_status == 4 || paymentData.payment_status == 1) {
                        // Payment was successful
                        if (!paymentData) {
                            auditData.description = 'policy creation failed due to payment information not found';
                            await helper.updateAuditTrail(auditData, req)
                            throw new CustomError(`Payment Information not found`);
                        }

                        if (paymentData.payment_type == 1) {
                            paymentData.card_number = selectedCardDetails ? selectedCardDetails?.card_last_4_digit ? selectedCardDetails.card_last_4_digit : payload.cardNumber.slice(-4) : payload.cardNumber.slice(-4);
                        } else if (payload.payment_type == 3) {
                            // ESCROW payment  
                            paymentData.payment_status = 4 //Pending
                            policyData.payment_status = 4 //Pending      
                        } else if (payload.payment_type == 4) {
                            /* do not charge Payment */
                            paymentData.payment_status = 4 //Pending
                            policyData.payment_status = 4 //Pending      
                        }
                        let createdPayments = await paymentService.createPayment(paymentData, transaction);
                        /*  if (policyData.policy_term_month == 1 && isExistPolicy.policy_term_month>1) {
                             if (isExistPolicy.policy_term_month>1) {
                                 let updatePayment = await db.paymentsModel.update({payment_status:5}, { where: { policy_id:policy_id,customer_id:isExistPolicy.customer_id,payment_status:4}, transaction });
                             }
 
                             for (let p = 0; p < 12; p++) {
                                 const nextPaymentDate = moment(paymentData.payment_date).add(1, 'months');
                                 paymentData.payment_date = adjustDateForLeapYear(nextPaymentDate);
                                 if (moment().format('YYYY-MM-DD') != moment(paymentData.payment_date).format('YYYY-MM-DD')) {
                                     paymentData.transaction_no=null;
                                     policyData.transactionResponse = null
                                     paymentData.transaction_response = null
                                     paymentData.payment_status = 4// pending=>4
                                     policyData.payment_status = 4// pending=>4
                                 }
                                  createdPayments = await paymentService.createPayment(paymentData, transaction);
                             }
                         } */

                        // if (policyData.policy_term_month == 1 && isExistPolicy.policy_term_month==1) {
                        //     let updatePayment = await db.paymentsModel.update({amount:payload.net_amount}, { where: { policy_id:policy_id,customer_id:isExistPolicy.customer_id,payment_status:4}, transaction });
                        // }





                        //  const createdPolicyWiseCommission = await policyWiseCommissionService.createpolicyWiseCommission(policyWiseCommissionData, transaction);
                        /*  if (createdPayments && createPolicyAmountUpdateLog) {
                             let dataObj = {
                                 customer_email: isExistPolicy.customer_details.email,
                                 customer_name: isExistPolicy.customer_details.first_name + ' ' + isExistPolicy.customer_details.last_name,
                                 customer_plan: planInfo.plan_name,
                                 policy_no: policyNumber
                             }
                             let mailTrigger = await mailService.triggerMail('updatePolicyTemp.ejs', dataObj, '', isExistPolicy.customer_details.email, 'Customer created Successfully. Welcome to our Family!');
                             if (mailTrigger) {
                                 transaction.commit();
                                 res.status(200).send({
                                     status: 1,
                                     message: "Policy updated Successfully.",
                                 });
                             }
                         } else {
                             //  await transaction.rollback()
                             throw new CustomError(`Something went wrong! , please try again later`);
                         } */

                    } else {
                        throw new CustomError(`Payment failed or encountered an issue`, 402)
                        // Payment failed or encountered an issue
                        // Handle the failure scenario here
                    }
                }
            }
            updatedData = await policyService.modifiedFieldValue(isExistPolicy, policyData, payload.selectedAddOnItems);

            auditData.description = null;
            if (updatedData.length > 0) {
                let descriptions = [];
                updatedData.forEach((item, index) => {
                    if (item.field == 'add-items') {
                        descriptions.push(`selected add-On coverage items are ${item.new_val}`);
                    } else {
                        descriptions.push(`${item.field} value changed ${item.old_val} to ${item.new_val} `);
                    }
                });
                auditData.description = descriptions.join(', ') + ` in policy number ${isExistPolicy.policy_number} update from admin portal`;
                await helper.updateAuditTrail(auditData, req);
            }
            transaction.commit()
            res.status(200).send({ status: 1, message: `Policy information updated successfully` })
        } else {
            throw new CustomError(`Something wen wrong! policy not updated.`)
        }

    } catch (error) {
        transaction.rollback()
        next(error)
    }
}



exports.renewPolicy = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { policy_id } = req.params;
        const org_user_id = req.tokenData.org_user_id;
        let payload = req.body;
        let isExpiredPolicy = null;
        // return 
        let paymentProfileId = null
        let selectedCardDetails = null
        let isExistPolicy = await policyService.findPolicyByPolicyId(policy_id,
            {
                include: [
                    {
                        model: db.customersModel,
                        as: 'customer_details',
                    },
                    {
                        model: db.policyProductsModel,
                        as: 'policy_product_list',
                        attributes: { exclude: ['create_user_type', 'update_user_type', 'created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
                    },
                ]
            }
        );

        if (!isExistPolicy) {
            throw new CustomError(`Someething went wrong! Policy Not Found`, 400);
        }
        const planInfo = await planService.findPlanById(payload.plan_id)
        // let policyNumber = isExistPolicy.policy_number;
        // if (payload.plan_id != isExistPolicy.plan_id) {
        //     policyNumber = planInfo.plan_name.toUpperCase().slice(0, 2) + policyNumber.substring(2);
        //     let checkPolicyNumberIsExist = await policyService.findPolicyByPolicyNumber(policyNumber);
        //     if (checkPolicyNumberIsExist) {
        //         policyNumber = policyNumber + Math.floor(Math.random() * 90) + 10 + parseInt(moment().format('ss'));
        //     }
        // }

        let policyNumber = planInfo.plan_name.toUpperCase().slice(0, 2) + '' + moment().format('MM') * 2 + '' + moment().format('DD') * 2 + '' + moment().format('YYYY') * 2 + '' + isExistPolicy.customer_id;

        //  policyNumber = planInfo.plan_name.toUpperCase().slice(0, 2) + policyNumber.substring(2);
        let checkPolicyNumberIsExist = await policyService.findPolicyByPolicyNumber(policyNumber);
        if (checkPolicyNumberIsExist) {
            policyNumber = policyNumber + Math.floor(Math.random() * 90) + 10 + parseInt(moment().format('ss'));
        }

        const planTermInfo = await planTermsService.findPlanTermById(parseInt(payload.plan_terms_id))
        if (!planInfo) {
            throw new CustomError(`plan Information not found`);
        }
        let getProducts = await planService.findPlanWithProductByPlanId(payload.plan_id);
        getProducts = helper.getJsonParseData(getProducts);
        if (getProducts.length == 0) {
            throw new CustomError(`Plan product Information not found`);
        }

        console.log('getProducts', getProducts);

        if (moment(payload.expiry_with_bonus).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD')) {
            isExpiredPolicy = true
        } else {
            isExpiredPolicy = false
        }

        if (isExpiredPolicy) {
            payload.policy_start_date = moment().format('YYYY-MM-DD');

            let validEndDate = moment(payload.policy_start_date).add(planTermInfo.plan_term_month, 'months');
            validEndDate = adjustDateForLeapYear(validEndDate)
            payload.policy_end_date = moment(validEndDate).format('YYYY-MM-DD');
            payload.holding_period = 0;

            let validBonusExpiryDate = moment(payload.policy_end_date).add(payload.bonus_month, 'months');
            validBonusExpiryDate = adjustDateForLeapYear(validBonusExpiryDate)
            payload.expiry_with_bonus = moment(validBonusExpiryDate).format('YYYY-MM-DD');

            // console.log('policy_start_date', payload.policy_start_date);
            // console.log('policy_end_date', payload.policy_end_date);
            // console.log('expiry_with_bonus', payload.expiry_with_bonus);
        } else {
            let validStartDate = moment(payload.expiry_with_bonus).add(1, 'days');
            validStartDate = adjustDateForLeapYear(validStartDate);
            payload.policy_start_date = moment(validStartDate).format('YYYY-MM-DD');

            let validEndDate = moment(payload.policy_start_date).add(planTermInfo.plan_term_month, 'months');
            validEndDate = adjustDateForLeapYear(validEndDate)
            payload.policy_end_date = moment(validEndDate).format('YYYY-MM-DD');

            let validBonusExpiryDate = moment(payload.policy_end_date).add(payload.bonus_month, 'months');
            validBonusExpiryDate = adjustDateForLeapYear(validBonusExpiryDate)
            payload.expiry_with_bonus = moment(validBonusExpiryDate).format('YYYY-MM-DD');
            payload.holding_period = moment(payload.policy_start_date).diff(moment().format('YYYY-MM-DD'), 'days');


        }

        let policyData = {
            org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
            customer_id: isExistPolicy.customer_id,
            first_name: payload.first_name ? payload.first_name : isExistPolicy.first_name,
            last_name: payload.last_name ? payload.last_name : isExistPolicy.last_name,
            email: payload.email ? payload.email : isExistPolicy.email,
            mobile: payload.mobile ? payload.mobile : isExistPolicy.mobile,
            alternate_phone: payload.alternate_phone ? payload.alternate_phone : null,
            billing_zip: payload.billing_zip ? payload.billing_zip : isExistPolicy.billing_zip,
            billing_city: payload.billing_city ? payload.billing_city : isExistPolicy.billing_city,
            billing_state: payload.billing_state ? payload.billing_state : isExistPolicy.billing_state,
            billing_address1: payload.billing_address1 ? payload.billing_address1 : isExistPolicy.billing_address1,
            policy_number: policyNumber,
            plan_id: payload.plan_id ? payload.plan_id : isExistPolicy.plan_id,
            plan_terms_id: payload.plan_terms_id ? parseInt(payload.plan_terms_id) : isExistPolicy.plan_terms_id,
            policy_term: planTermInfo.plan_term,
            policy_term_month: planTermInfo.plan_term_month,
            pcf: payload.pcf ? payload.pcf : isExistPolicy.pcf,
            holding_period: payload.holding_period ? payload.holding_period : 0,
            policy_start_date: payload.policy_start_date ? moment(payload.policy_start_date).format('YYYY-MM-DD') : isExistPolicy.policy_start_date,
            policy_expiry_date: payload.policy_end_date ? moment(payload.policy_end_date).format('YYYY-MM-DD') : isExistPolicy.policy_expiry_date,
            expiry_with_bonus: payload.expiry_with_bonus ? moment(payload.expiry_with_bonus).format('YYYY-MM-DD') : isExistPolicy.expiry_with_bonus,
            property_type_id: payload.property_type_id ? payload.property_type_id : isExistPolicy.property_type_id,
            property_size_id: payload.property_size_id ? payload.property_size_id : isExistPolicy.property_size_id,
            order_date: moment().format('YYYY-MM-DD'),
            bonus_month: payload.bonus_month ? payload.bonus_month : isExistPolicy.bonus_month,
            policy_amount: payload.policy_amount ? payload.policy_amount : null,
            addon_coverage_amount: payload.addon_coverage_amount,
            sub_total_amount: payload.sub_total_amount,
            tax_amount: payload.tax_amount,
            total_price: payload.total_price,
            net_amount: payload.net_amount,
            // ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            policy_status: payload.payment_type == 3 ? 4 : payload.payment_type == 4 ? 5 : 2,// payment_type==3 =>4 awaiting for escrow , payment_type==4 => 5 do not charge,else policy_status=>2 Hold
            ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            create_user_type: 2,
            created_by: org_user_id,
            policyProductData: [...payload.selectedAddOnItems, ...getProducts],
            payment_status: null,
            source: 1,
            renewed_from_policy_id: isExistPolicy.policy_id
            //payment_status:  null
        }

        const renewedPolicy = await policyService.createPolicy(policyData, transaction);
        let policyProductsData = [...payload.selectedAddOnItems, ...getProducts];
        policyProductsData = policyProductsData.map((productData) => ({
            org_id: isExistPolicy.org_id,
            policy_id: renewedPolicy.policy_id, // Associate the policy product with the policy
            product_id: productData.product_id,
            product_name: productData.product_name,
            monthly_price: productData.monthly_price,
            yearly_price: productData.yearly_price,
            product_quantity: 1,
            create_user_type: 2,
            created_by: org_user_id,
        }));
        policyProductsData = _.uniq(policyProductsData);

        let policyNoteData = {
            org_id: req.tokenData.org_id,
            customer_id: isExistPolicy.customer_id,
            notes: payload.policy_note ? payload.policy_note : null,
            create_user_type: 2,
            created_by: org_user_id,
        }
        let policyAmountUpdateLogData = {
            policy_id: renewedPolicy.policy_id,
            org_id: req.tokenData.org_id,
            customer_id: isExistPolicy.customer_id,
            plan_terms_id: payload.plan_terms_id ? parseInt(payload.plan_terms_id) : isExistPolicy.plan_terms_id,
            policy_term_months: planTermInfo.plan_term_month,
            previous_policy_term_months: isExistPolicy.policy_term_month,
            previous_plan_id: isExistPolicy.plan_id,
            plan_id: payload.plan_id ? payload.plan_id : isExistPolicy.plan_id,
            policy__amount_update_sale_type: payload.net_amount > isExistPolicy.net_amount ? 1 : 0,// "Up Sale=>1, Down Sale=>0",
            amount: Math.abs(parseFloat(Number(payload.net_amount).toFixed(2))),
            ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            create_user_type: 2,
            created_by: org_user_id,
        }
        let policyWiseCommissionData = {
            policy_id: renewedPolicy.policy_id,
            org_id: isExistPolicy.org_id,
            org_user_id: org_user_id,
            policy_no: policyNumber,
            customer_id: isExistPolicy.customer_id,
            commission_value: payload.commission_value,
            commission_type: payload.commission_type,
            created_by: org_user_id,
        }

        let updatePreviousPolicy = null;
        if (renewedPolicy) {
            let updateData = {
                is_policy_renewed: 1,
                renewal_status: 1
            }
            updatePreviousPolicy = await policyService.updatePolicy(policy_id, updateData, transaction);
        }

        const createOrDeletePolicyProducts = await policyService.createOrDeletePolicyProducts(req, res, next, renewedPolicy.policy_id, isExistPolicy.customer_id, policyProductsData, transaction);
        if (policyNoteData.notes) {
            policyNoteData.policy_number = renewedPolicy.policy_number;
            policyNoteData.policy_id = renewedPolicy.policy_id;
            const createdPolicyNotes = await policyNoteService.createpolicyNotes(policyNoteData, transaction);
        }

        if (renewedPolicy && updatePreviousPolicy && createOrDeletePolicyProducts) {
            let paymentData = {
                policy_id: renewedPolicy.policy_id,
                org_id: isExistPolicy.org_id,
                customer_id: isExistPolicy.customer_id,
                amount: payload.net_amount,
                state: payload.billing_state ? payload.billing_state : null,
                payment_type: payload.payment_type ? payload.payment_type : null,
                acc_holder_name: payload.bankAccountHolderName ? payload.bankAccountHolderName : null,
                acc_no: payload.bankAccountNumber ? payload.bankAccountNumber : null,
                routing_no: payload.routingNumber ? payload.routingNumber : null,
                payment_date: payload.paymentDate ? moment(payload.paymentDate).format('YYYY-MM-DD') : null,
                payment_successfull_date: null,
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
                recurring_type: planTermInfo.plan_term_month == 1 ? 1 : 0,//  monthly=>1
                cheque_no: payload.cheque_no ? payload.cheque_no : null,
            }

            const isExistCard = await customerCardService.getCustomerAllSavedCards({ where: { customer_id: isExistPolicy.customer_id } })
            // if upsale or downgrade policy
            const createPolicyAmountUpdateLog = await policyService.createPolicyAmountUpdateLog(policyAmountUpdateLogData, transaction);


            if (policyData.policy_term_month == 1 && isExistPolicy.policy_term_month == 1) {
                // if existing policy term and updated policy term is same then update the amount
                let updatePayment = await db.paymentsModel.update({ amount: payload.net_amount }, { where: { policy_id: renewedPolicy.policy_id, customer_id: isExistPolicy.customer_id, payment_status: 4 }, transaction });

            }

            if (policyData.policy_term_month == 1 && isExistPolicy.policy_term_month > 1) {
                // if policy term yearly to monthly
                if (isExistCard.length == 0 && paymentData.payment_type == null) {
                    throw new CustomError(`Policy updating has  failedsince the customer does not have a Save Credit Card.`)
                }
                // deactivate previous pending transaction
                let updatePayment = await db.paymentsModel.update({ payment_status: 5 }, { where: { policy_id: renewedPolicy.policy_id, customer_id: isExistPolicy.customer_id, payment_status: 4 }, transaction });
                if (paymentData.payment_type == null) {
                    // if payment type null means  its downgraded update policy because if is it upsale policy then it should have payment information
                    // payment information null then bydefault payment mode is  primary credit card
                    selectedCardDetails = await customerCardService.getCustomerCardById({ where: { customer_id: isExistPolicy.customer_id, primary_card: true } })
                    let futurePaymentData = { ...paymentData }
                    futurePaymentData.payment_type = 1
                    futurePaymentData.card_holder_name = selectedCardDetails.card_holder_name
                    futurePaymentData.card_number = selectedCardDetails.card_last_4_digit
                    futurePaymentData.card_expiry_date = helper.encodeCrypto(selectedCardDetails.card_expiry_date)
                    futurePaymentData.card_type = selectedCardDetails.card_type;
                    futurePaymentData.amount = payload.net_amount


                    for (let p = 0; p < 12; p++) {
                        // create 12 monthly recurring payment data.
                        const nextPaymentDate = moment().add(1, 'months');
                        futurePaymentData.payment_date = adjustDateForLeapYear(nextPaymentDate);
                        if (moment().format('YYYY-MM-DD') != moment(futurePaymentData.payment_date).format('YYYY-MM-DD')) {
                            futurePaymentData.transaction_no = null;
                            policyData.transactionResponse = null
                            futurePaymentData.transaction_response = null
                            futurePaymentData.payment_status = 4// pending=>4
                            policyData.payment_status = 4// pending=>4
                        }
                        createdPayments = await paymentService.createPayment(futurePaymentData, transaction);
                    }
                }
            } else if (policyData.policy_term_month > 1 && isExistPolicy.policy_term_month == 1) {
                // if current policy term is monthly and update to any yearly policy
                // deactivate monthly recurring
                let updatePayment = await db.paymentsModel.update({ payment_status: 5 }, { where: { policy_id: renewedPolicy.policy_id, customer_id: isExistPolicy.customer_id, payment_status: 4 }, transaction });
            } {
                // if current term 
            }


            // if up
            let customerCardData
            if (payload.payment_type == 1) {
                // if paymennt type is credit card
                if (payload.selectedCardId) {
                    selectedCardDetails = await customerCardService.getCustomerCardById({ where: { customer_id: isExistPolicy.customer_id, customer_card_id: payload.selectedCardId } })
                } else {
                    if (!isExistPolicy.customer_details.authorizeNet_customer_profile_id) {
                        // if createdCustomer.authorizeNet_customer_profile_id is null, its means they not have customer profile account in authorize.net
                        let customerProfileObj = {
                            customer_id: isExistPolicy.customer_id,
                            customer_email: isExistPolicy.customer_details.email,
                            first_name: isExistPolicy.customer_details.first_name ? isExistPolicy.customer_details.first_name : null,
                            last_name: isExistPolicy.customer_details.last_name ? isExistPolicy.customer_details.last_name : null,
                            zip: isExistPolicy.customer_details.zip ? isExistPolicy.customer_details.zip : null,
                            city: isExistPolicy.customer_details.city ? isExistPolicy.customer_details.city : null,
                            state: isExistPolicy.customer_details.state ? isExistPolicy.customer_details.state : null,
                            address: isExistPolicy.customer_details.address1 ? isExistPolicy.customer_details.address1 : null,
                            card_number: payload.cardNumber,
                            card_expiry_date: payload.cardExpiryDate ? payload.cardExpiryDate : null,
                            card_cvv: payload.cvv ? payload.cvv : null,
                            policy_no: policyNumber,
                            plan_name: planInfo.plan_name,
                            plan_term: planTermInfo.plan_term,
                            tax_amount: payload.tax_amount,
                            net_amount: payload.net_amount,
                            policy_start_date: payload.policy_start_date ? moment(payload.policy_start_date).format('YYYY-MM-DD') : null,
                            policy_expiry_date: payload.policy_end_date ? moment(payload.policy_end_date).format('YYYY-MM-DD') : null,
                            expiry_with_bonus: payload.expiry_with_bonus ? moment(payload.expiry_with_bonus).format('YYYY-MM-DD') : null,
                        }
                        const createCustomerProfileResponse = await securePaymentsService.createCustomerProfile(customerProfileObj);
                        //console.log('createCustomerProfile', createCustomerProfileResponse);
                        if (createCustomerProfileResponse) {
                            isExistPolicy.customer_details.authorizeNet_customer_profile_id = createCustomerProfileResponse.getCustomerProfileId();
                            const paymentProfileIdObject = createCustomerProfileResponse.getCustomerPaymentProfileIdList().getNumericString()[0];
                            // Extract the actual ID from the object
                            paymentProfileId = paymentProfileIdObject.toString();
                            if (isExistPolicy.customer_details.authorizeNet_customer_profile_id) {
                                // The response contains the expected structure and customerProfileId
                                const updateCustomerProfileId = await customerService.updateCustomer(isExistPolicy.customer_id, {
                                    authorizeNet_customer_profile_id: isExistPolicy.customer_details.authorizeNet_customer_profile_id,
                                }, transaction);
                            } else {
                                throw new CustomError('Provided Card Information is Invalid.');
                            }
                        } else {
                            throw new CustomError('Invalid response from Authorize.Net');
                        }
                    }
                    let customerPaymentProfileObj = {
                        authorizeNet_customer_profile_id: isExistPolicy.customer_details.authorizeNet_customer_profile_id,
                        customer_id: isExistPolicy.customer_id,
                        customer_email: isExistPolicy.customer_details.email,
                        first_name: payload.first_name ? payload.first_name : null,
                        last_name: payload.last_name ? payload.last_name : null,
                        billing_zip: payload.billing_zip ? payload.billing_zip : null,
                        billing_city: payload.billing_city ? payload.billing_city : null,
                        billing_state: payload.billing_state ? payload.billing_state : null,
                        billing_address: payload.billing_address1 ? payload.billing_address1 : null,
                        card_number: payload.cardNumber,
                        card_expiry_date: payload.cardExpiryDate ? payload.cardExpiryDate : null,
                        card_cvv: payload.cvv ? payload.cvv : null,
                        policy_no: policyNumber,
                        plan_name: planInfo.plan_name,
                        plan_term: planTermInfo.plan_term,
                        tax_amount: payload.tax_amount,
                        net_amount: payload.net_amount,
                        policy_start_date: payload.policy_start_date ? moment(payload.policy_start_date).format('YYYY-MM-DD') : null,
                        policy_expiry_date: payload.policy_end_date ? moment(payload.policy_end_date).format('YYYY-MM-DD') : null,
                        expiry_with_bonus: payload.expiry_with_bonus ? moment(payload.expiry_with_bonus).format('YYYY-MM-DD') : null,
                    }
                    if (isExistCard.length == 0) {
                        // if customer dosenot have any card stored previously
                        customerCardData = {
                            org_id: isExistPolicy.org_id,
                            customer_id: isExistPolicy.customer_id,
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
                            // if customer provide different card details which not stored in customer_card table
                            if (!paymentProfileId) {
                                // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                                const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                                paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
                            }

                            customerCardData = {
                                org_id: isExistPolicy.org_id,
                                customer_id: isExistPolicy.customer_id,
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
                            selectedCardDetails = await customerCardService.getCustomerCardById({ where: { customer_id: isExistPolicy.customer_id, customer_card_id: matchedExpDate.customer_card_id } })
                            paymentProfileId = selectedCardDetails.authorizeNet_payment_profile_id ? selectedCardDetails.authorizeNet_payment_profile_id : null
                        }
                        if (!paymentProfileId) {
                            // if customer have no payment Profile in auhorize.net then create a customer payment profile in authorize.net
                            const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                            paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId()
                        }
                    }
                }
            } else if (payload.payment_type == 2) {
                // bank payment
            } else if (payload.payment_type == 3) {
                // escrow payment
                paymentData.payment_status = 4// pending=>4
                policyData.payment_status = 4// pending=>4
            } else if (payload.payment_type == 4) {
                /* do not charge Payment */
                paymentData.payment_status = 4// pending=>4
                policyData.payment_status = 4// pending=>4
            }
            if (payload.paymentDate) {
                // if payment date is current day 
                if (moment().format('YYYY-MM-DD') == moment(payload.paymentDate).format('YYYY-MM-DD')) {
                    if (payload.payment_type == 1) {
                        // credit card payment
                        if (payload.selectedCardId) {
                            selectedCardDetails = await customerCardService.getCustomerCardById({ where: { customer_id: isExistPolicy.customer_id, customer_card_id: payload.selectedCardId } })
                        }
                        let paymentObj = {
                            authorizeNet_customer_profile_id: isExistPolicy.customer_details.authorizeNet_customer_profile_id,
                            authorizeNet_payment_profile_id: selectedCardDetails ? selectedCardDetails.authorizeNet_payment_profile_id : paymentProfileId,
                            customer_id: isExistPolicy.customer_id,
                            customer_email: isExistPolicy.customer_details.email,
                            first_name: payload.first_name ? payload.first_name : null,
                            last_name: payload.last_name ? payload.last_name : null,
                            billing_zip: payload.billing_zip ? payload.billing_zip : null,
                            billing_city: payload.billing_city ? payload.billing_city : null,
                            billing_state: payload.billing_state ? payload.billing_state : null,
                            billing_address: payload.billing_address1 ? payload.billing_address1 : null,
                            card_number: selectedCardDetails ? selectedCardDetails.card_number : payload.cardNumber,
                            card_expiry_date: payload.cardExpiryDate ? payload.cardExpiryDate : null,
                            card_cvv: payload.cvv ? payload.cvv : null,
                            policy_no: policyNumber,
                            plan_name: planInfo.plan_name,
                            plan_term: planTermInfo.plan_term,
                            tax_amount: payload.tax_amount,
                            net_amount: payload.net_amount,
                            chargable_amount: payload.net_amount,
                            policy_start_date: payload.policy_start_date ? moment(payload.policy_start_date).format('YYYY-MM-DD') : null,
                            policy_expiry_date: payload.policy_end_date ? moment(payload.policy_end_date).format('YYYY-MM-DD') : null,
                            expiry_with_bonus: payload.expiry_with_bonus ? moment(payload.expiry_with_bonus).format('YYYY-MM-DD') : null,
                        }
                        // console.log('paymentObj', paymentObj);
                        const chargeCustomerProfileResponse = await securePaymentsService.chargeCustomerProfile(paymentObj);
                        // console.log(' chargeCustomerProfileResponse Transaction Response:', chargeCustomerProfileResponse);
                        policyData.transactionResponse = chargeCustomerProfileResponse//.getTransactionResponse()
                        paymentData.transaction_response = chargeCustomerProfileResponse//.getTransactionResponse()
                        const responseObject = chargeCustomerProfileResponse;
                        const resultCode = responseObject?.messages?.resultCode;
                        const code = responseObject?.messages?.message[0]?.code;
                        const transactionResponse =  responseObject?.transactionResponse;
                        const transactionResponseCode =  responseObject?.transactionResponse?.responseCode;
                        if (resultCode === 'Ok' && code === 'I00001' && transactionResponse && (transactionResponseCode== 1|| transactionResponseCode== 4)) { 
                            // if (chargeCustomerProfileResponse.getTransactionResponse() && chargeCustomerProfileResponse.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
                            // Payment was successful
                            if (customerCardData && Object.keys(customerCardData).length !== 0 && !payload.selectedCardId) {
                                customerCardData.card_type = chargeCustomerProfileResponse.transactionResponse.accountType
                                const createdCustomerCard = await customerCardService.createCustomerCard(customerCardData, transaction);
                            }
                            paymentData.transaction_no = chargeCustomerProfileResponse.getTransactionResponse().getTransId();
                            paymentData.card_type = chargeCustomerProfileResponse.transactionResponse.accountType
                            paymentData.payment_status = 1 //success=>1
                            policyData.payment_status = 1 // success=>1
                            paymentData.payment_successfull_date = moment().format('YYYY-MM-DD')
                        } else {
                            // Payment failed or encountered an issue
                            paymentData.payment_status = 2 //failed=>2
                            policyData.payment_status = 2 //failed=>2
                            // Payment failed or encountered an issue
                            throw new CustomError(`Payment failed!`, 402)
                        }
                    } else if (payload.payment_type == 2) {
                        // bank payment
                        paymentData.payment_status = 4 //Pending
                        policyData.payment_status = 4 //Pending                            

                    } else if (payload.payment_type == 3) {
                        // escrow payment
                        paymentData.payment_status = 4 //Pending
                        policyData.payment_status = 4 //Pending                        

                    } else if (payload.payment_type == 4) {
                        /* do not charge Payment */
                        paymentData.payment_status = 4 //Pending
                        policyData.payment_status = 4 //Pending      
                    }
                } else if (moment(payload.paymentDate).isAfter(moment())) {
                    //**** */ payment date is future date
                    if (payload.payment_type == 1) {
                        // Card payment  
                        if (customerCardData && Object.keys(customerCardData).length !== 0 && !payload.selectedCardId) {
                            const createdCustomerCard = await customerCardService.createCustomerCard(customerCardData, transaction);
                        }
                    } else if (payload.payment_type == 2) {
                        // bank payment  
                        paymentData.payment_status = 4// pending=>4
                        policyData.payment_status = 4// pending=>4
                    } else if (payload.payment_type == 3) {
                        // ESCROW payment  
                        paymentData.payment_status = 4 //Pending
                        policyData.payment_status = 4 //Pending      
                    } else if (payload.payment_type == 4) {
                        /* do not charge Payment */
                        paymentData.payment_status = 4 //Pending
                        policyData.payment_status = 4 //Pending      
                    }
                } else {
                    // console.log('payload.paymentDate', payload.paymentDate);
                    throw new CustomError(`Payment date should be the current date or future date`, 400)
                }

            }
            if (paymentData.payment_status == 4 || paymentData.payment_status == 1) {
                // Payment was successful
                if (!paymentData) {
                    throw new CustomError(`Payment Information not found`);
                }

                if (paymentData.payment_type == 1) {
                    paymentData.card_number = selectedCardDetails ? selectedCardDetails?.card_last_4_digit ? selectedCardDetails.card_last_4_digit : payload.cardNumber.slice(-4) : payload.cardNumber.slice(-4);
                } else if (payload.payment_type == 3) {
                    // ESCROW payment  
                    paymentData.payment_status = 4 //Pending
                    policyData.payment_status = 4 //Pending      
                } else if (payload.payment_type == 4) {
                    /* do not charge Payment */
                    paymentData.payment_status = 4 //Pending
                    policyData.payment_status = 4 //Pending      
                }

                console.log('paymentData', paymentData);

                let createdPayments = await paymentService.createPayment(paymentData, transaction);


                /*  if (policyData.policy_term_month == 1 && isExistPolicy.policy_term_month>1) {
                     if (isExistPolicy.policy_term_month>1) {
                         let updatePayment = await db.paymentsModel.update({payment_status:5}, { where: { policy_id:policy_id,customer_id:isExistPolicy.customer_id,payment_status:4}, transaction });
                     }
 
                     for (let p = 0; p < 12; p++) {
                         const nextPaymentDate = moment(paymentData.payment_date).add(1, 'months');
                         paymentData.payment_date = adjustDateForLeapYear(nextPaymentDate);
                         if (moment().format('YYYY-MM-DD') != moment(paymentData.payment_date).format('YYYY-MM-DD')) {
                             paymentData.transaction_no=null;
                             policyData.transactionResponse = null
                             paymentData.transaction_response = null
                             paymentData.payment_status = 4// pending=>4
                             policyData.payment_status = 4// pending=>4
                         }
                          createdPayments = await paymentService.createPayment(paymentData, transaction);
                     }
                 } */

                // if (policyData.policy_term_month == 1 && isExistPolicy.policy_term_month==1) {
                //     let updatePayment = await db.paymentsModel.update({amount:payload.net_amount}, { where: { policy_id:policy_id,customer_id:isExistPolicy.customer_id,payment_status:4}, transaction });
                // }





                //  const createdPolicyWiseCommission = await policyWiseCommissionService.createpolicyWiseCommission(policyWiseCommissionData, transaction);
                /*  if (createdPayments && createPolicyAmountUpdateLog) {
                     let dataObj = {
                         customer_email: isExistPolicy.customer_details.email,
                         customer_name: isExistPolicy.customer_details.first_name + ' ' + isExistPolicy.customer_details.last_name,
                         customer_plan: planInfo.plan_name,
                         policy_no: policyNumber
                     }
                     let mailTrigger = await mailService.triggerMail('updatePolicyTemp.ejs', dataObj, '', isExistPolicy.customer_details.email, 'Customer created Successfully. Welcome to our Family!');
                     if (mailTrigger) {
                         transaction.commit();
                         res.status(200).send({
                             status: 1,
                             message: "Policy updated Successfully.",
                         });
                     }
                 } else {
                     //  await transaction.rollback()
                     throw new CustomError(`Something went wrong! , please try again later`);
                 } */

            } else {
                throw new CustomError(`Payment failed or encountered an issue`, 402)
                // Payment failed or encountered an issue
                // Handle the failure scenario here
            }



            // console.log('paymentData.payment_status', paymentData.payment_status);
            // console.log('isExpiredPolicy', isExpiredPolicy);
            if (paymentData.payment_status == 1 && isExpiredPolicy) {
                let policyData = {
                    renewal_status: 1,
                    policy_status: 1//Active
                }
                await policyService.updatePolicy(renewedPolicy.policy_id, policyData, transaction)
            }


            transaction.commit()
            res.status(200).send({ status: 1, message: `Policy renewed successfully` })
        } else {
            throw new CustomError(`Something wen wrong! policy not updated.`)
        }

    } catch (error) {
        transaction.rollback()
        next(error)
    }
}

exports.updateRenewPolicyStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const { policy_id } = req.params;
        const owner_id = req.tokenData.org_user_id
        let isExistPolicy = await policyService.findPolicyByPolicyId(parseInt(policy_id));
        if (isExistPolicy) {
            let data = {
                renewal_status: status
            }
            const transaction = await db.sequelize.transaction(async (t) => {
                await db.policiesModel.update(
                    { updated_by: owner_id },
                    { where: { policy_id: policy_id }, transaction: t })
                await db.policiesModel.update(data, { where: { policy_id: policy_id }, transaction: t })
                res.status(200).send({ status: 1, message: 'Policy status has been successfully updated.' })
            });
        } else {
            res.status(200).send({ status: 0, message: "Policy not found" });
        }
    } catch (error) {
        next(error);
    }
}

exports.createPolicyNotes = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const org_user_id = req.tokenData.org_user_id;
        let payload = req.body
        let policyNoteData = {
            policy_id: payload.policy_id,
            org_id: req.tokenData.org_id,
            notes: payload.notes ? payload.notes : null,
            create_user_type: 2,
            created_by: org_user_id
        }
        const createdPolicyNotes = await policyNoteService.createpolicyNotes(policyNoteData, transaction);
        transaction.commit();
        if (createdPolicyNotes) {
            res.status(200).send({ status: 1, message: "Policy Note created successfully." });
        } else {
            res.status(200).send({ status: 0, message: "The creation of the policy note failed." });
        }
    } catch (error) {
        transaction.rollback()
        next(error)
    }
}


exports.updatePolicyInfo = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { policy_id } = req.params;
        const policyExists = await policyService.findPolicyByPolicyId(parseInt(policy_id))
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'CUSTOMER_PORTAL',
            table_name: 'hws_customers',
            source: 0,
            create_user_type: 1,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        if (policyExists) {
            let policy_detail = {
                first_name: req.body.firstName ? req.body.firstName : null,
                last_name: req.body.lastName ? req.body.lastName : null,
                email: req.body.emailId ? req.body.emailId : null,
                mobile: req.body.mobileNo ? req.body.mobileNo : null,
                updated_by: req.tokenData.customer_id ? parseInt(req.tokenData.customer_id) : null,
                deleted_by: null
            }
            auditData.customer_id = policyExists.customer_id;
            auditData.name = policy_detail.first_name + ' ' + policy_detail.last_name;
            auditData.email = policy_detail.email ? policy_detail.email : null;
            auditData.row_id = policyExists.policy_id;
            auditData.created_by = policyExists.customer_id;
            const transaction = await db.sequelize.transaction(async (t) => {
                await db.policiesModel.update(
                    { updated_by: req.tokenData.customer_id },
                    { where: { policy_id: policy_id }, transaction: t })
                await db.policiesModel.update(policy_detail, { where: { policy_id: policy_id }, transaction: t })
                res.status(200).send({ status: 1, message: 'Policy information has been successfully updated.' })
            });
            auditData.description = 'policy information updated from customer portal';
            await helper.updateAuditTrail(auditData, req);
        } else {
            auditData.description = 'unable to update policy information from customer portal';
            await helper.updateAuditTrail(auditData, req);
            res.status(200).send({ status: 0, message: "Policy information not found" });
        }
    } catch (error) {
        transaction.rollback()
        next(error)
    }
};



function adjustDateForLeapYear(payment_date) {
    let date = moment(payment_date)
    const isLeapYear = date.isLeapYear();
    if (date.month() === 1 && date.date() > 28 && isLeapYear) {
        return date.date(28).format('YYYY-MM-DD'); // Set the date to 28th if  a leap year
    }

    return date.format('YYYY-MM-DD');
}


exports.generatePaymentReceipt = async (req, res, next) => {
    try {
        let { policy_id } = req.params
        const org_user_id = req.tokenData.org_user_id;
        let policyDetails = await policyService.findPolicyByPolicyId(policy_id);
        if (!policyDetails) {
            throw new CustomError('Policy information not found')
        }
        // if (policyDetails.policy_status == 1 || policyDetails.policy_status == 2) { // awaiting for escrow
        //     (async () => {
        // let generatePaymentReceiptData = await policyService.generatePaymentReceiptData(policyDetails.org_id, policyDetails.policy_id);


        let generatePaymentRecipetData = await policyService.generatePaymentReceiptData(policyDetails.org_id, policyDetails.policy_id);
        if (generatePaymentRecipetData) {
            let dataObj = generatePaymentRecipetData;
            dataObj.company_address = mailConfig.company_address,
                dataObj.company_phone = mailConfig.company_phone,
                dataObj.company_email = mailConfig.company_email,
                dataObj.company_copyright_year = mailConfig.company_copyright_year,
                dataObj.company_website = mailConfig.company_website,
                dataObj.company_website_link = mailConfig.company_website_link,
                dataObj.email_imageUrl = helper.email_imageUrl
            // AUDIT TRAIL PAYLOAD
            let auditData = {
                section: 'ADMIN_PORTAL',
                customer_id: policyDetails.customer_id,
                table_name: 'hws_policy_documents',
                source: req.tokenData.source,
                create_user_type: 2,
                created_by: org_user_id,
                device_id: helper.getDeviceId(req.headers['user-agent']),
            }

            switch (req.params.key) {
                case 'send-mail':
                    auditData.row_id = policy_id;
                    auditData.description = `payment receipt successfully send to mail against policy number ${dataObj.policy_number} from admin portal`;
                    await helper.updateAuditTrail(auditData, req);
                    let paymentRecipetMailTrigger = await mailService.triggerMail('paymentRecipet.ejs', dataObj, '', policyDetails.email, 'Receipt: Payment Successfully Received');
                    res.status(200).send({ status: 1, message: 'Payment receipt successfully send to mail.' })

                    break;
                // case 'download':
                //     break
                default:
                    //for esccrow payment send the email Attachment
                    // const templatePath = path.join(__dirname, `../../../view/emailTemplate/policyPurchaseTemp.ejs`);
                    // const storagePath = path.join(__dirname, `../../../public/org_files/hws_${req.tokenData.org_id}/documents/customers/policy_docs`);
                    //console.log('current Directory', __dirname);
                    const projectRoot = path.join(__dirname, '../../..');
                    //console.log('projectRoot', projectRoot);
                    const templatePath = path.join(projectRoot, 'view', 'emailTemplate', 'paymentRecipet.ejs');
                    //console.log('templatePath', templatePath);

                    const storagePath = path.join(projectRoot, 'public', `org_files/hws_${req.tokenData.org_id}/customers/policy_docs`);
                    //console.log('storagePath', storagePath);

                    const pdfName = `Payment-Receipt_${policy_id}_${new Date().getTime()}`
                    let genEscrowPdfRes = await helper.generatePdfFromEjs(templatePath, dataObj, storagePath, pdfName);
                    if (genEscrowPdfRes) {
                        auditData.row_id = policy_id;
                        auditData.description = `payment receipt generated successfully against policy number ${dataObj.policy_number} from admin portal`;
                        await helper.updateAuditTrail(auditData, req);
                        res.status(200).send({ status: 1, payment_receipt_url: `${helper.api_baseurl}/org_file/hws_${req.tokenData.org_id}/customers/policy_docs/${genEscrowPdfRes.filename}`, message: 'Payment receipt generated successfully.' })
                    } else {
                        auditData.row_id = policy_id;
                        auditData.description = `payment receipt generation failed against policy number ${dataObj.policy_number} from admin portal`;
                        await helper.updateAuditTrail(auditData, req);
                        throw new CustomError(`Payment receipt generation failed`, 400)
                    }

                    break;
            }
        }
        //     })();
        // } else {
        //     throw new CustomError('Something went wrong,the policy have no successfull payment', 400)
        // }

    } catch (error) {
        next(error)
    }
}
exports.generateEscrowInvoice = async (req, res, next) => {
    try {
        let { policy_id } = req.params
        // console.log('policy_id', policy_id);
        let policyDetails = await policyService.findPolicyByPolicyId(policy_id);
        if (!policyDetails) {
            throw new CustomError('Policy information not found')
        }
        // console.log('policyDetails', policyDetails);
        if (policyDetails.policy_status == 4) { // awaiting for escrow
            (async () => {
                let genEscrowPdfRes = await policyService.generateEscrowAttachment(policyDetails.org_id, policyDetails.policy_id);
                let generateEscrowInvoiceData = await policyService.generateEscrowInvoiceData(policyDetails.org_id, policyDetails.policy_id);
                console.log('generateEscrowInvoiceData', generateEscrowInvoiceData);
                let escrowInvoiceData = generateEscrowInvoiceData ? helper.getJsonParseData(generateEscrowInvoiceData) : null;
                if (genEscrowPdfRes) {
                    let esccrowBccMail = [];
                    if (policyDetails.realtor_email) {
                        esccrowBccMail.push(policyDetails.realtor_email);
                    }
                    if (policyDetails.agent_email) {
                        esccrowBccMail.push(policyDetails.agent_email);
                    }
                    let dataObj = escrowInvoiceData;
                    dataObj.company_address = mailConfig.company_address;
                    dataObj.company_phone = mailConfig.company_phone;
                    dataObj.company_email = mailConfig.company_email;
                    dataObj.company_copyright_year = mailConfig.company_copyright_year;
                    dataObj.company_website = mailConfig.company_website;
                    dataObj.company_website_link = mailConfig.company_website_link;
                    dataObj.email_imageUrl = helper.email_imageUrl
                    // console.log('dataObj',dataObj);
                    switch (req.params.key) {
                        case 'send-mail':
                            let escrowMailTrigger = await mailService.triggerMail('escrowInvoice.ejs', dataObj, '', policyDetails.email, 'Escrow Pdf', genEscrowPdfRes, esccrowBccMail);
                            res.status(200).send({ status: 1, message: 'Escrow-Invoice successfully send to mail.' })
                            /*  if (escrowMailTrigger) {
                                 console.log('Escrow mail triggered successfully');
                             } else {
                                 console.log('Escrow mail trigger failed');
                             } */
                            break;
                        // case 'download':
                        //     break
                        default:
                            res.status(200).send({ status: 1, escrow_invoice_url: `${helper.api_baseurl}/org_file/hws_${req.tokenData.org_id}/customers/policy_docs/${genEscrowPdfRes.filename}`, message: 'Escrow-Invoice generated successfully.' })
                            break;
                    }

                }
            })();
        } else {
            throw new CustomError('Something went wrong,the policy is not escrow policy', 400)
        }

    } catch (error) {
        next(error)
    }
}
exports.gen = async () => {
    const result = await db.sequelize.transaction(async (t) => {
        policyService.generateEscrowAttachment(3, 8, { transaction: t });

    })
}

//TEST PAYMENT LINK 

exports.testPaymentLink = async (req, res, next) => {
    try {
        //     const transaction = await db.sequelize.transaction();
        //     let sendPaymentObj=req.body
        //     // let sendPaymentObj={  //PAYMENT LINK OBJECT
        //     //     org_id:createdPayments.org_id,
        //     //     policy_id:createdPayments.policy_id,
        //     //     customer_id:createdPayments.customer_id,
        //     //     payment_id:createdPayments.payment_id,
        //     //     created_by:org_user_id
        //     // }
        //     const token = helper.generateToken(sendPaymentObj, '1d') //GENERATING PAYMENT LINK
        //     sendPaymentObj.payment_link=`${helper.website_baseUrl}customer-payment-deeplink/${token}`
        //     let createdPaymentLink = await policyService.sendPaymentLink(sendPaymentObj,transaction);  //CALLING POLICY SERVICE
        //     console.log(createdPaymentLink);
        // if (createdPaymentLink) {
        //         let dataObj=createdPaymentLink
        //         let sendMail = await mailService.triggerMail('sendPaymentLink.ejs', dataObj, '', 'test333@mailinator.com', 'Payment Link Pdf');
        //         res.status(200).send({ status: 1,data:createdPaymentLink, message: 'Payment link successfully send to mail.' })
        //         transaction.commit()
        // }else{
        //     res.status(200).send({ status: 0, message: 'failed tested.' })
        //     transaction.rollback() 
        // }


    } catch (error) {
        next(error);
    }
}


exports.GetPaymentLinkData = async (req, res, next) => {
    try {
        let payload = req.body.payment_link
        if (!req.body.payment_link) {
            throw new CustomError('Invalid link', 400)
        }
        jwt.verify(payload, process.env.ACCESS_TOKEN, async (err, tokenDataResponse) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    // JWT token has expired
                    return res.status(498).json({ status: 0, message: 'link has expired' });
                } else {
                    // Other JWT verification errors
                    res.status(498).json({ status: 0, message: 'Invalid Access Token' });
                }
            } else {
                let GetPaymentLink = await db.customerPaymentLinkModel.findOne({
                    where: {
                        policy_id: tokenDataResponse.policy_id,
                        payment_id: tokenDataResponse.payment_id,
                        customer_id: tokenDataResponse.customer_id
                    }
                });
                let queryOptions = {
                    attributes: { exclude: ['deleted_by', 'deleted_at', 'user_agent', 'device_id', 'ip_address',] },
                    include: [
                        {
                            model: db.customersModel,
                            as: 'customer_details',
                            attributes: ['customer_id', 'first_name', 'last_name', 'email'],
                            include: {
                                model: db.customerCardsModel,
                                as: 'card_list',
                                attributes: { exclude: ['deleted_by', 'deleted_at', 'card_number'] },
                                // attributes: ['payment_id']
                            },
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
                            model: db.propertyTypesModel,
                            as: 'property_type_details',
                            attributes: { exclude: ['deleted_by', 'deleted_at'] },
                        },
                        {
                            model: db.policyProductsModel,
                            as: 'policy_product_list',
                            attributes: { exclude: ['deleted_by', 'deleted_at'] },
                            include: {
                                model: db.productsModel,
                                as: 'product_details',
                                attributes: { exclude: ['deleted_by', 'deleted_at'] },
                            }
                        },
                    ]
                }
                let policy_details = await policyService.findPolicyByPolicyId(tokenDataResponse.policy_id, queryOptions);
                if (!policy_details) {
                    throw new CustomError('Policy information not found')
                }
                policy_details.payment_link_status = GetPaymentLink.payment_link_status
                res.status(200).send({ status: 1, data: policy_details, message: ' Successfully fetch.' })
            }
        })
        //res.status(200).send({ status: 0, message: 'failed tested.' })



    } catch (error) {
        next(error);
    }
}

exports.GetAvdvanceSearchData = async (req, res, next) => {
    try {
        let data = {}
        data.all_policy_status = await policyService.allPolicyStatus();
        data.all_payment_status_type = await paymentService.allPaymentTypeOrStatus();
        res.status(200).send({ status: 1, data: data, message: 'Fetch successfully.' })
    } catch (error) {
        next(error)
    }
}

exports.MarkPolicyAsAnamaly = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        let policy_id = req.body.policy_id
        //console.log(policy_id);
        if (!req.body.policy_id) {
            throw new CustomError('policy is required', 400)
        }
        let updatePolicy = await policyService.updatePolicy(policy_id, { is_anamaly: req.body.is_anamaly }, transaction)
        //console.log(updatePolicy);
        if (updatePolicy) {
            res.status(200).send({ status: 1, data: [], message: 'Updated successfully.' })
            await transaction.commit();
        } else {
            await transaction.rollback();
            res.status(200).send({ status: 0, data: [], message: 'Update failed.' })
        }
    } catch (error) {
        next(error)
    }
}

exports.processCronPolicyActiveStatus = async () => {
    const transaction = await db.sequelize.transaction();
    try {
        const today = moment().format('YYYY-MM-DD');

        let holdPolicies = await policyService.getAllpolicy({
            where: {
                policy_status: 2, //30 Days Wait =>2,
                policy_start_date: {
                    [Op.lte]: today // Less than or equal to today's date
                }
            },
            attributes: ['policy_id', 'policy_status', 'policy_start_date', 'customer_id', 'org_id'],
            limit: 20,
        })
        holdPolicies = holdPolicies.rows

        if (holdPolicies.length > 0) {
            for (let i = 0; i < holdPolicies.length; i++) {
                const element = holdPolicies[i];
                let auditData = {
                    org_id: element.org_id,
                    customer_id: element.customer_id,
                    user_id: null,
                    row_id: element.policy_id,
                    section: 'POLICY_STATUS_PROCESS_CRON',
                    table_name: 'hws_policies',
                    source: 10,
                    create_user_type: 10,
                    created_by: null,
                    device_id: null,
                    description: `Policy status change  ${await policyService.getPolicyStatusFlagName(element.policy_status)} to ${await policyService.getPolicyStatusFlagName(1)} created by POLICY_STATUS_PROCESS_CRON`,
                };


                let updatePolicy = await policyService.updatePolicy(element.policy_id, { policy_status: 1, update_user_type: 10, updated_by: null }, transaction)
                if (updatePolicy) {
                    let policyStatusUpdateLogData = {
                        org_id: element.org_id,
                        policy_id: element.policy_id,
                        prev_policy_status_id: element.policy_status,
                        prev_policy_status: await policyService.getPolicyStatusFlagName(element.policy_status),
                        current_policy_status_id: 1,//Active=>1,
                        current_policy_status: await policyService.getPolicyStatusFlagName(1)//Active=>1,
                    }
                    let updatePolicyStatusLog = await policyStatusUpdateLogService.createPolicyStatusUpdateLog(policyStatusUpdateLogData, transaction);
                    let createAudit = await helper.updateAuditTrail(auditData);
                }

            }
            await transaction.commit();
            console.log('POLICY_STATUS_PROCESS_CRON committed successfully');
        } else {
            await transaction.rollback();
        }

    } catch (error) {
        await transaction.rollback();
        console.error('Error occurred:', error);
    }
}

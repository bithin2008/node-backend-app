const customerCardService = require("../../../services/v1/admin/customerCardService");
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index')
const helper = require("../../../common/helper");
const securePaymentsService = require("../../../services/v1/admin/securePaymentsService");
const customerService = require("../../../services/v1/admin/customerService");
var ApiContracts = require('authorizenet').APIContracts;

exports.getAllCards = async (req, res, next) => {
    try {
        const { customer_id } = req.params
        let queryOptions = {
            where: {
                customer_id: customer_id,
                active_status: 1
            }
        }
        let customerCardList = await customerCardService.getCustomerAllSavedCards(queryOptions);
        if (customerCardList.length > 0) {
            customerCardList.forEach(element => {
                element.card_last_4_digit = element.card_last_4_digit ? "xxxx xxxx xxxx " + element.card_last_4_digit : null
            });
            res.status(200).send({ status: 1, data: customerCardList, message: `Successfully found customer credit card list` })
        } else {
            res.status(200).send({ status: 1, data: customerCardList, message: `Customer have no saved card ` })
        }
    } catch (error) {
        next(error)
    }
}
exports.updatePrimaryCard = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { customer_card_id } = req.params
        let isExistCard = await customerCardService.getCustomerCardById({ where: { customer_card_id } });
        if (!isExistCard) {
            throw new CustomError(`Card Details not found!`, 400)
        }
        let queryOptions = {
            where: {
                customer_id: isExistCard.customer_id
            }
        }
        let customerCardList = await customerCardService.getCustomerAllSavedCards(queryOptions);
        let updateRes = null
        if (customerCardList.length > 0) {
            customerCardList.forEach(async element => {
                if (element.primary_card == 1) {
                    updateRes = await customerCardService.updateCustomerCard(element.customer_card_id, { primary_card: false }, transaction);
                }
            });
        }
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'CUSTOMER_PORTAL_ADD_CARD',
            table_name: 'hws_customer_cards',
            source: 1,
            create_user_type: 2,
            row_id: customer_card_id,
            device_id: helper.getDeviceId(req.headers['user-agent']),
            customer_id: isExistCard.customer_id,
            created_by: req.tokenData.org_user_id
        }
        updateRes = await customerCardService.updateCustomerCard(customer_card_id, { primary_card: true }, transaction)
        transaction.commit()
        if (updateRes) {
            auditData.description = `primary card updated ending with number ${isExistCard.card_last_4_digit}`;
            //  await helper.updateAuditTrail(auditData,req);
            res.status(200).send({ status: 1, message: `primary card updated ending with number ${isExistCard.card_last_4_digit}` })
        } else {
            auditData.description = `primary card update ending failed number ${isExistCard.card_last_4_digit}`;
            await helper.updateAuditTrail(auditData, req);
            res.status(200).send({ status: 0, message: `Primary card failed to updated. ` })
        }
    } catch (error) {
        transaction.rollback()
        next(error)
    }
}


exports.createCard = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { customer_id } = req.params
        const org_id = req.headers.org_id ? parseInt(req.headers.org_id) : req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null
        let customerDetails = await customerService.findCustomerById(parseInt(customer_id),{ include: [{
            model: db.customerCardsModel,
            as: 'card_list'
        },],});
        customerDetails = helper.getJsonParseData(customerDetails);

        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'CUSTOMER_PORTAL_ADD_CARD',
            table_name: 'hws_customer_cards',
            source: 0,
            create_user_type: 1,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        //console.log('customerDetails', customerDetails);
        if (customerDetails) {
            if (customerDetails.card_list.length==5) {
                throw new CustomError(`Maximum card entry reached. You can add up to five cards.`)
            }
            let payload = req.body

            auditData.customer_id = customerDetails.customer_id;
            auditData.name = customerDetails.first_name + ' ' + customerDetails.last_name;
            auditData.email = customerDetails.email ? customerDetails.email : null;
            auditData.row_id = customerDetails.customer_id;
            auditData.created_by = customerDetails.customer_id;

            const cardCreationData = {
                first_name: customerDetails.first_name ? customerDetails.first_name : null,
                last_name: customerDetails.last_name ? customerDetails.last_name : null,
                org_id: org_id,
                address1: customerDetails.address1 ? customerDetails.address1 : null,
                city: customerDetails.city ? customerDetails.city : null,
                state: customerDetails.state ? customerDetails.state : null,
                zip: customerDetails.zip ? customerDetails.zip : null,
                card_holder_name: req.body.cardHolderName ? req.body.cardHolderName : null,
                card_number: req.body.cardNumber ? req.body.cardNumber : null,
                card_expiry_date: req.body.cardExpiryDate ? req.body.cardExpiryDate : null,
                card_cvv: req.body.cardCVV ? req.body.cardCVV : null,
            }
            // console.log('cardCreationData', cardCreationData);
            const authorizeCustomerCardResponse = await securePaymentsService.authorizeCreditCard(cardCreationData);
            if (authorizeCustomerCardResponse.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
                const customerCardData = {
                    first_name: customerDetails.first_name ? customerDetails.first_name : null,
                    last_name: customerDetails.last_name ? customerDetails.last_name : null,
                    org_id: org_id,
                    customer_id: parseInt(customer_id),
                    card_type: null,
                    primary_card: false,
                    authorizeNet_payment_profile_id: null,
                    address1: customerDetails.address1 ? customerDetails.address1 : null,
                    city: customerDetails.city ? customerDetails.city : null,
                    state: customerDetails.state ? customerDetails.state : null,
                    zip: customerDetails.zip ? customerDetails.zip : null,
                    card_holder_name: req.body.cardHolderName ? req.body.cardHolderName : null,
                    card_number: req.body.cardNumber ? helper.encodeCrypto(req.body.cardNumber) : null,
                    card_last_4_digit: req.body.cardNumber ? req.body.cardNumber.slice(-4) : null,
                    card_expiry_date: req.body.cardExpiryDate ? helper.encodeCrypto(req.body.cardExpiryDate) : null,
                    card_cvv: req.body.cardCVV ? req.body.cardCVV : null,
                    ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
                    create_user_type: req.tokenData.source == 1 ?2:1, //  "self customer =>1,  admin-user=>2, realtor=>3,",
                    created_by: req.tokenData.source == 1 ? parseInt(req.tokenData.org_user_id) : parseInt(customerDetails.customer_id),
                }
                const allSavedCard = await customerCardService.getCustomerAllSavedCards({ where: { customer_id: customer_id } })
                //console.log('allSavedCard', allSavedCard);
                if (allSavedCard.length == 5) {
                    throw new CustomError("Maximum Save card limit exceeded");
                }
                if (allSavedCard.length == 0) {
                    customerCardData.primary_card = true
                }
                let cardAlreadyExists = false;
                allSavedCard.forEach(element => {
                    if (element.card_number == req.body.cardNumber && element.customer_id == customer_id && element.card_expiry_date == req.body.cardExpiryDate) {
                        cardAlreadyExists = true;
                    }
                });

                if (cardAlreadyExists) {
                    auditData.description = 'trying to add card which is already exist from customer portal';
                    await helper.updateAuditTrail(auditData, req);
                    throw new CustomError('Card is already exist');
                }

                //  const cardExists = await customerCardService.findCardByCardNumber(customerCardData);
                if (!cardAlreadyExists) {
                    let authorizeNet_customer_profile_id = null;
                    if (!customerDetails.authorizeNet_customer_profile_id) {

                        let customerProfileObj = {
                            customer_id: customerDetails.customer_id,
                            customer_email: customerDetails.email ? customerDetails.email : null,
                            first_name: customerDetails.first_name ? customerDetails.first_name : null,
                            last_name: customerDetails.last_name ? customerDetails.last_name : null,
                            billing_zip: customerDetails.zip ? customerDetails.zip : null,
                            billing_city: customerDetails.city ? customerDetails.city : null,
                            billing_state: customerDetails.state ? customerDetails.state : null,
                            billing_address: customerDetails.address1 ? customerDetails.address1 : null,
                            card_number: req.body.cardNumber ? req.body.cardNumber : null,
                            card_expiry_date: req.body.cardExpiryDate ? req.body.cardExpiryDate : null,
                            card_cvv: req.body.cardCVV ? req.body.cardCVV : null
                        }
                        let createCustomerProfileRes = await securePaymentsService.createCustomerProfile(customerProfileObj);
                        authorizeNet_customer_profile_id = createCustomerProfileRes.getCustomerProfileId()
                        console.log('authorizeNet_customer_profile_id', authorizeNet_customer_profile_id);
                        let updateCustomerProfileId = await db.customersModel.update({ authorizeNet_customer_profile_id: authorizeNet_customer_profile_id }, { where: { customer_id: customer_id } });
                    } else {
                        authorizeNet_customer_profile_id = customerDetails.authorizeNet_customer_profile_id
                    }

                    if (authorizeNet_customer_profile_id) {

                        let customerPaymentProfileObj = {
                            authorizeNet_customer_profile_id: customerDetails.authorizeNet_customer_profile_id ? customerDetails.authorizeNet_customer_profile_id : authorizeNet_customer_profile_id,
                            customer_id: customerDetails.customer_id ? customerDetails.customer_id : null,
                            customer_email: customerDetails.email ? customerDetails.email : null,
                            first_name: customerDetails.first_name ? customerDetails.first_name : null,
                            last_name: customerDetails.last_name ? customerDetails.last_name : null,
                            card_holder_name: req.body.cardHolderName ? req.body.cardHolderName : null,
                            card_number: req.body.cardNumber ? req.body.cardNumber : null,
                            card_expiry_date: req.body.cardExpiryDate ? req.body.cardExpiryDate : null,
                            card_cvv: req.body.cardCVV ? req.body.cardCVV : null
                        }

                        const createCustomerPaymentProfileResponse = await securePaymentsService.createCustomerPaymentProfile(customerPaymentProfileObj);
                        // console.log('createCustomerPaymentProfileResponse', createCustomerPaymentProfileResponse);
                        paymentProfileId = createCustomerPaymentProfileResponse.getCustomerPaymentProfileId();
                        if (paymentProfileId) {
                            if (customerCardData) {
                                customerCardData.card_type = authorizeCustomerCardResponse.getTransactionResponse().accountType;
                                customerCardData.authorizeNet_payment_profile_id = paymentProfileId ? paymentProfileId : null;
                                let createdCustomerCard = await customerCardService.createCustomerCard(customerCardData, transaction);
                                createdCustomerCard = helper.getJsonParseData(createdCustomerCard);

                                /*  if (allSavedCard.length == 0) {
                                     setTimeout(() => {
                                         db.customerCardsModel.update({ primary_card: true }, { where: { customer_card_id: createdCustomerCard.customer_card_id } });
                                     }, 500);
 
                                 } */
                                transaction.commit();
                                if (createdCustomerCard) {
                                    auditData.description = `${req.body.cardNumber.slice(-4)} card added successfully from customer portal`;
                                    await helper.updateAuditTrail(auditData, req);
                                    res.status(200).send({ status: 1, message: "Card saved successfully" });
                                }
                            }
                        }

                    } else {
                        throw new CustomError("Customer profile not found");
                    }

                }
            } else {
                auditData.description = 'unable to add card from customer portal';
                await helper.updateAuditTrail(auditData, req);
                throw new CustomError(`Unable to add card`);
                // throw new CustomError(authorizeCustomerCardResponse.getTransactionResponse().getErrors().getError()[0].getErrorText());
            }
        } else {
            throw new CustomError("Customer not found");
        }

    } catch (error) {
        transaction.rollback()
        next(error)
    }


}
exports.updateCardInActiveStatus = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { customer_card_id } = req.params
        let isExistCard = await customerCardService.getCustomerCardById({ where: { customer_card_id } });
        if (!isExistCard) {
            throw new CustomError(`Card Details not found!`, 400)
        }
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'CUSTOMER_PORTAL_ADD_CARD',
            table_name: 'hws_customer_cards',
            source: 1,
            create_user_type: 2,
            device_id: helper.getDeviceId(req.headers['user-agent']),
            customer_id: isExistCard.customer_id,
            created_by: req.tokenData.org_user_id
        }
        const updateRes = await customerCardService.updateCustomerCard(customer_card_id, { active_status: 0 }, transaction)
        transaction.commit()
        if (updateRes) {

            auditData.description = `card removed successfully ending with number ${isExistCard.card_last_4_digit}`;
            await helper.updateAuditTrail(auditData, req);
            res.status(200).send({ status: 1, message: `Card Removed successfully! ` })
        } else {
            auditData.description = `card removed failed ending with number ${isExistCard.card_last_4_digit}`;
            await helper.updateAuditTrail(auditData, req);
            res.status(200).send({ status: 0, message: `Card Removed failed.` })
        }
    } catch (error) {
        transaction.rollback()
        next(error)
    }
}
exports.deleteCustomerCard = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { org_id, org_user_id } = req.tokenData
        const { customer_card_id } = req.params
        let isExistCard = await customerCardService.getCustomerCardById({
            where: { customer_card_id },
            include: [{
                model: db.customersModel,
                as: 'customer_details'
            },],
        });
        if (!isExistCard) {
            throw new CustomError(`Card Details not found!`, 400)
        }
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'CUSTOMER_PORTAL_DELETE_CARD',
            table_name: 'hws_customer_cards',
            source: 1,
            create_user_type: 2,
            device_id: helper.getDeviceId(req.headers['user-agent']),
            customer_id: isExistCard.customer_id,
            created_by: org_user_id
        }
        const deleteRes = await customerCardService.deleteCustomerCard(org_id, customer_card_id, isExistCard.customer_details.authorizeNet_customer_profile_id, isExistCard.authorizeNet_payment_profile_id, org_user_id, transaction)
        transaction.commit()
        if (deleteRes) {

            auditData.description = `card removed successfully ending with number ${isExistCard.card_last_4_digit}`;
            await helper.updateAuditTrail(auditData, req);
            res.status(200).send({ status: 1, message: `Card Removed successfully! ` })
        } else {
            auditData.description = `card removed failed ending with number ${isExistCard.card_last_4_digit}`;
            await helper.updateAuditTrail(auditData, req);
            res.status(200).send({ status: 0, message: `Card Removed failed.` })
        }
    } catch (error) {
        transaction.rollback()
        next(error)
    }
}
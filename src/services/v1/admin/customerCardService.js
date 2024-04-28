const db = require('../../../models/index');
const helper = require('../../../common/helper');
const CustomError = require('../../../utils/customErrorHandler');
const securePaymentsService = require("../../../services/v1/admin/securePaymentsService");
var ApiContracts = require('authorizenet').APIContracts;



exports.getCustomerAllSavedCards = async (queryOption = {}) => {
    let cardList = await db.customerCardsModel.findAll(queryOption);
    if (cardList.length > 0) {
        cardList.forEach(element => {
            if (element.card_expiry_date) {
                element.card_expiry_date = helper.decodeCrypto(element.card_expiry_date)
            }
            if (element.card_number) {  
                element.card_number = helper.decodeCrypto(element.card_number)
            }
        });
    }
    return helper.getJsonParseData(cardList)
}

exports.getCustomerCardById = async (queryOption) => {
    let cardDetails = await db.customerCardsModel.findOne(queryOption);;
    if (cardDetails) {
        cardDetails.card_number = helper.decodeCrypto(cardDetails.card_number)
        cardDetails.card_expiry_date = helper.decodeCrypto(cardDetails.card_expiry_date)
    }
    return helper.getJsonParseData(cardDetails)
}
//UPDATE CUSTOMER CARD 
exports.updateCustomerCard = async (customer_card_id, obj, transaction) => {
    try {
        let updatedPolicy = await db.customerCardsModel.update(obj, { where: { customer_card_id: customer_card_id }, transaction })
        return updatedPolicy[0] != 0 ? true : false;
    } catch (e) {
        throw e;
    }
}
exports.createCustomerCard = async (obj, transaction) => {
    //console.log('createCustomerCard', obj);
    let createdCard = await db.customerCardsModel.create(obj, { transaction });
    return helper.getJsonParseData(createdCard)
}

exports.findCardByCardNumber = async (obj, transaction) => {
    try {
        var cardExist = await db.customerCardsModel.findOne({ where: { card_number: obj.card_number, customer_id: obj.customer_id } });
        console.log('cardExist', cardExist);
        return cardExist;
    } catch (e) {
        console.log(e);
        throw e
        // throw Error('Error while fetching User')
    }
}


exports.deleteCustomerCard = async (org_id, customer_card_id, authorizeNet_customer_profile_id, authorizeNet_payment_profile_id, ownerId, transaction) => {
    try {

        const authorizeCustomerCardResponse = await securePaymentsService.deleteCustomerPaymentProfile(authorizeNet_customer_profile_id, authorizeNet_payment_profile_id,)
        if (authorizeCustomerCardResponse.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
            await db.customerCardsModel.update({ deleted_by: ownerId }, { where: { customer_card_id: customer_card_id, org_id: org_id }, transaction })
            let deleteCustomerCard = await db.customerCardsModel.destroy({ where: { customer_card_id: customer_card_id }, transaction })
            return true;
        }else{
            return false;
        }



    } catch (e) {
        throw e
    }
}
const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');
var ApiContracts = require('authorizenet').APIContracts;
var ApiControllers = require('authorizenet').APIControllers;
var SDKConstants = require('authorizenet').Constants;
const moment = require("moment");
const apiLoginKey = process.env.AUTHORIZE_DOT_NET_API_LOGIN_KEY
const transactionKey = process.env.AUTHORIZE_DOT_NET_TRANSACTION_KEY
const clientKey = process.env.AUTHORIZE_DOT_NET_CLIENT_KEY
const policyService = require("../../../services/v1/admin/policyService");
 const logger = require('../../../utils/logger')

exports.authorizeCreditCard = async (obj) => {

	const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName(apiLoginKey);
	merchantAuthenticationType.setTransactionKey(transactionKey);
	//merchantAuthenticationType.setClientKey(clientKey);

	const creditCard = new ApiContracts.CreditCardType();
	creditCard.setCardNumber(obj ? obj.card_number : null);
	creditCard.setExpirationDate(obj ? obj.card_expiry_date : null);
	creditCard.setCardCode(obj ? obj.card_cvv : null);

	const paymentType = new ApiContracts.PaymentType();
	paymentType.setCreditCard(creditCard);

	const billTo = new ApiContracts.CustomerAddressType();
	let cardHolderFName = null;
	let cardHolderLName = null;
	if (obj?.card_holder_name) {
		let holderNameSplit = obj?.card_holder_name.split(' ');
		cardHolderFName = holderNameSplit[0];
		cardHolderLName = holderNameSplit[holderNameSplit.length - 1];
	}
	cardHolderLName = cardHolderLName.length > 20 ? cardHolderLName.substring(0, 20) : cardHolderLName;
	let address = obj?.address1?.length > 20 ? obj.address1.substring(0, 20) : obj.address1;
	billTo.setFirstName(cardHolderFName ? cardHolderFName.charAt(0) : null);
	billTo.setLastName(cardHolderLName ? cardHolderLName : null);
	billTo.setAddress(obj ? address : null);
	billTo.setCity(obj ? obj.city : null);
	billTo.setState(obj ? obj.state : null);
	billTo.setZip(obj ? obj.zip : null);
	billTo.setCountry('USA');
	const transactionRequestType = new ApiContracts.TransactionRequestType();
	transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHONLYTRANSACTION);
	transactionRequestType.setPayment(paymentType);
	transactionRequestType.setAmount(0);
	transactionRequestType.setBillTo(billTo);

	const createRequest = new ApiContracts.CreateTransactionRequest();

	createRequest.setMerchantAuthentication(merchantAuthenticationType);
	createRequest.setTransactionRequest(transactionRequestType); ''
	var ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
	if (process.env.NODE_ENV == 'prod') {
		ctrl.setEnvironment(SDKConstants.endpoint.production);
	}
	try {
		const response = await new Promise((resolve, reject) => {
			ctrl.execute(() => {
				const apiResponse = ctrl.getResponse();
				const authorizeCreditCardResponse = new ApiContracts.CreateTransactionResponse(apiResponse);
				resolve(authorizeCreditCardResponse);
			});
		});
		console.log('response', JSON.stringify(response));

		const responseObject = response;
		const resultCode = responseObject?.messages?.resultCode;
		const code = responseObject?.messages?.message[0]?.code;
		const transactionResponse = responseObject?.transactionResponse;
		const transactionResponseCode = responseObject?.transactionResponse?.responseCode;
		console.log('resultCode',resultCode);
		console.log('code',code);
		console.log('transactionResponse',transactionResponse);
		console.log('transactionResponseCode',transactionResponseCode);
		if (responseObject && (transactionResponseCode==1 ||transactionResponseCode==4)) {
			return response;
		} else {
			logger.error(JSON.stringify(response))
			const errors = response?.transactionResponse?.errors?.error;
			if (errors && errors.length > 0) {
				const errorCode = errors[0]?.errorCode;
				const errorText = errors[0]?.errorText;
				throw new CustomError(errorText, 400);
			}else{
				throw new CustomError(response.getMessages().getMessage()[0].getText(), 400);
			}
		}
		if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
			return response;
		} else {
			logger.error(JSON.stringify(response))
			throw new CustomError(response.getMessages().getMessage()[0].getText(), 400);
		}
	} catch (error) {
		throw error; // Rethrow any errors for handling in the calling code
	}
}

exports.chargeCreditCard = async (req, res, next, obj) => {
	// console.log('chargeCreditCard obj',obj);
	let policyTerm;
	if (!obj) {
		if (req.body.policyTermMonth == 1) {
			policyTerm = Math.round(30.44);
		} else {
			policyTerm = Math.round(req.body.policyTermMonth * 30.44);
		}
	}

	const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName(apiLoginKey);
	merchantAuthenticationType.setTransactionKey(transactionKey);
	//merchantAuthenticationType.setClientKey(clientKey);

	const creditCard = new ApiContracts.CreditCardType();
	creditCard.setCardNumber(obj ? obj.card_number : req.body.cardNumber);
	creditCard.setExpirationDate(obj ? obj.card_expiry_date : req.body.expiryDate);
	creditCard.setCardCode(obj ? obj.card_cvv : req.body.cardCode);

	const paymentType = new ApiContracts.PaymentType();
	paymentType.setCreditCard(creditCard);

	const orderDetails = new ApiContracts.OrderType();
	orderDetails.setInvoiceNumber(`INV-`);//${obj ? obj.policy_no : req.body.policyNum}
	orderDetails.setDescription(`${obj ? obj.plan_name : req.body.planName} plan from  ${obj ? obj.policy_start_date : moment().add(30, "days").format('YYYY-MM-DD')} to ${obj ? obj.expiry_with_bonus : moment().add(policyTerm + 30 + Math.round(req.body.bonusMonth * 30.44), "days").format('YYYY-MM-DD')}`);

	const tax = new ApiContracts.ExtendedAmountType();
	tax.setAmount(obj ? obj.tax_amount : req.body.taxAmount);

	const billTo = new ApiContracts.CustomerAddressType();
	billTo.setFirstName(obj ? obj.first_name : req.body.firstName);
	billTo.setLastName(obj ? obj.last_name : req.body.lastName);
	billTo.setAddress(obj ? obj.billing_address : req.body.billingAddress);
	billTo.setCity(obj ? obj.billing_city : req.body.billingCity);
	billTo.setState(obj ? obj.billing_state : req.body.billingState);
	billTo.setZip(obj ? obj.billing_zip : req.body.billingZipCode);
	billTo.setCountry('USA');

	const transactionRequestType = new ApiContracts.TransactionRequestType();
	transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
	transactionRequestType.setPayment(paymentType);
	transactionRequestType.setAmount(obj ? obj.net_amount : req.body.netAmount);
	transactionRequestType.setOrder(orderDetails);
	transactionRequestType.setTax(tax);
	transactionRequestType.setBillTo(billTo);

	const createRequest = new ApiContracts.CreateTransactionRequest();
	if (process.env.NODE_ENV == 'prod') {
		createRequest.setValidationMode(ApiContracts.ValidationModeEnum.LIVEMODE);
	}
	createRequest.setMerchantAuthentication(merchantAuthenticationType);
	createRequest.setTransactionRequest(transactionRequestType); ''

	//pretty print request
	//console.log(JSON.stringify(createRequest.getJSON(), null, 2));

	var ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
	//Defaults to sandbox
	if (process.env.NODE_ENV == 'prod') {
		ctrl.setEnvironment(SDKConstants.endpoint.production);
	}
	return new Promise((resolve, reject) => {
		ctrl.execute(() => {
			const apiResponse = ctrl.getResponse();
			const response = new ApiContracts.CreateTransactionResponse(apiResponse);
			// console.log('response' ,response)
			// console.log('response transactionResponse errors' ,response.transactionResponse.errors)
			// console.log('response messages' ,helper.getJsonParseData(response.messages.message) );

			if (response !== null) {
				if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
					resolve(response);
				} else {
					resolve(response);
					logger.error(JSON.stringify(response))
				}
			} else {
				resolve('Null response from Authorize.Net');
			}
		});
	});
	/* ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.CreateTransactionResponse(apiResponse);

		//pretty print response
		console.log(JSON.stringify(response, null, 2));
		
		if(response != null){
			if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
				if(response.getTransactionResponse().getMessages() != null){
					console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
					console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
					console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
					console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
				}
				else {
					console.log('Failed Transaction.');
					if(response.getTransactionResponse().getErrors() != null){
						console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
						console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
					}
				}
			}
			else {
				console.log('Failed Transaction. ');
				if(response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null){
				
					console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
					console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
				}
				else {
					console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
					console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
				}
			}
		}
		else {
			console.log('Null Response.');
		}

	}); */
}

exports.createSchedulePayment = async (req, res, next, obj) => {
	try {
		const ApiContracts = require('authorizenet').APIContracts;
		const ApiControllers = require('authorizenet').APIControllers;
		const constants = require('authorizenet').Constants;



		const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
		merchantAuthenticationType.setName(apiLoginKey);
		merchantAuthenticationType.setTransactionKey(transactionKey);
		//merchantAuthenticationType.setClientKey(clientKey);

		const orderDetails = new ApiContracts.OrderType();
		orderDetails.setInvoiceNumber(`INV-${obj.policy_no}`);
		orderDetails.setDescription(obj.plan_name);
		const billTo = new ApiContracts.CustomerAddressType();
		billTo.setFirstName(obj.first_name);
		billTo.setLastName(obj.last_name);
		billTo.setAddress(obj.billing_address);
		billTo.setCity(obj.billing_city);
		billTo.setState(obj.billing_state);
		billTo.setZip(obj.billing_zip);
		billTo.setCountry('USA');

		// Create a payment transaction
		const transactionRequestType = new ApiContracts.TransactionRequestType();
		transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION); // Adjust transaction type as needed
		transactionRequestType.setAmount(obj.net_amount); // Set the payment amount
		transactionRequestType.setScheduledDate(moment(obj.payment_date).format("YYYY-MM-DD")); // Set the scheduled date in the format 'YYYY-MM-DD'
		transactionRequestType.setOrder(orderDetails);
		transactionRequestType.setBillTo(billTo);
		// Set other transaction details like payment method, customer info, etc.
		// ...

		const createRequest = new ApiContracts.CreateTransactionRequest();
		if (process.env.NODE_ENV == 'prod') {
			createRequest.setValidationMode(ApiContracts.ValidationModeEnum.LIVEMODE);
		}
		createRequest.setMerchantAuthentication(merchantAuthenticationType);
		createRequest.setTransactionRequest(transactionRequestType);

		// Create a controller and execute the request
		let ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
		if (process.env.NODE_ENV == 'prod') {
			ctrl.setEnvironment(SDKConstants.endpoint.production);
		}
		return new Promise((resolve, reject) => {
			ctrl.execute(() => {
				const apiResponse = ctrl.getResponse();
				const response = new ApiContracts.CreateTransactionResponse(apiResponse);

				if (response !== null) {
					if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
						resolve(response);
					} else {
						resolve(response);
					}
				} else {
					resolve('Null response from Authorize.Net');
				}
			});
		});
		ctrl.execute(function () {
			const apiResponse = ctrl.getResponse();
			const response = new ApiContracts.CreateTransactionResponse(apiResponse);

			if (response != null) {
				if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
					console.log('Payment Scheduled Successfully');
					console.log('Transaction ID: ' + response.getTransactionResponse().getTransId());
				} else {
					console.log('Payment Scheduling Failed');
					if (response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null) {
						console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
						console.log('Error Message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
					} else {
						console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
						console.log('Error Message: ' + response.getMessages().getMessage()[0].getText());
					}
				}
			} else {
				console.log('Null Response.');
			}
		});
	} catch (error) {
		throw error
	}
}



exports.debitBankAccount = async (req, res, next, obj = {}) => {
	console.log('obj obj', obj);
	const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName(process.env.AUTHORIZE_DOT_NET_API_LOGIN_KEY); //process.env.AUTHORIZE_DOT_NET_API_LOGIN_KEY
	merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZE_DOT_NET_TRANSACTION_KEY); //process.env.AUTHORIZE_DOT_NET_TRANSACTION_KEY
	let policyTerm;
	if (!obj) {
		if (req.body.policyTermMonth == 1) {
			policyTerm = Math.round(30.44);
		} else {
			policyTerm = Math.round(req.body.policyTermMonth * 30.44);
		}
	}
	const bankAccountType = new ApiContracts.BankAccountType();
	bankAccountType.setAccountType(ApiContracts.BankAccountTypeEnum.SAVINGS);
	bankAccountType.setRoutingNumber(Object.keys(obj).length !== 0 ? obj.routing_no : req.body.routingNumber);
	bankAccountType.setAccountNumber(Object.keys(obj).length !== 0 ? obj.acc_no : req.body.bankAccountNumber);
	//bankAccountType.setNameOnAccount(Object.keys(obj).length !== 0?obj.acc_holder_name:req.body.bankAccountHolderName);

	/* var bankAccountNum = Math.floor(Math.random() * 9999999999) + 10000;
	bankAccountType.setAccountNumber(bankAccountNum.toString()); */
	bankAccountType.setNameOnAccount(Object.keys(obj).length !== 0 ? obj.acc_holder_name : req.body.bankAccountHolderName);
	const paymentType = new ApiContracts.PaymentType();
	paymentType.setBankAccount(bankAccountType);

	const orderDetails = new ApiContracts.OrderType();
	orderDetails.setInvoiceNumber(`INV-`);
	// orderDetails.setName(Object.keys(obj).length !== 0?obj.plan_name:req.body.planName);
	//orderDetails.setDescription(`${Object.keys(obj).length !== 0 ? obj.plan_name : req.body.planName} plan from  ${obj.policy_start_date} to ${obj.expiry_with_bonus}`);
	orderDetails.setDescription(`${Object.keys(obj).length !== 0 ? obj.plan_name : req.body.planName} plan from  ${Object.keys(obj).length !== 0 ? obj.policy_start_date : moment().add(30, "days").format('YYYY-MM-DD')} to ${Object.keys(obj).length !== 0 ? obj.expiry_with_bonus : moment().add(policyTerm + 30 + Math.round(req.body.bonusMonth * 30.44), "days").format('YYYY-MM-DD')}`);

	const tax = new ApiContracts.ExtendedAmountType();
	tax.setAmount(Object.keys(obj).length !== 0 ? obj.tax_amount : req.body.taxAmount);
	// tax.setName('level2 tax name');
	// tax.setDescription('level2 tax');




	// const shipping = new ApiContracts.ExtendedAmountType();
	// shipping.setAmount(req.body.netAmount);
	//shipping.setName('shipping name');
	//shipping.setDescription('shipping description');

	const billTo = new ApiContracts.CustomerAddressType();
	billTo.setFirstName(Object.keys(obj).length !== 0 ? obj.first_name : req.body.firstName);
	billTo.setLastName(Object.keys(obj).length !== 0 ? obj.last_name : req.body.lastName);
	billTo.setAddress(Object.keys(obj).length !== 0 ? obj.billing_address : req.body.billingAddress);
	billTo.setCity(Object.keys(obj).length !== 0 ? obj.billing_city : req.body.billingCity);
	billTo.setState(Object.keys(obj).length !== 0 ? obj.billing_state : req.body.billingState);
	billTo.setZip(Object.keys(obj).length !== 0 ? obj.billing_zip : req.body.billingZipCode);
	billTo.setCountry('USA');;

	/* var lineItemList = [];


	if (req.body.selectdAddOnProducts.length > 0) {
		req.body.selectdAddOnProducts.forEach((element, lineItem_id) => {
			lineItem_id = new ApiContracts.LineItemType();
			lineItem_id.setItemId(lineItem_id + 1);
			lineItem_id.setName(element.product_name);
			lineItem_id.setQuantity(1);
			lineItem_id.setUnitPrice(req.body.policyTerm.toLowerCse() == 'monthly' ? element.monthly_price : element.yearly_price);
			lineItemList.push(lineItem_id);
		});
	} */



	// var lineItem_id2 = new ApiContracts.LineItemType();
	// lineItem_id2.setItemId('2');
	// lineItem_id2.setName('vase2');
	// lineItem_id2.setDescription('cannes logo2');
	// lineItem_id2.setQuantity('28');
	// lineItem_id2.setUnitPrice('25.00');


	// var lineItems = new ApiContracts.ArrayOfLineItem();
	// lineItems.setLineItem(lineItemList);

	// var userField_a = new ApiContracts.UserField();
	// userField_a.setName('A');
	// userField_a.setValue('Aval');

	// var userField_b = new ApiContracts.UserField();
	// userField_b.setName('B');
	// userField_b.setValue('Bval');

	// var userFieldList = [];
	// userFieldList.push(userField_a);
	// userFieldList.push(userField_b);

	// var userFields = new ApiContracts.TransactionRequestType.UserFields();
	// userFields.setUserField(userFieldList);

	// var transactionSetting1 = new ApiContracts.SettingType();
	// transactionSetting1.setSettingName('duplicateWindow');
	// transactionSetting1.setSettingValue('120');

	// var transactionSetting2 = new ApiContracts.SettingType();
	// transactionSetting2.setSettingName('recurringBilling');
	// transactionSetting2.setSettingValue('false');

	// var transactionSettingList = [];
	// transactionSettingList.push(transactionSetting1);
	// transactionSettingList.push(transactionSetting2);

	// var transactionSettings = new ApiContracts.ArrayOfSetting();
	// transactionSettings.setSetting(transactionSettingList);

	const transactionRequestType = new ApiContracts.TransactionRequestType();
	transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
	transactionRequestType.setPayment(paymentType);
	transactionRequestType.setAmount(Object.keys(obj).length !== 0 ? obj.net_amount : req.body.netAmount);
	// transactionRequestType.setLineItems(lineItems);
	//transactionRequestType.setUserFields(userFields);
	transactionRequestType.setOrder(orderDetails);
	//transactionRequestType.setTax(tax);
	transactionRequestType.setBillTo(billTo);
	//transactionRequestType.setTransactionSettings(transactionSettings);

	const createRequest = new ApiContracts.CreateTransactionRequest();
	if (process.env.NODE_ENV == 'prod') {
		createRequest.setValidationMode(ApiContracts.ValidationModeEnum.LIVEMODE);
	}
	createRequest.setMerchantAuthentication(merchantAuthenticationType);
	createRequest.setTransactionRequest(transactionRequestType);

	//pretty print request
	//console.log(JSON.stringify(createRequest.getJSON(), null, 2));

	let ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
	if (process.env.NODE_ENV == 'prod') {
		ctrl.setEnvironment(SDKConstants.endpoint.production);
	}
	//pretty print response
	//console.log(JSON.stringify(response, null, 2));

	return new Promise((resolve, reject) => {
		ctrl.execute(() => {
			const apiResponse = ctrl.getResponse();
			const response = new ApiContracts.CreateTransactionResponse(apiResponse);
			console.log(JSON.stringify(response));
			if (response !== null) {
				if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
					resolve(response);
				} else {
					resolve(response);
				}
			} else {
				resolve('Null response from Authorize.Net');
			}
		});
	});
}

// CREAE CUSTOMER PROFILE I AUTHORIZE.NET 
exports.createCustomerProfile = async (obj) => {
	try {
		const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();

		merchantAuthenticationType.setName(apiLoginKey);
		merchantAuthenticationType.setTransactionKey(transactionKey);
		const creditCard = new ApiContracts.CreditCardType();
		creditCard.setCardNumber(obj.card_number);
		creditCard.setExpirationDate(obj.card_expiry_date);

		const paymentType = new ApiContracts.PaymentType();
		paymentType.setCreditCard(creditCard);

		const customerAddress = new ApiContracts.CustomerAddressType();
		customerAddress.setFirstName(obj.first_name);
		customerAddress.setLastName(obj.last_name);
		customerAddress.setAddress(obj.address?obj.address:(obj.billing_address?obj.billing_address:'N/A'));
		customerAddress.setCity(obj.city?obj.city:(obj.billing_city?obj.billing_city:'N/A'));
		customerAddress.setState(obj.state?obj.state:(obj.billing_state?obj.billing_state:'N/A'));
		customerAddress.setZip(obj.zip?obj.zip:(obj.billing_zip?obj.billing_zip:'N/A'));
		customerAddress.setPhoneNumber(obj.mobile);

		const customerPaymentProfileType = new ApiContracts.CustomerPaymentProfileType();
		customerPaymentProfileType.setCustomerType(ApiContracts.CustomerTypeEnum.INDIVIDUAL);
		customerPaymentProfileType.setPayment(paymentType);
		customerPaymentProfileType.setBillTo(customerAddress);

		const paymentProfilesList = [];
		paymentProfilesList.push(customerPaymentProfileType);

		const customerProfileType = new ApiContracts.CustomerProfileType();
		customerProfileType.setMerchantCustomerId(obj.customer_id);
		customerProfileType.setDescription('Customer Profile');
		customerProfileType.setEmail(obj.customer_email);
		customerProfileType.setPaymentProfiles(paymentProfilesList);

		const createRequest = new ApiContracts.CreateCustomerProfileRequest();
		//createRequest.clientId = clientKey;
		createRequest.setProfile(customerProfileType);
		if (process.env.NODE_ENV == 'prod') {
			createRequest.setValidationMode(ApiContracts.ValidationModeEnum.LIVEMODE);
		}
		createRequest.setMerchantAuthentication(merchantAuthenticationType);

		//pretty print request
		//console.log(JSON.stringify(createRequest.getJSON(), null, 2));


		let ctrl = new ApiControllers.CreateCustomerProfileController(createRequest.getJSON());
		if (process.env.NODE_ENV == 'prod') {
			ctrl.setEnvironment(SDKConstants.endpoint.production);
		}
		const response = await new Promise((resolve, reject) => {
			ctrl.execute(() => {
				const apiResponse = ctrl.getResponse();
				const customerProfileResponse = new ApiContracts.CreateCustomerProfileResponse(apiResponse);
				resolve(customerProfileResponse);
			});
		});
		console.log('response', response);
		
		if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
			return response; // Return the response if successful
		} else {
			//'Error creating customer profile: ' + response.getMessages().getMessage()[0].getText()
			console.log(response.getMessages());
			//throw new CustomError(response.getMessages().getMessage()[0].getText());
			//throw new CustomError(response.getMessages().getMessage()[0].getText(),400);
			logger.error(JSON.stringify(response))

			throw new CustomError(`Payment failed`, 400);
			reject(response);
		}
		////console.log('response.getMessages()',response.getMessages());

	} catch (error) {
		throw error; // Rethrow any errors for handling in the calling code
	}
	return new Promise((resolve, reject) => {
		ctrl.execute(() => {
			const apiResponse = ctrl.getResponse();
			const response = new ApiContracts.CreateTransactionResponse(apiResponse);
			/* 	console.log('response' ,response)
				console.log('response transactionResponse errors' ,response.transactionResponse.errors)
				console.log('response messages' ,helper.getJsonParseData(response.messages.message) );
				*/
			if (response !== null) {
				if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
					resolve(response);
				} else {
					resolve(response);
				}
			} else {
				resolve('Null response from Authorize.Net');
			}
		});
	});
	ctrl.execute(function () {

		const apiResponse = ctrl.getResponse();

		const response = new ApiContracts.CreateCustomerProfileResponse(apiResponse);

		//pretty print response
		//console.log(JSON.stringify(response, null, 2));

		if (response != null) {
			if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
				console.log('Successfully created a customer profile with id: ' + response.getCustomerProfileId());
			}
			else {
				console.log('Result Code: ' + response.getMessages().getResultCode());
				console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else {
			console.log('Null response received');
		}

		callback(response);
	});
}

exports.createCustomerPaymentProfile = async (obj) => {
	console.log('PAYMENT customerPaymentProfileObj', obj);
	const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName(apiLoginKey);
	merchantAuthenticationType.setTransactionKey(transactionKey);

	const creditCard = new ApiContracts.CreditCardType();
	creditCard.setCardNumber(obj.card_number);
	creditCard.setExpirationDate(obj.card_expiry_date);

	const paymentType = new ApiContracts.PaymentType();
	paymentType.setCreditCard(creditCard);

	const customerAddress = new ApiContracts.CustomerAddressType();
	customerAddress.setFirstName(obj.first_name);
	customerAddress.setLastName(obj.last_name);
	// customerAddress.setAddress(obj.address);
	// customerAddress.setCity(obj.city);
	// customerAddress.setState(obj.state);
	// customerAddress.setZip(obj.zip);

	customerAddress.setAddress(obj.address?obj.address:(obj.billing_address?obj.billing_address:'N/A'));
	customerAddress.setCity(obj.city?obj.city:(obj.billing_city?obj.billing_city:'N/A'));
	customerAddress.setState(obj.state?obj.state:(obj.billing_state?obj.billing_state:'N/A'));
	customerAddress.setZip(obj.zip?obj.zip:(obj.billing_zip?obj.billing_zip:'N/A'));

	customerAddress.setPhoneNumber(obj.mobile);

	const profile = new ApiContracts.CustomerPaymentProfileType();
	profile.setBillTo(customerAddress);
	profile.setPayment(paymentType);
	// profile.setDefaultPaymentProfile(true);

	const createRequest = new ApiContracts.CreateCustomerPaymentProfileRequest();
	if (process.env.NODE_ENV == 'prod') {
		createRequest.setValidationMode(ApiContracts.ValidationModeEnum.LIVEMODE);
	}
	createRequest.setMerchantAuthentication(merchantAuthenticationType);
	createRequest.setCustomerProfileId(obj.authorizeNet_customer_profile_id);
	createRequest.setPaymentProfile(profile);

	//pretty print request
	//console.log(JSON.stringify(createRequest.getJSON(), null, 2));

	let ctrl = new ApiControllers.CreateCustomerPaymentProfileController(createRequest.getJSON());
	if (process.env.NODE_ENV == 'prod') {
		ctrl.setEnvironment(SDKConstants.endpoint.production);
	}
	try {
		const response = await new Promise((resolve, reject) => {
			ctrl.execute(() => {
				const apiResponse = ctrl.getResponse();
				const customerProfileResponse = new ApiContracts.CreateCustomerPaymentProfileResponse(apiResponse);
				resolve(customerProfileResponse);
			});
		});
		console.log('RESPONSE', response.getMessages());
		if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {

			return response; // Return the response if successful
		} else {
			logger.error(JSON.stringify(response))

			//'Error creating customer profile: ' + response.getMessages().getMessage()[0].getText()
			console.log('Error creating customer profile: ' + response.getMessages().getMessage()[0].getText());
			// throw new CustomError(response.getMessages().getMessage()[0].getText());
			throw new CustomError(`Something went wrong`, 400);
		}
	} catch (error) {
		throw error; // Rethrow any errors for handling in the calling code
	}

	ctrl.execute(function () {

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.CreateCustomerPaymentProfileResponse(apiResponse);

		//pretty print response
		//console.log(JSON.stringify(response, null, 2));

		if (response != null) {
			if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
				console.log('createCustomerPaymentProfile: Successfully created a customer payment profile with id: ' + response.getCustomerPaymentProfileId());
			}
			else {
				console.log('Result Code: ' + response.getMessages().getResultCode());
				console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else {
			console.log('Null response received');
		}

		callback(response);
	});
}



exports.deleteCustomerPaymentProfile = async (customerProfileId, customerPaymentProfileId) => {

	const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName(apiLoginKey);
	merchantAuthenticationType.setTransactionKey(transactionKey);
	//merchantAuthenticationType.setClientKey(clientKey);

	const deleteRequest = new ApiContracts.DeleteCustomerPaymentProfileRequest();
	deleteRequest.setMerchantAuthentication(merchantAuthenticationType);
	deleteRequest.setCustomerProfileId(customerProfileId);
	deleteRequest.setCustomerPaymentProfileId(customerPaymentProfileId);

	//pretty print request
	//console.log(JSON.stringify(createRequest.getJSON(), null, 2));

	let ctrl = new ApiControllers.DeleteCustomerPaymentProfileController(deleteRequest.getJSON());
	if (process.env.NODE_ENV == 'prod') {
		ctrl.setEnvironment(SDKConstants.endpoint.production);
	}
	try {
		const response = await new Promise((resolve, reject) => {
			ctrl.execute(() => {
				const apiResponse = ctrl.getResponse();
				const customerDeletePaymentProfileResponse = new ApiContracts.DeleteCustomerPaymentProfileResponse(apiResponse);
				resolve(customerDeletePaymentProfileResponse);
			});
		});
		console.log('response', response.getMessages());
		if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
			return response; // Return the response if successful
		} else {
			// throw new CustomError(response.getMessages().getMessage()[0].getText());
			logger.error(JSON.stringify(response))
			return response
			throw new CustomError(`Payment  failed`, 400);
		}
	} catch (error) {
		throw error; // Rethrow any errors for handling in the calling code
	}
	ctrl.execute(function () {

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.DeleteCustomerPaymentProfileResponse(apiResponse);

		//pretty print response
		//console.log(JSON.stringify(response, null, 2));

		if (response != null) {
			if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
				return response

				console.log('Successfully deleted a customer payment profile with id: ' + customerPaymentProfileId);
			}
			else {
				return response

				//console.log('Result Code: ' + response.getMessages().getResultCode());
				console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else {
			console.log('Null response received');
		}

	});
}



// CHARGE PAYMENT USING CUSTOMER PROFILE ID AND CUSTOMER PAYMENT ID
exports.chargeCustomerProfile = async (obj) => {
	console.log('chargeCustomerProfile', obj);
	if (!obj.authorizeNet_customer_profile_id && !obj.authorizeNet_payment_profile_id) {
		throw new CustomError(`Payment Card Information not found`);
	}
	const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName(apiLoginKey);
	merchantAuthenticationType.setTransactionKey(transactionKey);
	//merchantAuthenticationType.setClientKey(clientKey);

	const profileToCharge = new ApiContracts.CustomerProfilePaymentType();
	profileToCharge.setCustomerProfileId(obj.authorizeNet_customer_profile_id);

	const paymentProfile = new ApiContracts.PaymentProfile();
	paymentProfile.setPaymentProfileId(obj.authorizeNet_payment_profile_id);
	profileToCharge.setPaymentProfile(paymentProfile);

	const orderDetails = new ApiContracts.OrderType();
	if(obj.policy_no){
		orderDetails.setInvoiceNumber(obj.policy_no);		
	}else{
		if(obj.policy_id){
			let policyDetails= await policyService.findPolicyByPolicyId(obj.policy_id);
			orderDetails.setInvoiceNumber(policyDetails.policy_number?policyDetails.policy_number:'N/A');
		}else{
			orderDetails.setInvoiceNumber('N/A');
		}		
	}
	//${obj ? obj.policy_no : req.body.policyNum}
	orderDetails.setDescription(obj.orderDetails ? obj.orderDetails : '');

	// orderDetails.setDescription(`${obj ? obj.plan_name : req.body.planName} plan from  ${obj ? obj.policy_start_date : moment().add(30, "days").format('YYYY-MM-DD')} to ${obj ? obj.expiry_with_bonus : moment().add(policyTerm + 30 + Math.round(req.body.bonusMonth * 30.44), "days").format('YYYY-MM-DD')}`);

	const transactionRequestType = new ApiContracts.TransactionRequestType();
	transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
	transactionRequestType.setProfile(profileToCharge);
	transactionRequestType.setAmount(obj.chargable_amount);
	transactionRequestType.setOrder(orderDetails);
	if (obj.tax_amount) {
		const tax = new ApiContracts.ExtendedAmountType();
		tax.setAmount(obj ? obj.tax_amount : req.body.taxAmount);
		transactionRequestType.setTax(tax);
	}
	const createRequest = new ApiContracts.CreateTransactionRequest();
	
	createRequest.setMerchantAuthentication(merchantAuthenticationType);
	createRequest.setTransactionRequest(transactionRequestType);

	//pretty print request
	//console.log('CHARGE CUSTOMER',JSON.stringify(createRequest.getJSON(), null, 2));

	let ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
	if (process.env.NODE_ENV == 'prod') {
		ctrl.setEnvironment(SDKConstants.endpoint.production);
		
		//ctrl.setValidationMode(ApiContracts.ValidationModeEnum.LIVEMODE);
		
	}
	try {
		const response = await new Promise((resolve, reject) => {
			ctrl.execute(() => {
				const apiResponse = ctrl.getResponse();
				const customerProfileResponse = new ApiContracts.CreateTransactionResponse(apiResponse);
				resolve(customerProfileResponse);
			});
		});
		console.log('chargeCustomerProfile response',JSON.stringify(response));
		return response; 

		if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
			return response; // Return the response if successful
		} else {
			// throw new CustomError(response.getMessages().getMessage()[0].getText());
			return response
			throw new CustomError(`Payment  failed`, 400);
		}
	} catch (error) {
		throw error; // Rethrow any errors for handling in the calling code
	}
	ctrl.execute(function () {

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.CreateTransactionResponse(apiResponse);

		//pretty print response
		console.log(JSON.stringify(response, null, 2));

		if (response != null) {
			if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
				if (response.getTransactionResponse().getMessages() != null) {
					console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
					console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
					console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
					console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
				}
				else {
					console.log('Failed Transaction.');
					if (response.getTransactionResponse().getErrors() != null) {
						console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
						console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
					}
				}
			}
			else {
				console.log('Failed Transaction. ');
				if (response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null) {

					console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
					console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
				}
				else {
					console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
					console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
				}
			}
		}
		else {
			console.log('Null Response.');
		}
	})
}








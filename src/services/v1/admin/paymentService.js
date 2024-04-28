const db = require('../../../models/index');
const helper = require('../../../common/helper');
const moment = require('moment');
const CustomError = require('../../../utils/customErrorHandler');
const productService = require("../../../services/v1/admin/productService");

//CREATE PAYMENT
exports.createPayment = async (obj, transaction) => {
    try {
        let createdPayment = await db.paymentsModel.create(obj, { transaction });
        return helper.getJsonParseData(createdPayment);
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}
//BULK CREATE PAYMENT
exports.bulkCreatePayment = async (arr, transaction) => {
    try {
        let createdPayment = await db.paymentsModel.bulkCreate(arr, { transaction });
        return createdPayment;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//UPDATE PAYMENT
exports.updatePayment = async (payment_id, obj, transaction) => {
    try {
        let updatePayment = await db.paymentsModel.update(obj, { where: { payment_id }, transaction });
        return updatePayment[0] != 0 ? true : false;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}


//GET ALL PAYMENTS
exports.getAllPayments = async (queryOptions) => {
    try {
        let allPayments = await db.paymentsModel.findAndCountAll(queryOptions);
        // allPayments = helper.getJsonParseData(allPayments);  
        allPayments.rows = await Promise.all(allPayments.rows.map(async (element) => {
            if (element.create_user_type == 2) {
                element.created_user_info = await helper.getUserInfo(parseInt(element.created_by));
            }
            if (element.update_user_type == 2) {
                element.updated_user_info = await helper.getUserInfo(parseInt(element.updated_by));
            }
            if (element.create_user_type == 3) {
                // Handle create_user_type 3 if needed
            }
            return element;
        }));
        return helper.getJsonParseData(allPayments);
    } catch (e) {
        console.log(e);
        throw e
    }
}

exports.getPaymentById = async (payment_id, queryOptions = {}) => {
    try {
        let paymentDetails = await db.paymentsModel.findByPk(payment_id, queryOptions);
        return paymentDetails ? helper.getJsonParseData(paymentDetails) : null
    } catch (error) {
        throw error
    }
}

//UPDATE GET ALL PAYMENTS DATA
exports.PaymentsFlagStatusName = async (object) => {
    //console.log(122,object);
    try {

        //payment_status
        object.payment_status_details = await this.getPaymentStatusObject(object.payment_status)

        //manual_payment_type

        if (object.manual_payment_type == 1) {
            object.manual_payment_type_details = 'Ticket'
        } else if (object.manual_payment_type == 0) {
            object.manual_payment_type_details = 'Policy'
        }

        //recurring_type
        if (object.recurring_type == 0) {
            object.recurring_type_details = 'Yearly'
        } else if (object.recurring_type == 1) {
            object.recurring_type_details = 'Monthly'
        }

        //schedule_payment
        if (object.schedule_payment == helper.schedule_payment.same_day_payment) {
            object.schedule_payment_details = helper.schedule_payment_name.same_day_payment

        } else if (object.schedule_payment == helper.schedule_payment.future_payment) {
            object.schedule_payment_details = helper.schedule_payment_name.future_payment
        }

        //payment_type

        object.payment_type_details =  this.getPaymentTypeFlagName(object.payment_type)
  
        return object
    } catch (e) {
        throw e
    }
}
exports.getPaymentStatusObject =  async(status_id) => {
    let result =  await db.paymentStatusModel.findOne({ where: { value: status_id,active_status:1 }, attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] } });
    return  result ? await helper.getJsonParseData(result) : null;
}

exports.getPaymentStatusFlagName = async(status_id) => {
    let result =  await db.paymentStatusModel.findOne({ where: { value: status_id,active_status:1 },raw:true, attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] } });
    let name=result?result.status_name:'';
    return name;    
}

exports.allPaymentTypeOrStatus = async() => {
    const payment_type = [
        { id: helper.paymentType.credit_card, label: helper.paymentTypeName.credit_card },
        { id: helper.paymentType.bank_ach, label: helper.paymentTypeName.bank_ach },
        { id: helper.paymentType.escrow, label: helper.paymentTypeName.escrow },
        { id: helper.paymentType.do_not_charge, label: helper.paymentTypeName.do_not_charge },
        { id: helper.paymentType.link_payment, label: helper.paymentTypeName.link_payment },
     
    ];
    let payment_status = await db.paymentStatusModel.findAll({
        where:{
            active_status:1
        },
        raw:true
    })
    return {payment_type,payment_status};
}

exports.getPaymentTypeFlagName = (type) => {
    if (type == helper.paymentType.credit_card) {
        return helper.paymentTypeName.credit_card

    } else if (type == helper.paymentType.bank_ach) {
        return helper.paymentTypeName.bank_ach

    }else if(type==helper.paymentType.escrow){
        return helper.paymentTypeName.escrow

    }else if (type==helper.paymentType.do_not_charge) {
        return helper.paymentTypeName.do_not_charge

    }else if (type==helper.paymentType.link_payment) {
        return helper.paymentTypeName.link_payment
    }
}

exports.generateInvoiceNo = async () => {
    let invoice_no = `INV-0000000`;

    let lastInvoice = await db.invoicesModel.findOne({
        order: [['invoice_id', 'DESC']],
    });

    if (lastInvoice) {
        let lastTicket = parseInt(lastInvoice.invoice_no.substring(4));
        lastTicket++;
        return `INV-${lastTicket.toString().padStart(7, '0')}`;
    } else {
        tt = parseInt(invoice_no.substring(3));
        tt++;
        return `INV-${tt.toString().padStart(7, '0')}`;
    }
}

exports.findLastSuccessfulPayment = async (org_id, customerId) => {
    try {
        const lastSuccessfulPayment = await  db.paymentsModel.findOne({
            where: {
                org_id: org_id,
                customer_id: customerId,
                payment_status: 1, // 1 means payment success
            },
            order: [
                ['created_at', 'DESC'], // Assuming you have a createdAt column to track payment creation time
            ],
        });

        return lastSuccessfulPayment;
    } catch (error) {
        console.error('Error finding last successful payment:', error);
        throw error; // Handle the error according to your application's needs
    }
}

exports.modifiedFieldValue = (oldData, newData) =>{
    let fieldArray = [];
    for (const property in newData) {
        for (const isExistProperty in oldData) {
            if (property == isExistProperty) {
                if (newData[property] != oldData[isExistProperty]) {
                    let properFieldName = null;
                    if (property == 'amount') {
                        properFieldName = 'Amount';
                    }
                    if (property == 'payment_date') {
                        properFieldName = 'Payment Date';
                        if (helper.isDate(newData[property] )) {
                            oldData[isExistProperty]= moment(oldData[isExistProperty]).format('MM-DD-YYYY')
                            newData[property] = moment(newData[property] ).format('MM-DD-YYYY')
                        }
                    }
                    if (property == 'payment_status') {
                        properFieldName = 'Payment Status';
                        oldData[isExistProperty]= this.getPaymentStatusFlagName(oldData[isExistProperty])
                         newData[property] = this.getPaymentStatusFlagName(newData[property] )
                    }
                    if (property == 'cheque_no') {
                        properFieldName = 'Checque No';
                    }
                    if (property == 'payment_successfull_date') {
                        properFieldName = 'Payment Successfull Date';
                        if (helper.isDate(newData[property] )) {
                            oldData[isExistProperty]=oldData[isExistProperty]? moment(oldData[isExistProperty]).format('MM-DD-YYYY'):null
                            newData[property] = newData[property] ?moment(newData[property] ).format('MM-DD-YYYY'):null
                        }
                    }
                    if (properFieldName) {
                        fieldArray.push({ field: properFieldName, old_val: oldData[isExistProperty], new_val: newData[property] });
                    }
                    // fieldArray.push({ field: properFieldName, old_val: oldData[isExistProperty], new_val: newData[property] });
                }
            }
        }
    }
    return fieldArray;
}
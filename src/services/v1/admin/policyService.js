const db = require('../../../models/index');
const helper = require('../../../common/helper');
const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const CustomError = require('../../../utils/customErrorHandler');
const paymentService = require("../../../services/v1/admin/paymentService");
const productService = require("../../../services/v1/admin/productService");
const planTermsService = require("../../../services/v1/admin/planTermsService");
const moment = require("moment");
const { Op } = require("sequelize");
const mailConfig = require('../../../config/mailConfig');
const fs = require('fs');



//FIND SUB MODULE BY ID
exports.findPolicyByPolicyNumber = async (val) => {
    try {
        let policyDetails = await db.policiesModel.findOne({ where: { policy_number: val } });
        return policyDetails ? helper.getJsonParseData(policyDetails) : null;
    } catch (e) {
        console.log(e);
    }
}


//FIND SUB MODULE BY ID
exports.findPolicyByPolicyId = async (policy_id, queryOptions = {}) => {
    try {

        let policyDetails = await db.policiesModel.findByPk(policy_id, queryOptions);
        return policyDetails ? helper.getJsonParseData(policyDetails) : null;
    } catch (e) {
        console.log(e);
    }
}

exports.findOnePolicy = async (queryOptions = {}) => {
    try {
        let policyDetails = await db.policiesModel.findOne(queryOptions);
        return policyDetails ? helper.getJsonParseData(policyDetails) : null;
    } catch (e) {
        console.log(e);
    }
}

//FIND SUB MODULE BY ID
exports.findPlanById = async (val) => {
    try {
        let plan = await db.plansModel.findOne({ where: { plan_id: val } });
        return plan;
    } catch (e) {
        console.log(e);
    }
}

//CREATE POLICY
exports.createPolicy = async (obj, transaction) => {
    try {
        let createdPolicy = await db.policiesModel.create(obj, { transaction });
        return createdPolicy ? helper.getJsonParseData(createdPolicy) : null
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}
//UPDATE POLICY 
exports.updatePolicy = async (policy_id, obj, transaction) => {
    try {
        let updatedPolicy = await db.policiesModel.update(obj, { where: { policy_id: policy_id }, transaction })
        return updatedPolicy[0] != 0 ? true : false;
    } catch (e) {
        throw e;
    }
}
//BULK CREATE POLICY 
exports.createBulkPolicy = async (arr, transaction) => {
    try {
        let createdPolicies = await db.policiesModel.bulkCreate(arr, { transaction })
        return createdPolicies;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}
exports.getAllpolicy = async (queryOptions = {}) => {
    try {
        let allPolicy = await db.policiesModel.findAndCountAll(queryOptions)
        return allPolicy ? helper.getJsonParseData(allPolicy) : null
    } catch (e) {
        console.log(e);
        throw e
    }
}

exports.validateNetAmount = async (req) => {
    try {
        let netAmount = 0;
        let queryOptions = {
            where: {
                plan_id: parseInt(req.body.planId),
                property_type_id: parseInt(req.body.propertyType),
                plan_term_month: parseInt(req.body.policyTermMonth)
            },
        };
        let planTermDetails = await db.planTermsModel.findOne(queryOptions);
        planTermDetails = helper.getJsonParseData(planTermDetails);
        if (req.body.propertySize == 0) {
            netAmount = planTermDetails.price_below_5000_sqft
        } else {
            netAmount = planTermDetails.price_above_5000_sqft
        }

        if (req.body.selectdAddOnProducts.length > 0) {
            req.body.selectdAddOnProducts.forEach(element => {
                if (planTermDetails.plan_term_month > 1) {
                    netAmount = netAmount + (element.yearly_price * (planTermDetails.plan_term_month / 12))
                } else {
                    netAmount = netAmount + element.monthly_price
                }
            });
        }

        let finalAmount = parseFloat(netAmount.toFixed(2));
        return finalAmount;
    } catch (e) {
        console.log(e);
        throw e
    }
}

//CREATE POLICY Ammount update LOG
exports.createPolicyAmountUpdateLog = async (obj, transaction) => {
    try {
        let createdpolicyAmountUpdateLog = await db.policyAmountUpdateLogsModel.create(obj, { transaction });
        return createdpolicyAmountUpdateLog
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//Update Policy Object Status 
exports.getPolicyObjectFlagsName = async (object) => {
    try {

        /////Policy Status
        object.policy_status_details = await this.getPolicyStatusObject(object.policy_status)
        const renewalStatus = await this.getPolicyRenewalStatusFlagName(object.renewal_status) || {};
        object.policy_renewal_status_details = renewalStatus?.renewal_status_name;
        object.policy_renewal_status_color = renewalStatus?.renewal_status_color;

        /////First Free Service

        if (object.first_free_service == 1) {
            object.first_free_service_details = 'Eligible'
        } else if (object.first_free_service == 0) {
            object.first_free_service_details = 'Not Eligible'
        }
        /////purchase_status

        if (object.purchase_status == 1) {
            object.purchase_status_details = 'Success'
        } else if (object.purchase_status == 0) {
            object.purchase_status_details = 'Failed'
        }

        /////source

        if (object.source == 0  && object.create_user_type==1) {
            object.source_details = 'Self Customer'
        } else if (object.source == 1) {
            object.source_details = 'Backend Team'
        } else if (object.source == 0 && object.create_user_type==3 ) {
            object.source_details = 'RE PROS'
        }

        return object;

    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}
exports.getPolicyStatusObject =  async(status_id) => {
    let result =  await db.policyStatusModel.findOne({ where: { value: status_id,active_status:1 }, attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] } });
    return result ? helper.getJsonParseData(result) : null;
}

exports.getPolicyStatusFlagName =  async(status_id) => {
    let result =  await db.policyStatusModel.findOne({ where: { value: status_id,active_status:1 },raw:true, attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] } });
    let name=result?result.status_name:'';
    return name;
}

exports.allPolicyStatus = async() => {
    let result = await db.policyStatusModel.findAll({
        where:{
            active_status:1
        },
        raw:true
    })
    return result;
    //[
        // { id: 1, label: 'Active' },
        // { id: 2, label: '30 Days Wait' },
        // { id: 3, label: 'Expired' },
        // { id: 0, label: 'Cancelled' },
        // { id: 4, label: 'Escrow - Pending' },
        // { id: 5, label: 'Do not Charge' },
        // { id: 6, label: 'Hold (Failed Payment)' },
        // { id: 7, label: 'Pending (Link-Payment)' }
    //];
    //result.
}

exports.getPolicyRenewalStatusFlagName = async (status_id) => {
    if(status_id != null && status_id != undefined){
        const renewalStatus = await db.renewalStatusModel.findOne({
            where: {
                value: parseInt(status_id),
            }
        })
        return {
            renewal_status_name: renewalStatus?.status_name ? renewalStatus?.status_name : '',
            renewal_status_color: renewalStatus?.status_color ? renewalStatus?.status_color : '#BDBDBD',
        };
    }
}
exports.sendPaymentLink = async(data,transaction) => {
  
    let createdPaymentLink = await db.customerPaymentLinkModel.create(data, { transaction });
    return createdPaymentLink
}

exports.createOrDeletePolicyProducts = async (req, res, next, policy_id, customer_id, policyProducts, transaction) => {
    try {

        let deletePolicyProducts = await db.policyProductsModel.destroy({ where: { policy_id: policy_id }, force: true, transaction });

        let createdpolicyProduct = await db.policyProductsModel.bulkCreate(policyProducts, { transaction })

        return createdpolicyProduct.length > 0 ? helper.getJsonParseData(createdpolicyProduct) : null


        return
        // console.log('arr', arr);
        // let restoreProduct=  await db.policyProductsModel.restore({ where: { policy_id: policy_id },transaction }); 
        let existingPolicyProducts = await db.policyProductsModel.unscoped().findAll({ where: { policy_id: policy_id } })
        existingPolicyProducts = helper.getJsonParseData(existingPolicyProducts)
        existingPolicyProducts.forEach(element => {
            if (element.deleted_at != null) {
                console.log('element', element);
            }
        });
        let updaePolicyProducts = await db.policyProductsModel.update({ deleted_by: req.tokenData.org_user_id }, { where: { policy_id: policy_id }, transaction })
        //let deletePolicyProducts= await db.policyProductsModel.destroy({where:{policy_id:policy_id},transaction});

        let createdpolicyAmountUpdateLog = []

        const unmatchedProductArr = await arr.filter(async (product) => {
            return !existingPolicyProducts.some((existingProduct) => existingProduct.product_id == product.product_id);
        });
        /*    const promises = req.body.selectedServiceTypes.map(async prod => {
               const prodData = {
                   contractor_id: createdContractor.contractor_id,
                   org_id: req.headers.org_id ? parseInt(req.headers.org_id) : null,
                   product_id: prod.product_id,
                   product_name: prod.product_name,
                   create_user_type: req.body.createUserType,
                   created_by: null,
                   updated_by: null,
                   deleted_by: null
               };
               const createdContractorProduct = await contractorsService.createContractorProduct(prodData, transaction);
               return createdContractorProduct;
           });
   
           // Wait for all promises to resolve
           await Promise.all(promises); */
        const matchedProductArr = arr.filter((product) => {
            return existingPolicyProducts.some((existingProduct) => existingProduct.product_id == product.product_id);
        });

        console.log('Matched Product Arr:', matchedProductArr);
        const matchedProductIdsArr = matchedProductArr.map((item) => item.product_id);
        console.log('matchedProductIdsArr', matchedProductIdsArr);

        let restoreProductupdaePolicyProducts = await db.policyProductsModel.update({ updated_by: req.tokenData.org_user_id, deleted_by: null }, { where: { policy_id: policy_id, product_id: matchedProductIdsArr }, transaction })
        let restoreProduct = await db.policyProductsModel.restore({ where: { policy_id: policy_id, product_id: matchedProductIdsArr }, transaction });
        // Output the results
        // console.log('Matched Product Arr:', matchedProductArr);
        console.log('Unmatched Product Arr:', unmatchedProductArr);
        console.log('unmatchedProductArr length', unmatchedProductArr.length);
        if (unmatchedProductArr.lenth > 0) {
            let createdpolicyProduct = await db.policyProductsModel.bulkCreate(unmatchedProductArr, { transaction })
            console.log('createdpolicyProduct', createdpolicyProduct);
        }

        return createdpolicyAmountUpdateLog
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

exports.generatePaymentReceiptData = async (org_id, policy_id) => {
    try {

        let queryOptions = {
            where: { org_id: org_id },
            include: [
                {
                    model: db.plansModel,
                    as: 'plan_details',
                    attributes: ['plan_name'],
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
        let policyDetails = await this.findPolicyByPolicyId(policy_id, queryOptions);
        if (!policyDetails) {
            throw new CustomError('Policy information not found');
        }
        let basePolicyProducts = []
        let addOnPolicyProducts = []
        if (policyDetails.policy_product_list.length == 0) {
            throw new CustomError(`policy products not found`, 400)
        }
        policyDetails.policy_product_list.forEach(element => {
            element.product_details = helper.getJsonParseData(element.product_details)
            if (element.product_details) {
                if (element.product_details.product_type == 0) {
                    addOnPolicyProducts.push(element.product_details.product_name)
                } else {
                    basePolicyProducts.push(element.product_details.product_name)
                }
            }

        });
        //   "success=>1,failed=>2, cancelled=>3, pending=>4, deactivate=>5,",
        const totalAmount = await db.paymentsModel.sum('amount', { where: { policy_id: policy_id, org_id: org_id } });
        const paidAmount = await db.paymentsModel.sum('amount', { where: { payment_status: 1, policy_id: policy_id, org_id: org_id } });//  equal success payment_status =
        let dueAmount = await db.paymentsModel.sum('amount', {
            where: {
                policy_id: policy_id, org_id: org_id, payment_status: {
                    [Op.not]: 1 // not equal success payment_status
                }
            }
        });
        let a = 0.00
        dueAmount ? dueAmount : a.toFixed(2)
        //   console.log('dueAmount',dueAmount);
        //   console.log('addOnPolicyProducts',addOnPolicyProducts);
        let dataObj = {
            first_name: policyDetails.first_name,
            last_name: policyDetails.last_name,
            mobile: helper.setUSFormatPhoneNumber(policyDetails.mobile),
            plan_name: policyDetails.plan_details.plan_name,
            policy_number: policyDetails.policy_number,
            policy_term: policyDetails.policy_term,
            policy_start_date: moment(policyDetails.policy_start_date).format('MM-DD-YYYY'),
            expiry_with_bonus: moment(policyDetails.expiry_with_bonus).format('MM-DD-YYYY'),
            pcf: policyDetails.pcf,
            billing_address1: policyDetails.billing_address1,
            billing_zip: policyDetails.billing_zip,
            billing_city: policyDetails.billing_city,
            billing_state: policyDetails.billing_state,
            policy_amount: policyDetails.policy_amount,
            addon_coverage_amount: policyDetails.addon_coverage_amount,
            tax_amount: policyDetails.tax_amount,
            miscellaneous_charges: policyDetails.miscellaneous_charges,
            discount_amount: policyDetails.discount_amount,
            net_amount: policyDetails.net_amount,
            realtor_email: policyDetails.realtor_email,
            agent_email: policyDetails.agent_email,
            basePolicyProducts: helper.getJsonParseData(basePolicyProducts),
            addOnPolicyProducts: helper.getJsonParseData(addOnPolicyProducts),
            order_date: moment(policyDetails.order_date).format('MM-DD-YYYY'),
            email_imageUrl: helper.email_imageUrl,
            total_amount: totalAmount,
            paid_amount: paidAmount,
            due_amount: dueAmount
        }
        return dataObj
    } catch (error) {
        throw error
    }
}
exports.generateEscrowInvoiceData = async (org_id, policy_id) => {

    console.log('generateEscrowInvoiceData org_id',org_id);
    console.log('policy_id',policy_id);
    try {
        const invoiceNo = await paymentService.generateInvoiceNo();

        let queryOptions = {
            where: { org_id: org_id },
            include: [
                {
                    model: db.plansModel,
                    as: 'plan_details',
                    attributes: ['plan_name'],
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
        let policyDetails = await this.findPolicyByPolicyId(policy_id, queryOptions);
        if (!policyDetails) {
            throw new CustomError('Policy information not found')
        }
        let basePolicyProducts = []
        let addOnPolicyProducts = []
        if (policyDetails.policy_product_list.length == 0) {
            throw new CustomError(`policy products not found`, 400)
        }
        policyDetails.policy_product_list.forEach(element => {
            element.product_details = helper.getJsonParseData(element.product_details)
            if (element.product_details) {
                if (element.product_details.product_type == 0) {
                    addOnPolicyProducts.push(element.product_details.product_name)
                } else {
                    basePolicyProducts.push(element.product_details.product_name)
                }
            }

        });
        //    let allEscrowPayments = await paymentService.getAllPayments({where:{payment_type:3,policy_id:policy_id,org_id:org_id}});
        let createInvoice = db.invoicesModel.create({ org_id: org_id, invoice_no: invoiceNo },)
        let updateEscrowPayments = await db.paymentsModel.update({ invoice_no: invoiceNo }, { where: { payment_type: 3, policy_id: policy_id, org_id: org_id } });
        const resultTotalEscrowAmount = await db.paymentsModel.sum('amount', { where: { payment_type: 3, policy_id: policy_id, org_id: org_id } });
        let dataObj = {
            first_name: policyDetails.first_name,
            last_name: policyDetails.last_name,
            plan_name: policyDetails.plan_details.plan_name,
            policy_number: policyDetails.policy_number,
            policy_term: policyDetails.policy_term,
            policy_start_date: moment(policyDetails.policy_start_date).format('MM-DD-YYYY'),
            expiry_with_bonus: moment(policyDetails.expiry_with_bonus).format('MM-DD-YYYY'),
            pcf: policyDetails.pcf,
            billing_address1: policyDetails.billing_address1,
            billing_zip: policyDetails.billing_zip,
            billing_city: policyDetails.billing_city,
            billing_state: policyDetails.billing_state,
            policy_amount: policyDetails.policy_amount,
            addon_coverage_amount: policyDetails.addon_coverage_amount,
            tax_amount: policyDetails.tax_amount,
            miscellaneous_charges: policyDetails.miscellaneous_charges,
            discount_amount: policyDetails.discount_amount,
            net_amount: policyDetails.net_amount,
            realtor_email: policyDetails.realtor_email,
            agent_email: policyDetails.agent_email,
            basePolicyProducts: helper.getJsonParseData(basePolicyProducts),
            addOnPolicyProducts: helper.getJsonParseData(addOnPolicyProducts),
            order_date: moment(policyDetails.order_date).format('MM-DD-YYYY'),
            invoice_no: invoiceNo,
            email_imageUrl: helper.email_imageUrl,
            total_escrow_amount: resultTotalEscrowAmount
        }
        return dataObj
    } catch (error) {
        throw error
    }
}

exports.generateEscrowAttachment = async (org_id, policy_id,) => {
    try {
        const projectRoot = path.join(__dirname, '../../..');
        const escrowInvoiceTemplatePath = path.join(projectRoot, 'view', 'emailTemplate', 'escrowInvoice.ejs');
        const escrowAttachmentTemplatePath = path.join(projectRoot, 'view', 'emailTemplate', 'escrowAttachment.ejs');
        let html1

        const storagePath = path.join(projectRoot, 'public', `org_files/hws_${org_id}/customers/policy_docs`);
         // Check if the directory exists, create it if it doesn't
         if (!fs.existsSync(storagePath)) {
            fs.mkdirSync(storagePath, { recursive: true });
        }
        let escrowInvoiceData = await this.generateEscrowInvoiceData(org_id, policy_id);
        if (!escrowInvoiceData) {
            throw new CustomError(`Escrow Invoice generation failed`, 400)
        } else {
            let dataObj = escrowInvoiceData
            dataObj.company_address = mailConfig.company_address;
            dataObj.company_phone = mailConfig.company_phone;
            dataObj.company_email = mailConfig.company_email;
            dataObj.company_copyright_year = mailConfig.company_copyright_year;
            dataObj.company_website = mailConfig.company_website;
            dataObj.company_website_link = mailConfig.company_website_link;
            dataObj.email_imageUrl =helper.email_imageUrl
            html1 = await ejs.renderFile(escrowInvoiceTemplatePath, {
                dataObj
            });

        }

        let policyDetails = await this.findPolicyByPolicyId(policy_id, {});
        policyDetails = policyDetails ? helper.getJsonParseData(policyDetails) : null
        let addOnProducts = await productService.getAllProducts(org_id, { where: { org_id: org_id, product_type: 0 }, })// add on products 
        addOnProducts = helper.getJsonParseData(addOnProducts.rows)

        let queryOptions = {
            attributes: ['plan_term', 'plan_term_month', 'bonus_month', 'price_below_5000_sqft', 'price_above_5000_sqft'],
            where: {
                plan_id: policyDetails.plan_id,
                property_type_id: policyDetails.property_type_id,
                plan_term_month: {
                    [Op.gt]: 12 // Greater than 24
                },

            },

        }
        let getPlanTerms = await planTermsService.getAllPlanTerms(queryOptions);
        getPlanTerms = helper.getJsonParseData(getPlanTerms.rows)
        if (getPlanTerms.length > 0) {

        }
        getPlanTerms.forEach(element => {
            if (policyDetails.property_size_id == 1) {
                element.price_amount = element.price_above_5000_sqft
            } else {
                element.price_amount = element.price_below_5000_sqft
            }
        });
        let dataObj = {
            plan_terms_list: helper.getJsonParseData(getPlanTerms),
            optional_add_on_products: addOnProducts,
            email_imageUrl: helper.email_imageUrl
        }
        dataObj.company_address = mailConfig.company_address;
        dataObj.company_phone = mailConfig.company_phone;
        dataObj.company_email = mailConfig.company_email;
        dataObj.company_copyright_year = mailConfig.company_copyright_year;
        dataObj.company_website = mailConfig.company_website;
        dataObj.company_website_link = mailConfig.company_website_link;
        dataObj.email_imageUrl =helper.email_imageUrl
        dataObj = helper.getJsonParseData(dataObj)
        const html2 = await ejs.renderFile(escrowAttachmentTemplatePath, {
            dataObj
        });

        const htmlContent = `
            <html>
            <head>
                <title>Escrow Invoice</title>
                <style type="text/css">
                @media print {
                    thead {
                        display: table-header-group;
                    }
                    tfoot {
                        display: table-footer-group;
                    }
                    tr {
                        page-break-inside: avoid;
                    }
                    .page-break {
                        display: block;
                        page-break-after: always;
                    }
                    tr, td, tbody, table{
                        vertical-align:top;
                    }
                }
                </style>
            </head>
            <body>
                ${html1}
                ${html2}
            </body>
            </html>
        `;

        // Define options for PDF creation 
        const pdfName = `Escrow-Invoice_${escrowInvoiceData.invoice_no}_${policy_id}_${new Date().getTime()}`
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox'],
        });
        const page = await browser.newPage();

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const filePath = path.join(`${storagePath}/${pdfName}.pdf`);
        const pdfBuffer = await page.pdf({ printBackground: true, omitBackground: true, format: 'A4', path: filePath });
        // Save the PDF file with dynamic path and name
        if (pdfBuffer) {
            return { filename: `${pdfName}.pdf`, path: filePath } // Path to the attachment file  }
        }

        await browser.close();
    } catch (error) {
        throw error
    }
}

exports.modifiedFieldValue= async (oldData, newData, addOnItems) =>{
    let fieldArray = [];
    let addonItems = [];
    for (const property in newData) {
        for (const isExistProperty in oldData) {
            if (property == isExistProperty) {
                if (newData[property] != oldData[isExistProperty]) {
                    let properFieldName = null;
                    let oldDataVal = oldData[isExistProperty];
                    let newDataVal = newData[property];

                    if (property == 'first_name') {
                        properFieldName = 'First name';
                    }
                    if (property == 'last_name') {
                        properFieldName = 'Last name';
                    }
                    if (property == 'mobile') {
                        properFieldName = 'Mobile number';
                    }
                    if (property == 'email') {
                        properFieldName = 'Email address';
                    }
                    if (property == 'zip') {
                        properFieldName = 'Zipcode';
                    }
                    if (property == 'billing_address1') {
                        properFieldName = 'Billing address';
                    }
                    if (property == 'plan_id') {
                        let oldPlanDetails = await planService.findPlanById(oldData[isExistProperty]);
                        let newPlanDetails = await planService.findPlanById(newData[property]);
                        oldDataVal = oldPlanDetails.plan_name;
                        newDataVal = newPlanDetails.plan_name;
                        properFieldName = `Plan`;
                    }
                    if (property == 'policy_term') {
                        properFieldName = `Plan term`;
                    }
                    if (property == 'net_amount') {
                        properFieldName = `Net amount`;
                    }
                    if (property == 'holding_period') {
                        properFieldName = `Holding_period`;
                    }
                    if (property == 'holding_period') {
                        properFieldName = `Holding_period`;
                    }
                    if (property == 'property_type_id') {
                        let oldPropertyType = await propertyTypesService.findPropertyTypeById(oldData[isExistProperty]);
                        let newPropertyType = await propertyTypesService.findPropertyTypeById(newData[property]);
                        oldDataVal = oldPropertyType.property_type;
                        newDataVal = newPropertyType.property_type;
                        properFieldName = `Property type`;
                    }
                    if (property == 'property_size_id') {
                        oldDataVal = oldData[isExistProperty] == 0 ? 'Under 5,000 sq. ft' : 'Over 5,000 sq. ft';
                        newDataVal = newData[property] == 0 ? 'Under 5,000 sq. ft' : 'Over 5,000 sq. ft';
                        properFieldName = `Property size`;
                    }
                    if (property == 'policy_status') {
                        let oldStatus = await this.getPolicyStatusFlagName(oldData[isExistProperty]);
                        let newStatus = await this.getPolicyStatusFlagName(newData[property]);
                        oldDataVal = oldStatus;
                        newDataVal = newStatus;
                        properFieldName = `Policy Status`;
                    }
                    if (property == 'policy_start_date') {
                        properFieldName = 'Policy Start Date';
                        console.log('helper.isDate(newData[property] )',helper.isDate(newData[property] ));
                        if (helper.isDate(newData[property] )) {
                            let oldDate=null
                            let newDate=null
                            oldDate= moment(oldData[isExistProperty]).format('MM-DD-YYYY')
                            newDate = moment(newData[property] ).format('MM-DD-YYYY')
                            oldDataVal=oldDate
                            newDataVal=newDate
                          
                        }
                    }
                    if (property == 'policy_expiry_date') {
                        properFieldName = 'Policy Expiry Date';
                        if (helper.isDate(newData[property] )) {
                            oldDataVal= moment(oldData[isExistProperty]).format('MM-DD-YYYY')
                            newDataVal = moment(newData[property] ).format('MM-DD-YYYY')
                        }
                    }
                    if (property == 'expiry_with_bonus') {
                        properFieldName = 'Policy Expiry With Bonus Date';
                        if (helper.isDate(newData[property] )) {
                            oldDataVal= moment(oldData[isExistProperty]).format('MM-DD-YYYY')
                            newDataVal = moment(newData[property] ).format('MM-DD-YYYY')
                        
                        }
                    }
                    if (properFieldName) {
                        fieldArray.push({ field: properFieldName, old_val: oldDataVal, new_val: newDataVal });
                    }
                }
            }
        }
    }
    if (addOnItems.length > 0) {
        addOnItems.forEach((item) => {
            addonItems.push(item.product_name);
        });
        fieldArray.push({ field: 'add-items', old_val: '', new_val: addonItems.length > 0 ? addonItems.join(',  ') : '' });
    }
    return fieldArray;
}

const CustomError = require("../../../utils/customErrorHandler");
const helper = require('../../../common/helper');
const db = require('../../../models/index')
const customerFunnelService = require('../../../services/v1/frontend/customerFunnelService')
const commonService = require('../../../services/v1/common/commonService')
const customerService = require("../../../services/v1/admin/customerService");
const vanillaSoftId = process.env.vanillasoftid;
const axios = require('axios');


exports.createOrUpdateLead = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    // if (req.body.propertyZipCode) {
    //   req.body.propertyZipCodeData =await commonService.checkZipCode(req.body.propertyZipCode?req.body.propertyZipCode:null)
    // }
    // if (req.body.billingZip) {
    //   req.body.billingZipCodeData =await commonService.checkZipCode(req.body.billingZip?req.body.billingZip:null)
    // }
    var payLoadData = {};
    let leadResp;
    let leadUserId = null;
    let application_id = null;
    if (req.body.step == 1) {
      payLoadData = {
        org_id: req.headers.org_id ? parseInt(req.headers.org_id) : null,
        session_id: req.body.session_id ? req.body.session_id : null,
        first_name: req.body.firstName ? req.body.firstName : null,
        last_name: req.body.lastName ? req.body.lastName : null,
        email: req.body.emailAddress ? req.body.emailAddress : null,
        mobile: req.body.mobileNo ? req.body.mobileNo : null,
        property_zip: req.body.zipCode ? req.body.zipCode : null,
        property_state: req.body.state ? req.body.state : null,
        property_city: req.body.city ? req.body.city : null,
        step: req.body.step ? req.body.step : null,
        is_conversation_done: 0,
        ip_address: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
        device_id: helper.getDeviceId(req.headers['user-agent']),
        user_agent: req.headers['user-agent']
      }
    }
    if (req.body.step == 2) {
      payLoadData = {
        org_id: req.headers.org_id ? parseInt(req.headers.org_id) : null,
        session_id: req.body.session_id ? req.body.session_id : null,
        first_name: req.body.firstName ? req.body.firstName : null,
        last_name: req.body.lastName ? req.body.lastName : null,
        email: req.body.emailId ? req.body.emailId : null,
        mobile: req.body.mobileNo ? req.body.mobileNo : null,
        is_conversation_done: 0,
        ip_address: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
        step: req.body.step ? req.body.step : null,
        device_id: helper.getDeviceId(req.headers['user-agent']),
        user_agent: req.headers['user-agent']
      }
    }
    if (req.body.step == 3) {
      payLoadData = {
        org_id: req.headers.org_id ? parseInt(req.headers.org_id) : null,
        session_id: req.body.session_id ? req.body.session_id : null,
        email: req.body.emailId ? req.body.emailId : null,
        mobile: req.body.mobileNo ? req.body.mobileNo : null,
        property_zip: req.body.propertyZipCode ? req.body.propertyZipCode : null,
        property_city: req.body.propertyCity ? req.body.propertyCity : null,
        property_state: req.body.propertyState ? req.body.propertyState : null,
        property_address1: req.body.propertyAddressOne ? req.body.propertyAddressOne : null,
        property_address2: req.body.propertyAddressTwo ? req.body.propertyAddressTwo : null,
        property_type: req.body.propertyType ? req.body.propertyType : null,
        property_size: req.body.propertySize ? req.body.propertySize : null,
        step: req.body.step ? req.body.step : null,
      }
    }
    if (req.body.step == 4) {
      payLoadData = {
        org_id: req.headers.org_id ? parseInt(req.headers.org_id) : null,
        session_id: req.body.session_id ? req.body.session_id : null,
        email: req.body.emailId ? req.body.emailId : null,
        mobile: req.body.mobileNo ? req.body.mobileNo : null,
        plan_name: req.body.planName ? req.body.planName : null,
        policy_term: req.body.policyTerm ? req.body.policyTerm : null,
        add_on_coverages: req.body.addOnCoverages ? req.body.addOnCoverages : null,
        price: req.body.price ? req.body.price : null,
        step: req.body.step ? req.body.step : null,
      }
    }
    if (req.body.step == 6) {
      payLoadData = {
        org_id: req.headers.org_id ? parseInt(req.headers.org_id) : null,
        session_id: req.body.session_id ? req.body.session_id : null,
        email: req.body.emailId ? req.body.emailId : null,
        mobile: req.body.mobileNo ? req.body.mobileNo : null,
        plan_name: req.body.planName ? req.body.planName : null,
        policy_term: req.body.policyTerm ? req.body.policyTerm : null,
        add_on_coverages: req.body.addOnCoverages ? req.body.addOnCoverages : null,
        price: req.body.price ? req.body.price : null,
        property_type: req.body.propertyType ? req.body.propertyType : null,
        property_size: req.body.propertySize ? req.body.propertySize : null,
        step: req.body.step ? req.body.step : null,
      }
      console.log('payLoadData', payLoadData);
    }
    if (payLoadData.email && payLoadData.mobile) {
      var genApplicationIdData = {
        org_id: payLoadData.org_id,
        email: payLoadData.email,
        mobile: payLoadData.mobile,
        session_id: payLoadData.session_id
      }

      var genLeadUserIdData = {
        org_id: payLoadData.org_id,
        email: payLoadData.email,
        mobile: payLoadData.mobile
      }

      application_id = customerFunnelService.generateApplicationID(genApplicationIdData) //helper.encodeCrypto(genApplicationIdData)
      leadUserId = customerFunnelService.generateLeadUserID(genLeadUserIdData)
      // req.body.applicationId = `app${application_id}`
      payLoadData.application_id = `APP${application_id}`
      console.log('appid', `app${application_id}`);

      payLoadData.lead_user_id = leadUserId
      leadResp = await customerFunnelService.createOrUpdateLead(
        req,
        res,
        next,
        payLoadData,
        transaction
      );
      leadResp = JSON.parse(JSON.stringify(leadResp));


      if (leadResp && leadResp.step == 5) {
        const emailExists = await customerService.findCustomerByEmail(leadResp.emailId);
        if (!emailExists) {
          const existingLead = await db.leadsModel.findOne({
            where: {
              application_id: leadResp.applicationId,
            },
          });
          let createdcustomerData = await db.customersModel.create(existingLead);
        }
      }
      await transaction.commit();


    }

    if (req.body.lead_data) {
      req.body.lead_data = helper.getJsonParseData(req.body.lead_data)
      req.body.lead_data.application_id = application_id;
      req.body.lead_data.user_id = leadUserId;
      leadResp['lead_data'] = req.body.lead_data;
    }
    if(process.env.NODE_ENV == 'prod'){
      this.vanillaSotDataExport(req.body.lead_data)
    }
    res.send({
      status: 1,
      data: leadResp,
      message: `Successfully completed first step ${req.body.step}`,
    });


  } catch (error) {
    console.log(error);
    await transaction.rollback();
    next(error);
  }
}


exports.createOrUpdateLeadByField = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    // if (req.body.propertyZipCode) {
    //   req.body.propertyZipCodeData =await commonService.checkZipCode(req.body.propertyZipCode?req.body.propertyZipCode:null)
    // }
    // if (req.body.billingZip) {
    //   req.body.billingZipCodeData =await commonService.checkZipCode(req.body.billingZip?req.body.billingZip:null)
    // }
    var payLoadData = {};
    let leadResp;
    let leadUserId = null;
    let application_id = null;
    const leadField = Object.keys(req.body).filter((key) => key.startsWith('lead_field_'));
    payLoadData = {
      org_id: req.headers.org_id ? parseInt(req.headers.org_id) : null,
      email: req.body.emailId ? req.body.emailId : null,
      mobile: req.body.mobileNo ? req.body.mobileNo : null,
      session_id: req.body.session_id ? req.body.session_id : null,
      [leadField[0].replace(/lead_field_/, '')]: req.body[leadField],
      ip_address: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
      device_id: helper.getDeviceId(req.headers['user-agent']),
      user_agent: req.headers['user-agent']
    }
    console.log('payLoadData', payLoadData);

    if (payLoadData.email && payLoadData.mobile) {
      var genApplicationIdData = {
        org_id: payLoadData.org_id,
        email: payLoadData.email,
        mobile: payLoadData.mobile,
        session_id: payLoadData.session_id
      }

      var genLeadUserIdData = {
        org_id: payLoadData.org_id,
        email: payLoadData.email,
        mobile: payLoadData.mobile
      }

      application_id = customerFunnelService.generateApplicationID(genApplicationIdData) //helper.encodeCrypto(genApplicationIdData)
      leadUserId = customerFunnelService.generateLeadUserID(genLeadUserIdData)
      payLoadData.application_id = `APP${application_id}`
      console.log('appid', `app${application_id}`);
      payLoadData.lead_user_id = leadUserId
      leadResp = await customerFunnelService.createOrUpdateLead(
        req,
        res,
        next,
        payLoadData,
        transaction
      );
      leadResp = JSON.parse(JSON.stringify(leadResp));
      await transaction.commit();
    }

    if (req.body.lead_data) {
      req.body.lead_data = helper.getJsonParseData(req.body.lead_data)
      req.body.lead_data.application_id = application_id;
      req.body.lead_data.user_id = leadUserId;
      leadResp['lead_data'] = req.body.lead_data;
    }
    if(process.env.NODE_ENV == 'prod'){
      this.vanillaSotDataExport(req.body.lead_data)
    }
    
    res.send({
      status: 1,
      data: leadResp,
      message: `lead successfully updated`,
    });


  } catch (error) {
    console.log(error);
    await transaction.rollback();
    next(error);
  }
}

exports.getLeadDetails = async (req, res, next) => {
  try {
    const { lead_id } = req.body;
    let leadExist;
    if (lead_id) {
      leadExist = await customerFunnelService.findLeadByLeadId(lead_id);
    } else {
      leadExist = await customerFunnelService.findLeadBySessionIdAndEmailId(req);
    }

    leadExist = helper.getJsonParseData(leadExist);
    if (leadExist) {
      res.status(200).send({ status: 1, data: leadExist, message: 'Lead found successfully' })
    } else {
      res.status(200).send({ status: 1, data: {}, message: 'No lead found' })
    }
  } catch (error) {
    console.log(error);
    next(error)
  }
}

exports.vanillaSotDataExport = async (leadData) => {
  console.log('leadData', leadData);
  const headers = {
    'Content-Type': 'application/json'
  };
  axios.post(`https://new.vanillasoft.net/web/post.aspx?id=${vanillaSoftId}`, leadData, { headers })
    .then(response => {
      console.log('Response:', response.data);
    })
    .catch(error => {
      console.error('Error:', error.response ? error.response.data : error.message);
    });
}

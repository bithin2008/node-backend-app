const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');
const CryptoJS = require("crypto-js");
const crypto = require('crypto');

exports.generateApplicationID = (obj) => {
  // Concatenate the email, session ID, and mobile number
  const data = obj.org_id + obj.email + obj.session_id + obj.mobile;
  // Generate a hash using MD5 algorithm
  const hash = crypto.createHash('md5').update(data).digest('hex');
  return hash//applicationID;
}

exports.generateLeadUserID = (obj) => {
  // Concatenate the email, session ID, and mobile number
  const data = obj.org_id + obj.email + obj.mobile;
  // Generate a hash using MD5 algorithm
  const hash = crypto.createHash('md5').update(data).digest('hex');
  return hash;
}

exports.createOrUpdateLead = async (req, res, next, data, transaction) => {
  try {
    const existingLead = await db.leadsModel.findOne({
      where: {
        application_id: data.application_id,
      }
    });

    if (existingLead) {
      let updatedResp = await existingLead.update(data);
      updatedResp = helper.getJsonParseData(updatedResp);

      if (updatedResp) {
        return updatedResp; // Return the req.body data
      } else {
        throw new CustomError('Invalid request', 400);
      }
    } else {
      let createdResp = await db.leadsModel.create(data, { transaction });
      if (createdResp) {
        return createdResp; // Return the req.body data
      } else {
        throw new CustomError('Invalid request', 400);
      }
    }
  } catch (error) {
    console.error('Error creating or updating lead:', error);
    throw error; // Rethrow the error to be handled in the controller
  }
};

//FIND LEAD BY SESSION ID AND EMAIL ID AND MOBILE NUMBER 
exports.findLeadBySessionIdAndEmailId = async (req) => {
  try {
    let lead = await db.leadsModel.findOne({ where: { session_id: req.body.sessionId, email: req.body.emailId, mobile: req.body.mobileNo }, attributes: ['application_id', 'session_id', 'first_name', 'last_name', 'email', 'mobile','property_zip'] });
    return lead;
  } catch (e) {
    console.log(e);
  }
}

//FIND LEAD BY LEAD ID
exports.findLeadByLeadId = async (leadId) => {
  try {
    let lead = await db.leadsModel.findOne({ where: { lead_id: leadId }, attributes: ['lead_id','application_id', 'session_id', 'first_name', 'last_name', 'email', 'mobile','property_state','property_city','property_zip'] });
    return lead;
  } catch (e) {
    console.log(e);
  }
}


//UPDATE LEAD BY LEAD ID
exports.updateLeadByLeadId = async (leadId,orgId, obj) => { 
  try {
    let updateRes = await db.leadsModel.update(obj, { where: { lead_id: parseInt(leadId), org_id: parseInt(orgId) }});
    return updateRes[0] != 0 ? true : false;
  } catch (e) {
    throw e
    // throw Error('Error while fetching User')
  }
}
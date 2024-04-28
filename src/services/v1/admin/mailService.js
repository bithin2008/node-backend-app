'use strict';
const CustomError = require('../../../utils/customErrorHandler');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const path = require("path");
const ejs = require('ejs');
const moment = require('moment');
const jwt = require('jsonwebtoken');

exports.triggerMail = (fileName, dataObj, from, to, subject,attachments,bcc=[],cc=[]) => {
  bcc.push(process.env.DEFAULT_BCC?process.env.DEFAULT_BCC:'fphw@mailinator.com')
  return new Promise(async (resolve, reject) => {
      try {
        const templatePath = path.join(__dirname, `../../../view/emailTemplate/${fileName}`);
          const templatedata = await ejs.renderFile(templatePath, {
            dataObj
          });
        const mailOptions = {
          from: from ? from : helper.emailForm,
          to: to,
          subject: subject,
          html: templatedata,
          attachments: attachments,
          bcc:bcc, // BCC recipients as an array
          cc:cc
        };
        const mailTransporter = helper.nodemailerAuth();
        mailTransporter.sendMail(mailOptions, (err) => {
          if (!err) {
           // console.log('mail send');
            resolve(true);
          } else {         
            console.log('mail failed');  
            resolve(false);
          //  const emailError = new CustomError(`The mail server could not deliver mail to ${to}. Please check your email id`, 500); // You can customize the error message and status code
           // reject(emailError);
          }
        });
      } catch (e) {
        // console.log(e);
        reject(e);
      }
    });
  };
  



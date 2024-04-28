const express = require('express');

const _ = require('lodash')
const multer = require('multer');
const date = require('date-and-time');
const nodemailer = require('nodemailer');
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const DeviceDetector = require('node-device-detector');
const NODE_ENV = process.env.NODE_ENV || "development";

const moment = require('moment');
const db = require('../models/index');
const { Op } = require("sequelize");
const fs = require('fs'); // Include the 'promises' version of the fs module
const path = require('path');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const os = require('os');


//const userService = require("../view/emailTemplate/userCreationWelcomeTemp.ejs");

const config = {
    // mainUrl: "",
    // //mediaUrl: 'http://localhost:5000/org_fi
    api_baseurl: envSpecificUrlData().api_baseurl,
    admin_baseUrl: envSpecificUrlData().admin_baseUrl,
    website_baseUrl: envSpecificUrlData().website_baseUrl,
    email_imageUrl: envSpecificUrlData().email_imageUrl,
    server_port: process.env.SERVER_PORT,
    getDbDateTime: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0],
    date: (format) => {
        const now = new Date();
        return date.format(now, format);
    },
    tokenExpireIn: '7d',
    getFinancialYear: (date_data) => {
        var fiscalyear = "";
        var today = new Date(date_data);
        if ((today.getMonth() + 1) <= 3) {
            fiscalyear = (today.getFullYear() - 1) + "-" + today.getFullYear()
        } else {
            fiscalyear = today.getFullYear() + "-" + (today.getFullYear() + 1)
        }
        return fiscalyear

    },

    nodemailerAuth() {
        if(process.env.NODE_ENV == 'prod'){
            return nodemailer.createTransport({
                host: 'smtp.sendgrid.net',
                port: 587,
                secure: false, // Set to true if using SSL/TLS
                auth: {
                  user: process.env.SEND_GRID_MAIL_APIKEY,
                  pass: process.env.SEND_GRID_MAIL_PASS,
                },
                tls: { rejectUnauthorized: false }
            });
          }else{
            return nodemailer.createTransport({
                service: 'smtp',
                sendMail: true,
                //path:'usr/sbin/sendmail',
                host: "43.239.192.78",
                secure: false,
                // newline: 'unix',
                port: 587,
                auth: {
                    user: process.env.SMPTP_MAIL_APIKEY || "noreply@techdevelopments.co",
                    pass: process.env.SMPTP_MAIL_PASS ||'(dQU[s??iGdx'
                },
                tls: { rejectUnauthorized: false }
            });
          }
       

         
    },
    emailForm: process.env.EMAIL_FORM,
    otpExpiryTime: 30,
    clientMail: process.env.CLIENT_MAIL,
    testMail: process.env.TEST_MAIL,
    default_org_id: process.env.DEFAULT_ORG_ID,

    // function to decode the token.credential
    decodeJwtResponse(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    },

    autoGeneratePassword() {
        const length = 10;
        const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
        const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numericChars = "0123456789";
        const specialChars = "!@#$%^&*()-_+=<>?";
    
        const allChars = lowercaseChars + uppercaseChars + numericChars + specialChars;
        let password = "";
    
        // Ensure at least one lowercase letter
        password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
    
        // Ensure at least one uppercase letter
        password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
    
        // Ensure at least one numeric digit
        password += numericChars.charAt(Math.floor(Math.random() * numericChars.length));
    
        // Ensure at least one special character
        password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    
        // Generate remaining characters
        for (let i = 4; i < length; i++) {
            password += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }
    
        // Shuffle the characters to randomize the password further
        password = password.split('');
        for (let i = password.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [password[i], password[j]] = [password[j], password[i]];
        }
    
        return password.join('');
    },
    slugGenerator(val) {
        return val.trim().toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    },

    fileNameGenerator(fileName, fieldname) {
        let extension = path.extname(fileName);
        let file_name = new Date().getTime() + extension;
        return fieldname.trim().toLowerCase() + '_' + file_name
    },

    encodeCrypto(val) {
        return CryptoJS.AES.encrypt(JSON.stringify({ val }), process.env.CRYPTO_PASSWORD).toString();
    },
    decodeCrypto(val) {
        let decodedValue = CryptoJS.AES.decrypt(val, process.env.CRYPTO_PASSWORD).toString(CryptoJS.enc.Utf8);
        if (decodedValue) {
            decodedValue = JSON.parse(decodedValue)
            return decodedValue.val
        } else {
            return undefined
        }
    },
    generateToken(data, exp_time) {
        return jwt.sign(data, process.env.ACCESS_TOKEN, { expiresIn: exp_time });
    },
    getDeviceId(userAgent) {
        const detector = new DeviceDetector({
            clientIndexes: true,
            deviceIndexes: true,
            deviceAliasCode: false,
        });
        const deviceRes = detector.detect(userAgent);
        return deviceRes.device.type
    },
    getJsonParseData(obj) {
        return JSON.parse(JSON.stringify(obj))
    },
    async getUserInfo(userId, queryOptions = {}) {
        if (!userId) {
            return null
        }
        queryOptions.attributes = ['org_user_id', 'org_id', 'first_name', 'last_name', 'profile_image']
        let user = await db.orgUsersModel.findByPk(userId, queryOptions);
        if (user) {
            user = JSON.parse(JSON.stringify(user))
            user.profile_image ? user.profile_image = `${config.api_baseurl}/org_file/hws_${user.org_id}/users/${user.profile_image}` : null

            user = user ? config.getJsonParseData(user) : null;
            return user;
        } else {
            return null
        }
    },
    async getRealtorInfo(realestate_professional_id, queryOptions = {}) {
        if (!realestate_professional_id) {
            return null
        }
        queryOptions.attributes = ['realestate_professional_id', 'org_id','email', 'contact_name']
        let user = await db.realestateProfessionalsModel.findByPk(realestate_professional_id, queryOptions);
        if (user) {
            user = JSON.parse(JSON.stringify(user))
            user.profile_image ? user.profile_image = `${config.api_baseurl}/org_file/hws_${user.org_id}/users/${user.profile_image}` : null

            user = user ? config.getJsonParseData(user) : null;
            return user;
        } else {
            return null
        }
    },
    async updateAuditTrail(payload, req=null) {
        try {

            const userAgent = req?req.headers["user-agent"]:null;
            let userInfo = null;
            if (payload.source == 1) {
                userInfo = await db.orgUsersModel.findByPk(payload.created_by);
                userInfo = config.getJsonParseData(userInfo);
                payload.email = userInfo.email;
                payload.name = `${userInfo.first_name} ${userInfo.last_name}`;
            }
            if (!payload.org_id) {
                if (req) {
                    payload.org_id = req.headers.org_id ? parseInt(req.headers.org_id) : req.tokenData.org_id?parseInt(req.tokenData.org_id):null;

                }
            }
            payload.ip_address =req? req.headers["x-forwarded-for"] || req.socket.remoteAddress:null;
            payload.user_agent = userAgent;
            // console.log('payload.source',payload.source);
            payload.description = `${payload.description} on ${moment().format('MM-DD-YYYY')} ${moment().format("HH:mm")} ${payload.source == 1 ? `by ${userInfo.first_name} ${userInfo.last_name}`:payload.source == 10 ? `Cron`:`by ${payload.name}` }`;
            payload.os_platform = userAgent? await this.fetchOperatingSystem(userAgent):null;
            if (!payload.device_id) {
                payload.device_id = userAgent?this.getDeviceId(userAgent):null;
            }
           let createdAuditData= await db.auditTrailModel.create(payload);
          // console.log('createdAuditData',createdAuditData);
           return createdAuditData?this.getJsonParseData(createdAuditData):createdAuditData
        } catch (error) {
            console.log('audit trail error',error);
            throw error
        }
       
    },
    async modifiedFieldValue(oldData, newData) {
        let fieldArray = [];
        for (const property in newData) {
            for (const isExistProperty in oldData) {
                if (property == isExistProperty) {
                    if (newData[property] != oldData[isExistProperty]) {
                        fieldArray.push({ field: property, old_val: oldData[isExistProperty], new_val: newData[property] });
                    }
                }
            }
        }
        return fieldArray;
    },
    async fetchClientMACAddress() {
        getmac.getMac((err, macAddress) => {
            if (err) {
                console.error(err);
            } else {
                return macAddress;
            }
        });
    },
    async fetchOperatingSystem(userAgent){
        if (userAgent.indexOf("Windows") !== -1) {
            operatingSystem = "Windows";
        } else if (userAgent.indexOf("Mac") !== -1) {
            operatingSystem = "Mac";
        } else if (userAgent.indexOf("Linux") !== -1) {
            operatingSystem = "Linux";
        } else if (userAgent.indexOf("Android") !== -1) {
            operatingSystem = "Android";
        } else if (userAgent.indexOf("iOS") !== -1) {
            operatingSystem = "iOS";
        } else {
            operatingSystem = "Unknown";
        }
        return operatingSystem;
    }, 
    async test(object, queryOptions = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!object.created_by && !object.updated_by) {
                    return null
                }
                //console.log(35423);
                queryOptions.attributes = ['org_user_id', 'org_id', 'first_name', 'last_name', 'profile_image']

                if (object.created_by) {
                    let user = await db.orgUsersModel.findByPk(object.created_by, queryOptions);
                    if (user) {
                        user = JSON.parse(JSON.stringify(user))
                        user.profile_image ? user.profile_image = `${config.api_baseurl}/org_file/hws_${user.org_id}/users/${user.profile_image}` : null
                        user = user ? config.getJsonParseData(user) : null

                        // if (object.create_user_type == 1) {
                        object.created_user_info = {
                            customer_id: user.customer_id,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            profile_image: user.profile_image
                        }
                        // }
                    }

                }
                if (object.updated_by) {
                    let user = await db.orgUsersModel.findByPk(object.updated_by, queryOptions);
                    if (user) {
                        user = JSON.parse(JSON.stringify(user))
                        user.profile_image ? user.profile_image = `${config.api_baseurl}/org_file/hws_${user.org_id}/users/${user.profile_image}` : null
                        user = user ? config.getJsonParseData(user) : null

                        //if (object.update_user_type == 1) {
                        object.updated_user_info = {
                            customer_id: user.customer_id,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            profile_image: user.profile_image
                        }
                        // }
                    }
                }

            } catch (error) {
                reject(error);
            }
            resolve(object)
        })
    },
    setUSFormatPhoneNumber(phoneNumber) {
        // let cleanNumber = phoneNumber.toString().replace(/\D/g, '');
        // // Apply the desired format (XXX) XXX-XXXX
        // let formattedNumber = cleanNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        // Remove all non-digit characters from the input
        if (phoneNumber) {
            let number = phoneNumber.replace(/\D/g, '');
            // Apply the desired phone number format
            if (number.length >= 4) {
                number = `(${number.slice(0, 3)}) ${number.slice(3)}`;
            }
            if (number.length >= 10) {

                number = `${number.slice(0, 9)}-${number.slice(9)}`;
            }
            if (number.length >= 5) {
                number = `${number.slice(0, 3)}${number.slice(3)}`;

            }
            return number;
        }
        return null
    },
    convertToNormalPhoneNumber(usPhoneNumber) {
        if (usPhoneNumber) {
            // Remove all non-numeric characters from the input phone number
            const normalPhoneNumber = usPhoneNumber.replace(/\D/g, '');
            return normalPhoneNumber;
        }
        return null
    },
    getMatchedPermissionCombination(combination) {
        let combinationArr = [
            {
                id: 1,
                combination: "0,0,0,0"
            },
            {
                id: 2,
                combination: "1,0,0,0"
            },
            {
                id: 3,
                combination: "1,0,0,1"
            },
            {
                id: 4,
                combination: "1,0,1,0"
            },
            {
                id: 5,
                combination: "1,0,1,1"
            },
            {
                id: 6,
                combination: "1,1,0,0"
            },
            {
                id: 7,
                combination: "1,1,0,1"
            },
            {
                id: 8,
                combination: "1,1,1,0"
            },
            {
                id: 9,
                combination: "1,1,1,1"
            }
        ]
        let matchedObj = _.find(combinationArr, { 'combination': combination });

        return matchedObj
    },
    permissionName: {
        view: 0,
        add: 1,
        edit: 2,
        delete: 3
    },

    isDate(searchingValue) {
        if (searchingValue) {
            // Function to check if the searchingValue matches the date format
            // const dateFormatRegex = /^\d{2}-\d{2}-\d{4}$/;// Date format MM-DD-YYYY
            //return dateFormatRegex.test(searchingValue);
            let date = moment(searchingValue);
            date.isValid();
            return date.isValid();
        }
        return null
    },
    searchTimeStamp(searchingValue) {
        if (searchingValue) {
            const dateFormatRegex = /^\d{2}-\d{2}-\d{4}$/; // Date format MM-DD-YYYY
            if (dateFormatRegex.test(searchingValue)) {
                // If searchingValue is a date, parse it
                const parsedDate = moment(searchingValue, 'MM-DD-YYYY').format();
                // Search for records created on or after the specified date
                return searchQuery = {
                    [Op.or]: [
                        {
                            created_at: {
                                [Op.gte]: parsedDate,
                            },
                        },
                        {
                            updated_at: {
                                [Op.gte]: parsedDate,
                            },
                        },
                    ]

                };
            }

        }
    },
    advanceSerachQueryGenrator(parsedQs, fieldArr) {
        let advancedSearchQuery = {
            [Op.and]: [], // Initialize an array for AND conditions
        };
        // console.log('parsedQs',parsedQs);
        for (const key in parsedQs) {
            //console.log('called==',key);
            if (fieldArr.includes(key)) {
                if (typeof parsedQs[key] === 'string') {

                    // Customize this part based on your allowed search fields
                    if (key === 'full_name') {
                        // Handle the "name" query for both first_name and last_name
                        let searchedName = parsedQs[key].trim().split(" ");
                        let firstName = searchedName[0]?.trim();
                        let lastName = searchedName[1]?.trim();
                        const nameGroup = {
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
                            ],
                        };
                        advancedSearchQuery[Op.and].push(nameGroup);
                    } else if (key === 'created_from') {
                        const fromDateCondition = {
                            created_at: {
                                [Op.gte]: this.getStartOfDay(new Date(parsedQs[key])),
                            },
                        };
                        advancedSearchQuery[Op.and].push(fromDateCondition);
                    } else if (key === 'created_to') {
                        // Handle the "to" date
                        const toDateCondition = {
                            created_at: {
                                [Op.lte]:  this.getEndOfDay(new Date(parsedQs[key]))
                            }
                        }
                        advancedSearchQuery[Op.and].push(toDateCondition);
                    } else {
                        const otherKey = {
                            [key]: {
                                [Op.iLike]: `%${parsedQs[key]}%`,
                            },
                        };
                        advancedSearchQuery[Op.and].push(otherKey);

                    }
                } else if (typeof parsedQs[key] === 'number') {
                    const numbervalue = {
                        [key]: parsedQs[key]
                    }
                    advancedSearchQuery[Op.and].push(numbervalue);
                    //db.Sequelize.literal(`CAST(${key} AS TEXT) ILIKE '%${parsedQs[key]}%'`)
                    //console.log(key, parsedQs[key]);
                }
            }
        }
        return advancedSearchQuery
    },
    convertStringsToNumbers(obj, fieldArr = []) {
        if (typeof obj !== 'object' || obj === null) {
            return obj; // Return the input object if it's not an object or if it's null
        }
        for (const key in obj) {
            if (fieldArr.includes(key)) {
                if (key != 'mobile' && key != 'alternate_phone') {
                    if (typeof obj[key] === 'string') { // Check if the value is a string
                        if (!isNaN(obj[key])) {
                            if (obj[key] != 'mobile' || obj[key] != 'alternate_phone') {
                                if (obj[key].includes('.')) {
                                    obj[key] = parseFloat(obj[key]); // Convert to decimal number
                                } else {
                                    obj[key] = parseInt(obj[key], 10); // Convert to integer number
                                }
                            }
                        }
                    }
                }
            }
        }
        return obj;
    },
    getStartOfDay(dateVal){
        let date = moment(dateVal);
  
        if (date.isValid()) {
          // Check if date is valid before attempting to modify it
          return new Date(date.startOf('day').toDate());
        } else {
          console.error('Invalid date:', dateVal);
          return null;
        }
    },
    getEndOfDay(dateVal){
        let date = moment(dateVal);
  
        if (date.isValid()) {
          // Use endOf('day') to set the time to the end of the day
          return new Date(date.endOf('day').toDate());
        } else {
          console.error('Invalid date:', dateVal);
          return null;
        }
    },
    createfolderIfNotExist(folder_path) {
        return new Promise((resolve, reject) => {
            const baseDirectory = path.resolve(__dirname);
            const parentDirectory = path.resolve(baseDirectory, '../');
            const joinedPath = path.join(parentDirectory, folder_path);

            fs.access(joinedPath, fs.constants.F_OK, (err) => {
                if (err) {
                    // console.error('Directory not found:', err);
                    fs.mkdir(joinedPath, { recursive: true }, (error) => {
                        if (error) {
                            // console.error('Error creating directory:', error);
                            reject(false);
                        } else {
                            // console.log('Directory created successfully');
                            resolve(true);
                        }
                    });
                } else {
                    // console.log('Directory already exists');
                    resolve(true);
                }
            });
        });
    },

    async createFolderIfNotExistAsync(folderName) {
        const baseDirectory = path.resolve(__dirname);
        const parentDirectory = path.resolve(baseDirectory, '../');
        const folderPath = path.join(parentDirectory, folderName);
        try {
            // Check if the folder exists
            await fs.access(folderPath);

            console.log(`Folder already exists at: ${folderPath}`);
        } catch (error) {
            // If not, create the folder
            await fs.mkdir(folderPath, { recursive: true });
            console.log(`Folder created at: ${folderPath}`);
        }
    },

    getFileExtension(fileName) {
        if (!fileName) {
            return null
        }
        return fileName.split('.').pop();
    },

    async generatePdfFromEjs(templatePath, dataObj, storagePath = null, pdfName = 'output.pdf') {
        try {
            // Read the EJS file content      
            // Compile the EJS template with dynamic data
            const templatedata = await ejs.renderFile(templatePath, {
                dataObj
            });

            const htmlContent = templatedata;

            // Generate PDF from the compiled HTML content
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
            //   return pdfBuffer;
        } catch (error) {
            throw error;
        }
    },
    generateRoleBasedCondition(tokenData) {
        const { user_role_id, org_user_id, org_id } = tokenData;

        let condition = {};

        switch (user_role_id) {
            case this.userRole.admin:
                // Admin can access all data, no need to add any specific condition
                condition = {
                    org_id: org_id,
                };
                break;

            case this.userRole.sales_manager:
                // Sales manager can access data of sales users data
                condition = {
                    org_id: org_id,
                };
                break;
            case this.userRole.sales_representative:
                // Salesman can access data created by themselves
                condition = {
                    create_user_type: 2,
                    created_by: org_user_id,
                    org_id: org_id,
                };
                break;

            // Add more cases for other roles if needed

            default:
                // Default condition for unknown roles
                break;
        }

        return condition;
    },

    userRole: {
        admin: 1,
        sales_manager: 2,
        sales_representative: 3,
        claim_representative: 4,
    },
    create_update_user_type:{
        self_customer:1,
        admin_user:2,
        realtor:3,
        contractor:4,
        affiliates:5,
        cron_process:10,
        legacy_data:99
    },
    paymentType:{
        credit_card:1,
        bank_ach:2,
        escrow:3,
        do_not_charge:4, 
        link_payment:5
    },

    paymentTypeName:{
        credit_card:'CREDIT CARD',
        bank_ach:'BANK ACH',
        escrow:'ESCROW',
        do_not_charge:'DO NOT CHARGE', 
        link_payment:'LINK'
    },

    recurring_type:{
        yearly:0,
        monthly:1
    },
    schedule_payment:{
        same_day_payment:0,
        future_payment:1
    },
    schedule_payment_name:{
        same_day_payment:'Same Day Payment',
        future_payment:'Future Payment'
    }
}



function envSpecificUrlData() {
    let url = {
        website_baseUrl: `http://localhost:4200/`,
        admin_baseUrl: `http://localhost:4200/`,
        api_baseurl: 'http://localhost:5000',
        email_imageUrl: "https://api.techdevelopments.co/email_images/"

    }
    switch (NODE_ENV) {
        case 'development':
            return url;
        case 'staging':
            url = {
                website_baseUrl: `https://fpwebstage.techdevelopments.co/`,
                admin_baseUrl: `https://techdevelopments.co/fphw-stage/admin/`,
                api_baseurl: 'https://fphwapi.techdevelopments.co',
                email_imageUrl: "https://fphwapi.techdevelopments.co/email_images/"

            }
            return url;
        case 'uat':
            url = {
                website_baseUrl: `https://techdevelopments.co/fphw-website/`,
                admin_baseUrl: `https://techdevelopments.co/fphw-admin/`,
                api_baseurl: 'https://api.techdevelopments.co',
                email_imageUrl: "https://api.techdevelopments.co/email_images/"
            }
            return url;
        case 'prod':
            url = {
                website_baseUrl: process.env.website_baseUrl,
                admin_baseUrl: process.env.admin_baseUrl,
                api_baseurl: process.env.api_baseurl,
                email_imageUrl: process.env.email_imageUrl
            }
            return url;
        default:
            break;
    }
}
module.exports = config;


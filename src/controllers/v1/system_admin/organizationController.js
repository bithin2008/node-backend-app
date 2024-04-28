const CustomError = require("../../../utils/customErrorHandler");
const moment =require('moment')
const db = require("../../../models")
const helper = require("../../../common/helper");
const bcrypt = require('bcryptjs');
const DeviceDetector = require('node-device-detector');
const createFolder = require("../../../middleware/createFolder")
const mailService = require("../../../services/v1/admin/mailService");
const jwt = require('jsonwebtoken');
const os = require('os');
const ejs = require('ejs');
const path = require("path");
const OrganizationsService = require('../../../services/v1/admin/organizatonsService')
const orgDepartmentsService = require('../../../services/v1/admin/orgDepartmentsService')
const orgUserRolesService = require('../../../services/v1/admin/orgUserRolesService')
const orgUserAccessPermissionsService = require('../../../services/v1/admin/orgUserAccessPermissionsService')
const orgModuleService = require('../../../services/v1/admin/orgModuleService')
const userAuthService = require('../../../services/v1/admin/userAuthService')
const orgModuleSubmodulePermissionService = require("../../../services/v1/admin/orgModuleSubmodulePermissionService");


exports.createOrganizations = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {         
        let payload = {
            org_name: req.body.orgName ? req.body.orgName : null,
            org_title: req.body.orgTitle ? req.body.orgTitle : null,
            description: req.body.descriptions ? req.body.descriptions : null,
            logo: req.body.logo ? req.body.logo : null,
            tiny_logo: req.body.tinyLogo ? req.body.tinyLogo : null,
            favicon: req.body.favicon ? req.body.favicon : null,
            copyright_text: req.body.copyrightText ? req.body.copyrightText : null,
            contact_email: req.body.contactEmail ? req.body.contactEmail : null,
            contact_phone: req.body.contactPhone ? req.body.contactPhone : null,
            support_email: req.body.supportEmail ? req.body.supportEmail : null,
            support_phone: req.body.supportPhone ? req.body.supportPhone : null,
            color_scheme: req.body.colorScheme ? req.body.colorScheme : null,
            fb_link: req.body.fbLink ? req.body.fbLink : null,
            twitter_link: req.body.twitterLink ? req.body.twitterLink : null,
            linkedin_link: req.body.linkedinLink ? req.body.linkedinLink : null,
            instagram_link: req.body.instagramLink ? req.body.instagramLink : null,
            youtube_link: req.body.youtubeLink ? req.body.youtubeLink : null,
            whatsapp_link: req.body.whatsappLink ? req.body.whatsappLink : null,
            pinterest_link: req.body.pinterestLink ? req.body.pinterestLink : null,
            active_status: req.body.activeStatus ? req.body.activeStatus : null,
            // db_schema_prefix:req.body.dbSchemaPrefix?req.body.dbSchemaPrefix:null,
            
            created_by: req.tokenData.system_administrator_id ? parseInt(req.tokenData.system_administrator_id) : null,

        }
        let orgModelRes = await db.organizationsModel.create(payload, { transaction })
        orgModelRes = helper.getJsonParseData(orgModelRes)
         if (orgModelRes.org_id) {
            let departmentData = {
                org_id: orgModelRes.org_id,
                department_name: 'Administration',
                description: null,
                created_by: null,
            };
            let createDepartmentRes = await orgDepartmentsService.createDepartment(departmentData, transaction);
            const orgRoledata = {
                org_id: orgModelRes.org_id,
                role_type: 'Super Admin',
                is_super_admin:1,
                descriptions: null,
            };
            let createdOrgRoleRes = await orgUserRolesService.createOrgUserRole(orgRoledata, transaction);
            const password = helper.autoGeneratePassword();
            const detector = new DeviceDetector({
                clientIndexes: true,
                deviceIndexes: true,
                deviceAliasCode: false,
            });
            const deviceRes = detector.detect(req.headers["user-agent"]);
            const userData = {
                org_id: orgModelRes.org_id,
                user_role_id: createdOrgRoleRes.user_role_id,
                department_id: createDepartmentRes.department_id,
                first_name: orgModelRes.org_name,
                last_name: 'User',
                email: orgModelRes.contact_email,
                password: await bcrypt.hash(password, 10),
                mobile: orgModelRes.contact_phone,
                joining_date: moment().format('YYYY-MM-DD HH:mm:ss z'),
                active_status: 0,
                ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
                device_id: deviceRes.device.type,
                os_platform: os.platform(),
                user_agent: req.headers["user-agent"],
            };


            const emailExists = await userAuthService.findUserByEmail(orgModelRes.contact_email);

            if (!emailExists) {
                let createdUserData = await db.orgUsersModel.create(userData, { transaction });
                createdUserData=helper.getJsonParseData(createdUserData)
                if (req.body.selectedModuleSubModules.length==0) {
                    throw new CustomError(`You must choose a minimum of one module or submodule.`,400)
                }
                let selectedModuleSubModulesData=[];
                req.body.selectedModuleSubModules.forEach(el=>{
                    selectedModuleSubModulesData.push({
                        ...el,
                        org_id:orgModelRes.org_id
                    })
                })
                let orgModuleSubmodulePermissionServiceRes= await orgModuleSubmodulePermissionService.createOrgModuleSubModulePermission(req, res, next,selectedModuleSubModulesData,transaction);
                if (!orgModuleSubmodulePermissionServiceRes) {
                    throw new CustomError(`Something went wrong! Organaization module submodule permission not set.`,400)
                }
                let orguserAccessPermissionData=[]
                orgModuleSubmodulePermissionServiceRes.createdOrgSubModules.forEach(element => {
                    orguserAccessPermissionData.push({
                        org_id:element.org_id,
                        org_user_id:createdUserData.org_user_id,
                        org_module_id:element.module_id,
                        org_sub_module_id:element.org_sub_module_id,
                        permission_combination_id:9,
                        created_by:null
                    })
                }); 

                if (createdUserData.org_user_id) {
                    setTimeout(async() => {
                        let orgUserAccessPermissionsModelRes =await orgUserAccessPermissionsService.createOrgUserAccessPermission(orguserAccessPermissionData,transaction)
                    }, 200);
                    const user_activation_token = jwt.sign({ org_user_id: createdUserData.org_user_id }, process.env.ACCESS_TOKEN, { expiresIn: '60m' })
                    let path = []
                    path[0] = `./public/org_files/hws_${orgModelRes.org_id}`
                    path[1] = `./public/org_files/hws_${orgModelRes.org_id}/customers`
                    path[2] = `./public/org_files/hws_${orgModelRes.org_id}/careers`
                    path[3] = `./public/org_files/hws_${orgModelRes.org_id}/contractors`
                    path[4] = `./public/org_files/hws_${orgModelRes.org_id}/media_content`
                    path[5] = `./public/org_files/hws_${orgModelRes.org_id}/media_content/blogs`
                    path[6] = `./public/org_files/hws_${orgModelRes.org_id}/media_content/market-leaders`
                    path[7] = `./public/org_files/hws_${orgModelRes.org_id}/media_content/products`
                    path[8] = `./public/org_files/hws_${orgModelRes.org_id}/users`
                    path[9] = `./public/org_files/hws_${orgModelRes.org_id}/customers/policy_docs`
                    path.forEach(element => {
                        helper.createFolderIfNotExistAsync(element)
                    });
                    let dataObj = {
                        org_name: payload.org_name,
                        password: password,
                        org_user_id: createdUserData.org_user_id,
                        url: `${helper.admin_baseUrl}auth/user-activation/${user_activation_token}`
                    }
                    await transaction.commit();

                    let mailTrigger = await mailService.triggerMail('newOrgWelcome.ejs', dataObj, '',orgModelRes.contact_email, 'Your Organaization Account is created successfully. Welcome to our Family!');
                    if (mailTrigger) {
                        res.status(201).send({  status: 1,  message: "Organization account is created successfully.", key:orgModelRes.org_id});
                       
                    } else {
                        throw new CustomError(`Something Went Wrong! Try Again Later`, 500)
                    }
                } else {
                    throw new CustomError(`Something Went Wrong! Try Again Later`, 500)
                }

            } else {
                await transaction.rollback();
                res.status(200).send({ status: 0, message: "Organaization user email id already exists" });
            }
           
        }

    } catch (error) {
        console.log("main error", error);
        await transaction.rollback();
        next(error);
    }
}
exports.getAllOrganizations = async (req, res, next) => {
    try {
        let limit = res.pagination.limit
        let offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * limit)
        let allOrganizations = await OrganizationsService.getallOrganizations(req, res, next, offset, limit,)
        res.pagination.total = allOrganizations.count
        res.pagination.totalPages = Math.ceil(allOrganizations.count / limit)
        if (allOrganizations.count > 0) {
            res.status(200).send({ status: 1, data: allOrganizations.rows, pagination: res.pagination, message: 'Organizations list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allOrganizations.rows, pagination: res.pagination, message: 'No Organizations found' })
        }

    } catch (error) {
        console.log(error);
        next(error)
    }
}

exports.updateOrganizations = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { org_id } = req.params
        const isExistOrg = await OrganizationsService.findOrganizationById(parseInt(org_id),);
        let payload = {
            org_name: req.body.orgName ? req.body.orgName : null,
            org_title: req.body.orgTitle ? req.body.orgTitle : null,
            description: req.body.descriptions ? req.body.descriptions : null,
            favicon: req.body.favicon ? req.body.favicon : null,
            copyright_text: req.body.copyrightText ? req.body.copyrightText : null,
            contact_email: req.body.contactEmail ? req.body.contactEmail : null,
            contact_phone: req.body.contactPhone ? req.body.contactPhone : null,
            support_email: req.body.supportEmail ? req.body.supportEmail : null,
            support_phone: req.body.supportPhone ? req.body.supportPhone : null,
            color_scheme: req.body.colorScheme ? req.body.colorScheme : null,
            fb_link: req.body.fbLink ? req.body.fbLink : null,
            twitter_link: req.body.twitterLink ? req.body.twitterLink : null,
            linkedin_link: req.body.linkedinLink ? req.body.linkedinLink : null,
            instagram_link: req.body.instagramLink ? req.body.instagramLink : null,
            youtube_link: req.body.youtubeLink ? req.body.youtubeLink : null,
            whatsapp_link: req.body.whatsappLink ? req.body.whatsappLink : null,
            pinterest_link: req.body.pinterestLink ? req.body.pinterestLink : null,
            active_status: req.body.activeStatus ? req.body.activeStatus : isExistOrg.active_status,
            // db_schema_prefix:req.body.dbSchemaPrefix?req.body.dbSchemaPrefix:null,
            updated_by: req.tokenData.system_administrator_id ? parseInt(req.tokenData.system_administrator_id) : null,

        }
        const isuniqueOrgName = await OrganizationsService.isExistOrganizations(req, res, next, payload, org_id)
        if (isuniqueOrgName) {
            let userData={
                first_name:payload.org_name,
                email:payload.contact_email
            }
            let updateOrgres = await OrganizationsService.updateOrganizations(req,res,next,payload,org_id,transaction)
            let updateOrgUserRes=  await db.orgUsersModel.update(userData,{ where:{ email:isExistOrg.contact_email},transaction})
            if (updateOrgres[0] == 1 && updateOrgUserRes[0]==1) {
                transaction.commit()
                res.status(200).send({ status: 1, message: `Organizations update successfully.` })
            }else{
                throw new CustomError(`Something Went Wrong! Try Again Later`, 500)
            }
        } else {
            throw new CustomError(`Organizations name already exist`, 400)
        }
    } catch (error) {
        console.log(error);
        transaction.rollback()
        next(error)
    }
}
exports.orgUpdateLogo = async (req, res, next) => {
    try {
        let org_id = null
        if (req.params.org_id) {
            // org_id = helper.decodeCrypto(decodeURI(req.params.org_id));
            org_id = req.params.org_id
            if (req.file) {

                var image = req.file.filename ? `${req.file.filename}` : null
                req.body.orgLogo = image
                let data = {
                    logo: req.body.orgLogo,
                    //updated_by: req.tokenData.user_id
                }
                let orgRes = await db.organizationsModel.update(data,
                    { where: { org_id: org_id } }
                )
                if (orgRes[0] == 1) {
                    res.status(200).send({ status: 1, message: 'Successfully updated organization logo.' })
                } else {
                    throw new CustomError('Failed to update organization logo.', 500)
                }
            } else {
                throw new CustomError('Something went wrong! The file could not be found.', 500)
            }
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}
exports.orgTinyLogo = async (req, res, next) => {
    try {
        let org_id = null
        if (req.params.org_id) {
            org_id = req.params.org_id
            if (req.file) {
                var image = req.file.filename ? `${req.file.filename}` : null
                req.body.orgTinyLogo = image
                let data = {
                    tiny_logo: req.body.orgTinyLogo,
                    favicon: req.body.orgTinyLogo,
                }
                let orgRes = await db.organizationsModel.update(data,
                    { where: { org_id: org_id } }
                )
                if (orgRes[0] == 1) {
                    res.status(200).send({ status: 1, message: 'Successfully updated organization tiny logo.' })
                } else {
                    throw new CustomError('Failed to update organization tiny logo.', 500)
                }
            } else {
                throw new CustomError('Something went wrong! The file could not be found.', 500)
            }
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}

/*****************************
 *  TOGGLE ORGANIZATIONS STATUS
 ******************************/
exports.toggleOrganizationsStatus = async (req, res, next) => {
    try {
        const { org_id } = req.params;
        const owner_id = req.tokenData.system_administrator_id
        const orgExists = await OrganizationsService.findOrganizationById(parseInt(org_id));
        if (orgExists) {
            let payload = {
                active_status: parseInt(req.body.activeStatus),
                updated_by: req.tokenData.system_administrator_id ? parseInt(req.tokenData.system_administrator_id) : null,
            }
            const transaction = await db.sequelize.transaction(async (t) => {
                let updateRes = await db.organizationsModel.update(
                    payload,
                    { where: { org_id: org_id }, transaction: t })
                if (updateRes[0] == 1) {
                    res.status(200).send({ status: 1, message: `Organaization successfully ${req.body.activeStatus ? 'enabled' : 'disabled'}.` })
                } else {
                    throw new CustomError(`Something went wrong! Organaization status not updated .`)
                }

            });


        } else {
            res.status(200).send({ status: 0, message: "Organaization not found" });
        }
    } catch (error) {
        next(error);
    }
}

require("dotenv").config();
const config = require("../../../config/config");
const CustomError = require("../../../utils/customErrorHandler");
const helper = require('../../../common/helper');
const userAuthService = require("../../../services/v1/admin/userAuthService");
const userService = require("../../../services/v1/admin/userService");
const mailService = require("../../../services/v1/admin/mailService");
const db = require('../../../models/index');
const { Op } = require("sequelize");
const moment = require("moment");
const bcrypt = require('bcryptjs')
const os = require('os');
const jwt = require('jsonwebtoken');
const DeviceDetector = require('node-device-detector');
const createFolder = require("../../../middleware/createFolder")
const orgUserAccessPermissionsService = require('../../../services/v1/admin/orgUserAccessPermissionsService')
const orgSubModuleService = require("../../../services/v1/admin/orgSubModuleService");
const mailConfig = require("../../../config/mailConfig");



/*****************************
 *  CREATE ORG USER
 ******************************/
exports.createUser = async (req, res, next) => {

  const transaction = await db.sequelize.transaction();
  try {
    const userAgent = req.headers["user-agent"];
    const password = helper.autoGeneratePassword();
    const detector = new DeviceDetector({
      clientIndexes: true,
      deviceIndexes: true,
      deviceAliasCode: false,
    });
    const deviceRes = detector.detect(userAgent);
    const data = {
      org_id: req.body.orgId ? parseInt(req.body.orgId) : null,
      user_role_id: req.body.userRoleId ? parseInt(req.body.userRoleId) : null,
      department_id: req.body.departmentId ? parseInt(req.body.departmentId) : null,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      email: req.body.emailId,
      password: await bcrypt.hash(password, 10),
      mobile: req.body.mobile,
      residential_phone: req.body.residentialPhone,
      profile_image: null,
      gender: parseInt(req.body.gender),
      date_of_birth: req.body.dateOfBirth ? moment(req.body.dateOfBirth).format('YYYY-MM-DD HH:mm:ss z') : null,
      joining_date: req.body.joiningDate ? moment(req.body.joiningDate).format('YYYY-MM-DD HH:mm:ss z') : null,
      zip: req.body.zip ? req.body.zip : null,
      state: req.body.state ? req.body.state : null,
      city: req.body.city ? req.body.city : null,
      address1: req.body.address1 ? req.body.address1 : null,
      address2: req.body.address2 ? req.body.address2 : null,
      active_status: req.body.activeStatus ? parseInt(req.body.activeStatus) : 0,
      login_otp: null,//Math.floor(1000 + Math.random() * 9000),
      login_otp_created_at: null,// moment().add(req.body.loginOTPCreatedAt?req.body.loginOTPCreatedAt:60, 'minutes'),
      last_login: null,
      ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      device_id: deviceRes.device.type,
      os_platform: os.platform(),
      user_agent: userAgent,
      created_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
      updated_by: null,
      deleted_by: null
    };
    const emailExists = await userAuthService.findUserByEmail(req.body.emailId);
    if (!emailExists) {
      let createdUserData = await userService.createUser(req, res, next, data, transaction);
      if (createdUserData.org_user_id) {
        let roleDetails = await db.orgUserRolesModel.findByPk(createdUserData.user_role_id, { include: { model: db.orgUserRolePermissionsModel, as: 'role_permission_details' }, transaction });
        roleDetails = helper.getJsonParseData(roleDetails)
        let orguserAccessPermissionData = []
        if (roleDetails.is_super_admin == 0) {
          roleDetails.role_permission_details.forEach(element => {
            orguserAccessPermissionData.push({
              org_id: element.org_id,
              org_user_id: createdUserData.org_user_id,
              org_module_id: element.org_module_id,
              org_sub_module_id: element.org_sub_module_id,
              permission_combination_id: element.permission_combination_id,
              created_by: req.tokenData.org_user_id
            })
          });
        } else {
          let queryOptions = {
            where: {
              org_id: createdUserData.org_id,
              s_admin_active_status: 1
            }
          }
          let orgSubmoduleList = await orgSubModuleService.getOrgSubModules(queryOptions)
          orgSubmoduleList.rows.forEach(element => {
            orguserAccessPermissionData.push({
              org_id: element.org_id,
              org_user_id: createdUserData.org_user_id,
              org_module_id: element.module_id,
              org_sub_module_id: element.org_sub_module_id,
              permission_combination_id: 9,
              created_by: req.tokenData.org_user_id
            })
          })
        }
        setTimeout(async () => {
          let orgUserAccessPermissionsModelRes = await orgUserAccessPermissionsService.createOrgUserAccessPermission(orguserAccessPermissionData, transaction);
        }, 500);

        transaction.commit()
        const folderPath = `./src/public/org_files/hws_${createdUserData.org_id}/users`; // Replace this with your folder path template
        let folderRes = await createFolder(folderPath);
        const user_activation_token = jwt.sign({ org_user_id: createdUserData.org_user_id }, process.env.ACCESS_TOKEN, { expiresIn: '60m' })
        let dataObj = {
          first_name: createdUserData.first_name,
          last_name: createdUserData.last_name,
          email: createdUserData.email,
          password: password,
          org_user_id: createdUserData.org_user_id,
          url: `${helper.admin_baseUrl}auth/user-activation/${user_activation_token}`,
          company_address: mailConfig.company_address,
          company_phone: mailConfig.company_phone,
          company_email: mailConfig.company_email,
          company_copyright_year: mailConfig.company_copyright_year,
          company_website: mailConfig.company_website,
          company_website_link: mailConfig.company_website_link,
          email_imageUrl: helper.email_imageUrl
        }
        let mailTrigger = await mailService.triggerMail('userCreationWelcomeTemp.ejs', dataObj, '', data.email, 'Your Account is created. Welcome to our Family!');
        if (mailTrigger) {
          res.status(201).send({
            status: 1,
            message: "User Created Successfully.",
            key: createdUserData.org_user_id
          });
        } else {
          throw new CustomError(`Something Went Wrong! Try Again Later`, 500)
        }


      } else {
        throw new CustomError(`Something Went Wrong! Try Again Later`, 500)
      }

    } else {
      res.status(200).send({ status: 0, message: "Email id already exists" });
    }
  } catch (error) {
    transaction.rollback()
    next(error);
  }
}
/*****************************
 *  UPDATE USER
 ******************************/
exports.updateUser = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {

    const { org_user_id } = req.params;
    const owner_id = req.tokenData.org_user_id
    const userExists = await userService.findUserById(org_user_id);
    const userAgent = req.headers["user-agent"];
    const detector = new DeviceDetector({
      clientIndexes: true,
      deviceIndexes: true,
      deviceAliasCode: false,
    });
    const deviceRes = detector.detect(userAgent);
    if (userExists) {
      let user_detail = {
        user_role_id: req.body.userRoleId ? parseInt(req.body.userRoleId) : null,
        department_id: parseInt(req.body.departmentId),
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        mobile: req.body.mobile,
        residential_phone: req.body.residentialPhone,
        gender: parseInt(req.body.gender),
        date_of_birth: req.body.dateOfBirth ? moment(req.body.dateOfBirth).format('YYYY-MM-DD HH:mm:ss z') : null,
        joining_date: req.body.joiningDate ? moment(req.body.joiningDate).format('YYYY-MM-DD HH:mm:ss z') : null,
        zip: req.body.zip,
        state: req.body.state,
        city: req.body.city,
        address1: req.body.address1,
        address2: req.body.address2,
        active_status: req.body.activeStatus ? parseInt(req.body.activeStatus) : 0,
        ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        device_id: deviceRes.device.type,
        os_platform: os.platform(),
        user_agent: userAgent,
        updated_by: owner_id
      }

      await userService.updateUser(org_user_id, user_detail, transaction)

      if (user_detail.user_role_id != userExists.user_role_id) {

        let roleDetails = await db.orgUserRolesModel.findByPk(user_detail.user_role_id, { include: { model: db.orgUserRolePermissionsModel, as: 'role_permission_details' }, transaction });
        roleDetails = helper.getJsonParseData(roleDetails)
        let orguserAccessPermissionData = []
        if (roleDetails.is_super_admin == 0) {
          roleDetails.role_permission_details.forEach(element => {
            orguserAccessPermissionData.push({
              org_id: element.org_id,
              org_user_id: userExists.org_user_id,
              org_module_id: element.org_module_id,
              org_sub_module_id: element.org_sub_module_id,
              permission_combination_id: element.permission_combination_id,
              created_by: req.tokenData.org_user_id
            })
          });
        } else {
          let queryOptions = {
            where: {
              org_id: userExists.org_id,
              s_admin_active_status: 1
            }
          }
          let orgSubmoduleList = await orgSubModuleService.getOrgSubModules(queryOptions)
          orgSubmoduleList.rows.forEach(element => {
            orguserAccessPermissionData.push({
              org_id: userExists.org_id,
              org_user_id: userExists.org_user_id,
              org_module_id: element.module_id,
              org_sub_module_id: element.org_sub_module_id,
              permission_combination_id: 9,
              created_by: req.tokenData.org_user_id
            })
          })
        }

        let permissionRes = await orgUserAccessPermissionsService.updateOrgUserAccessPermissions(org_user_id, orguserAccessPermissionData, transaction);
        // console.log('permissionRes',permissionRes);
        let deleteExistingLoginToken = await db.orgUserLoginActivitiesModel.destroy({ where: { org_user_id: userExists.org_user_id } });
      }
      transaction.commit()
      res.status(200).send({ status: 1, message: 'User information has been successfully updated.' })
    } else {
      res.status(200).send({ status: 0, message: "User not found" });
    }
  } catch (error) {
    transaction.rollback();
    next(error);
  }
}

/*****************************
 *  GET ALL USER
 ******************************/
exports.getOrgByAllUser = async (req, res, next) => {
  try {
    const org_id = req.body.orgId;
    let whereCond = {};
    if (org_id) {
      whereCond = {
        org_id: org_id,
        [Op.not]: [
          { org_user_id: req.tokenData.org_user_id },
        ]
      };
    } else {
      throw new CustomError('Something went wrong! Organaization not found')
    }
    // Extract the search term from the query parameters
    const searchingValue = req.query.search || '';
    let searchTimestamp = helper.searchTimeStamp(searchingValue) ? helper.searchTimeStamp(searchingValue) : {}
    const searchLastLogin = helper.isDate(searchingValue)
      ? {
        [Op.or]: [
          {
            last_login: {
              [Op.gte]: moment(searchingValue, 'MM-DD-YYYY').format(), // Format it to match the database format
            },
          },
        ],
      }
      : {};
    let nameQueryForSearch = searchingValue ? searchingValue.trim().split(" ") : [];
    let firstName = nameQueryForSearch[0]?.trim();
    let lastName = nameQueryForSearch[1]?.trim();
    const searchQuery = searchingValue ? {

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
        {
          email: {
            [Op.iLike]: `%${searchingValue}%`,
          },
        },
        {
          mobile: {
            [Op.iLike]: `%${searchingValue}%`,
          },
        },
        /* {
          zip: {
            [Op.iLike]: `%${searchingValue}%`,
          },
        },
        {
          state: {
            [Op.iLike]: `%${searchingValue}%`,
          },
        },
        {
          city: {
            [Op.iLike]: `%${searchingValue}%`,
          },
        },
        {
          address1: {
            [Op.iLike]: `%${searchingValue}%`,
          },
        }, */

      ],
      ...searchTimestamp,
      ...searchLastLogin,
    } : {};
    const activeStatus = req.query.active_status ? { active_status: parseInt(req.query.active_status) } : {};
    const department_id = req.query.filterDept ? { department_id: parseInt(req.query.filterDept) } : {};
    const user_role_id = req.query.filterrole ? { user_role_id: parseInt(req.query.filterrole) } : {};

    const sortField = req.query.sortField || 'org_user_id'; // Default to 'org_user_id'
    const sortOrder = req.query.sortOrder || 'ASC'; // Default to ascending order
    let order;
    if (sortField === 'department_details.department_name') {
      order = [[{ model: db.orgDepartmentsModel, as: 'department_details' }, 'department_name', sortOrder]];
    } else if (sortField === 'user_role_details.role_type') {
      order = [[{ model: db.orgUserRolesModel, as: 'user_role_details' }, 'role_type', sortOrder]];
    } else {
      // Default order when sortField doesn't match any associations
      order = [[sortField, sortOrder]];
    }
    let queryOptions = {
      where: {
        ...whereCond,
        ...searchQuery,
        ...activeStatus,
        ...user_role_id,
        ...department_id
      },
      attributes: { exclude: ['password', 'deleted_by', 'deleted_at', 'device_id', 'user_agent', 'os_platform', 'ip_address'] },
      include: [
        {
          model: db.organizationsModel,
          as: 'organization_details',

          attributes: ['org_id', 'org_name']
        },
        {
          model: db.orgDepartmentsModel,
          as: 'department_details',
          attributes: ['department_id', 'department_name']
        },
        {
          model: db.orgUserRolesModel,
          as: 'user_role_details',
          attributes: ['user_role_id', 'role_type']

        },
        {
          model: db.orgUserAccessPermissionsModel,
          as: 'accessable_module_submodules',
          required: false,
          // attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
          include: [
            {
              model: db.orgModulesModel,
              as: 'module_details',
              attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
              required: false,

            },
            {
              model: db.orgSubModulesModel,
              as: 'submod_details',
              attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
              required: false,

            },
            {
              model: db.permissionCombinationsModel, as: 'permission_details',
              attributes: ['combination'],
              required: false,
            },
          ],

        },
        {
          model: db.orgUsersModel,
          as: 'update_info',
          attributes: ['first_name', 'last_name'],
          required: false
        },
        {
          model: db.orgUsersModel,
          as: 'create_info',
          attributes: ['first_name', 'last_name'],
          required: false
        },
      ],
      order: order,
      distinct: true,
      // logging:console.log
    };
    // Check if 'limit' and 'offset' are provided in the request query
    if (res.pagination) {
      queryOptions.limit = res.pagination.limit
    }

    if (res.pagination) {
      queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
    }

    let userList = await userService.getAllUsers(queryOptions);
    //userList.rows = userList.rows.filter(e => e.org_user_id != req.tokenData.org_user_id);
    // Make accessable group by modules submodule 
    for (let i = 0; i < userList.rows.length; i++) {
      const response = userList.rows[i];
      const groupedData = {};


      response.accessable_module_submodules.forEach(item => {
        //console.log('item.module_details',item);

        if (item.module_details) {
          const moduleKey = item.module_details.org_module_id;
          // If the moduleKey doesn't exist in groupedData, create it
          if (!groupedData[moduleKey]) {
            groupedData[moduleKey] = {
              module_details: item.module_details,
              submodules: []
            };
          }
          item.submod_details.permission_combination_id = item.permission_combination_id;
          item.submod_details.permission_details = { ...item.permission_details, permission_combination_id: item.permission_combination_id }
          // Push the submodule_details to the submodules array
          groupedData[moduleKey].submodules.push({
            ...item.submod_details
          });
        }

      });
      // Convert the grouped data object into an array
      const finalGroupedData = Object.values(groupedData);
      // Now 'finalGroupedData' contains the data structure you want             
      userList.rows[i].accessable_module_submodules = finalGroupedData
    }

    if (res.pagination) {
      res.pagination.total = userList.count
      res.pagination.totalPages = Math.ceil(userList.count / queryOptions.limit)
    }
    if (userList.count > 0) {
      res.status(200).send({ status: 1, data: userList.rows, pagination: res.pagination, message: 'User list found successfully' })
    } else {
      res.status(200).send({ status: 1, data: userList.rows, pagination: res.pagination, message: 'No User found' })
    }

  } catch (error) {
    console.log(error);
    next(error)
  }
}

/*****************************
 *  GET USER BY ID
 ******************************/
exports.getUserById = async (req, res, next) => {
  try {
    const { org_user_id } = req.params;
    const userExists = await userService.findUserById(parseInt(org_user_id));
    if (!userExists) {
      res.status(200).send({ status: 0, message: "User not found" });
    } else {
      res.status(200).send({ status: 1, data: userExists, message: 'User data fetch sucessfully.' });
    }
  } catch (error) {
    console.log(error);
    next(error)
  }
}


/*****************************
 *  GET USER BY NAME
 ******************************/
exports.getUserByName = async (req, res, next) => {
  try {
    let activeStatus = 1;
    const searchingValue = req.query.search || '';
    let searchQuery = searchingValue ? {
      [Op.or]: [
        {
          first_name: {
            [Op.iLike]: `%${searchingValue}%`,
          },
        },
        {
          last_name: {
            [Op.iLike]: `%${searchingValue}%`,
          },
        },
      ]
    } : {};
    let queryOptions = {
      where: { ...searchQuery },
      attributes: { exclude: ['deleted_by', 'deleted_at',] },
      include: [
        {
          model: db.orgUserLoginActivitiesModel,
          as: 'login_activities',
          attributes: ['ip_address']
        }
      ],
    };

    if (activeStatus) {
      queryOptions.where[Op.and] = [
        { active_status: activeStatus }
      ];
    }

    let allUser = await userService.findUserByName(req, res, next, queryOptions);

    if (allUser.length > 0) {
      res.status(200).send({ status: 1, data: allUser, pagination: res.pagination, message: 'Whitelist IP found successfully' })
    } else {
      res.status(200).send({ status: 1, data: allUser, message: 'No Whitelist IP found' })
    }
  } catch (error) {

    next(error)
  }
}



/*****************************
 *  TOGGLE USER ACTIVATION
 ******************************/
exports.toggleUserActivation = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();

  try {
    const org_user_id = req.params.org_user_id
    if (!org_user_id) {
      throw new CustomError('User not found', 400)
    }

    const userExists = await userService.findUserById(org_user_id);

    if (!userExists) {
      res.status(200).send({ status: 0, message: "User not found" });
    } else {
      const data = {
        active_status: req.body.activeStatus,
        updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
      };
      const userToggleStatus = await userService.togglUserActiveStatus(data, org_user_id, transaction);
      if (userToggleStatus) {
        transaction.commit();
        res.status(200).send({
          status: 1, message: `User ${userExists.first_name} successfully ${req.body.activeStatus == 1 ? 'enabled' : 'disabled'}.`
        });
      } else {
        res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
      }
    }
  } catch (error) {
    next(error);
    transaction.rollback();

  }
}

/*****************************
 * UPDATE DEPARTMENT ACTIVE STATUS
 ******************************/
exports.updateOrgUserActiveStatus = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const org_user_id = req.params.org_user_id
    const data = {
      active_status: req.body.activeStatus ? parseInt(req.body.activeStatus) : null,
      updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
    };
    const updateStatus = await userService.togglUserActiveStatus(data, org_user_id, transaction);
    if (updateStatus) {
      transaction.commit();
      res.status(200).send({
        status: 1, message: `User successfully ${req.body.activeStatus == 1 ? 'enabled' : 'disabled'}.`
      });
    } else {
      res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
    }
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}
/*****************************
 *  DELETE USER 
 ******************************/
exports.deleteUser = async (req, res, next) => {
  try {
    const { org_user_id } = req.params;
    const ownerId = req.tokenData.org_user_id
    const userExists = await userService.findUserById(org_user_id);
    if (!userExists) {
      res.status(200).send({ status: 0, message: "User not found" });
    } else {
      const deleteUser = await userService.deleteUser(userExists, ownerId);
      if (deleteUser) {
        res.status(200).send({ status: 1, message: 'User deleted sucessfully.' });
      } else {
        res.status(200).send({ status: 0, message: 'Unable to delete User.' });
      }
    }
  } catch (error) {
    next(error);
  }
}

/*****************************
 *  USER LOGOUT
 ******************************/
exports.logOut = async (req, res) => {
  try {
    const token = req.tokenData.token;
    const tokeRes = await db.orgUserLoginActivitiesModel.destroy({
      where: {
        token: token
      }
    })
    if (tokeRes == 1) {
      res.status(200).send({ status: 1, message: 'Log out Successfully' })
    } else {
      res.status(200).send({ status: 0, message: 'Something went wrong' })
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }

}




/*****************************
 *  GET ORG USER
 ******************************/
exports.getAllOrgUser = async (req, res, next) => {

  try {
    let orgId = req.query.org_id;
    let whereCond = {};
    if (orgId !== '') {
      whereCond = {
        org_id: orgId
      };
    }
    let limit = res.pagination.limit
    let offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * limit)
    let allUser = await db.orgUsersModel.findAndCountAll({
      where: whereCond,
      order: [
        ['created_at', 'ASC']
      ],
      //  attributes: ['user_id', 'user_role_id', 'department_id', 'first_name', 'last_name', 'email', 'mobile', 'residential_phone', 'gender', 'date_of_birth', 'joining_date', 'zip', 'state', 'city', 'address1', 'address2', 'active_status', 'access_activation', 'access_activation_exp_time', 'login_otp_created_at', 'last_login', 'updated_at'],
      offset: offset, limit: limit
    })
    res.pagination.total = allUser.count
    res.pagination.totalPages = Math.ceil(allUser.count / limit)
    res.status(200).send({ status: 1, data: allUser.rows, pagination: res.pagination, message: 'UserList found Successfully' })
  } catch (error) {
    console.log(error);
    next(error)
  }
}
exports.updateOrgUserProfieImage = async (req, res, next) => {
  try {
    let org_user_id = null
    if (req.params.org_user_id) {
      org_user_id = req.params.org_user_id
      if (req.file) {

        var image = req.file.filename ? `${req.file.filename}` : null
        req.body.profile_image = image
        let data = {
          profile_image: req.body.profile_image,
          //updated_by: req.tokenData.user_id
        }
        let orgUsersRes = await db.orgUsersModel.update(data,
          { where: { org_user_id: org_user_id } }
        )
        if (orgUsersRes[0] == 1) {
          res.status(200).send({ status: 1, message: 'Successfully updated profile image.' })
        } else {
          throw new CustomError('Failed to update profile image.', 500)
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

exports.updateOrgUserProfie = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    let { org_user_id } = req.tokenData
    let profileData = {
      first_name: req.body.first_name ? req.body.first_name : null,
      last_name: req.body.last_name ? req.body.last_name : null,
      mobile: req.body.mobile ? req.body.mobile : null,
      gender: req.body.gender ? req.body.gender : null,
      date_of_birth: req.body.date_of_birth ? req.body.date_of_birth : null,
      zip: req.body.zip ? req.body.zip : null,
      city: req.body.city ? req.body.city : null,
      state: req.body.state ? req.body.state : null,
      address1: req.body.address1 ? req.body.address1 : null,
      address2: req.body.address2 ? req.body.address2 : null,

    }
    let orgUsersRes = await userService.updateUser(org_user_id, profileData, transaction)
    transaction.commit()
    if (orgUsersRes[0] == 1) {
      res.status(200).send({ status: 1, message: 'Successfully updated profile information.' })
    } else {
      throw new CustomError('Failed to update profile information.', 500)
    }


  } catch (error) {
    transaction.rollback()
    next(error)
  }
}

exports.getAllUsersList = async (req, res, next) => {
  try {
    const org_id = req.body.orgId;
    let whereCond = {};
    if (org_id) {
      whereCond = {
        org_id: org_id,
        [Op.not]: [
          { org_user_id: req.tokenData.org_user_id },
        ]
      };
    } else {
      throw new CustomError('Something went wrong! Organaization not found')
    }

    let queryOptions = {
      where: {
        ...whereCond,
      },
      attributes: { exclude: ['password', 'deleted_by', 'deleted_at', 'device_id', 'user_agent', 'os_platform', 'ip_address'] },
      distinct: true,
    };

    let userList = await userService.getAllUsers(queryOptions);

    if (userList.count > 0) {
      res.status(200).send({ status: 1, data: userList.rows, pagination: res.pagination, message: 'User list found successfully' })
    } else {
      res.status(200).send({ status: 1, data: userList.rows, pagination: res.pagination, message: 'No User found' })
    }

  } catch (error) {
    console.log(error);
    next(error)
  }

}
exports.simpleUsersList = async (req, res, next) => {
  try {
    const org_id = req.tokenData.org_id;
    const activeStatus = req.query.active_status ? { active_status: parseInt(req.query.active_status)?parseInt(req.query.active_status):1 } : {};
   //let roleQuery = {user_role_id: helper.userRole.sales_representative}
   // if (req.tokenData.user_role_id == helper.userRole.sales_manager) {
    let  roleQuery = {
          [Op.or]: 
            [{
                user_role_id: helper.userRole.sales_representative,
              },
              {
                user_role_id: helper.userRole.sales_manager,
            }]
        }
    //}
    let whereCond = {};
    if (org_id) {
      whereCond = {
        org_id: org_id,
        ...roleQuery,
        ...activeStatus
      };
    } else {
      throw new CustomError('Something went wrong! Organaization not found')
    }
    let queryOptions = {
      where: {
        ...whereCond,
      },
      attributes: { exclude: ['password', 'deleted_by', 'deleted_at', 'device_id', 'user_agent', 'os_platform', 'ip_address'] },
      distinct: true,
    };

    let userList = await userService.getAllUsers(queryOptions);

    if (userList.count > 0) {
      res.status(200).send({ status: 1, data: userList.rows, pagination: res.pagination, message: 'User list found successfully' })
    } else {
      res.status(200).send({ status: 1, data: userList.rows, pagination: res.pagination, message: 'No User found' })
    }

  } catch (error) {
    console.log(error);
    next(error)
  }

}





require("dotenv").config();
const config = require("../../../config/config");
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index')
const moment = require("moment");
const bcrypt = require('bcryptjs');
const moduleService = require("../../../services/v1/admin/moduleService");
const url = require('url');
const querystring = require('querystring');
const { Op } = require("sequelize");
//const model =db.sequelize.models// Object.keys(db.sequelize.models);
/*****************************
 *  CREATE MODULE
 ******************************/
exports.createModule = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const data = {
      module_name: req.body.moduleName,
      descriptions: req.body.descriptions ? req.body.descriptions : null,
      icon: req.body.icon,
      sequence: req.body.sequence ? parseInt(req.body.sequence) : null,
      route_path: req.body.route_path ? req.body.route_path : null,
      active_status: parseInt(req.body.activeStatus),
      created_by: req.tokenData.system_administrator_id ? parseInt(req.tokenData.system_administrator_id) : null,
      updated_by: null,
      deleted_by: null
    };
    const createdModule = await moduleService.createModule(data, transaction);
    if (createdModule) {
      transaction.commit();
      res.status(200).send({
        status: 1,
        message: "Module created Successfully.",
      });
    }
  } catch (error) {
    next(error);
    await transaction.rollback();

  }
}

/*****************************
 *  UPDATE MODULE
 ******************************/
exports.updateModule = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { module_id } = req.params;
    const owner_id = req.tokenData.system_administrator_id
    const moduleExists = await moduleService.findModuleById(parseInt(module_id),);
    if (moduleExists) {
      let payLoadData = {
        moduleName: req.body.moduleName ? req.body.moduleName : null,
        descriptions: req.body.descriptions ? req.body.descriptions : null,
        icon: req.body.icon ? req.body.icon : null,
        route_path: req.body.route_path ? req.body.route_path : null,
        sequence: req.body.sequence ? parseInt(req.body.sequence) : null,
        activeStatus: req.body.activeStatus ? parseInt(req.body.activeStatus) : moduleExists.active_status,
      }
      // console.log(payLoadData);
      for (let key in payLoadData) {
        // Check if the key exists in req.body
        if (!(key in req.body)) {
          // If key is not present in req.body, delete it from module_detail
          delete payLoadData[key];
        }
      }
      let module_detail = {
        module_name: payLoadData?.moduleName || moduleExists.moduleName,
        descriptions: payLoadData?.descriptions || moduleExists.descriptions,
        icon: payLoadData?.icon || moduleExists.icon,
        route_path:payLoadData?.route_path|| moduleExists.route_path,
        sequence: payLoadData.sequence || moduleExists.sequence,
        active_status: payLoadData.activeStatus,
        deleted_by: null,
        updated_by: req.tokenData.system_administrator_id ? parseInt(req.tokenData.system_administrator_id) : null
      }

      let updateRes = await moduleService.updateModule(module_id, module_detail, transaction)
      let org_module_detail = {
        org_module_name: payLoadData?.moduleName || moduleExists.moduleName,
        org_module_slug:payLoadData?.moduleName.toLowerCase().replace(/ /g, '-')|| moduleExists.module_slug,
        descriptions: payLoadData?.descriptions || moduleExists.descriptions,
        icon: payLoadData?.icon || moduleExists.icon,
        route_path:payLoadData?.route_path|| moduleExists.route_path,
        sequence: payLoadData.sequence || moduleExists.sequence,
        deleted_by: null,
        updated_by:  null
      }
      let orgModuleUpdateRes = await db.orgModulesModel.update(org_module_detail, { where: { module_id: module_id }, transaction })
      transaction.commit()
      if (updateRes[0] != 0) {
        res.status(200).send({ status: 1, message: 'Module information has been successfully updated.' })
      } else {
        transaction.rollback();
        throw new CustomError(`It briefly explains that there was an issue with updating Module.`, 400)
      }
    } else {
      res.status(200).send({ status: 0, message: "Module not found" });
    }
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}


/*****************************
 *  GET ALL MODULES
 ******************************/
exports.getAllModule = async (req, res, next) => {
  try {
    let parsedUrl = url.parse(req.url);
    let parsedQs = querystring.parse(parsedUrl.query);
    const moduleName = parsedQs.moduleName ? parsedQs.moduleName : ''
    let activeStatus = parsedQs.active_status ? parsedQs.active_status : '';
    let statusCondition = {};
    if (activeStatus !== '') {
      statusCondition = {
        active_status: activeStatus
      };
    }
    let limit = res.pagination.limit
    let offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * limit);

    let allModules = await db.modulesModel.findAndCountAll({
      where: {
        [Op.or]: [{
          module_name: {
            [Op.like]: `%${moduleName}%`
          },
          ...statusCondition
        }]
      },

      order: [
        ['created_at', 'ASC']
      ],
      offset: offset, limit: limit
    })
    res.pagination.total = allModules.count
    res.pagination.totalPages = Math.ceil(allModules.count / limit)
    if (allModules.count > 0) {
      res.status(200).send({ status: 1, data: allModules.rows, pagination: res.pagination, message: 'Module list found successfully' })
    } else {
      res.status(200).send({ status: 1, data: allModules.rows, pagination: res.pagination, message: 'No Module found' })
    }

  } catch (error) {
    console.log(error);
    next(error)
  }
}


/*****************************
 *  GET MODULE BY ID
 ******************************/
exports.getModuleById = async (req, res, next) => {
  try {
    const { module_id } = req.params;
    const moduleExists = await moduleService.findModuleById(parseInt(module_id),);
    if (!moduleExists) {
      res.status(200).send({ status: 0, message: "Module not found" });
    } else {
      res.status(200).send({ status: 1, data: moduleExists, message: 'Module data fetch sucessfully.' });
    }
  } catch (error) {
    console.log(error);
    next(error)
  }
}

/*****************************
 *  TOGGLE MODULE STATUS
 ******************************/
exports.toggleModuleStatus = async (req, res, next) => {
  try {
    const { module_id } = req.params;
    const owner_id = req.tokenData.system_administrator_id
    const moduleExists = await moduleService.findModuleById(parseInt(module_id));
    if (moduleExists) {
      let module_detail = {
        active_status: parseInt(req.body.activeStatus),
        updated_by: req.tokenData.system_administrator_id ? parseInt(req.tokenData.system_administrator_id) : null,
      }
      const transaction = await db.sequelize.transaction(async (t) => {
        await db.modulesModel.update(
          { updated_by: owner_id },
          { where: { module_id: module_id }, transaction: t })

        await db.modulesModel.update(module_detail, { where: { module_id: module_id }, transaction: t })
        res.status(200).send({ status: 1, message: `Module successfully ${req.body.activeStatus ? 'enabled' : 'disabled'}.` })

      });


    } else {
      res.status(200).send({ status: 0, message: "Module not found" });
    }
  } catch (error) {
    next(error);
  }
}

/*****************************
 *  DELETE MODULE
 ******************************/
exports.deleteModule = async (req, res, next) => {
  try {
    const { module_id } = req.params;
    const ownerId = req.tokenData.user_id
    const moduleExists = await moduleService.findModuleById(module_id);

    if (!moduleExists) {
      res.status(200).send({ status: 0, message: "Module not found" });
    } else {
      const deleteModule = await moduleService.deleteModule(moduleExists, ownerId);
      if (deleteModule) {
        res.status(200).send({ status: 1, message: 'Module deleted sucessfully.' });
      } else {
        res.status(200).send({ status: 0, message: 'Unable to delete Module.' });
      }
    }
  } catch (error) {
    next(error);
  }
}




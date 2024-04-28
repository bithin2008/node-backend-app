require("dotenv").config();
const config = require("../../../config/config");
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index')
const moment = require("moment");
const orgSubmoduleService = require("../../../services/v1/admin/orgSubModuleService");
const url = require('url');
const querystring = require('querystring');
const { Op } = require("sequelize");
const orgModuleSubmodulePermissionService = require("../../../services/v1/admin/orgModuleSubmodulePermissionService");

exports.setOrgModuleSubModulePermission = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
      let payload = req.body.selectedModuleSubModules? req.body.selectedModuleSubModules:null
      let  setRes= await orgModuleSubmodulePermissionService.createOrgModuleSubModulePermission(req, res, next,payload,transaction);
      if (setRes) {
        transaction.commit();
        res.status(200).send({  status: 1,   message: "Organaization module-submodule permission saved successfully ." }); 
    }else{
        throw new CustomError(`Something went wrong,Database error occured `,500)
    }
    } catch (error) {
      next(error);
      await transaction.rollback();
  
    }
}

exports.getOrgSubModuleList= async(req,res,next)=>{
    try {
        if (!req.params.org_id) {
            throw new CustomError(`Bad request`,400)
        }
        let queryOptions={
            where:{
                org_id:req.params.org_id,
                s_admin_active_status:1
            }
        }
        let orgSubmoduleList = await orgSubmoduleService.getOrgSubModules(queryOptions)

        res.status(200).send({status:1,data:orgSubmoduleList.rows,message:`Organaization Submodule list found successfully.`})
    } catch (error) {
        console.log(error);
        next(error);
    }
}

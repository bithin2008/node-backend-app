
const db = require('../../../models/index');
const helper = require('../../../common/helper');
const CustomError = require('../../../utils/customErrorHandler');
const {Op} = require("sequelize");



//CREATE DEPARTMENTS
exports.createDepartment = async (obj, transaction) => {
    try {
        isExistDepartmentName = await db.orgDepartmentsModel.findAll({ where: { org_id: obj.org_id, department_name: obj.department_name } })
        if (isExistDepartmentName.length == 0) {
            let createDepartment = await db.orgDepartmentsModel.create(obj, { transaction });
            createDepartment = createDepartment ? helper.getJsonParseData(createDepartment) : createDepartment
            return createDepartment;
        } else { throw new CustomError(`Department name is already exist on this organaization`, 400) }

    } catch (e) {
        console.log(e);
        throw e
    }
}

//UPDATE DEPARTMENTS
exports.updateDepartment = async (obj, department_id, transaction) => {
    try {
        isExistDepartmentName = await db.orgDepartmentsModel.findAll({ where: {  [Op.not]: [  { department_id: department_id }, ],org_id:obj.org_id, department_name: obj.department_name } })
        if (isExistDepartmentName.length == 0) {
        let updateDepartment = await db.orgDepartmentsModel.update(obj, { where: { department_id }, transaction });
        return updateDepartment[0]!=0?true:false;
    } else { throw new CustomError(`Department name is already exist on this organaization`, 400) }

    } catch (e) {
        console.log(e); 
        throw e
    }
}
//UPDATE DEPARTMENTS
exports.updateDepartmentActiveStatus = async (obj, department_id, transaction) => {
    try {
        let isExistDepartmentOnOrgUsers= await db.orgUsersModel.findAll({where:{department_id},transaction})
       // console.log('isExistDepartmentOnOrgUsers',isExistDepartmentOnOrgUsers);
        if (isExistDepartmentOnOrgUsers.length>0) {
          throw new CustomError(`This department is already use in user. You cannot change the active status`,400)  
        }
        let updateDepartment = await db.orgDepartmentsModel.update(obj, { where: { department_id }, transaction });
        return updateDepartment;
    } catch (e) {
        console.log(e); 
        throw e
    }
}

//DELETE DEPARTMENTS
exports.deleteDepartment = async (department_id, transaction) => {
    try {
        let isExistDepartmentOnOrgUsers= await db.orgUsersModel.findAll({where:{department_id},transaction})
        if (isExistDepartmentOnOrgUsers.length>0) {
            throw new CustomError(`This department is already use in user. You cannot delete this`,400)  
        }
        let deleteModule = await db.orgDepartmentsModel.destroy({
            where: {
                department_id: department_id
            }, transaction
        })
        return deleteModule;
    } catch (e) {
        console.log(e);
    }
}
//GET ALL DEPARTMENTS
exports.getallDepartments = async (req, res, next, queryOptions={}) => {
    try {
        let allDepartments = await db.orgDepartmentsModel.findAndCountAll(queryOptions)
        allDepartments = allDepartments ? helper.getJsonParseData(allDepartments) : allDepartments
        return allDepartments;

    } catch (e) {
        console.log(e);
    }
}

const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');


exports.getAllSubModule = async (req, res, next,queryOptions) => {
    try {
        let allSubModules = await db.subModulesModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(allSubModules)
    } catch (e) {
        console.log(e);
        throw e
    }
}



//FIND SUB MODULE BY ID
exports.findSubModuleById = async (val) => {
    try {
        let subModule = await db.subModulesModel.findOne({ where: { sub_module_id: val } });
        return subModule;
    } catch (e) {
        console.log(e);
    }
}

//CREATE SUB MODULE
exports.createSubModule = async (obj, transaction) => {
    try {
        obj.sub_module_slug= obj.sub_module_name.toLowerCase().replace(/ /g, '-');
        let createdSubModule = await db.subModulesModel.create(obj, { transaction });
        return createdSubModule;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}
//UPDATE SUB MODULE
exports.updateSubModule = async (sub_module_id,sub_module_detail, transaction) => {
    try {
        sub_module_detail.sub_module_slug=sub_module_detail.sub_module_name.toLowerCase().replace(/ /g, '-');
       let updateRes=await db.subModulesModel.update(sub_module_detail, { where: { sub_module_id: sub_module_id }, transaction})
        return updateRes;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}


//DELETE SUB MODULE
exports.deleteSubModule = async (val, ownerId) => {
    try {
        let deleteSubModule = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.subModulesModel.update(
                { deleted_by: ownerId },
                { where: { sub_module_id: val.sub_module_id }, transaction: t }
            )


            deleteSubModule = await db.subModulesModel.destroy({
                where: {
                    sub_module_id: val.sub_module_id
                }, transaction: t
            })
        });
        return deleteSubModule;
    } catch (e) {
        console.log(e);
        // throw Error('Error while fetching User')
    }
}

exports.togglUserActvation = async (obj) => {
    try {
        var user = await db.userModel.update({ where: { email: val } });

        let updateRes = await db.userModel.update({ active_status: obj.activeStatus }, {
            where: {
                email: obj.emailId
            },
            transaction: t
        })
        return user;
    } catch (e) {
        throw Error('Error while fetching User')
    }
}




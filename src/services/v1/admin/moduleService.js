const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');

//FIND Module By ID 
exports.findModuleById = async (val) => {
    try {
        var module = await db.modulesModel.findOne({ where: { module_id: val } });
        return module;
    } catch (e) {
        console.log(e);
    }
}

//CREATE MODULE
exports.createModule = async (obj,transaction) => {
    try {
        let createdModule = await db.modulesModel.create(obj,{transaction});
        return createdModule;  
    } catch (e) {
        console.log(e);
        throw e
       // throw Error('Error while creating module')
    }
}
//UPDATE SUB MODULE
exports.updateModule = async (module_id,module_detail, transaction) => {
    try {
        module_detail.module_slug=module_detail.module_name.toLowerCase().replace(/ /g, '-');
       let updateRes= await db.modulesModel.update(module_detail, { where: { module_id: module_id }, transaction})

        return updateRes;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//DELETE MODULE
exports.deleteModule = async (val, ownerId) => {
    try {
        let deleteModule = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.modulesModel.update(
                { deleted_by: ownerId },
                { where: { module_id: val.module_id }, transaction: t }
            )


            deleteModule = await db.modulesModel.destroy({
                where: {
                    module_id: val.module_id
                }, transaction: t
            })          
        });
        return deleteModule;
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




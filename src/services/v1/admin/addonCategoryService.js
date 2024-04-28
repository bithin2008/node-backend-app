const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');

//FIND USER BY EMAIL ADDRESS
exports.findAddonCategoryById = async (val) => {
    try {
        var addonCategory = await db.addonCategoriesModel.findOne({ where: { addon_category_id: val } });
        return addonCategory;
    } catch (e) {
        console.log(e);
    }
}


//DELETE ADDON CATEGORY
exports.deleteAddonCategory = async (val, ownerId) => {
    try {
        let deleteAddonCategory = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.addonCategoriesModel.update(
                { deleted_by: ownerId },
                { where: { addon_category_id: val.addon_category_id }, transaction: t }
            )


            deleteAddonCategory = await db.addonCategoriesModel.destroy({
                where: {
                    addon_category_id: val.addon_category_id
                }, transaction: t
            })

            await db.sequelize.query(
                `SET CONSTRAINTS ALL DEFERRED;`,
                {
                    transaction: t
                }
            );
        });
        return deleteAddonCategory;
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




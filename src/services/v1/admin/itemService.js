const db = require('../../../models/index');
const helper = require('../../../common/helper');
const CustomError = require('../../../utils/customErrorHandler');

//FIND USER BY EMAIL ADDRESS
exports.findItemById = async (val) => {
    try {
        var item = await db.itemsModel.findOne({ where: { item_id: val } });
        return item;
    } catch (e) {
        console.log(e);
    }
}


//DELETE ITEM
exports.deleteItem = async (val, ownerId) => {
    try {
        let deleteItem = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.itemsModel.update(
                { deleted_by: ownerId },
                { where: { item_id: val.item_id }, transaction: t }
            )


            deleteItem = await db.itemsModel.destroy({
                where: {
                    item_id: val.item_id
                }, transaction: t
            })

            await db.sequelize.query(
                `SET CONSTRAINTS ALL DEFERRED;`,
                {
                    transaction: t
                }
            );
        });
        return deleteItem;
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




const db = require('../../../models/index');
const helper = require('../../../common/helper');


//SUBMIT CAREER
exports.submitContact = async (obj, transaction) => {
    try {
        let submitContact = await db.contactsModel.create(obj, { transaction });
        return submitContact;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

//GET ALL CAREER
exports.getAllConatcts = async (queryOptions = {}) => {
    try {
        let allContacts = await db.contactsModel.findAndCountAll(queryOptions);   
        return allContacts ? helper.getJsonParseData(allContacts) : null
    } catch (e) {
        console.log(e);
        throw e
    }
}

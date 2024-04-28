
const db = require('../../../models/index');
const helper = require('../../../common/helper');
const {Op} = require("sequelize");

//GET ALL ORGANIZATIONS
exports.getallOrganizations = async (req, res, next,offset,limit) => {
    try {
        let allOrganizations = await db.organizationsModel.findAndCountAll({
            attributes:{ exclude: ['created_by','updated_by','deleted_by','created_at','updated_at','deleted_at']},
            // where: whereClause, // Apply the search criteria
            // order: order, // Apply the sorting order
            offset: offset,
            limit: limit,
            order: [
                ['org_id', 'ASC'], // Sort by the 'createdAt' column in descending order
                // You can add more columns here for multi-level sorting
              ],
        })
        allOrganizations = allOrganizations ? helper.getJsonParseData(allOrganizations) : allOrganizations
        allOrganizations.rows.forEach(element => {
            if (element.logo)
            element.logo=`${helper.api_baseurl}/org_file/hws_${element.org_id}/media_content/${element.logo}`;
            if (element.tiny_logo){
                element.tiny_logo=`${helper.api_baseurl}/org_file/hws_${element.org_id}/media_content/${element.tiny_logo}`;
            }
            if (element.favicon) {
                element.favicon=`${helper.api_baseurl}/org_file/hws_${element.org_id}/media_content/${element.favicon}`;
            }
        });
        return allOrganizations;
        
    } catch (e) {
        console.log(e);
        throw e
    }
}

exports.updateOrganizations = async (req, res, next,payLoad,org_id,transaction) => {
    try {
        let updateRes = await db.organizationsModel.update(payLoad,{
           where:{
            org_id:org_id
           },
           transaction
        })
        return updateRes;
        
    } catch (e) {
        console.log(e);
        throw e
    }
}
exports.isExistOrganizations =async(req, res, next,payLoad,org_id) => {
    try {
        const isExist = await db.organizationsModel.findAll({
            where: {
                org_name:payLoad.org_name,
                [Op.not]: [
                    { org_id: org_id },
                ]
            },
        });
        return isExist;
        
    } catch (e) {
        console.log(e);
        throw e
    }
}
//FIND Module By ID 
exports.findOrganizationById = async (val) => {
    try {
        var org = await db.organizationsModel.findOne({ where: { org_id: val } });
        return org;
    } catch (e) {
        console.log(e);
    }
}
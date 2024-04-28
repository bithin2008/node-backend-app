const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');
const fs = require('fs');

//GET ALL PLANS
exports.getAllMarketLeaders = async (req,queryOptions) => {
    try {
        let allmarketLeaders = await db.marketLeadersModel.findAndCountAll(queryOptions);
        allmarketLeaders.rows.forEach((element) => { 
            element.image = element.image?`${helper.api_baseurl}/org_file/hws_${req.tokenData ? req.tokenData.org_id : parseInt(req.headers.org_id)}/media_content/market-leaders/${element.image}`:null;          
        });
        return helper.getJsonParseData(allmarketLeaders);
      } catch (e) {
        console.log(e);
        throw e;
      }
}



//FIND POST By ID 
exports.findMarketLeaderById = async (val) => {
    try {
        let blog = await db.marketLeadersModel.findOne({ where: { market_leader_id: val } });
        return blog;
    } catch (e) {
        console.log(e);
    }
}

//FIND POST BY SLUG
exports.findMarketLeaderBySlug = async (req, res, next, queryOptions) => {
    try {
        let blog = await db.marketLeadersModel.findOne(queryOptions);
        return helper.getJsonParseData(blog);
    } catch (e) {
        console.log(e);
    }
}



//FIND POST BY CATEGORY
exports.findMarketLeadersByCategory= async (req, res, next, queryOptions) => {
    try {
        let blog = await db.marketLeadersModel.findAll(queryOptions);
        return helper.getJsonParseData(blog);
    } catch (e) {
        console.log(e);
    }
}

//FIND NEXT PREVIOUS POST
exports.findPreviousMarketLeader= async (req, res, next, queryOptions) => {
    try {
        let blog = await db.marketLeadersModel.findAll(queryOptions);
        return helper.getJsonParseData(blog);
    } catch (e) {
        console.log(e);
    }
}

//FIND NEXT PREVIOUS POST
exports.findNextMarketLeader= async (req, res, next, queryOptions) => {
    try {
        let blog = await db.marketLeadersModel.findAll(queryOptions);
        return helper.getJsonParseData(blog);
    } catch (e) {
        console.log(e);
    }
}

//DELETE POST
exports.deleteMarketLeader = async (val, ownerId) => {
    try {
        let deleteMarketLeader = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.marketLeadersModel.update(
                { deleted_by: ownerId },
                { where: { market_leader_id: val.market_leader_id }, transaction: t }
            )


            deleteMarketLeader = await db.marketLeadersModel.destroy({
                where: {
                    market_leader_id: val.market_leader_id
                }, transaction: t
            })
        });
        return deleteMarketLeader;
    } catch (e) {
        console.log(e);
        // throw Error('Error while fetching User')
    }
}

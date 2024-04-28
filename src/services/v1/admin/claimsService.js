
const db = require('../../../models/index');
const helper = require('../../../common/helper');
const CustomError = require('../../../utils/customErrorHandler');
const {Op} = require("sequelize");

exports.createClaim =async(obj,transaction)=>{
    try {
      let createdClaim=  await db.claimsModel.create(obj,{transaction})
      return createdClaim?helper.getJsonParseData(createdClaim):null
    } catch (error) {
        throw error
    }
}

exports.getAllClaims =async(queryOptions={})=>{
    try {
        let claims =await db.claimsModel.findAndCountAll(queryOptions)
        return claims.length>0?helper.getJsonParseData(claims):claims
    } catch (error) {
        throw(error)
    }
}
exports.getClaimDetails =async(queryOptions)=>{
    try {
        let claims =await db.claimsModel.findOne(queryOptions)
        return claims?helper.getJsonParseData(claims):claims
    } catch (error) {
        throw(error)
    }
}
exports.updateClaim =async(claim_id,obj,transaction)=>{
    try {
        let updateClaims =await db.claimsModel.update(obj,{where:{claim_id:claim_id},transaction})
        return updateClaims[0]==1?true:false
    } catch (error) {
        throw(error)
    }
}

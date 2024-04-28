const express=require("express");
const jwt=require('jsonwebtoken');
const db = require("../models/index");

/* const verifyAuthToken= async (req, res, next)=> {
    const authHeader = req.headers['authorization']; 
    const token = authHeader && authHeader.split(' ')[1];
    if (token==null)
    return res.status(401).send({status:0,message:"User not authorized"});

    jwt.verify(token,process.env.ACCESS_TOKEN, async (err,response)=>{       
        if(err){
            console.log('err token',token);
            console.log('err',err);
            if (err.message=='jwt expired') {             
                await db.orgUserLoginActivitiesModel.destroy({ where: { token: token} });  
            } 
            return res.status(498).send({status:0,message:'Invalid Access Token'});
        } else{
            if(response.hasOwnProperty('system_administrator_id')){
                return res.status(498).send({status:0,message:'Invalid Access Token'});
            }else{
                let isExist =await db.orgUserLoginActivitiesModel.findOne({ where: { token: token ,org_user_id:response.org_user_id} });
                isExist = JSON.parse(JSON.stringify(isExist))
                if (isExist) {
                    req.tokenData=response;
                    req.body.orgId=response.org_id
                    req.tokenData['token']=token;
                    req.tokenData['source']=1;// backend Team
                    next()
                }else{
                    return res.status(498).send({status:0,message:'Invalid Access Token'});
                }
            }  
        }   
    })
    
}
 */
const verifyAuthToken = async (req, res, next) => {
    const authHeader = req.headers['authorization']; 
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).send({ status: 0, message: "User not authorized" });

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        if (decoded.hasOwnProperty('system_administrator_id')) {
            return res.status(498).send({ status: 0, message: 'Invalid Access Token' });
        } else {
            let isExist = await db.orgUserLoginActivitiesModel.findOne({ where: { token: token, org_user_id: decoded.org_user_id } });
            isExist = JSON.parse(JSON.stringify(isExist));
            if (isExist) {
                req.tokenData = decoded;
                req.body.orgId = decoded.org_id;
                req.tokenData['token'] = token;
                req.tokenData['source'] = 1; // backend Team
                next();
            } else {
                return res.status(498).send({ status: 0, message: 'Invalid Access Token' });
            }
        }
    } catch (error) {
        console.log('Error verifying token:', error);
        if (error.message === 'jwt expired') {
            try {
                await db.orgUserLoginActivitiesModel.destroy({ where: { token: token } });
            } catch (dbError) {
                console.log('Error deleting token from DB:', dbError);
            }
        }
        return res.status(498).send({ status: 0, message: 'Invalid Access Token' });
    }
}

module.exports=verifyAuthToken;
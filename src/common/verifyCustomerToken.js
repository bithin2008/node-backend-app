const express=require("express");
const jwt=require('jsonwebtoken');
const db = require("../models/index");

const verifyCustomerToken= async (req, res, next)=> {
    const authHeader = req.headers['authorization']; 
    const token = authHeader && authHeader.split(' ')[1];
    if (token==null)
    return res.status(401).send({status:0,message:"Customer not authorized"});

    jwt.verify(token,process.env.ACCESS_TOKEN, async (err,response)=>{       
        if(err){
            console.log('err',err);
            if (err.message=='jwt expired') {             
                await db.orgCustomerLoginActivitiesModel.destroy({ where: { token: token} });  
            } 
            return res.status(498).send({status:0,message:'The access token is invalid. Please log in again.'});
        } else{
            if(response.hasOwnProperty('customer_token')){
                return res.status(498).send({status:0,message:'The access token is invalid. Please log in again.'});
            }else{
                let isExist =await db.orgCustomerLoginActivitiesModel.findOne({ where: { token: token ,customer_id:response.customer_id} });
                isExist = JSON.parse(JSON.stringify(isExist))
                if (isExist) {
                    req.tokenData=response;
                    req.body.orgId=response.org_id
                    req.tokenData['token']=token;
                    req.tokenData['source']=0;// website
                    next()
                }else{
                    return res.status(498).send({status:0,message:'The access token is invalid. Please log in again.'});
                }
            }  
        }
    })
    
}

module.exports=verifyCustomerToken;
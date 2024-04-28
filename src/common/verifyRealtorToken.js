const express=require("express");
const jwt=require('jsonwebtoken');
const db = require("../models/index");

const verifyRealtorToken= async (req, res, next)=> {
    const authHeader = req.headers['authorization'];    
    const token = authHeader && authHeader.split(' ')[1];
    if (token==null)
    return res.status(401).send({status:0,message:"Realestate Professional not authorized"});

    jwt.verify(token,process.env.ACCESS_TOKEN, async (err,response)=>{       
        if(err){
            console.log('err',err);
            if (err.message=='jwt expired') {             
                await db.realestateProLoginActivitiesModel.destroy({ where: { token: token} });  
            } 
            return res.status(498).send({status:0,message:'Invalid Access Token'});
        } else{
            if(response.hasOwnProperty('realtor_token')){
                return res.status(498).send({status:0,message:'Invalid Access Token'});
            }else{
                // console.log('response.realestate_professional_id',response.realestate_professional_id);
                let isExist =await db.realestateProLoginActivitiesModel.findOne({ where: { token: token ,realestate_professional_id:response.realestate_professional_id} });
                isExist = JSON.parse(JSON.stringify(isExist))
                if (isExist) {
                    req.tokenData=response;
                    req.body.orgId=response.org_id
                    req.tokenData['token']=token;
                    req.tokenData['source']=0;// website
                    next()
                }else{
                    return res.status(498).send({status:0,message:'Invalid Access Token'});
                }
            }  
        }
    })
    
}

module.exports=verifyRealtorToken;
const express=require("express");
const jwt=require('jsonwebtoken')



const checkRole=(userTypes)=>{
    return (req, res, next) => {
        const user_role = req.tokenData.user_role_id;
        const verifyRole =userTypes.includes(user_role)
        if (verifyRole) {
           next();
        } else {
            return res.status(402).send({status:0,message:'User not Authorized'});   
        }
    };
    
}
module.exports=checkRole;
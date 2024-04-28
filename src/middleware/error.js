const db = require('../models/index');
const jwt = require('jsonwebtoken');
const mailService = require("../services/v1/admin/mailService");

module.exports = async (error, req, res, next) => {
    let dataObj = {
        errorData: error
    }
    //  let mailTrigger = await mailService.triggerMail('mailError.ejs', dataObj, '', 'sunny@sundewsolutions.com', 'SERVER ERROR','');
    console.log('main error===',error);

  //  let mailTrigger = await mailService.triggerMail('mailError.ejs', dataObj, '', 'bithin@sundewsolutions.com', 'SERVER ERROR','');
    error.statusCode  = error.statusCode || 500;
 
//   console.log(error);

//    console.log(error.name);
    // error.message = err.message || "Internal Server Error";
  //  res.status(error.statusCode).json({ status: 0, message: error.message });
    // Check for a Sequelize validation error
    if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map((err) => err.message);
       
        // Return a validation error response
        res.status(400).json({status:0, message: errors[0]});
    } else if (error instanceof db.Sequelize.UniqueConstraintError) {
        // Handle unique constraint violation errors 'Duplicate entry detected.' 
       // console.log(error);
      
        const errors = error.errors.map((err) => err.message);
       
        res.status(409).send({status:0, message:  errors[0]});
    } else if (error instanceof db.Sequelize.DatabaseError) {
        // Handle general database errors
        res.status(500).send({ message: error }); //'Database error occurred.'
    } else if (error.name === 'CustomError') {
       // console.log(error.message);
        res.status(error.statusCode).json({status:0, message: error.message});
    } else if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({status:0, message: 'JWT token has expired' });
    }else   if (error instanceof db.Sequelize.ConnectionAcquireTimeoutError) {
        // Handle the specific ConnectionAcquireTimeoutError    
        // Return a user-friendly error response
        res.status(500).json({ error: 'Database connection timeout. Please try again later.' });
    } else{
        // Return a generic error response
        res.status(500).json({status:0, message: 'Internal Server Error' });
    }
}
const express=require("express");
const app = express();
const { body, validationResult } = require('express-validator');
let fs = require('fs');


const validation= (req,res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('error catch for validation');
        if (req.file) {
          if (req.fileDestination) {
            console.log('unlink error for file destination',req.fileDestination);
            fs.unlinkSync(`${req.fileDestination}/${req.file.filename}`);
          }
        }else if(req.files){
          if (req.fileDestination) {
            console.log('unlink error for file destination',req.fileDestination);
            fs.unlinkSync(`${req.fileDestination}/${req.files.filename}`);
          }
        }
       
      return res.status(200).json({status:0, errors: errors.array() });
    }
    next();
}

module.exports=validation
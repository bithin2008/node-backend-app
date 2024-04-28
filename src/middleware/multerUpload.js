const multer = require("multer");
const CustomError = require('../utils/customErrorHandler');
const helper = require("../common/helper")
const express = require("express");
const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');

// const app = express();
// // Body parsing middleware
// app.use(express.json());


const excelFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("csv") ||
    file.mimetype.includes("excel") ||
    file.mimetype.includes("spreadsheetml")
  ) {
    cb(null, true);
  } else {
    cb("Please upload only excel file.", false);
  }
};

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/temp')
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = async (req, file, cb)=> {
   // Define your dynamic validation criteria here
   const allowedMimeTypes = req.fileType ? req.fileType : [];
   if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
    /*  const fileBuffer = fs.readFileSync(req.file.path);
     const dimensions = sizeOf(fileBuffer);
     console.log('Image dimensions:', dimensions.width, dimensions.height);
 
     if (file.fieldname === 'logoIcon') {
       validateImageDimensions(fileBuffer, 100, 100, cb);
     } else if (file.fieldname === 'orgLogo') {
       console.log('file.fieldname', file.fieldname);
       validate ImageDimensions(fileBuffer, 165, 35, cb);
     }*/
   } else {
     cb(new CustomError('Invalid file type', 403), false); // Reject the file
   }
};
  

const fileSizeValidator = () => (req, file, callback) => {
  if (file.size <= req.maxFileSize) {
    // File size is within the allowed limit
    callback(null, true);
  } else {
    // File size exceeds the allowed limit
    callback(new CustomError(`File size exceeds ${req.maxFileSize} MB.`));
  }
};
const singleFileUpload = multer.diskStorage({
   
  destination: (req, file, cb) => {  
    const baseDirectory = path.resolve(__dirname);
    const parentDirectory = path.resolve(baseDirectory, '../'); // Move one level up to remove 'middleware'
    const joinedPath = path.join(parentDirectory, req.fileDestination);
    cb(null, joinedPath) // Specify the destination directory to store uploaded files
  },
 
  limits: {
    // The maximum file size will be dynamically set based on your condition
    fileSize: fileSizeValidator(), // 10MB in bytes
  },
  filename: (req, file, cb) => {
    const fileName=helper.fileNameGenerator(file.originalname,file.fieldname)
   // console.log(fileName);
    cb(null, fileName);
      // Validate file types or dimensions if necessary
    // Example: Validate image dimensions
    
  },
});

const multerUpload = {
  uploadExcelFile: multer({ storage: storage, fileFilter: excelFilter }),

  multerUploadSingleFile: multer({ storage: singleFileUpload, fileFilter: fileFilter }),

  setMulterUploadValidation :(fileType, fileSize, destination) => {
    try {
      return (req, res,  next) => {

          req.fileType=fileType
          req.maxFileSize=fileSize
          req.fileDestination=destination
          const baseDirectory = path.resolve(__dirname);
          const parentDirectory = path.resolve(baseDirectory, '../'); // Move one level up to remove 'middleware'
          const joinedPath = path.join(parentDirectory, req.fileDestination);
          if (req.fileDestination) {
            fs.access(joinedPath, fs.constants.F_OK, (err) => {
              if (err) {
                
                console.error(`Directory does not exist at ${req.fileDestination}`);
              //  throw new CustomError (`Directory does not exist at ${req.fileDestination}`,500)
                res.status(500).send({status:0,message:`Directory does not exist at ${req.fileDestination}`})
                // Handle the directory not existing case here
              } else {
                next()
               // console.log(`Directory exists at ${req.fileDestination}`);
                // Directory exists, continue with your logic here
              }
            });
          }
      };
    } catch (error) {
      next(error)
    }
   
  }
}


// Function to validate image dimensions
function validateImageDimensions(fileBuffer, width, height, cb) {
  const dimensions = sizeOf(fileBuffer);
  if (dimensions.width === width && dimensions.height === height) {
    cb(null, true); // Accept the file
  } else {
    cb(new CustomError(`Invalid dimensions. Required: ${width}px by ${height}px`, 403), false); // Reject the file
  }
}
module.exports = multerUpload;

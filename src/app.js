require("dotenv").config();
const path = require("path");
/* if (!process.env.HOST) {
  dotenv.config({
    path: path.resolve(__dirname, '../.env'),
  });
} */

const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const compression = require('compression')
app.use(compression({
  level: 6, // Set compression level to 6 (default)
  threshold: 10 * 1000, // Set threshold to 10KB (default)
  filter: shouldCompress // Use the custom filter function
}));
const helper = require("./common/helper");
global.__basedir = __dirname + "/..";
const errorMiddleware = require("./middleware/error");
const routeDeclaration = require("./common/routeDeclaration");
// Set up static file serving
const orgFilesPath = path.join(__dirname, 'public', 'org_files');
app.use('/org_file', express.static(orgFilesPath));

const emailtemImgPath = path.join(__dirname, 'public', 'email-temp-img');
app.use('/email_images', express.static(emailtemImgPath));

var apiVersion = "v1";
PORT = helper.server_port;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ credentials: true, origin: true }));

function shouldCompress (req, res) {
  if (req.headers['x-no-compression']) {
    // Don't compress responses with this request header
    return false;
  }
 
  // Fallback to standard filter function
  return compression.filter(req, res);
}
/* app.use((req, res, next) => {
  let urlParts = req.url.split("/");
  apiVersion = urlParts[1] || "v1";
  const corsWhitelist = [
    "http://localhost:5000",
    "https://sundew.agency/",
    'https://api.techdevelopments.co',
    "https://admin.techdevelopments.co",
    "https://techdevelopments.co/fphw-admin",
    "http://localhost",
  ];

 
  if (corsWhitelist.indexOf(req.headers.origin) !== -1) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
  }
  res.header("Access-Control-Allow-Origin", "*");
  //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,token");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Credentials", true);

  res.header("Access-Control-Allow-Origin", "*"); //req.header.Host);
  res.header("Access-Control-Allow-Methods", "*");
  res.header("X-Content-Type-Options", "*");

  next();
}); */
/** Cros Origin  Handel*/ 
app.use((req, res, next) => {
  let urlParts = req.url.split("/");
  apiVersion = urlParts[1] || "v1";

  const corsWhitelist = [
    "http://localhost:4201",
    "http://localhost:5000",
    "https://sundew.agency",
    "https://api.techdevelopments.co",
    "https://admin.techdevelopments.co",
    "https://techdevelopments.co/fphw-admin",
    "https://techdevelopments.co/fphw/admin",
    "https://fphwapi.techdevelopments.co",
    "http://localhost",
  ];

  const requestOrigin = req.headers.origin;
  
  if (corsWhitelist.includes(requestOrigin)) {
    // Allow requests from whitelisted origins
    res.header("Access-Control-Allow-Origin", requestOrigin);
  } else {
    // If the request origin is not in the whitelist, restrict access
    res.header("Access-Control-Allow-Origin", "*"); // Or you can use a default allowed origin
  }
// Define the allowed domains
const allowedDomains = ['https://example1.com', 'https://example2.com'];
// Middleware function to set CORS headers
function allowOnlySpecificDomains(req, res, next) {
  const origin = req.headers.origin;
  if (allowedDomains.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  next();
}
// Register the middleware function
app.use(allowOnlySpecificDomains);
 /*  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("X-Content-Type-Options", "nosniff"); */

  // Preflight requests handling for CORS
  if (req.method === "OPTIONS") {
    res.status(200).end();
  } else {
    next();
  }
});

// Express middleware to enable CORS
/* app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from all origins (you can specify specific origins if needed)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
}); */

//Multer Handler 
app.use(multerErrHandler);

//Route Declaration
const routes = routeDeclaration;

routes.forEach((routeObj) => {
  app.use("/api/" + apiVersion + routeObj.path, require("./routes/" + apiVersion + routeObj.obj));
});
const db = require('../src/models');
const cronScheduler = require('../src/common/cronScheduler');
const CustomError = require("./utils/customErrorHandler");
app.get("/", async(req, res) => {
  console.log("running...");
//  const payload='wellcome'
//   res.status(200).send(payload.repeat(2000*1000));
   res.status(200).send({message:"wellcome!"});
});

function multerErrHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    console.log(err);

    console.log(err.name);
    res.json({
      success: 0,
      message: err.message,
    });
  }
}
//Handling unhandle routes
app.all("*", (req, res, next) => {
   console.log(`Page not found. Can't find ${req.originalUrl} on this server`);
  //throw new CustomError( `Page not found. Can't find ${req.originalUrl} on this server`,404)
});


//MiddleWare Error Handler
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT} in ${process.env.NODE_ENV} mode`);
});

/* const localIpAddress = '172.30.1.16'; // Use your local IP address here

app.listen(PORT,localIpAddress, () => {
  console.log(`Server is running at http://${localIpAddress}:${PORT} in ${process.env.NODE_ENV} mode`);
}); */
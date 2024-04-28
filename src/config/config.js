const dotenv = require("dotenv");
const path = require("path");
dotenv.config({path: path.resolve(__dirname, '../../.env')});


// Now you can use projectRootDirectory in your config.js file

module.exports = {

  development: {
    username: process.env.dbusername,
    password: process.env.password,
    database: process.env.database,
    host: process.env.host,
    port: process.env.port,
    dialect: process.env.dialect,
    schema: process.env.schema
  },
  
  staging: {
    //...dbConfig.staging
    username: process.env.dbusername,
    password: process.env.password,
    database: process.env.database,
    host: process.env.host,
    port: process.env.port,
    dialect: process.env.dialect,
    schema: process.env.schema 
  },
  uat:{
   // ...dbConfig.uat
    username: process.env.dbusername,
    password: process.env.password,
    database: process.env.database,
    host: process.env.host,
    port: process.env.port,
    dialect: process.env.dialect,
    schema: process.env.schema 
  },
  prod: {
    username: process.env.dbusername,
    password: process.env.password,
    database: process.env.database,
    host: process.env.host,
    port: process.env.port,
    dialect: process.env.dialect,
    schema: process.env.schema 
  },


};

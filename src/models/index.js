"use strict";

const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const NODE_ENV = process.env.NODE_ENV || "development";
const env = NODE_ENV
const config = require(__dirname + "/../config/config.js")[env];
const db = {};
let sequelize;

function createDbConnection() {
  console.log(config);
  sequelize = new Sequelize({
    ...config,
    logging: false,
    // Pool configuration
    pool: {
      max: 30, // Maximum number of connections in the pool
      min: 0, // Minimum number of connections in the pool
      acquire: 30000, // Maximum time (in milliseconds) to acquire a connection
      idle: 30000, // Maximum time (in milliseconds) a connection can be idle before being released
    },
    // Increase the connection timeout
    acquireTimeout: 60000, // 60 seconds (adjust as needed)

  });
}
createDbConnection();


fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes,
    );
    db[model.name] = model;
  });



db.sequelize = sequelize;
db.Sequelize = Sequelize;

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });



Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});


async function checkConnection() {
  console.log('Check DB Connection..');
  try {
    // Test the connection by authenticating
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    // Handle connection errors here, such as reconnecting or logging
    // For example, you could attempt to close the existing connection and create a new one:
    await sequelize.close();
    createDbConnection()// Replace with your Sequelize initialization code
  }
}


// Function to periodically check the health of the database connection
function startHealthCheck(interval) {
  // Perform an initial health check
  checkConnection();

  // Set up interval for periodic health checks
  setInterval(checkConnection, interval);
}

// Start periodic health checks (e.g., every 5 minutes)
startHealthCheck(5 * 60 * 1000); // 5 minutes in milliseconds

///////////////////////////////////////////////
//db.policyDocumentsModel.sync({ force: true });
// db.policiesModel.sync({ force: true });
// db.policyProductsModel.sync({ force: true });
//db.paymentsModel.sync({ force: true });
//db.customersModel.sync({ force: true });
// db.leadsModel.sync({ force: true });
//  db.policyWiseCommiosionModel.sync({force: true})
//  db.customerCardsModel.sync({force: true});
//  db.policyNotesModel.sync({force:true})
//db.policyAmountUpdateLogsModel.sync({force:true})
// db.claimsModel.sync({force:true})
//  db.claimNotesModel.sync({force:true})
//  db.policyNotesModel.sync({force:true})
// db.customerReviewsModel.sync({force:true})
//db.leadsModel.sync({force:true})
//db.auditTrailModel.sync({ force: true });
/////////////////////////////////////////////////


//db.realestateProfessionalsModel.sync({ force: true });
// db.websitePagesModel.sync({ force: true });
// db.policiesModel.sync({ alter: true });
// db.contactsModel.sync({ alter: true });
// db.affiliatesModel.sync({ alter: true });
// db.realestateProfessionalsModel.sync({ alter: true });

//db.contractorsModel.sync({ alter: true });
//db.realestateProLoginActivitiesModel.sync({ force: true });
//db.contractorProductsModel.sync({ force: true });
// db.contractorsModel.sync({ force: true });
//db.whitelistIPsModel.sync({ force: true });
//db.customersModel.sync({ alter: true });
//db.policiesModel.sync({ force: true });
// db.propertyTypesModel.sync({ alter: true });
// db.blogsModel.sync({ force: true }); 


//db.realestateProfessionalsModel.sync({ force: true });
//db.policyProformaInfoModel.sync({ force: true });
// db.propertyTypesModel.sync({ alter: true });
//db.policyProformaInfoModel.sync({ alter: true });
//db.planTermsModel.sync({ alter: true });
// db.organizationsModel.sync({ force: true });
// db.orgDepartmentsModel.sync({ force: true });
// db.orgUserRolesModel.sync({ force: true });
// db.orgUsersModel.sync({ alter: true })
// db.orgModulesModel.sync({ force: true });
//db.orgSubModulesModel.sync({ force: true })
//db.orgUserRolePermissionsModel.sync({ force: true })
//db.orgUserAccessPermissionsModel.sync({ force: true });
//db.productProblemsModel.sync({ alter: true });
// db.productBrandModel.sync({ force: true });
//db.claimPriorityModel.sync({ alter: true });
//  db.holdingPeriodModel.sync({ alter: true });
// db.customerPaymentLinkModel.sync({ alter: true });
//db.policyStatusModel.sync({ alter: true });
//db.propertySizeModel.sync({ alter: true });
//db.claimTicketStatusesModel.sync({ alter: true });
module.exports = db;

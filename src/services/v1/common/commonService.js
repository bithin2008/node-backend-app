
const { exec } = require('child_process');

const db = require('../../../models/index');
const helper = require('../../../common/helper');
const CustomError = require('../../../utils/customErrorHandler');
const path = require('path');
const { Op } = require("sequelize");

exports.checkZipCode = async (zip) => {
  try {
    if (zip) {
      let response = await db.zipcodesModel.findOne({
        attributes: [
          'zipcode', 'city', 'state', 'statecode', 'lat', 'lon', 'is_serviceable', 'active_status'],
        where: {
          zipcode: zip,
        }
      });
      if (!response) {
        throw new CustomError('Invalid zipcode', 400)
      } else {
        response = JSON.parse(JSON.stringify(response))
        if (response.is_serviceable == 1 && response.active_status==1) {
          return response
        } else {
          throw new CustomError('Unavailable services in this zip code', 503)
        }
      }
    }
  } catch (error) {
    console.log(error);
    throw error
  }
}

exports.searchZipCode = async (zip) => {
  try {
    if (zip) {
      let response = await db.zipcodesModel.findAll({
        attributes: [
          'zipcode', 'city', 'state', 'statecode', 'lat', 'lon', 'is_serviceable', 'active_status'],
        where: {          
          zipcode: {
            [Op.like]: `${zip}%`,
        }
        }
      });

      return JSON.parse(JSON.stringify(response))
     
    }
  } catch (error) {
    console.log(error);
    throw error
  }
}

// database schema creation dynamically
exports.createSchema = async (schemaName, transaction) => {
  try {
    // Run the SQL query to create the schema
    const [results, metadata] = await db.sequelize.queryInterface.createSchema(schemaName,);//{ transaction }
    //    db.sequelize.query(`CREATE SCHEMA ${schemaName};`);
    console.log(`Schema "${schemaName}" created successfully.`);
    return true
  } catch (error) {
    console.log(error);
    if (error.original.code === '42P06') {
      throw new CustomError(`Schema ${schemaName} already exists.`, 409)
      console.log(`Schema "${schemaName}" already exists.`);
    } else {
      throw new CustomError(`Error creating schema.`, 400)
      console.error('Error creating schema:', error);
    }
  }
}

exports.runMigrations = async (transaction) => {
  //await db.sequelize.sync(); //{force:true} Ensure all models are synchronized
  // Run migrations
  /*  await db.sequelize.getQueryInterface().migrate({  method: 'up',
   options: {
     from: '20230706064040-create-organizations.js', // Specify the migration ID from which you want to start executing
   }, });
   console.log('Migrations executed successfully!'); */
  try {

    await db.sequelize.authenticate();
    console.log('Database connection established.');

    const command = 'npx sequelize-cli db:migrate';
    const cwd = path.join(__dirname, 'src'); // Set the path to the src directory

    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing migrations: ${error}`);
      } else {
        console.log('Migrations executed successfully.');
      }
    });
  } catch (error) {
    console.error('Unable to establish database connection:', error);
  }
}

exports.uniqueValueCheck = async (model, field, value) => {
  const userData = await db[model].findOne({ where: { [field]: value } });
  return userData;
}

// runMigrations()
//   .then(() => {
//     process.exit(0); // Exit the process with success status
//   })
//   .catch((error) => {
//     console.error('Error executing migrations:', error);
//     process.exit(1); // Exit the process with error status
//   });
/* exports.dbMigrate = async(obj)=>{
  try {
    const { spawn } = require('child_process');

    // Change directory to 'src'
    const changeDirectory = spawn('cd', ['src']);
    
    changeDirectory.on('close', (code) => {
      if (code === 0) {
        // 'cd src' succeeded, now execute 'npx sequelize-cli db:migrate'
        const migrateProcess = spawn('npx', ['sequelize-cli', 'db:migrate']);
    
        migrateProcess.stdout.on('data', (data) => {
          console.log(`stdout: ${data}`);
        });
    
        migrateProcess.stderr.on('data', (data) => {
          console.error(`stderr: ${data}`);
        });
    
        migrateProcess.on('close', (code) => {
          if (code === 0) {
            console.log('Migration executed successfully');
          } else {
            console.error('Migration failed');
          }
        });
      } else {
        console.error('Failed to change directory');
      }
    });
    
  } catch (error) {
    throw error
  }
} */
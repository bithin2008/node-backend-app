require('dotenv').config();
const { exec } = require('child_process');
const path = require('path');

module.exports = {
  migrate: () => {
    const configPath = path.resolve(__dirname, 'config/config.js');
    exec(`set NODE_ENV=development && sequelize db:migrate --config ${configPath}`, (err, stdout, stderr) => {
      if (err) {
        console.error(`${stdout}`);
      }
    
       console.log(`stdout===========${stdout}`);
       console.warn(`stderr///////${stderr}`);
    });
  },
  migrateRollback: () => {
    exec(`npx sequelize db:migrate:undo --env ${process.env.NODE_ENV}`, (err, stdout, stderr) => {
      if (err) {
        console.error(`${stdout}`);
      }
    
      console.log(`${stdout}`);
      console.warn(`${stderr}`);
    });
  },
  migrateReset: () => {
    exec(`npx sequelize db:migrate:undo:all --env ${process.env.NODE_ENV}`, (err, stdout, stderr) => {
      if (err) {
        console.error(`${stdout}`);
      }
    
      console.log(`${stdout}`);
      console.warn(`${stderr}`);
    });
  }
};
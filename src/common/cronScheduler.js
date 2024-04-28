const cron = require('node-cron');
const Bree = require('bree');
const Graceful = require('@ladjs/graceful');
const moment = require('moment');

const paymentsController = require("../controllers/v1/admin/paymentsController");
const commissionsController = require("../controllers/v1/admin/commissionsController");
const policyController = require("../controllers/v1/admin/policyController");
const customerController = require("../controllers/v1/admin/customerController");

// // Schedule the first cron job to run every 5 minutes starting from the 0th minute
// cron.schedule('*/5 * * * *', async () => {
//    console.log('Monthly Cron running..', new Date());
//    await paymentsController.processMonthlyRecurringPayments();
// });

// // Schedule the second cron job to run every 5 minutes starting from the 2nd minute
// cron.schedule('2-59/5 * * * *', async () => {
//    console.log('Yearly Cron running..', new Date());
//    await paymentsController.processYearlyRecurringPayments();
// });
// Define the cron job functions
const monthlyRecurringCronJob = async () => {
   console.log('Monthly Cron running..', new Date());
   await paymentsController.processMonthlyRecurringPayments();
};

const yearlyRecurringCronJob = async () => {
   console.log('Yearly Cron running..', new Date());
   await paymentsController.processYearlyRecurringPayments();
};
/** START SUNDAY TO FRIDAY RECURING CRON**/

// Cron expression breakdown:
// - '*/2': Run every 2 minutes.
// - '7-11': Run from the 7th to the 11th hour (7 am to 11 am).
// - '* *': Run every day of the month and every month of the year.
// - '0-5': Run on Sunday to Friday.
cron.schedule('*/2 7-11 * * 0-5', monthlyRecurringCronJob);

// Cron expression breakdown:
// - '2-59/2': Run every 2 minutes, starting from the 2nd minute of the hour.
// - '7-11': Run from the 7th to the 11th hour (7 am to 11 am).
// - '* *': Run every day of the month and every month of the year.
// - '0-5': Run on Sunday to Friday.
cron.schedule('2-59/2 7-11 * * 0-5', yearlyRecurringCronJob);

/** END SUNDAY TO FRIDAY RECURING CRON **/

/** START SATURDAY RECURING CRON  **/

// Cron expression breakdown:
// - '*/2': Run every 2 minutes.
// - '21-23': Run from the 9th to the 11th hour (9 pm to 11 pm).
// - '* *': Run every day of the month and every month of the year.
// - '6': Run only on Saturday (Saturday is represented by 6 in cron).
cron.schedule('*/2 21-23 * * 6', monthlyRecurringCronJob);

// Cron expression breakdown:
// - '2-59/2': Run every 2 minutes, starting from the 2nd minute of the hour.
// - '21-23': Run from the 9th to the 11th hour (9 pm to 11 pm).
// - '* *': Run every day of the month and every month of the year.
// - '6': Run only on Saturday (Saturday is represented by 6 in cron).
cron.schedule('2-59/2 21-23 * * 6', yearlyRecurringCronJob);

/** END SATURDAY RECURING CRON**/



/** START SPIFF COMMISION CRON **/

// Cron expression breakdown:
// - '*/5': Run every 5 minutes.
// - '0-6': Run from the 12th to the 6th hour (12 am to 6 am).
// - '* * * * *': Run every day of the month, every month of the year, and every day of the week.
cron.schedule('*/5 0-6 * * *', async () => {
   console.log('Hold to active Policy Cron..', new Date());
   await policyController.processCronPolicyActiveStatus();
});

/** END SPIFF COMMISION CRON **/

// // Schedule the fourth cron job to run every 5 minutes starting from the 6th minute
// cron.schedule('6-59/5 * * * *', async () => {
   cron.schedule('0 3 * * *', async () => {
   // Check if today is Sunday (day 0 in JavaScript)
   if (moment().day() !== 1) {
       // If today is not Sunday, execute the SPIFF commission processing function
       console.log('Nightly SPIFF Commision calculation Cron running..', new Date());
       await commissionsController.processDailySPIFFCommissions();
   } else {
       // If today is Sunday, log a message indicating that SPIFF won't be calculated
       console.log('SPIFF calculation skipped on Sundays.');
   }
});

// Schedule the fifth cron job to run every 5 minutes starting from the 8th minute
cron.schedule('05 00 * * *', async () => {
   console.log('AMAZON GIFT CARD REMINDER TO ADMIN', new Date());
   await customerController.amazonGiftCardReminder();
});



// const bree = new Bree({
//    jobs: [
//       {
//          name: 'Monthly Cron',
//          interval: '*/5 * * * *', // Every 5 minutes
//          handler: async () => {
//             console.log('Monthly Cron running..', new Date());
//             await paymentsController.processMonthlyRecurringPayments();
//          }
//       },
//       {
//          name: 'Yearly Cron',
//          interval: '2-59/5 * * * *', // Every 5 minutes starting from the 2nd minute
//          handler: async () => {
//             console.log('Yearly Cron running..', new Date());
//             await paymentsController.processYearlyRecurringPayments();
//          }
//       },
//       {
//          name: 'Hold to Active Policy Cron',
//          interval: '*/5 * * * *', // Every 5 minutes
//          handler: async () => {
//             console.log('Hold to Active Policy Cron..', new Date());
//             await policyController.processCronPolicyActiveStatus();
//          }
//       }
//    ]

// });

/* const graceful = new Graceful({ brees: [bree] });
graceful.listen();
(async () => {
   await bree.start();
})();
 */

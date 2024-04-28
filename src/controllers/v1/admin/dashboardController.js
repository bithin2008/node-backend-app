require("dotenv").config();
const db = require('../../../models/index');
const { Sequelize, Op } = require('sequelize');
const moment = require('moment') 
const helper = require("../../../common/helper");


// -------------------Get Dashboard Details -------------

exports.getDashboardDetails = async (req, res, next) => { 
    try {
      let roleBasedCondition = helper.generateRoleBasedCondition(req.tokenData)

      let totalServiceData= await DashboardTotalServiceRequests()
      let totalPolicyData= await DashboardTotalPolicy(req)  
      const resultTotal = await db.paymentsModel.sum('amount', {
        where: {
          ...roleBasedCondition,
        }
      });
      const resultRecieved = await db.paymentsModel.sum('amount', {
        where: {
          ...roleBasedCondition,
          payment_status:1
        },
      });
      const resultSchedule = await db.paymentsModel.sum('amount', {
        where: {
          ...roleBasedCondition,
          payment_status:4
        },
      });

      const technicianVerified = await db.contractorsModel.count({
        where: { 
          org_id: req.tokenData.org_id,
          active_status:1
        },
      });
      const technicianBlacklist = await db.contractorsModel.count({
        where: { org_id: req.tokenData.org_id,active_status:2},
      });
      const technicianUnverified = await db.contractorsModel.count({
        where: { org_id: req.tokenData.org_id,active_status:0},
      });


      //console.log(technicianActive,technicianBlacklist); 
      totalPolicyData.totalServiceData=totalServiceData;
      totalPolicyData.revenueTotal=resultTotal;
      totalPolicyData.revenueRecieved=resultRecieved;
      totalPolicyData.revenueSchedule=resultSchedule;
      totalPolicyData.technicianVerified=technicianVerified;
      totalPolicyData.technicianUnverified=technicianUnverified;
      totalPolicyData.technicianUnverified=technicianUnverified;
      totalPolicyData.technicianBlacklist=technicianBlacklist;
  
      res.status(200).send({ status: 1, data:totalPolicyData, message: "Policy informations" });

    } catch (error) {
        next(error)
    }
}

// ------------------- Service Chart Data -------------

exports.getServiceChartData = async (req, res, next) => {
  try {
    let { serviceYear } = req.body;
    let mS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    let serviceChartData = { policy: [], claim: [], months: mS };

    const monthDates = await getMonthStartAndEndDates(serviceYear);
    const promises = monthDates.map(async (monthDate) => {
      let policyCount = await db.policiesModel.count({
        where: {
          order_date: {
            [Op.between]: [monthDate.start, monthDate.end],
          },
        },
      });

      let claimCount = await db.claimsModel.count({
        where: {
          created_at: {
            [Op.between]: [monthDate.start, monthDate.end],
          },
        },
      });

      return { policyCount, claimCount };
    });

    const results = await Promise.all(promises);

    results.forEach((result) => {
      serviceChartData.policy.push(result.policyCount);
      serviceChartData.claim.push(result.claimCount);
    });

    res.status(200).send({ status: 1, data: serviceChartData, message: "Service request information" });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ status: 0, message: 'Internal Server Error' });
  }
};

// --------------- Top Five State Wise Sales -----------------------


exports.getTopFiveStateWiseSales = async (req, res, next) => {
  try {
    let roleBasedCondition = helper.generateRoleBasedCondition(req.tokenData)

    let startDate = req.body.startDate; // "2023-09-01";
    let endDate =req.body.endDate; // "2024-04-28";
    let topFiveData = { stateData: [], months: [] };
    let background = ['#0081a7', '#00afb9', '#fff3b0', '#fed9b7', '#f07167'];
    let border = ['#0081a7', '#00afb9', '#fff3b0', '#fed9b7', '#f07167'];
    const stateList = await db.policiesModel.findAll({
      attributes: [
        'billing_state',
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'state_count'],
      ],
      group: ['billing_state'],
      order: [[Sequelize.literal('state_count'), 'DESC']],
      limit: 5,
      raw: true,
      where: {
            ...roleBasedCondition,
            created_at: {
              [Op.between]: [startDate, endDate],
            },
          },
    });
    const resultMonth = monthsBetweenDates(startDate, endDate);
    const stateDataPromises = stateList.map(async (item, i) => {
      let stateArray = [];
      const promise2= resultMonth.map(async (month) => {
           let mS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
            let monthName = mS[moment(month.start).month()];
            let sDate = moment(month.start).format('YYYY-MM-DD');
            let eDate = moment(month.end).format('YYYY-MM-DD');
            let result = await db.policiesModel.count({
              where: {
                ...roleBasedCondition,
                billing_state: item.billing_state,
                created_at: {
                  [Op.between]: [sDate, eDate],
                },
              },
            });
            return {result,monthName}        
        })
        let data = await Promise.all(promise2);
        data.forEach((res) => {
          stateArray.push(res.result)
          if (!topFiveData.months.includes(res.monthName)) {
            topFiveData.months.push(res.monthName);
          }
        });

      return {
        label: item.billing_state,
        data: stateArray,
        backgroundColor: background[i % background.length],
        borderColor: border[i % border.length],
      };
    });

    topFiveData.stateData = await Promise.all(stateDataPromises);
    res.status(200).send({ status: 1, data: topFiveData, message: "Top Five State Sales information" });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ status: 0, message: 'Internal Server Error' });
  }
};


// ------------------ Revenue Chart Data --------------------

exports.getRevenueChartData = async (req, res, next) => {
  try {
    const roleBasedCondition = helper.generateRoleBasedCondition(req.tokenData);
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
   
    const revenueChartData = { success: [], failed: [], pending: [], month: [] };
    const result = monthsBetweenDates(startDate, endDate);

    const promises = result.map(async (month) => {
      const mS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
      const monthName = mS[moment(month.start).month()];
      const sDate = moment(month.start).format('YYYY-MM-DD');
      const eDate = moment(month.end).format('YYYY-MM-DD');

      const [successCount, failedCount, pendingCount] = await Promise.all([
        getCount({ ...roleBasedCondition, payment_status: 1 }, sDate, eDate),
        getCount({ ...roleBasedCondition, payment_status: 2 }, sDate, eDate),
        getCount({ ...roleBasedCondition, payment_status: 4 }, sDate, eDate)
      ]);

      return { successCount, failedCount, pendingCount, monthName };
    });

    const results = await Promise.all(promises);

    results.forEach((result) => {
      revenueChartData.success.push(result.successCount);
      revenueChartData.failed.push(result.failedCount);
      revenueChartData.pending.push(result.pendingCount);
      revenueChartData.month.push(result.monthName);
    });

    res.status(200).send({ status: 1, data: revenueChartData, message: "Revenue information" });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ status: 0, message: 'Internal Server Error' });
  }
};

async function getCount(condition, startDate, endDate) {
  return await db.paymentsModel.count({
    where: {
      ...condition,
      created_at: {
        [Op.between]: [startDate, endDate],
      },
    },
    
  });
}



// ------------------ Revenue Chart Data --------------------

exports.getWebsiteVsBackendData= async (req, res, next) => {
  try{
  let {selectedYear}=req.body;
  let mS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  let webVsBackendData={website:[],backend:[],months:mS}
      const monthDates = await getMonthStartAndEndDates(selectedYear);
      const promises = monthDates.map(async(monthDate) => {
          let websiteCount= await db.policiesModel.count({
            where:{
              source:0,
              order_date: {
                  [Op.between]: [monthDate.start, monthDate.end]
              }  
            }
          })
          let backendCount= await db.policiesModel.count({
            where:{
              source:1,
              order_date: {
                  [Op.between]: [monthDate.start, monthDate.end]
              }  
            }
          }) 
      return { websiteCount, backendCount};

    });

    const results = await Promise.all(promises);

    results.forEach((result) => {
      webVsBackendData.website.push(result.websiteCount);
      webVsBackendData.backend.push(result.backendCount);
    });

    res.status(200).send({ status: 1, data:webVsBackendData, message: "Website vs Backend Data" });
  }catch (error) {
      console.error('Error:', error);
      res.status(500).send({ status: 0, message: 'Internal Server Error' });
    }  
}
// functions---------------------------

async function DashboardTotalServiceRequests() {
    try {
      const totalService = await db.claimsModel.findAndCountAll();
      let countData={
           completed:0,
           pending:0,
           inProgress:0,
           total:totalService.count,
        }
       totalService.rows.map((item)=>{
            if(item.claim_ticket_statuses_id==4){ //completed
                countData.completed++
            }else if(item.claim_ticket_statuses_id==2){ //ready to dispatch
                countData.pending++
            }else{
                countData.inProgress++
            }
        })
    
       return countData
    
    } catch (error) {   
        throw error
    }
}


async function DashboardTotalPolicy(req) {
    try {

      let roleBasedCondition = helper.generateRoleBasedCondition(req.tokenData)
        const totalPolicyCount = await db.policiesModel.count({
          where:{
            //...roleBasedCondition,
          }
        });
        const totalCancelledPolicy = await  db.policiesModel.count({
          where: {
           // ...roleBasedCondition,
            policy_status: 0 // Cancelled=>0
          }
        });
        const totalActivePolicy = await  db.policiesModel.count({
          where: {
           // ...roleBasedCondition,
            policy_status: 1 // Active=>1
          }
        });
        const totalHoldPolicy = await  db.policiesModel.count({
          where: {
           // ...roleBasedCondition,
            policy_status: 2 // 30 Days Wait=>2
          }
        });
        const totalInActivePolicy = await  db.policiesModel.count({
          where: {
           // ...roleBasedCondition,
            policy_status: 3 // Expired=>3,
          }
        });
        const totalAwaitingEscrowPolicy = await  db.policiesModel.count({
          where: {
            //...roleBasedCondition,
            policy_status: 4 //  Awaiting Escrow Payment=>4,
          }
        });
        const totalDoNotChargePolicy = await  db.policiesModel.count({
          where: {
           // ...roleBasedCondition,
            policy_status: 5 //   Do not charge =>5
          }
        });
        const totalFailedPaymentPolicy = await  db.policiesModel.count({
          where: {
            //...roleBasedCondition,
            policy_status: 6 //   Hold ( Failed Payment)=>6
          }
        });

        let policyData={
            totalPolicyCount,
            totalActivePolicy,
            totalInActivePolicy,
            totalCancelledPolicy,
            totalHoldPolicy,
            totalAwaitingEscrowPolicy,
            totalDoNotChargePolicy,
            totalFailedPaymentPolicy,
        }

       return policyData
    
    } catch (error) {   
       throw error
    }
}



async function getMonthStartAndEndDates(year) {
  year = parseInt(year, 10);
  if (isNaN(year) || year < 1000 || year > 9999) {
    throw new Error('Invalid year');
  }

  const monthDates = [];
  for (let month = 0; month < 12; month++) {
    const startDate = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const endDate = new Date(year, month, lastDay.getDate(), 23, 59, 59, 999);

    monthDates.push({
      month: month, // Adding 1 to the month to make it 1-based
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    });
  }
  return monthDates;
}

function monthsBetweenDates(startDate, endDate) {
  startDate = new Date(startDate);
  endDate = new Date(endDate);

  let result = [];

  while (startDate <= endDate) {
      result.push({
          start: new Date(startDate),
          end: new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)  // Last day of the current month
      });

      startDate.setMonth(startDate.getMonth() + 1);
  }

  return result;
}


// for cockpit overview

async function DashboardTotalPolicyBetweenDates(req) {
  try {
    let startDate = req.body.startDate; // "2023-09-01";
    let endDate = req.body.endDate; // "2024-04-28";
    let sDate = moment(startDate).format('YYYY-MM-DD');
    let eDate = moment(endDate).format('YYYY-MM-DD');
    let dateRangeCondition={
      created_at: {
        [Op.between]: [sDate, eDate],
      },
    }
    let roleBasedCondition = helper.generateRoleBasedCondition(req.tokenData)
      const totalPolicyCount = await db.policiesModel.count({
        where:{
          ...roleBasedCondition,
          ...dateRangeCondition,
        }
      });
      const totalCancelledPolicy = await  db.policiesModel.count({
        where: {
          ...roleBasedCondition,
          policy_status: 0,// Cancelled=>0
          ...dateRangeCondition,
        }
      });
      const totalActivePolicy = await  db.policiesModel.count({
        where: {
          ...roleBasedCondition,
          policy_status: 1, // Active=>1
          ...dateRangeCondition,
        }
      });
      const totalHoldPolicy = await  db.policiesModel.count({
        where: {
          ...roleBasedCondition,
          policy_status: 2, // 30 Days Wait=>2
          ...dateRangeCondition,
        }
      });
      const totalInActivePolicy = await  db.policiesModel.count({
        where: {
          ...roleBasedCondition,
          policy_status: 3, // Expired=>3,
          ...dateRangeCondition,
        }
      });
      const totalAwaitingEscrowPolicy = await  db.policiesModel.count({
        where: {
          ...roleBasedCondition,
          policy_status: 4, //  Awaiting Escrow Payment=>4,
          ...dateRangeCondition,
        }
      });
      const totalDoNotChargePolicy = await  db.policiesModel.count({
        where: {
          ...roleBasedCondition,
          policy_status: 5, //   Do not charge =>5
          ...dateRangeCondition,
        }
      });
      const totalFailedPaymentPolicy = await  db.policiesModel.count({
        where: {
          ...roleBasedCondition,
          policy_status: 6, //   Hold ( Failed Payment)=>6
          ...dateRangeCondition,
        }
      });

      let policyData={
          totalPolicyCount,
          totalActivePolicy,
          totalInActivePolicy,
          totalCancelledPolicy,
          totalHoldPolicy,
          totalAwaitingEscrowPolicy,
          totalDoNotChargePolicy,
          totalFailedPaymentPolicy,
      }

     return policyData
     
  } catch (error) {   
     throw error
  }
}

async function DashboardTotalServiceRequestsBetweenDates(req) {
try {
  let startDate = req.body.startDate; // "2023-09-01";
  let endDate = req.body.endDate; // "2024-04-28";
  let sDate = moment(startDate).format('YYYY-MM-DD');
  let eDate = moment(endDate).format('YYYY-MM-DD');
  const totalService = await db.claimsModel.findAndCountAll({
    where:{
      created_at: {
        [Op.between]: [sDate, eDate],
      },
    }
  });
  let countData={
       completed:0,
       pending:0,
       inProgress:0,
       total:totalService.count,
    }
   totalService.rows.map((item)=>{
    if(item.claim_ticket_statuses_id==4){ //completed
        countData.completed++
    }else if(item.claim_ticket_statuses_id==2){ //ready to dispatch
        countData.pending++
    }else{
        countData.inProgress++
    }
    })

   return countData

} catch (error) {   
    throw error
}
}

exports.getDashboardCockPitOverview = async (req, res, next) => { 
  try {
    let startDate = req.body.startDate; // "2023-09-01";
    let endDate = req.body.endDate; // "2024-04-28";
    let sDate = moment(startDate).format('YYYY-MM-DD');
    let eDate = moment(endDate).format('YYYY-MM-DD');

    let dateRangeCondition={
      created_at: {
        [Op.between]: [sDate, eDate],
      },
    }
    let roleBasedCondition = helper.generateRoleBasedCondition(req.tokenData)
     let totalServiceData= await DashboardTotalServiceRequestsBetweenDates(req)
    let totalPolicyData= await DashboardTotalPolicyBetweenDates(req)  
    const resultTotal = await db.paymentsModel.sum('amount', {
      where: {
        ...roleBasedCondition,
        created_at: {
          [Op.between]: [sDate, eDate],
        },
      }
    });
    const resultRecieved = await db.paymentsModel.sum('amount', {
      where: {
        ...roleBasedCondition,
        ...dateRangeCondition,
        payment_status:1
      },
    });
    const resultSchedule = await db.paymentsModel.sum('amount', {
      where: {
        ...roleBasedCondition,
        ...dateRangeCondition,
        payment_status:4
      },
    });

    const technicianVerified = await db.contractorsModel.count({
      where: { 
        org_id: req.tokenData.org_id,
        ...dateRangeCondition,
        active_status:1
      },
    });
    const technicianBlacklist = await db.contractorsModel.count({
      where: { 
        org_id: req.tokenData.org_id,
        active_status:2,
        ...dateRangeCondition,
      },
    });
    const technicianUnverified = await db.contractorsModel.count({
      where: { 
        org_id: req.tokenData.org_id,
        active_status:0,
        ...dateRangeCondition,
      },
    });


  
      totalPolicyData.totalServiceData=totalServiceData;
      totalPolicyData.revenueTotal=resultTotal?resultTotal:0;
      totalPolicyData.revenueRecieved=resultRecieved?resultRecieved:0;
      totalPolicyData.revenueSchedule=resultSchedule?resultSchedule:0;
      totalPolicyData.technicianVerified=technicianVerified;
      totalPolicyData.technicianUnverified=technicianUnverified;
      totalPolicyData.technicianBlacklist=technicianBlacklist;
      totalPolicyData.technicianTotal=technicianUnverified+technicianVerified+technicianBlacklist;

     res.status(200).send({ status: 1, data:totalPolicyData, message: "Policy informations" });

  } catch (error) {
      next(error)
 }
}

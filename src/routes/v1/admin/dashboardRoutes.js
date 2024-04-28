require("dotenv").config();
const express = require("express");
const dashboardRouter = express.Router();
const verifyToken = require("../../../common/verifyToken");

const dashboardController = require("../../../controllers/v1/admin/dashboardController");

/*******************************
 * GET ALL DASHBOARD DETAILS
 * @method: GET
 * @url: /api/v1/admin/dashboard/get-dashboard-details
 ********************************/
dashboardRouter.post("/get-dashboard-details", verifyToken, dashboardController.getDashboardDetails);
dashboardRouter.post("/get-dashboard-cockpit", verifyToken, dashboardController.getDashboardCockPitOverview);
dashboardRouter.post("/get-service-request", verifyToken, dashboardController.getServiceChartData);
dashboardRouter.post("/get-revenue-data", verifyToken, dashboardController.getRevenueChartData);
dashboardRouter.post("/get-revenue-data", verifyToken, dashboardController.getRevenueChartData);
dashboardRouter.post("/get-top5-state-sales", verifyToken, dashboardController.getTopFiveStateWiseSales);
dashboardRouter.post("/get-website-vs-backend", verifyToken, dashboardController.getWebsiteVsBackendData);

module.exports = dashboardRouter;
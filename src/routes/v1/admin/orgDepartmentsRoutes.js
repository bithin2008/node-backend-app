const express = require("express");
const router = express.Router();
const OrgDepartmentsController = require("../../../controllers/v1/admin/orgDepartmentsController");
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');

/*******************************
 * CREATE  DEPARTMENTS
 * @method: POST
 * @url: /api/v1/admin/org-departments/create-department
 ********************************/ 
 router.post("/create-department",verifyToken, OrgDepartmentsController.createDepartment);
 /*******************************/
/*******************************
 * CREATE  DEPARTMENTS
 * @method: PUT
 * @url: /api/v1/admin/org-departments/update-department:/department_id
 ********************************/ 
 router.put("/update-department/:department_id",verifyToken, OrgDepartmentsController.updateDepartment);
 /*******************************/

 /*******************************
 * DELETE  DEPARTMENTS
 * @method: DELETE
 * @url: /api/v1/admin/org-departments/delete-department:/department_id
 ********************************/ 
 router.delete("/delete-department/:department_id",verifyToken, OrgDepartmentsController.deleteDepartment);
 /*******************************/

 /*******************************
 * DELETE  DEPARTMENTS
 * @method: DELETE
 * @url: /api/v1/admin/org-departments/delete-department:/department_id
 ********************************/ 
 router.put("/update-departments-status/:department_id",verifyToken, OrgDepartmentsController.updateDepartmentActiveStatus);
 /*******************************/
  /*******************************
 * GET ALL  DEPARTMENTS
 * @method: POST    
 * @url: /api/v1/admin/org-departments/get-all-departments
 ********************************/ 
  router.post("/get-all-departments",verifyToken, generatePagination(),OrgDepartmentsController.getAllDepartments);
  
  /*******************************/
 module.exports = router;

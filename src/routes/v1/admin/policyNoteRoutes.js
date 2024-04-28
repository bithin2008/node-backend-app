const express = require("express");
const router = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const policyNoteController = require("../../../controllers/v1/admin/policyNoteController")

/*******************************
 * GET All POLICY NOTES
 * @method: POST
 * @url: /api/v1/admin/policy/get-all-policy-notes
 ********************************/
router.post('/get-policy-tasks', verifyToken,generatePagination(), policyNoteController.getAllPolicyTasks)

/*******************************
 * GET All POLICY NOTES
 * @method: POST
 * @url: /api/v1/admin/policy/get-all-policy-notes
 ********************************/
router.post('/get-policy-task-by-policy-info/:policy_id', verifyToken, policyNoteController.getPolicyTasksByPolicyId)



module.exports = router;

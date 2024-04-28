const express = require("express");
const router = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const orgSubModuleController = require("../../../controllers/v1/admin/orgSubModuleController")






/*******************************
*  GET ALL SUB MODULES GROUP BY MODULE
* @method: POST
 * @url: /api/v1/admin/submodules/get-all-submodule-groupby-module
********************************/
router.post("/get-all-submodule-groupby-module", verifyToken, async (req, res, next) => {
    try {
        let result = await orgSubModuleController.getAllSubModulesGroupByModule(req, res, next)
        res.status(200).send({ status: 1, data: result })

    } catch (e) {
        next(e)
    }
},);

module.exports = router;

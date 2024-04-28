const url = require('url');
const querystring = require('querystring');
const policyService = require("../services/v1/admin/policyService");

const getAllPolicyStaus = () => {
    return (req, res, next) => {
      let allPolicyStatus=  policyService.allPolicyStatus();      
        if (allPolicyStatus) {           
            res.policy_status=allPolicyStatus
        }
        next();
    };
}


module.exports = getAllPolicyStaus;
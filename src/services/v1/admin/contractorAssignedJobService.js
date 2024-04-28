const db = require('../../../models/index');
const helper = require('../../../common/helper');

 
//Create Job
exports.createJob = async (obj, transaction) => {
    try {
        let contractorAssignedJob = await db.contractorAssignedJobModel.create(obj, { transaction });
        return contractorAssignedJob?helper.getJsonParseData(contractorAssignedJob):contractorAssignedJob;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}
//Create Job
exports.updateAssignedJob = async (org_id,contractors_assigned_job_id,obj, transaction) => {
    try {
        let contractorAssignedJob = await db.contractorAssignedJobModel.update(obj, { where: {org_id:org_id, contractors_assigned_job_id: contractors_assigned_job_id }, transaction})
        return contractorAssignedJob[0] != 0 ? true : false;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}
//Create Job
exports.getAllAssignedJobs = async (queryOptions) => {
    try {
        let contractorAssignedJob = await db.contractorAssignedJobModel.findAll(queryOptions);
        return contractorAssignedJob?helper.getJsonParseData(contractorAssignedJob):contractorAssignedJob;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}

exports.getContractorJobStatusFlagName= (job_status)=>{
    if(job_status==1){
        return'Dispatched'
    }else if(job_status==2){
        return 'Completed'
    }
}
//Update contractors Object Status 
exports.getContractorObjectFlagsName = async (object) => {
    try {
        /////contractors Status
        object.job_status_details= this.getContractorJobStatusFlagName(object.job_status)
        return object;
    } catch (e) {
        throw e
        // throw Error('Error while fetching User')
    }
}
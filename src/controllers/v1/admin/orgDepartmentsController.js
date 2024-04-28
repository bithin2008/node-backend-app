const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index')
const orgDepartmentsService = require("../../../services/v1/admin/orgDepartmentsService");
const { Op } = require("sequelize");
const helper = require('../../../common/helper');


/*****************************
 *  CREATE DEPARTMENT
 ******************************/
exports.createDepartment = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const data = {
            org_id: req.body.orgId,
            department_name: req.body.departmentName ? req.body.departmentName.trim() : null,
            description: req.body.description ? req.body.description : null,
            active_status: req.body.activeStatus ? parseInt(req.body.activeStatus) : null,
            created_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
        };
        let existingDepartMents= await  db.orgDepartmentsModel.findAll({
            where:{
                org_id:data.org_id
            }
        })
        existingDepartMents=helper.getJsonParseData(existingDepartMents)
        existingDepartMents.forEach(element => {
            if (element.department_name.trim().toLowerCase()==data.department_name.trim().toLowerCase()) {
                throw new CustomError(`The ${req.body.departmentName} department is already exist. Department name should be unique.`)
            
            }
        });
       
      
        const createDepartment = await orgDepartmentsService.createDepartment(data, transaction);
        if (createDepartment) {
            transaction.commit();
            res.status(200).send({
                status: 1, message: "Department created Successfully.",
            });
        } else {
            res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
        }

    } catch (error) {
        await transaction.rollback();
        next(error);
    }

}
/*****************************
 * UPDATE DEPARTMENT
******************************/
exports.updateDepartment = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const department_id = req.params.department_id
        const data = {
            org_id: req.body.orgId,
            department_name: req.body.departmentName ? req.body.departmentName : null,
            description: req.body.description ? req.body.description : null,
            active_status: req.body.activeStatus ? parseInt(req.body.activeStatus) : null,
            updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
        };
        const updateDepartment = await orgDepartmentsService.updateDepartment(data, department_id, transaction);
        if (updateDepartment) {
            transaction.commit();
            res.status(200).send({
                status: 1, message: "Department updated Successfully.",
            });
        } else {
            res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
        }
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}

/*****************************
 * UPDATE DEPARTMENT ACTIVE STATUS
 ******************************/
exports.updateDepartmentActiveStatus = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const department_id = req.params.department_id
        const data = {
            active_status: parseInt(req.body.activeStatus),
            updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
        };
        const updateDepartment = await orgDepartmentsService.updateDepartmentActiveStatus(data, department_id, transaction);
        if (updateDepartment[0] == 1) {
            transaction.commit();
            res.status(200).send({
                status: 1, message: `Department successfully ${req.body.activeStatus ? 'enabled' : 'disabled'}.`
            });
        } else {
            res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
        }
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}
/*****************************
 * DELETE DEPARTMENT
 ******************************/
exports.deleteDepartment = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const department_id = req.params.department_id

        const deleteDepartment = await orgDepartmentsService.deleteDepartment(department_id, transaction);
        if (deleteDepartment) {
            transaction.commit();
            res.status(200).send({
                status: 1,
                message: "Department deleted Successfully.",
            });
        } else {
            res.status(400).send({ status: 0, message: 'Something Went Wrong! Try Again Later' })
        }
    } catch (error) {
        await transaction.rollback();
        next(error);
    }

}

/*****************************
 *  GET ALL DEPARTMENT
 ******************************/
exports.getAllDepartments = async (req, res, next) => {
    try {
        let orgId = req.body.orgId ? req.body.orgId : null;
        let whereCond = {};
        if (orgId) {
            whereCond = {
                org_id: orgId
            };
        }
        // Extract the search term from the query parameters
        const search = req.query.search || '';
        // Construct the search query
        const searchQuery = search ? { department_name: { [Op.iLike]: `%${search}%` } } : {};
        const activeStatus = req.query.active_status ? { active_status: parseInt(req.query.active_status) } : {};
        const sortField = req.query.sortField || 'created_at'; // Default to 'created_at'
        const sortOrder = req.query.sortOrder || 'ASC'; // Default to ascending order
        let queryOptions = {
            attributes: { exclude: [ 'deleted_by', 'deleted_at',] },
            where: {
                ...whereCond,
                ...searchQuery,
                ...activeStatus
            },
            include: [
                {
                    model: db.organizationsModel,
                    as: 'organization',
                    attributes: ['org_name', 'org_id']
                },
                {
                    model: db.orgUsersModel,
                    as: 'update_info',
                    attributes: ['first_name', 'last_name'],
                    required: false
                },
                {
                    model: db.orgUsersModel,
                    as: 'create_info',
                    attributes: ['first_name', 'last_name'],
                    required: false
                },
            ],
            order: [
                [sortField, sortOrder]
            ],
            distinct: true, 

        }

        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }
        let allDepartments = await orgDepartmentsService.getallDepartments(req, res, next, queryOptions);
        if (res.pagination) {
            res.pagination.total = allDepartments.count
            res.pagination.totalPages = Math.ceil(allDepartments.count / queryOptions.limit)
        }
        if (allDepartments.count > 0) {
            res.status(200).send({ status: 1, data: allDepartments.rows, pagination: res.pagination, message: 'Departments list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allDepartments.rows, pagination: res.pagination, message: 'No departments found' })
        }

    } catch (error) {
        console.log(error);
        next(error)
    }
}


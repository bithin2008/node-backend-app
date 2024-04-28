require("dotenv").config();
const config = require("../../../config/config");
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index')
const moment = require("moment");
const bcrypt = require('bcryptjs');
const url = require('url');
const querystring = require('querystring');
const { Op } = require("sequelize");
const paymentService = require("../../../services/v1/admin/paymentService");
const customerCardService = require("../../../services/v1/admin/customerCardService");
const policyService = require("../../../services/v1/admin/policyService");
const securePaymentsService = require("../../../services/v1/admin/securePaymentsService");
const mailService = require("../../../services/v1/admin/mailService");
const policyStatusUpdateLogService = require("../../../services/v1/admin/policyStatusUpdateLogService");
const helper = require('../../../common/helper');
const ExcelJS = require('exceljs');
const mailConfig = require("../../../config/mailConfig");
const ApiContracts = require('authorizenet').APIContracts;


/*****************************
 *  GET ALL PAYMENTS
 ******************************/
exports.getAllPaymentHistory = async (req, res, next) => {
    try {
        let roleBasedCondition = helper.generateRoleBasedCondition(req.tokenData)

        let parsedUrl = url.parse(req.url);
        let parsedQp = querystring.parse(parsedUrl.query);
        let associationSearch = {
            [Op.and]: [], // Initialize an array for AND conditions
        };
        if (parsedQp.full_name) {
            const nameGroup = {
                [Op.or]: [
                    {
                        '$policy_details.first_name$': {
                            [Op.iLike]: `%${parsedQp.full_name}%`,
                        },
                    },
                    {
                        '$policy_details.last_name$': {
                            [Op.iLike]: `%${parsedQp.full_name}%`,
                        },
                    },
                ],
            };
            associationSearch[Op.and].push(nameGroup);
        } else if (parsedQp.email) {
            associationSearch[Op.and].push({
                '$policy_details.email$': {
                    [Op.iLike]: `%${parsedQp.email}%`,
                },
            });

        } else if (parsedQp.policy_number) {
            associationSearch[Op.and].push({
                '$policy_details.policy_number$': {
                    [Op.iLike]: `%${parsedQp.policy_number}%`,
                },
            });
        }

        //return
        let searchingValue = req.query.search || '';
        let sortField = req.query.sortField || 'created_by';
        let sortOrder = req.query.sortOrder || 'DESC';
        let nameQueryForSearch = searchingValue ? searchingValue.trim().split(" ") : [];
        let firstName = nameQueryForSearch[0]?.trim();
        let lastName = nameQueryForSearch[1]?.trim();

        let searchQuery = searchingValue ? {
            [Op.or]: [

                {
                    ticket_no: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    // Search in the associated model columns
                    '$policy_details.first_name$': {
                        [Op.iLike]: `%${firstName}%`,
                    },
                }, {
                    // Search in the associated model columns
                    '$policy_details.last_name$': {
                        [Op.iLike]: `%${lastName ? lastName : firstName}%`,
                    },
                },
                {
                    // Search in the associated model columns
                    '$policy_details.policy_number$': {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    '$policy_details.email$': {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                }
            ]
        } : {};
        let order;
        if (sortField === 'policy_details.first_name') {
            order = [[{ model: db.policiesModel, as: 'policy_details' }, 'first_name', sortOrder]];
        } else if (sortField === 'policy_details.last_name') {
            order = [[{ model: db.policiesModel, as: 'policy_details' }, 'last_name', sortOrder]];
        } else if (sortField === 'policy_details.policy_number') {
            order = [[{ model: db.policiesModel, as: 'policy_details' }, 'policy_number', sortOrder]];
        } else if (sortField === 'policy_details.email') {
            order = [[{ model: db.policiesModel, as: 'policy_details' }, 'email', sortOrder]];
        }else if (sortField === 'customer_details.first_name') {
            order = [[{ model: db.customersModel, as: 'customer_details' }, 'first_name', sortOrder]];
        } else {
            order = [[sortField, sortOrder]];
        }
        let payment_status = parsedQp.paymentStatus ? parseInt(parsedQp.paymentStatus) : '';

        let filterByPaymentDate = parsedQp.filterByPaymentDate ? parsedQp.filterByPaymentDate : '';
        let filterByCreatedAtDate = parsedQp.filterByCreatedAtDate ? parsedQp.filterByCreatedAtDate : '';
        let filterByPaymentSuccessDate = parsedQp.filterByPaymentSuccessDate ? parsedQp.filterByPaymentSuccessDate : '';
        let from_amount = parsedQp.fromAmount ? parsedQp.fromAmount : '';
        let to_amount = parsedQp.toAmount ? parsedQp.toAmount : '';
        let payment_type = parsedQp.paymentType ? parseInt(parsedQp.paymentType) : '';
        let queryOptions = {
            where: {
                ...roleBasedCondition,
                ...searchQuery,
                ...associationSearch
            },
            attributes: { exclude: ['deleted_by', 'deleted_at'] },
            include: [
                {
                    model: db.policiesModel,
                    as: 'policy_details',
                    attributes: ['policy_id', 'policy_number', 'first_name', 'last_name', "email", "source","is_anamaly"]
                },
                {
                    model: db.customersModel,
                    as: 'customer_details',
                    attributes: ['customer_id', 'first_name', 'last_name']
                },

            ],
            order: order,
        };

        if (payment_status) {
            queryOptions.where[Op.and].push(
                { payment_status: parseInt(payment_status) })

        }

        if (filterByPaymentDate) {
            if (!queryOptions.where[Op.and]) {
                queryOptions.where[Op.and] = [];
            }
            queryOptions.where[Op.and].push({
                payment_date: {
                    [Op.between]: [filterByPaymentDate.split(',')[0], filterByPaymentDate.split(',')[1]]
                }
            });
        }
        if (filterByPaymentSuccessDate) {
            if (!queryOptions.where[Op.and]) {
                queryOptions.where[Op.and] = [];
            }
            queryOptions.where[Op.and].push({
                payment_successfull_date: {
                    [Op.between]: [filterByPaymentSuccessDate.split(',')[0], filterByPaymentSuccessDate.split(',')[1]]
                }
            });
        }
        if (filterByCreatedAtDate) {
            if (!queryOptions.where[Op.and]) {
                queryOptions.where[Op.and] = [];
            }
            queryOptions.where[Op.and].push({
                created_at: {
                    [Op.between]: [filterByCreatedAtDate.split(',')[0], filterByCreatedAtDate.split(',')[1]]
                }
            });
        }

        if (from_amount && to_amount) {
            if (!queryOptions.where[Op.and]) {
                queryOptions.where[Op.and] = [];
            }
            queryOptions.where[Op.and].push({
                amount: {
                    [Op.between]: [from_amount, to_amount]
                }
            });
        }



        if (payment_type) {
            queryOptions.where[Op.and].push(
                { payment_type: payment_type }
            )
        }
        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }


        allPayments = await paymentService.getAllPayments(queryOptions);
        if (allPayments) {
            allPayments.rows = await Promise.all(allPayments.rows.map(async (element) => {
                if (element.create_user_type == 2) {
                    element.created_user_info = await helper.getUserInfo(parseInt(element.created_by));
                }
                if (element.update_user_type == 2) {
                    element.updated_user_info = await helper.getUserInfo(parseInt(element.updated_by));
                }
                if (element.create_user_type == 1) {
                    // Handle create_user_type 3 if needed
                    element.created_user_info = {
                        customer_id: element.customer_id,
                        first_name: element.first_name,
                        last_name: element.last_name,
                    }
                }
                await paymentService.PaymentsFlagStatusName(element);
                return element;
            }));
        }

        if (res.pagination) {
            res.pagination.total = allPayments.count;
            res.pagination.totalPages = Math.ceil(allPayments.count / queryOptions.limit)
        }
        if (allPayments.count > 0) {
            res.status(200).send({ status: 1, data: allPayments.rows, pagination: res.pagination,payment_status: res.payment_status,payment_type: res.payment_type, message: 'Payment list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allPayments.rows, pagination: res.pagination,payment_status: res.payment_status,payment_type: res.payment_type, message: 'No Payment found' })
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}
/*****************************
 *  GET CUSTOMER ALL PAYMENTS
 ******************************/
exports.getCustomerAllPayments = async (req, res, next) => {
    try {
        const { customer_id } = req.params
        let queryOptions = {
            where: {
                customer_id: customer_id,
                org_id: req.tokenData.org_id
            },
            attributes: { exclude: ['deleted_by', 'deleted_at'] },
            include: [
                {
                    model: db.policiesModel,
                    as: 'policy_details',
                    attributes: ['policy_id', 'policy_number', 'first_name', 'last_name', "email", "source"]
                },
                {
                    model: db.customersModel,
                    as: 'customer_details',
                    attributes: ['customer_id', 'first_name', 'last_name']
                },
            ],
        };
        allPayments = await paymentService.getAllPayments(queryOptions);
        if (allPayments) {
            allPayments.rows = await Promise.all(allPayments.rows.map(async (element) => {
                element.card_number = element.card_number ? "xxxx xxxx xxxx " + element.card_number : null
                if (element.create_user_type == 2) {
                    element.created_user_info = await helper.getUserInfo(parseInt(element.created_by));
                }
                if (element.update_user_type == 2) {
                    element.updated_user_info = await helper.getUserInfo(parseInt(element.updated_by));
                }
                if (element.create_user_type == 1) {
                    // Handle create_user_type 3 if needed
                    element.created_user_info = {
                        customer_id: element.customer_id,
                        first_name: element.first_name,
                        last_name: element.last_name,
                    }
                }
                await paymentService.PaymentsFlagStatusName(element);
                return element;
            }));

        }
        if (allPayments.count > 0) {
            res.status(200).send({ status: 1, data: allPayments.rows, message: 'Payment list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allPayments.rows, message: 'No Payment found' })
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}
exports.exportGetAllPaymentHistory = async (req, res, next, data) => {
    try {
        const key = req.params.key
        let customerData = data
        if (key == 'export_xlsx' || key == 'export_csv') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Payment History");
            worksheet.columns = [
                { header: "SL", key: "sl_no" },
                // { header: "Id", key: "id" },
                { header: "Full Name", key: "full_name" },
                { header: "First Name", key: "first_name" },
                { header: "Last Name", key: "last_name" },
                { header: "Email", key: "email" },
                { header: "Policy No.", key: "policy_number" },
                { header: "Ticket No.", key: "ticket_no" },
                { header: "Payment Status", key: "payment_status" },
                { header: "Amount", key: "amount" },
                { header: "Cheque Number", key: "cheque_no" },
                { header: "Payment Type", key: "payment_type" },
                { header: "Schedule Payment Date", key: "payment_date" },
                { header: "Successfully Payment Date", key: "payment_successfull_date" },
                { header: "Created By", key: "created_info" },
                { header: "Updated By", key: "updated_info" },
                { header: "Created On", key: "created_at" },
                { header: "Updated On", key: "updated_at" },
            ]
            worksheet.columns.forEach(function (column, i) {
                var maxLength = 0;
                column["eachCell"]({ includeEmpty: true }, function (cell) {
                    var columnLength = cell.value ? cell.value.toString().length : 20;
                    if (columnLength > maxLength) {
                        maxLength = columnLength;
                    }
                });
                column.width = maxLength < 10 ? 10 : maxLength;
            });
            let counter = 1;
            customerData.forEach(element => {
                element.sl_no = counter;
                element.full_name = `${element.policy_details.first_name} ${element.policy_details.last_name}`
                element.first_name = `${element.policy_details.first_name}`
                element.last_name = `${element.policy_details.last_name}`
                element.email = element.policy_details.email ? element.policy_details.email : 'N/A'
                element.policy_number = element.policy_details.policy_number ? element.policy_details.policy_number : 'N/A'
                element.ticket_no = element.ticket_no ? element.ticket_no : 'N/A'
                element.cheque_no = element.cheque_no ? element.cheque_no : 'N/A'
                element.created_info = element.created_user_info ? `${element.created_user_info.first_name ? element.created_user_info.first_name : 'N/A'} ${element.created_user_info.last_name ? element.created_user_info.last_name : ''}` : 'N/A'
                //console.log(element.created_user_info);
                element.updated_info = element.updated_user_info ? `${element.updated_user_info.first_name} ${element.updated_user_info.last_name}` : 'N/A'

                if (element.payment_status == 1) {
                    element.payment_status = 'Success';
                } else if (element.payment_status == 2) {
                    element.payment_status = 'Failed';
                } else if (element.payment_status == 3) {
                    element.payment_status = 'Cancelled';
                } else if (element.payment_status == 4) {
                    element.payment_status = 'Pending';
                } else if (element.payment_status == 5) {
                    element.payment_status = 'Deactivate';
                } else if (element.payment_status == 6) {
                    element.payment_status = 'Awating for Escrow'
                } else if (element.payment_status == 7) {
                    element.payment_status = 'Do not Charge'
                }

                if (element.payment_type == 1) {
                    element.payment_type = 'CREDIT CARD'
                } else if (element.payment_type == 2) {
                    element.payment_type = 'BANK ACH'
                } else if (element.payment_type == 3) {
                    element.payment_type = 'Escrow'
                } else if (element.payment_type == 4) {
                    element.payment_type = 'Do not Charge'
                }

                element.payment_date = element.payment_date ? moment(element.payment_date).format('MM-DD-YYYY') : 'N/A'
                element.payment_successfull_date = element.payment_successfull_date ? moment(element.payment_successfull_date).format('MM-DD-YYYY') : 'N/A'
                element.created_at = element.created_at ? moment(element.created_at).format('MM-DD-YYYY') : 'N/A'
                element.updated_at = element.updated_at ? moment(element.updated_at).format('MM-DD-YYYY') : 'N/A'
                worksheet.addRow(element)
                counter++;
            });
            worksheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true };
            })

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )

            res.setHeader("Content-Disposition", `attachment; filename=paymentList.${key == 'export_csv' ? 'csv' : 'xlsx'}`);
            res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

            return workbook.xlsx.write(res).then(() => {
                res.status(200);
            })
        }
        next()
    } catch (error) {
        next(error)
    }
}
/*****************************
 *  GET ALL FAILED PAYMENTS
 ******************************/
exports.getAllFailedPayment = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQp = querystring.parse(parsedUrl.query);
        let searchingValue = req.query.search || '';
        let sortField = req.query.sortField || 'created_by';
        let sortOrder = req.query.sortOrder || 'DESC';
        let nameQueryForSearch = searchingValue ? searchingValue.trim().split(" ") : [];
        let searchQuery = searchingValue ? {
            [Op.or]: [

                {
                    ticket_no: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    // Search in the associated model columns
                    '$customer_details.first_name$': {
                        [Op.iLike]: `%${nameQueryForSearch[0].trim()}%`,
                    },
                }, {
                    // Search in the associated model columns
                    '$customer_details.last_name$': {
                        [Op.iLike]: `%${nameQueryForSearch[1].trim() ? nameQueryForSearch[1].trim() : nameQueryForSearch[0].trim()}%`,
                    },
                },
                {
                    // Search in the associated model columns
                    '$policy_details.policy_number$': {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                }
            ]
        } : {};
        let order;
        if (sortField === 'customer_details.first_name') {
            order = [[{ model: db.customersModel, as: 'customer_details' }, 'first_name', sortOrder]];
        } else if (sortField === 'policy_details.policy_number') {
            order = [[{ model: db.policiesModel, as: 'policy_details' }, 'policy_number', sortOrder]];
        } else {
            order = [[sortField, sortOrder]];
        }

        let start_date = parsedQp.startDate ? parsedQp.startDate : '';
        let end_date = parsedQp.endDate ? parsedQp.endDate : '';
        let from_amount = parsedQp.fromAmount ? parsedQp.fromAmount : '';
        let to_amount = parsedQp.toAmount ? parsedQp.toAmount : '';
        let queryOptions = {
            where: {
                payment_status: 2,
                ...searchQuery,
            },
            attributes: { exclude: ['deleted_by', 'deleted_at'] },
            include: [
                {
                    model: db.policiesModel,
                    as: 'policy_details',
                    attributes: ['policy_id', 'policy_number']
                },
                {
                    model: db.customersModel,
                    as: 'customer_details',
                    attributes: ['customer_id', 'first_name', 'last_name']
                },

            ],
            order: order,
        };

        queryOptions.where[Op.and] = [
            { payment_type: 1 }
        ];
        if (start_date && end_date) {
            if (!queryOptions.where[Op.and]) {
                queryOptions.where[Op.and] = [];
            }
            queryOptions.where[Op.and].push({
                payment_date: {
                    [Op.between]: [start_date, end_date]
                }
            });
        }

        if (from_amount && to_amount) {
            if (!queryOptions.where[Op.and]) {
                queryOptions.where[Op.and] = [];
            }
            queryOptions.where[Op.and].push({
                amount: {
                    [Op.between]: [from_amount, to_amount]
                }
            });
        }




        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }


        allPayments = await paymentService.getAllPayments(queryOptions);
        if (allPayments) {
            allPayments.rows = await Promise.all(allPayments.rows.map(async (element) => {
                if (element.create_user_type == 2) {
                    element.created_user_info = await helper.getUserInfo(parseInt(element.created_by));
                }
                if (element.update_user_type == 2) {
                    element.updated_user_info = await helper.getUserInfo(parseInt(element.updated_by));
                }
                if (element.create_user_type == 1) {
                    // Handle create_user_type 3 if needed
                    element.created_user_info = {
                        customer_id: element.customer_id,
                        first_name: element.first_name,
                        last_name: element.last_name,
                    }
                }
                await paymentService.PaymentsFlagStatusName(element);
                return element;
            }));
        }
        if (res.pagination) {
            res.pagination.total = allPayments.count;
            res.pagination.totalPages = Math.ceil(allPayments.count / queryOptions.limit)
        }
        if (allPayments.count > 0) {
            res.status(200).send({ status: 1, data: allPayments.rows, pagination: res.pagination, message: 'Payment list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allPayments.rows, pagination: res.pagination, message: 'No Payment found' })
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}


exports.updatePayment = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();

    try {
        let { payment_id } = req.params;
        const org_user_id = req.tokenData.org_user_id;
        let isExist = await paymentService.getPaymentById(payment_id, {
            include: [
                {
                    model: db.policiesModel,
                    as: 'policy_details',
                    include: [
                        {
                            model: db.planTermsModel,
                            as: 'plan_term_details',
                            attributes: { exclude: ['deleted_by', 'deleted_at'] },
                        },

                    ]
                },
            ]
        });
        if (!isExist) {
            throw new CustomError(`Something Went wrong! Payment not found`, 400)
        }

        let policyDetails = await policyService.findPolicyByPolicyId(isExist.policy_id);
        if (!policyDetails) {
            throw new CustomError('Policy information not found')
        }

        let paymentData = {}
        let policyData = {}
        // AUDIT TRAIL PAYLOAD
        let auditData = {
            section: 'ADMIN_PORTAL',
            customer_id: isExist.customer_id,
            table_name: 'hws_payments',
            source: 1,
            create_user_type: 2,
            created_by: org_user_id,
            device_id: helper.getDeviceId(req.headers['user-agent']),
        }
        if (isExist.payment_type == 1) {
            //CREDIT CARD PAYMENT
            paymentData = {
                amount: req.body.amount ? req.body.amount : null,
                payment_date: req.body.payment_date ? req.body.payment_date : null,
                payment_status: req.body.payment_status ? req.body.payment_status : isExist.payment_status,

            }
        } else if (isExist.payment_type == 2) {
            //BANK PAYMENT
            paymentData = {
                cheque_no: req.body.cheque_no ? req.body.cheque_no : null,
                amount: req.body.amount ? req.body.amount : null,
                payment_date: req.body.payment_date ? moment(req.body.payment_date).format('YYYY-MM-DD') : null,
                payment_status: req.body.payment_status ? req.body.payment_status : null,
            }

        } else if (isExist.payment_type == 3) {
            //ESCROW PAYMENT
            paymentData = {
                cheque_no: req.body.cheque_no ? req.body.cheque_no : null,
                amount: req.body.amount ? req.body.amount : null,
                payment_date: req.body.payment_date ? moment(req.body.payment_date).format('YYYY-MM-DD') : null,
                payment_successfull_date: req.body.payment_successfull_date ? moment(req.body.payment_successfull_date).format('YYYY-MM-DD') : null,
                payment_status: req.body.payment_status ? req.body.payment_status : null,
            }

            if (paymentData.payment_status == 1) {
                if (isExist.policy_details.policy_status == 4) {
                    // if policy status == awaiting for escrow
                    let policyStatusUpdateLogData = {
                        org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
                        policy_id: isExist.policy_id,
                        prev_policy_status_id: isExist?.policy_details.policy_status,
                        prev_policy_status: await policyService.getPolicyStatusFlagName(isExist.policy_details.policy_status),
                        current_policy_status_id: 2,//hold
                        current_policy_status: await policyService.getPolicyStatusFlagName(2)
                    }
                    // console.log('policyStatusUpdateLogData',policyStatusUpdateLogData);
                    // console.log('isExist',isExist);
                    // return
                    await policyStatusUpdateLogService.createPolicyStatusUpdateLog(policyStatusUpdateLogData, transaction)
                    const policyStartDate = moment(paymentData.payment_successfull_date).add(30, 'days').format("YYYY-MM-DD")
                    const policyEndDate = moment(policyStartDate).add(isExist.policy_details.plan_term_details.plan_term_month, 'month').format("YYYY-MM-DD");
                    const endWithBonusDate = moment(policyEndDate).add(isExist.policy_details.bonus_month, 'month').format("YYYY-MM-DD");
                    policyData = {
                        order_date: paymentData.payment_successfull_date,
                        policy_start_date: policyStartDate,
                        policy_expiry_date: policyEndDate,
                        expiry_with_bonus: endWithBonusDate,
                        policy_status: 2//hold
                    }
                    // console.log('policyData',policyData);
                    await policyService.updatePolicy(isExist.policy_id, policyData, transaction)
                }
            }
        } else if (isExist.payment_type == 4) {
            //DO NOT CHARGE PAYMENT
            // auditData.description = `do not charge payment successfully done against policy number ${policyDetails.policy_number} from admin portal`;
            paymentData = {
                transaction_no: req.body.transaction_no ? req.body.transaction_no : null,
                cheque_no: req.body.cheque_no ? req.body.cheque_no : null,
                payment_date: req.body.payment_date ? moment(req.body.payment_date).format('YYYY-MM-DD') : null,
                payment_successfull_date: req.body.payment_successfull_date ? moment(req.body.payment_successfull_date).format('YYYY-MM-DD') : null,
                payment_status: req.body.payment_status ? req.body.payment_status : null,
                payment_type: req.body.payment_type ? req.body.payment_type : null,
            }

            if (paymentData.payment_status == 1) {

                if (isExist.policy_details.policy_status == 5) {
                    // if policy status == Do not charge
                    let policyStatusUpdateLogData = {
                        org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
                        policy_id: isExist.policy_id,
                        prev_policy_status_id: isExist?.policy_details.policy_status,
                        prev_policy_status: await policyService.getPolicyStatusFlagName(isExist.policy_details.policy_status),
                        current_policy_status_id: 2,//hold
                        current_policy_status: await policyService.getPolicyStatusFlagName(2),// 2 => hold
                    }

                    await policyStatusUpdateLogService.createPolicyStatusUpdateLog(policyStatusUpdateLogData, transaction)
                    const policyStartDate = moment(paymentData.payment_successfull_date).add(30, 'days').format("YYYY-MM-DD")
                    const policyEndDate = moment(policyStartDate).add(isExist.policy_details.plan_term_details.plan_term_month, 'month').format("YYYY-MM-DD");
                    const endWithBonusDate = moment(policyEndDate).add(isExist.policy_details.bonus_month, 'month').format("YYYY-MM-DD");
                    policyData = {
                        order_date: paymentData.payment_successfull_date,
                        policy_start_date: policyStartDate,
                        policy_expiry_date: policyEndDate,
                        expiry_with_bonus: endWithBonusDate,
                        policy_status: 2//hold
                    }
                    // console.log('policyData',policyData);
                    await policyService.updatePolicy(isExist.policy_id, policyData, transaction)
                }
            }
        }
        paymentData.update_user_type = 2,//self customer =>1, admin-user=>2, realtor=>3,
            paymentData.updated_by = req.tokenData.org_user_id
        let updatePayment = await paymentService.updatePayment(payment_id, paymentData, transaction)
        if (updatePayment) {
            auditData.row_id = payment_id;

            let updatedAuditData = paymentService.modifiedFieldValue(isExist, paymentData);

            auditData.description = null;
            if (updatedAuditData.length > 0) {
                let descriptions = [];
                updatedAuditData.forEach(async (item, index) => {

                    /*   let updatePolicyMsz=``
                       if (policyData.policy_status) {
                           if (policyData.policy_status!=isExist.policy_details.policy_status) {
                               let oldStatus= await await policyService.getPolicyStatusFlagName(isExist.policy_details.policy_status)
                               let newStatus = await await policyService.getPolicyStatusFlagName(policyData.policy_status)
                               // console.log('oldStatus',oldStatus);
                               updatePolicyMsz=` and policy status changed ${oldStatus} to ${newStatus}`
                           }
                           
                       }
                       if (policyData.startDate && (policyData.policy_start_date!=isExist.policy_details.policy_start_date || policyData.expiry_with_bonus!=isExist.policy_details.expiry_with_bonus)) {
   
                           updatePolicyMsz +=` and policy start date changed ${moment(isExist.policy_details.policy_start_date).format('MM-dd-YYYY')} to ${moment(policyData.policy_start_date).format('MM-dd-YYYY')}, end date changed ${moment(isExist.policy_details.expiry_with_bonus).format('MM-dd-YYYY')} to ${moment(policyData.expiry_with_bonus).format('MM-dd-YYYY')} `
                       } */
                    // ${updatePolicyMsz?updatePolicyMsz:''}
                    descriptions.push(`${paymentService.getPaymentTypeFlagName(isExist.payment_type)} Payment ${item.field} value changed ${item.old_val} to ${item.new_val} against policy number ${policyDetails.policy_number} `);
                    // descriptions.push(updatePolicyMsz)
                    // console.log('updatePolicyMsz',updatePolicyMsz);

                });
                auditData.description = descriptions.join(', ') + ' from admin portal';
                await helper.updateAuditTrail(auditData, req);
                // return
            }
            // console.log('policyData', policyData);
            if (policyData) {
                let updatedPolicyAuditData = await policyService.modifiedFieldValue(policyDetails, policyData, []);
                // console.log('updatedPolicyAuditData', updatedPolicyAuditData);
                if (updatedPolicyAuditData.length > 0) {
                    let auditData = {
                        section: 'ADMIN_PORTAL',
                        customer_id: isExist.customer_id,
                        row_id: policyDetails.policy_id,
                        table_name: 'hws_policies',
                        description: null,
                        source: 1,
                        create_user_type: 2,
                        created_by: org_user_id,
                        device_id: helper.getDeviceId(req.headers['user-agent']),
                    }
                    let descriptions = [];
                    updatedPolicyAuditData = await Promise.all(updatedPolicyAuditData.map(async (item, index) => {
                        descriptions.push(`${paymentService.getPaymentTypeFlagName(isExist.payment_type)} Payment update time Policy ${item.field} value changed ${item.old_val} to ${item.new_val} against policy number ${policyDetails.policy_number} `);
                    }));
                    auditData.description = descriptions.join(', ') + ' from admin portal';
                    await helper.updateAuditTrail(auditData, req);
                }
            }
            transaction.commit()
            res.status(200).send({ status: 1, message: `Payment information has been updated successfully.` })
        } else {
            auditData.row_id = payment_id;
            auditData.description = `payment failed for policy number ${policyDetails.policy_number} from admin portal`;
            //await helper.updateAuditTrail(auditData,req);
            transaction.rollback()
            res.status(200).send({ status: 0, message: `The updating of payment information failed.` })
        }
    } catch (error) {
        transaction.rollback()
        next(error);

    }
}

exports.retryFailedPayment = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {

        const { payment_id } = req.params
        let queryOption = {
            include: [
                {
                    model: db.policiesModel,
                    as: 'policy_details',
                },
                {
                    model: db.customersModel,
                    as: 'customer_details',
                },

            ],
        }
        let existingPayment = await paymentService.getPaymentById(payment_id, queryOption);
        if (!existingPayment) {
            throw new CustomError(`Payment details not found `, 400)
        }
        let auditData = {
            customer_id: existingPayment.customer_id,
            user_id: req.tokenData.org_user_id,
            row_id: payment_id,
            section: 'ADMIN_RETRY_FAILED_PAYMENT',
            table_name: 'hws_payments',
            source: 1,
            create_user_type: 2,
            created_by: req.tokenData.org_user_id,
            device_id: existingPayment.policy_details.device_id,
        }
        // console.log('existingPayment', existingPayment);
        const existingPrimaryCard = await customerCardService.getCustomerCardById({ where: { customer_id: existingPayment.customer_id, org_id: req.tokenData.org_id, primary_card: true } })
        if (!existingPrimaryCard) {
            throw new CustomError(`Card details not found `, 400)
        }
        const createUserInfo = await helper.getUserInfo(req.tokenData.org_id);
        // console.log('existingPrimaryCard', existingPrimaryCard);
        let paymentObj = {
            authorizeNet_customer_profile_id: existingPayment.customer_details.authorizeNet_customer_profile_id,
            authorizeNet_payment_profile_id: existingPrimaryCard.authorizeNet_payment_profile_id,
            // tax_amount: 0,
            chargable_amount: existingPayment.amount,
            policy_id: existingPayment.policy_id 
            // orderDetails: `${planInfo.plan_name} plan from  ${element.policy_end_date ? moment(element.policy_end_date).format('YYYY-MM-DD') : null} to ${element.expiry_with_bonus ? moment(element.expiry_with_bonus).format('YYYY-MM-DD') : null}`
        }
        // console.log('paymentObj', paymentObj);
        const chargeCustomerProfileResponse = await securePaymentsService.chargeCustomerProfile(paymentObj);
        const responseObject = chargeCustomerProfileResponse;
        const resultCode = responseObject?.messages?.resultCode;
        const code = responseObject?.messages?.message[0]?.code;
        const transactionResponse =  responseObject?.transactionResponse;
        const transactionResponseCode =  responseObject?.transactionResponse?.responseCode;
        if (resultCode === 'Ok' && code === 'I00001' && transactionResponse && (transactionResponseCode== 1|| transactionResponseCode== 4)) {    
        // if (chargeCustomerProfileResponse.getTransactionResponse() && chargeCustomerProfileResponse.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
            // if (chargeCustomerProfileResponse.getTransactionResponse() && chargeCustomerProfileResponse.getTransactionResponse().getResponseCode() === '1') {
            // Payment was successful  policy status change for failed to active/30 day wait created_by, created_at
            const lastSucessPayment = paymentService.findLastSuccessfulPayment(req.tokenData.org_id, existingPayment.customer_id);
            let paymentData = {
                transaction_response: chargeCustomerProfileResponse,//.getTransactionResponse(),
                transaction_no: chargeCustomerProfileResponse.getTransactionResponse().getTransId(),
                payment_status: 1,
                payment_successfull_date: moment().format("YYYY-MM-DD")
            }
            let updatePayment = await paymentService.updatePayment(payment_id, paymentData, transaction);//success=>1, 
            // console.log('updatePayment',updatePayment);
            if (updatePayment) {

                let existingFailedPayments = await paymentService.getAllPayments({ where: { customer_id: existingPayment.customer_id, org_id: req.tokenData.org_id, payment_status: 2, [Op.not]: [{ payment_id: payment_id },], } });//failed=>2,
                let policyData = {}
                // console.log('existingFailedPayments',existingFailedPayments);
                auditData.description = `Retry failed payment completed successfully.  created by ${createUserInfo.first_name} ${createUserInfo.last_name}`;

                if (existingFailedPayments.rows.length == 0) {
                    const policyStartDate = moment(existingPayment.policy_details.policy_start_date);
                    // console.log('policyStartDate',policyStartDate);
                    if (existingPayment.policy_details.policy_term_month == 1 && existingPayment.recurring_type == 1) {
                        const policyEndDate = moment(lastSucessPayment.payment_successfull_date).add(30, 'days').format("YYYY-MM-DD")
                        const endWithBonusDate = policyEndDate
                        policyData = {
                            policy_start_date: policyStartDate,
                            policy_expiry_date: policyEndDate,
                            expiry_with_bonus: endWithBonusDate,
                            policy_status: 1,// Active=>1,
                        }
                        // console.log('policyData',policyData);
                        if (policyStartDate.isAfter(moment())) {
                            // existingPayment.policy_details.policy_start_date is after the current date
                            // Your logic here
                            policyData.policy_status = 2// 30 days hold=>2,

                        } else {
                            policyData.policy_status = 1
                        }
                    } else {
                        if (policyStartDate.isAfter(moment())) {
                            // existingPayment.policy_details.policy_start_date is after the current date
                            // Your logic here
                            policyData.policy_status = 2// 30 days hold=>2,


                        } else {
                            policyData.policy_status = 1
                        }
                    }
                    // console.log('policyData',policyData);
                    await policyService.updatePolicy(existingPayment.policy_id, policyData, transaction)
                    if (policyData.policy_status != existingPayment.policy_details.policy_status) {
                        console.log('createUserInfo', createUserInfo);
                        let policyStatusUpdateLogData = {
                            org_id: req.tokenData.org_id,
                            policy_id: existingPayment.policy_id,
                            prev_policy_status_id: existingPayment?.policy_details.policy_status,
                            prev_policy_status: await policyService.getPolicyStatusFlagName(existingPayment.policy_details.policy_status),
                            current_policy_status_id: policyData.policy_status,
                            current_policy_status: await policyService.getPolicyStatusFlagName(policyData.policy_status),
                            description: `Policy status change  ${await policyService.getPolicyStatusFlagName(existingPayment.policy_details.policy_status)} to ${await policyService.getPolicyStatusFlagName(policyData.policy_status)} created by ${createUserInfo.first_name} ${createUserInfo.last_name} at ${moment()}`
                        }
                        auditData.description = `Payment completed successfully, Policy status change  ${await policyService.getPolicyStatusFlagName(existingPayment.policy_details.policy_status)} to ${await policyService.getPolicyStatusFlagName(policyData.policy_status)} created by monthly payment processed CRON `;

                        // console.log('policyStatusUpdateLogData', policyStatusUpdateLogData);
                        // console.log('isExist',isExist);
                        // return
                        await policyStatusUpdateLogService.createPolicyStatusUpdateLog(policyStatusUpdateLogData, transaction)
                    }

                } else {

                }
                // return
                transaction.commit()
                await helper.updateAuditTrail(auditData, req)

                res.status(200).send({ status: 1, message: `Payments have been made successfully` })
            } else {
                transaction.rollback()

                res.status(200).send({ status: 0, message: `Failure to make payments has occurred` })

            }
        } else {
            throw new CustomError(`Failure to make payments has occurred`, 400)
        }
    } catch (error) {
        transaction.rollback()
        next(error)
    }
}

exports.deletepayment = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { payment_id } = req.params
        const { deleted_by } = req.tokenData.org_user_id;
        let updatePayments = await paymentService.updatePayment(payment_id, { deleted_by: deleted_by }, transaction)
        let deletePaymentRes = await db.paymentsModel.destroy({ where: { payment_id: payment_id }, transaction });
        if (deletePaymentRes) {
            res.status(200).send({ status: 1, message: 'Escrow payment deleted successfully' })
        }
        transaction.commit()
    } catch (error) {
        transaction.rollback()
        next(error)
    }
}


// For Monthly Payment Cron
exports.processMonthlyRecurringPayments = async () => {
    // Your logic for processing recurring payments goes here
    const transaction = await db.sequelize.transaction();
    try {

        let queryOption = {
            where: {
                org_id: helper.default_org_id,
                payment_type: 1, //CREDIT CARD=>1,
                payment_date: moment().format('YYYY-MM-DD'),
                recurring_type: 1,// 1=>monthly
                payment_status: 4, // pending=>4
            },
            include: [
                {
                    model: db.policiesModel,
                    as: 'policy_details',

                },
                {
                    model: db.customersModel,
                    as: 'customer_details',
                    include: {
                        model: db.customerCardsModel,
                        as: 'card_list',
                        where: {
                            primary_card: true
                        }
                    }
                },

            ],
            limit: 3,
        }
        let allPayments = await paymentService.getAllPayments(queryOption);
        allPayments = allPayments.rows
        // console.log('allPayments',allPayments);
        if (allPayments.length > 0) {
            for (let i = 0; i < allPayments.length; i++) {
                const element = allPayments[i];
                let auditData = {
                    org_id: helper.default_org_id,
                    customer_id: element.customer_id,
                    user_id: null,
                    row_id: element.payment_id,
                    section: 'MONTHLY_PAYMENT_PROCESS_CRON',
                    table_name: 'hws_payments',
                    source: 10,
                    create_user_type: 10,
                    created_by: null,
                    device_id: null,
                }
                if (element.customer_details.card_list[0]) {
                    let paymentObj = {
                        authorizeNet_customer_profile_id: element.customer_details.authorizeNet_customer_profile_id,
                        authorizeNet_payment_profile_id: element.customer_details.card_list[0].authorizeNet_payment_profile_id,
                        // tax_amount: 0,
                        chargable_amount: element.amount,
                        policy_id: element.policy_id 
                        // orderDetails: `${planInfo.plan_name} plan from  ${element.policy_end_date ? moment(element.policy_end_date).format('YYYY-MM-DD') : null} to ${element.expiry_with_bonus ? moment(element.expiry_with_bonus).format('YYYY-MM-DD') : null}`
                    }
                    //  console.log('paymentObj', paymentObj);
                    const chargeCustomerProfileResponse = await securePaymentsService.chargeCustomerProfile(paymentObj);
                    // console.log('chargeCustomerProfileResponse',chargeCustomerProfileResponse);
                    const responseObject = chargeCustomerProfileResponse;
                    const resultCode = responseObject?.messages?.resultCode;
                    const code = responseObject?.messages?.message[0]?.code;
                    const transactionResponse =  responseObject?.transactionResponse;
                    const transactionResponseCode =  responseObject?.transactionResponse?.responseCode;
                    if (resultCode === 'Ok' && code === 'I00001' && transactionResponse && (transactionResponseCode== 1|| transactionResponseCode== 4)) {   
                    // if (chargeCustomerProfileResponse.getTransactionResponse() && chargeCustomerProfileResponse.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
                        // Payment was successful  policy status change for failed to active/30 day wait created_by, created_at
                        const lastSucessPayment = paymentService.findLastSuccessfulPayment(element.org_id, element.customer_id);
                        let paymentData = {
                            transaction_response: chargeCustomerProfileResponse.getTransactionResponse(),
                            transaction_no: chargeCustomerProfileResponse.getTransactionResponse().getTransId(),
                            payment_status: 1,//success=>1
                            payment_successfull_date: moment().format("YYYY-MM-DD")
                        }
                        let updatePayment = await paymentService.updatePayment(element.payment_id, paymentData, transaction);

                        if (updatePayment) {
                            // console.log('paymentData', paymentData);
                            // console.log('updatePayment', updatePayment);
                            let existingFailedPayments = await paymentService.getAllPayments({ where: { customer_id: element.customer_id, org_id: element.org_id, payment_status: 2, } });//failed=>2,
                            let policyData = {}
                            // console.log('existingFailedPayments', existingFailedPayments);
                            auditData.description = `Cron payment process completed successfully.  `;

                            if (existingFailedPayments.rows.length == 0) {
                                const policyStartDate = moment(element.policy_details.policy_start_date);
                                // console.log('policyStartDate',policyStartDate);
                                if (element.policy_details.policy_term_month == 1) {
                                    const policyEndDate = moment(lastSucessPayment.payment_successfull_date).add(30, 'days').format("YYYY-MM-DD")
                                    const endWithBonusDate = policyEndDate
                                    policyData = {
                                        policy_start_date: policyStartDate,
                                        policy_expiry_date: policyEndDate,
                                        expiry_with_bonus: endWithBonusDate,
                                        policy_status: 1,// Active=>1,
                                    }
                                    // console.log('policyData',policyData);
                                    if (policyStartDate.isAfter(moment())) {
                                        // existingPayment.policy_details.policy_start_date is after the current date
                                        // Your logic here
                                        policyData.policy_status = 2// 30 days hold=>2,

                                    } else {
                                        policyData.policy_status = 1
                                    }
                                } else {
                                    if (policyStartDate.isAfter(moment())) {
                                        // existingPayment.policy_details.policy_start_date is after the current date
                                        // Your logic here
                                        policyData.policy_status = 2// 30 days hold=>2,


                                    } else {
                                        policyData.policy_status = 1 // Active=>1,
                                    }
                                }
                                // console.log('policyData', policyData);
                                let updatePolicy = await policyService.updatePolicy(element.policy_id, policyData, transaction)

                                if (updatePolicy && policyData.policy_status != element.policy_details.policy_status) {
                                    let policyStatusUpdateLogData = {
                                        org_id: element.org_id,
                                        policy_id: element.policy_id,
                                        prev_policy_status_id: element?.policy_details.policy_status,
                                        prev_policy_status: await policyService.getPolicyStatusFlagName(element.policy_details.policy_status),
                                        current_policy_status_id: policyData.policy_status,
                                        current_policy_status: await policyService.getPolicyStatusFlagName(policyData.policy_status),
                                        description: `Policy status change  ${await policyService.getPolicyStatusFlagName(element.policy_details.policy_status)} to ${await policyService.getPolicyStatusFlagName(policyData.policy_status)} created by Cron payment process at ${moment()}`
                                    }

                                    auditData.description = `Retry failed payment completed successfully, Policy status change  ${await policyService.getPolicyStatusFlagName(element.policy_details.policy_status)} to ${await policyService.getPolicyStatusFlagName(policyData.policy_status)} created by  Cron payment process`;
                                    // console.log('policyStatusUpdateLogData', policyStatusUpdateLogData);
                                    let policyStatusUpdateLogService = await policyStatusUpdateLogService.createPolicyStatusUpdateLog(policyStatusUpdateLogData, transaction);
                                    // console.log('policyStatusUpdateLogService', policyStatusUpdateLogService);

                                }
                            }

                            // return

                        } else {
                            auditData.description = `Failure to Update payments has occurred By Cron `
                            throw new CustomError(`Failure to Update payments has occurred By Cron `)
                        }
                    } else {
                        //console.log('chargeCustomerProfileResponse.getTransactionResponse()',chargeCustomerProfileResponse.getTransactionResponse());
                        // console.log('caleddd==else auditData',auditData);
                        let paymentData = {
                            transaction_response: chargeCustomerProfileResponse.getTransactionResponse() ? chargeCustomerProfileResponse.getTransactionResponse() : null,
                            transaction_no: chargeCustomerProfileResponse.getTransactionResponse() ? chargeCustomerProfileResponse.getTransactionResponse().getTransId() : null,
                            payment_status: 2,//failed=>2
                            payment_successfull_date: null
                        }
                        await cronTimeFailedPayment(element, paymentData, transaction)
                        // console.log('mailTrigger',mailTrigger);
                        auditData.description = `Failure to make payments has occurred by monthly reccuring Cron `
                    }


                } else {
                    let paymentData = {
                        transaction_response: null,
                        transaction_no: null,
                        payment_status: 2,//failed=>2
                        payment_successfull_date: null
                    }
                    await cronTimeFailedPayment(element, paymentData, transaction)
                    auditData.description = `Due to not have saved card, Monthly reccuring Payment via Cron Process Failed!`
                }
                // console.log('==================================called');

                let updateAuditTrail = await helper.updateAuditTrail(auditData)
                //   console.log('==================================called',updateAuditTrail);

            }

            transaction.commit()
            console.log('monthly payment Cron comited successfully');
        }else{
            transaction.rollback()
        }
       
    } catch (error) {
        transaction.rollback()
    }


}
// For YEARLY Payment Cron


exports.processYearlyRecurringPayments = async () => {
    const transaction = await db.sequelize.transaction();
    try {
        let queryOption = {
            where: {
                org_id: helper.default_org_id,
                payment_type: 1, //CREDIT CARD=>1,
                payment_date: moment().format('YYYY-MM-DD'),
                recurring_type: 0,// 0=>yearly
                payment_status: 4, // pending=>4
            },
            include: [
                {
                    model: db.policiesModel,
                    as: 'policy_details',
                },
                {
                    model: db.customersModel,
                    as: 'customer_details',
                    include: {
                        model: db.customerCardsModel,
                        as: 'card_list',
                        where: {
                            primary_card: true
                        }
                    }
                },
            ],
            limit: 3,
        };

        let allPayments = await paymentService.getAllPayments(queryOption);
        allPayments = allPayments.rows;
        // console.log('allPayments.length', allPayments.length);

        if (allPayments.length > 0) {
            for (let i = 0; i < allPayments.length; i++) {
                const element = allPayments[i];
                let auditData = {
                    org_id:element.org_id,
                    customer_id: element.customer_id,
                    user_id: null,
                    row_id: element.payment_id,
                    section: 'YEARLY_PAYMENT_PROCESS_CRON',
                    table_name: 'hws_payments',
                    source: 10,
                    create_user_type: 10,
                    created_by: null,
                    device_id: null,
                };

                if (element.customer_details.card_list[0]) {
                    let paymentObj = {
                        authorizeNet_customer_profile_id: element.customer_details.authorizeNet_customer_profile_id,
                        authorizeNet_payment_profile_id: element.customer_details.card_list[0].authorizeNet_payment_profile_id,
                        chargable_amount: element.amount,
                        policy_id: element.policy_id 
                    };
                    const chargeCustomerProfileResponse = await securePaymentsService.chargeCustomerProfile(paymentObj);
                    const responseObject = chargeCustomerProfileResponse;
                    const resultCode = responseObject?.messages?.resultCode;
                    const code = responseObject?.messages?.message[0]?.code;
                    const transactionResponse =  responseObject?.transactionResponse;
                    const transactionResponseCode =  responseObject?.transactionResponse?.responseCode;
                    if (resultCode === 'Ok' && code === 'I00001' && transactionResponse && (transactionResponseCode== 1|| transactionResponseCode== 4)) {   
                    // if (chargeCustomerProfileResponse.getTransactionResponse() && chargeCustomerProfileResponse.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
                        let paymentData = {
                            transaction_response: chargeCustomerProfileResponse.getTransactionResponse(),
                            transaction_no: chargeCustomerProfileResponse.getTransactionResponse().getTransId(),
                            payment_status: 1, // Success => 1
                            payment_successfull_date: moment().format("YYYY-MM-DD")
                        };

                        let updatePayment = await paymentService.updatePayment(element.payment_id, paymentData, transaction);
                        if (updatePayment) {
                            let existingFailedPayments = await paymentService.getAllPayments({ where: { customer_id: element.customer_id, org_id: element.org_id, payment_status: 2 } });
                            let policyData = {};

                            auditData.description = `Cron payment process completed successfully.  `;

                            if (existingFailedPayments.rows.length == 0) {
                                const policyStartDate = moment(element.policy_details.policy_start_date);
                                if (policyStartDate.isAfter(moment())) {
                                    policyData.policy_status = 2; // 30 days hold => 2
                                } else {
                                    policyData.policy_status = 1; // Active => 1
                                }
                                let updatePolicy = await policyService.updatePolicy(element.policy_id, policyData, transaction);
                                if (policyData.policy_status != element.policy_details.policy_status) {
                                    let policyStatusUpdateLogData = {
                                        org_id: element.org_id,
                                        policy_id: element.policy_id,
                                        prev_policy_status_id: element?.policy_details.policy_status,
                                        prev_policy_status: await policyService.getPolicyStatusFlagName(element.policy_details.policy_status),
                                        current_policy_status_id: policyData.policy_status,
                                        current_policy_status: await policyService.getPolicyStatusFlagName(policyData.policy_status),
                                        description: `Policy status change  ${await policyService.getPolicyStatusFlagName(element.policy_details.policy_status)} to ${await policyService.getPolicyStatusFlagName(policyData.policy_status)} created by yearly payment process Cron at ${moment()}`
                                    };

                                    auditData.description = `payment completed successfully, Policy status change  ${await policyService.getPolicyStatusFlagName(element.policy_details.policy_status)} to ${await policyService.getPolicyStatusFlagName(policyData.policy_status)} created by Yearly payment process Cron`;

                                    await policyStatusUpdateLogService.createPolicyStatusUpdateLog(policyStatusUpdateLogData, transaction);
                                }
                            }
                        } else {
                            auditData.description = `Failure to Update payments has occurred By Yearly payment process Cron `;
                        }
                    } else {
                        let paymentData = {
                            transaction_response: chargeCustomerProfileResponse.getTransactionResponse(),
                            transaction_no: chargeCustomerProfileResponse.getTransactionResponse().getTransId(),
                            payment_status: 2, // Failed => 2
                            payment_successfull_date: null
                        };

                        await cronTimeFailedPayment(element, paymentData, transaction);
                        auditData.description = `Failure to make payments has occurred By Cron `;
                    }
                } else {
                    let paymentData = {
                        transaction_response: null,
                        transaction_no: null,
                        payment_status: 2, // Failed => 2
                        payment_successfull_date: null
                    };

                    await cronTimeFailedPayment(element, paymentData, transaction);
                    auditData.description = `Due to not having a saved card, Yearly recurring payment via Cron Process Failed!`;
                }
                await helper.updateAuditTrail(auditData);
            }
            await transaction.commit();
            console.log('Yearly payment Cron committed successfully');
        }else{
            transaction.rollback()
        }
    } catch (error) {
        await transaction.rollback();
        console.error('Error occurred:', error);
    }
};
async function cronTimeFailedPayment(element, paymentData, transaction) {
    try {
        // console.log('paymentData', paymentData);
        let updatePayment = await paymentService.updatePayment(element.payment_id, paymentData, transaction);
        let dataObj = {
            first_name: element.policy_details.first_name,
            last_name: element.policy_details.last_name,
            email: element.policy_details.email,
            mobile: helper.setUSFormatPhoneNumber(element.policy_details.mobile),
            policy_number: element.policy_details.policy_number,
            payment_date: moment(element.payment_date).format('MM-DD-YYYY'),
            amount: element.amount,
            email_imageUrl: helper.email_imageUrl
        };

        let mailTo = process.env.NODE_ENV == 'prod' ? helper.clientMail : helper.testMail;
        let mailTrigger = await mailService.triggerMail('failedPaymentCronProcess.ejs', dataObj, '', mailTo, 'Payment via Cron Process Failed!');
        return mailTrigger;
    } catch (error) {
        throw error;
    }
}

/* exports.processYearlyRecurringPayments = async () => {
    // Your logic for processing recurring payments goes here
    const transaction = await db.sequelize.transaction();
    try {

        let queryOption = {
            where: {
                org_id: helper.default_org_id,
                payment_type: 1, //CREDIT CARD=>1,
                payment_date: moment().format('YYYY-MM-DD'),
                recurring_type: 0,// 0=>yearly
                payment_status: 4, // pending=>4
            },
            include: [
                {
                    model: db.policiesModel,
                    as: 'policy_details',
                    attributes: ['policy_id', 'policy_term_month', 'policy_status', 'first_name', 'last_name', 'email', 'mobile', 'policy_number',]

                },
                {
                    model: db.customersModel,
                    as: 'customer_details',
                    attributes: ['customer_id', 'authorizeNet_customer_profile_id'],
                    include: {
                        model: db.customerCardsModel,
                        as: 'card_list',
                        attributes: ['customer_card_id', 'authorizeNet_payment_profile_id', 'primary_card'],
                        where: {
                            primary_card: true
                        }
                    }
                },

            ],
            limit: 2,
        }
        let allPayments = await paymentService.getAllPayments(queryOption);
        allPayments = allPayments.rows
        //  console.log('allPayments',allPayments);
        console.log('allPayments.length', allPayments.length);

        if (allPayments.length > 0) {
            for (let i = 0; i < allPayments.length; i++) {
                const element = allPayments[i];
                let auditData = {
                    customer_id: element.customer_id,
                    user_id: null,
                    row_id: element.payment_id,
                    section: 'YEARLY_PAYMENT_PROCESS_CRON',
                    table_name: 'hws_payments',
                    source: 10,
                    create_user_type: 10,
                    created_by: null,
                    device_id: null,
                }
                if (element.customer_details.card_list[0]) {
                    let paymentObj = {
                        authorizeNet_customer_profile_id: element.customer_details.authorizeNet_customer_profile_id,
                        authorizeNet_payment_profile_id: element.customer_details.card_list[0].authorizeNet_payment_profile_id,
                        chargable_amount: element.amount,
                    }
                    console.log('paymentObj', paymentObj);
                    const chargeCustomerProfileResponse = await securePaymentsService.chargeCustomerProfile(paymentObj);
                    if (chargeCustomerProfileResponse.getTransactionResponse() && chargeCustomerProfileResponse.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
                        // Payment was successful  policy status change for failed to active/30 day wait created_by, created_at
                        let paymentData = {
                            transaction_response: chargeCustomerProfileResponse.getTransactionResponse(),
                            transaction_no: chargeCustomerProfileResponse.getTransactionResponse().getTransId(),
                            payment_status: 1,//success=>1
                            payment_successfull_date: moment().format("YYYY-MM-DD")
                        }
                        let updatePayment = await paymentService.updatePayment(element.payment_id, paymentData, transaction);

                        if (updatePayment) {
                            console.log('element.payment_id', element.payment_id);
                            // console.log('updatePayment', updatePayment);
                            let existingFailedPayments = await paymentService.getAllPayments({ where: { customer_id: element.customer_id, org_id: element.org_id, payment_status: 2, } });//failed=>2,
                            let policyData = {}
                            //  console.log('existingFailedPayments',existingFailedPayments);
                            auditData.description = `Cron payment process completed successfully.  `;

                            if (existingFailedPayments.rows.length == 0) {
                                const policyStartDate = moment(element.policy_details.policy_start_date);
                                // console.log('policyStartDate',policyStartDate);

                                if (policyStartDate.isAfter(moment())) {
                                    // existingPayment.policy_details.policy_start_date is after the current date
                                    // Your logic here
                                    policyData.policy_status = 2// 30 days hold=>2,

                                } else {
                                    policyData.policy_status = 1 // Active=>1,
                                }

                                let updatePolicy = await policyService.updatePolicy(element.policy_id, policyData, transaction)
                                console.log('updatePolicy', updatePolicy);

                                if (policyData.policy_status != element.policy_details.policy_status) {
                                    let policyStatusUpdateLogData = {
                                        org_id: element.org_id,
                                        policy_id: element.policy_id,
                                        prev_policy_status_id: element?.policy_details.policy_status,
                                        prev_policy_status: await policyService.getPolicyStatusFlagName(element.policy_details.policy_status),
                                        current_policy_status_id: policyData.policy_status,
                                        current_policy_status: await policyService.getPolicyStatusFlagName(policyData.policy_status),
                                        description: `Policy status change  ${await policyService.getPolicyStatusFlagName(element.policy_details.policy_status)} to ${await policyService.getPolicyStatusFlagName(policyData.policy_status)} created by yearly payment process Cron at ${moment()}`
                                    }
                                    auditData.description = `payment completed successfully, Policy status change  ${await policyService.getPolicyStatusFlagName(element.policy_details.policy_status)} to ${await policyService.getPolicyStatusFlagName(policyData.policy_status)} created by Yearly payment process Cron`;

                                    await policyStatusUpdateLogService.createPolicyStatusUpdateLog(policyStatusUpdateLogData, transaction)
                                }

                            }
                            // return

                        } else {
                            auditData.description = `Failure to Update payments has occurred By Yearly payment process Cron `
                            // throw new CustomError(`Failure to Update payments has occurred By Cron `)
                        }
                    } else {

                        let paymentData = {
                            transaction_response: chargeCustomerProfileResponse.getTransactionResponse(),
                            transaction_no: chargeCustomerProfileResponse.getTransactionResponse().getTransId(),
                            payment_status: 2,//failed=>2
                            payment_successfull_date: null
                        }
                        console.log('failed pay ment else');

                        let cronTimeFailedPayment = await cronTimeFailedPayment(element, paymentData, transaction)
                        console.log('cronTimeFailedPayment', cronTimeFailedPayment);
                        auditData.description = `Failure to make payments has occurred By Cron `
                        //  throw new CustomError(`Failure to make payments has occurred`)
                    }
                    //await helper.updateAuditTrail(auditData,req)

                } else {
                    let paymentData = {
                        transaction_response: null,
                        transaction_no: null,
                        payment_status: 2,//failed=>2
                        payment_successfull_date: null
                    }
                    auditData.description = `Due to not have saved card, Yaearly reccuring Payment via Cron Process Failed!`
                    await cronTimeFailedPayment(element, paymentData, transaction)
                }
                await helper.updateAuditTrail(auditData, req)
            }

        }
        console.log('before commit');
        transaction.commit()
        console.log('yearly payment Cron comited successfully');
    } catch (error) {
        transaction.rollback()

    }


}
this.processYearlyRecurringPayments();

async function cronTimeFailedPayment(element, paymentData, transaction) {
    try {
        console.log('paymentData', paymentData);

        let updatePayment = await paymentService.updatePayment(element.payment_id, paymentData, transaction);
        console.log('called failed payment update payment', updatePayment);
        let dataObj = {
            first_name: element.policy_details.first_name,
            last_name: element.policy_details.last_name,
            email: element.policy_details.email,
            mobile: helper.setUSFormatPhoneNumber(element.policy_details.mobile),
            policy_number: element.policy_details.policy_number,
            payment_date: moment(element.payment_date).format('MM-DD-YYYY'),
            amount: element.amount,
            email_imageUrl: helper.email_imageUrl,
            company_address : mailConfig.company_address,
            company_phone : mailConfig.company_phone,
            company_email : mailConfig.company_email,
            company_copyright_year : mailConfig.company_copyright_year,
            company_website : mailConfig.company_website,
            company_website_link : mailConfig.company_website_link,
        }
        // console.log('called else dataObj',dataObj);

        let mailTo = process.env.NODE_ENV == 'prod' ? helper.clientMail : helper.testMail
        // console.log('called else mailTo',mailTo);

        let mailTrigger = await mailService.triggerMail('failedPaymentCronProcess.ejs', dataObj, '', mailTo, 'Payment via Cron Process Failed!');
        return mailTrigger
    } catch (error) {
        throw error
    }

} */

exports.getAllPaymentTypeOrStatus = async() => {
    return async (req, res, next) => {
      let allPaymentTypeOrStatus= await paymentService.allPaymentTypeOrStatus();     
      console.log(allPaymentTypeOrStatus); 
        if (allPaymentTypeOrStatus) {           
            res.payment_status=allPaymentTypeOrStatus.payment_status
            res.payment_type=allPaymentTypeOrStatus.payment_type
        }
        next();
    };
}


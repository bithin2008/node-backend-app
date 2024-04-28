require("dotenv").config();
const salesmanService = require("../../../services/v1/admin/salesmanService");
const helper = require('../../../common/helper');
const db = require('../../../models/index');
const { getAllPolicyNotes } = require("../../../services/v1/admin/policyNoteService");
const { Op } = require("sequelize");
const policyService = require("../../../services/v1/admin/policyService");
const paymentService = require("../../../services/v1/admin/paymentService");

exports.getUserById = async (req, res, next) => {
    try {
      const { org_user_id } = req.params;
      
      const queryOptions = {
        attributes: { exclude: ['deleted_by', 'deleted_at', 'user_agent', 'device_id', 'ip_address', 'password'] },
        include: [
            {
                model: db.policiesModel,
                as: 'policy_list',
                //where:{create_user_type:2},// for backend team =2, realtor =3
                include: [
                    {
                        model: db.plansModel,
                        as: 'plan_details',
                        attributes: ['plan_name']
                    },
                    {
                        model: db.propertyTypesModel,
                        as: 'property_type_details',
                        attributes: ['property_type']
                    },
                    {
                        model: db.policyProductsModel,
                        as: 'policy_product_list',
                        include: {
                            model: db.productsModel,
                            as: 'product_details',
                            attributes: ['product_name', 'product_type',]
                        },
                        attributes: { exclude: ['deleted_by', 'deleted_at'] },
                    },
                    {
                      model: db.claimsModel,
                      as: 'claim_list',
                    },
                    {
                      model: db.paymentsModel,
                      as: 'payment_details',
                      attributes: { exclude: ['deleted_by', 'deleted_at'] },
                    },
                ]
            },
        ],
    };
      const userExists = await salesmanService.findUserById(parseInt(org_user_id),queryOptions);
      
      if (!userExists) {
        res.status(200).send({ status: 0, message: "User not found" });
      } else {
         let policyIdArr=[]
         userExists.policy_list=  await Promise.all(userExists?.policy_list.filter( async item =>{
          if (item.create_user_type==helper.create_update_user_type.admin_user) {   
            await policyService.getPolicyObjectFlagsName(item);
            await Promise.all(item.payment_details.map(async el => {
              await paymentService.PaymentsFlagStatusName(el);
              return el;
            }));
            // return element;      
            policyIdArr.push(item.policy_id)
            return item
          }
        }))
         let queryNotes={
          where: {
            policy_id:{[Op.in]: policyIdArr},
          },
          include: [
            {
                model: db.orgUsersModel,
                as: 'assignee_user_info'
            },
        ],
        }
        const policyNotes=await getAllPolicyNotes(queryNotes)
        if (policyNotes.rows.length > 0) {
          policyNotes.rows = await Promise.all(policyNotes.rows.map(async (element) => {

              if (element.create_user_type == 2) {
                  element.created_user_info = await helper.getUserInfo(parseInt(element.created_by));
              }
              if (element.create_user_type == 1) {
                  element.created_user_info = {
                      customer_id: element.customer_id,
                      first_name: element.first_name,
                      last_name: element.last_name,
                  }
              }
              return element;
          }));
        }
        res.status(200).send({ status: 1, data: userExists,policyNote:policyNotes.rows, message: 'User data fetch sucessfully.' });
      }
    } catch (error) {
      console.log(error);
      next(error)
    }
  }
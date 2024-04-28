const db= require('../models/index');
const CustomError = require('../utils/customErrorHandler');
const orgUserAccessPermissionsService = require("../services/v1/admin/orgUserAccessPermissionsService");
// Middleware function for access control
const checkPermission =(combinationIndex)=> {
    return async (req, res, next) => {
      try {
        const accessPermissionData = JSON.parse(req.headers['access-permission']); 
        //console.log('accessPermissionData',accessPermissionData);
        const { org_user_id } = req.tokenData; // Assuming you've added user data to the request object after authentication.
        //console.log('checkPermission org_user_id ===>',org_user_id);

        if (!org_user_id) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
        let permission_combination_id=req.body.permission_combination_id;


        let queryOptions = {
          where:{
            permission_combination_id:9,//permission_combination_id,
            org_user_id:org_user_id
          },
          include:[   
            {
              model: db.orgUsersModel,
              attributes: ['org_user_id','active_status'],
              include:{
                model: db.orgUserRolesModel,
                as: 'user_role_details',
                attributes: ['user_role_id','is_super_admin'],
              }
          },
          ]
          //    logging: console.log, // Add this line
        }

        let userRes = await orgUserAccessPermissionsService.getOrgUserAccessPermissions(queryOptions);
   /*    userRes.forEach(element => {
        element.
        console.log('userRes',element);
      }); */
        // Check if the user's role is allowed.
        if (!userRes ) {
          return res.status(403).json({ status:0, message: 'Unauthorize' });
        }
       /*  setTimeout(() => {
           console.log('userRes',userRes);

        if (userRes.orgUsersModel.active_status==0) {
          throw new CustomError(`Your account is deactivated, You have no longer permission to access.`,403)
        }
        }, 500); */
       
    
        // Check if the user has the required permissions.
        // if (allowedPermissions && !allowedPermissions.includes(user.permission)) {
        //   return res.status(403).json({ message: 'Forbidden' });
        // }
        // res.send(userRes)
        next(); // User has permission; continue with the route handler.
      
      } catch (e) {
        throw e
        
      }
    }
    
}

/* const validateUser = async ()=>{
  return async (req, res, next) => {

 
 next();

}
} */
module.exports= checkPermission;
require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const moment = require("moment");
const router = express.Router();
const config = require('../../../config/config');
const checkPermisiion = require('../../../middleware/checkPermisiion');
const authVerify = require("../../../common/verifyToken");
const checkRole = require('../../../middleware/checkRole');
const generatePagination = require('../../../middleware/pagination');
const multerUpload = require("../../../middleware/multerUpload");
const helper = require('../../../common/helper');

const userController = require("../../../controllers/v1/admin/UserController")

/*******************************
 * CREATE USER
 * @method: POST
 * @url: /api/v1/admin/org-user/create-user
 ********************************/
router.post("/create-user", authVerify,  userController.createUser);
//checkPermission(['admin', 'manager'], ['createUser']),

/*******************************
 * EDIT USER
 * @method: POST
 * @url: /api/v1/admin/org-user/update-user/:org_user_id
 ********************************/
router.put("/update-user/:org_user_id", authVerify, userController.updateUser);

/*******************************
 * GET ALL USER
 * @method: GET
 * @url: /api/v1/admin/org-user/get-all-users  
 ********************************/

router.post("/get-all-users", authVerify, generatePagination(),userController.getOrgByAllUser);
/*******************************
 * GET ALL USER
 * @method: GET
 * @url: /api/v1/admin/org-user/get-all-users  
 ********************************/

router.post("/get-all-users-list", authVerify,userController.getAllUsersList);

router.post("/get-all-simple-user-list", authVerify,userController.simpleUsersList);

/*******************************
 * GET USER BY ID
 * @method: GET
 * @url: /api/v1/admin/org-user/user-details/:org_user_id
 ********************************/
router.get("/user-details/:org_user_id", authVerify, userController.getUserById);


/*******************************
 * GET USER BY NAME
 * @method: GET
 * @url: /api/v1/admin/org-user/user-list-search
 ********************************/
router.get("/user-list-search", authVerify, userController.getUserByName);


/*******************************
* DELETE USER
* @method: GET
* @url: /api/v1/admin/org-user/delete-user
********************************/
router.delete("/delete-user/:org_user_id", authVerify, userController.deleteUser);

/*******************************
 * TOGGLE USER ACTIVE STATUS
 * @method: PUT
 * @url: /api/v1/admin/org-user/toggle-user-active-status/:org_user_id
 ********************************/
router.put("/toggle-user-active-status/:org_user_id", authVerify, userController.toggleUserActivation);

/*******************************
 * USER ACTIVATION
 * @method: POST
 * @url: /api/v1/admin/org-user/update-profile-image
 ********************************/
 router.post(
    "/update-profile-image/:org_user_id",authVerify, (req, res, next) => {
      const{org_user_id}  =  req.params;
      if (org_user_id) {
        multerUpload.setMulterUploadValidation(['image/png','image/jpg','image/jpeg'], 2 * 1024 * 1024, `./public/org_files/hws_${req.tokenData.org_id}/users`)(req, res, next); 
      } else {
        throw new CustomError( 'Bad request.',400)
      }
    },
    multerUpload.multerUploadSingleFile.single('profile_image'), userController.updateOrgUserProfieImage
  );

/*******************************
 * UPDATE  USER PROFILE INFORMATION
 * @method: POST
 * @url: /api/v1/admin/org-user/update-profile-info
 ********************************/
router.put('/update-profile-info', authVerify, userController.updateOrgUserProfie)

/*******************************
 * UPDATE  USER SELF PROFILE PHOTO
 * @method: POST
 * @url: /api/v1/admin/org-user/update-profile-photo
 ********************************/
router.post(
  "/update-profile-photo",authVerify, (req, res, next) => {
    const{org_user_id}  =  req.tokenData;
    req.params['org_user_id']=org_user_id
    if (org_user_id) {
      multerUpload.setMulterUploadValidation(['image/png','image/jpg','image/jpeg'], 2 * 1024 * 1024, `./public/org_files/hws_${req.tokenData.org_id}/users`)(req, res, next); 
    } else {
      throw new CustomError( 'Bad request.',400)
    }
  },
  multerUpload.multerUploadSingleFile.single('profile_image'), userController.updateOrgUserProfieImage
);


/*******************************
 * USER LOGOUT
 * @method: POST
 * @url: /api/v1/admin/org-user/logout
 ********************************/
router.post('/logout', authVerify, userController.logOut)

module.exports = router;

require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const blogsRouter = express.Router();
const verifyToken = require("../../../common/verifyToken");
const generatePagination = require('../../../middleware/pagination');
const blogsController = require("../../../controllers/v1/admin/blogsController");
const multerUpload = require("../../../middleware/multerUpload");

/*******************************
 * CREATE POST
 * @method: POST
 * @url: /api/v1/admin/blogs/create-post
 ********************************/
blogsRouter.post("/create-post", verifyToken, blogsController.createPost);

 /*******************************
 * UPLOAD AUTHOR IMAGE
 * @method: POST
 * @url: /api/v1/admin/blogs/upload-author-image/:blog_id
 ********************************/ 
 blogsRouter.post(
    "/upload-author-image/:blog_id",verifyToken, (req, res, next) => {
      const{blog_id}  =  req.params;

      if (blog_id) {
        multerUpload.setMulterUploadValidation(['image/png','image/jpg','image/png'], 2 * 1024 * 1024, `./public/org_files/hws_${req.tokenData.org_id}/media_content/blogs`)(req, res, next); 
      } else {
        throw new CustomError( 'Bad request.',400)
      }
    },
    multerUpload.multerUploadSingleFile.single('authorImage'), blogsController.uploadAuthorImage
  );


   /*******************************
 * UPLOAD BLOG IMAGE
 * @method: POST
 * @url: /api/v1/admin/blogs/upload-blog-image/:blog_id
 ********************************/ 
 blogsRouter.post(
    "/upload-blog-image/:blog_id",verifyToken, (req, res, next) => {      
        const{blog_id}  =  req.params;
        if (blog_id) {
          multerUpload.setMulterUploadValidation(['image/png','image/jpg','image/png'], 2 * 1024 * 1024, `./public/org_files/hws_${req.tokenData.org_id}/media_content/blogs`)(req, res, next); 
        } else {
          throw new CustomError( 'Bad request.',400)
        }
      },
    multerUpload.multerUploadSingleFile.single('blogImage'), blogsController.uploadBlogImage
  );

   /*******************************
 * UPLOAD BLOG IMAGE
 * @method: POST
 * @url: /api/v1/admin/blogs/upload-blog-description-image
 ********************************/ 
 blogsRouter.post(
    "/upload-blog-description-image",verifyToken, (req, res, next) => {
        const{blog_id}  =  req.params;
        multerUpload.setMulterUploadValidation(['image/png','image/jpg','image/jpeg','image/webp','image/png'], 2 * 1024 * 1024, `./public/org_files/hws_${req.tokenData.org_id}/media_content/blogs`)(req, res, next); 
      },
    multerUpload.multerUploadSingleFile.single('blogDescriptionImage'), blogsController.uploadBlogDescriptionImage
  );

/*******************************
 * EDIT POST
 * @method: PUT
 * @url: /api/v1/admin/blogs/update-post/:blog_id
 ********************************/
blogsRouter.put("/update-post/:blog_id", verifyToken, blogsController.updatePost);


/*******************************
 * GET ALL POSTS
 * @method: GET
 * @url: /api/v1/admin/blogs/get-all-posts
 ********************************/
blogsRouter.get("/get-all-posts", verifyToken, generatePagination(), blogsController.getAllPosts);


/*******************************
 * GET ALL BLOG CATEGORIES
 * @method: GET
 * @url: /api/v1/admin/blogs/get-all-blog-categories
 ********************************/
blogsRouter.get("/get-all-blog-categories", verifyToken, blogsController.getAllBlogCategories);



/*******************************
 * DELETE BLOG IMAGE
 * @method: POST
 * @url: /api/v1/admin/blogs/delete-existing-image
 ********************************/
blogsRouter.post("/delete-existing-image/:blog_id", verifyToken, blogsController.deleteExistingImage);

/*******************************
 * TOGGLE POST STATUS
 * @method: POST
 * @url: /api/v1/admin/blogs/toggle-post-status
 ********************************/
blogsRouter.put("/toggle-post-status/:blog_id", verifyToken, blogsController.togglePostStatus);

/*******************************
* DELETE POST
* @method: DELETE
* @url: /api/v1/admin/blogs/delete-post
********************************/
blogsRouter.delete("/delete-post/:blog_id", verifyToken, blogsController.deletePost);

module.exports = blogsRouter;

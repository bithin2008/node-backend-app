const db = require('../../../models/index');
const helper = require('../../../common/helper');
const bcrypt = require('bcryptjs');
const CustomError = require('../../../utils/customErrorHandler');
const fs = require('fs');

//GET ALL PLANS
exports.getAllPosts = async (req,queryOptions) => {
    try {
        let allposts = await db.blogsModel.findAndCountAll(queryOptions);
        allposts.rows.forEach((element) => { 
            element.image = element.image?`${helper.api_baseurl}/org_file/hws_${req.tokenData ? req.tokenData.org_id : parseInt(req.headers.org_id)}/media_content/blogs/${element.image}`:null;          
        });
        return helper.getJsonParseData(allposts);
      } catch (e) {
        console.log(e);
        throw e;
      }
}

//GET ALL BLOG CATEORIES
exports.getAllBlogCategories = async (req, res, next, queryOptions) => {
    try {
        let allBlogCategories = await db.blogCategoriesModel.findAndCountAll(queryOptions)
        return helper.getJsonParseData(allBlogCategories)
    } catch (e) {
        console.log(e);
        throw e
    }
}

//FIND POST By ID 
exports.findPostById = async (val) => {
    try {
        let blog = await db.blogsModel.findOne({ where: { blog_id: val } });
        return blog;
    } catch (e) {
        console.log(e);
    }
}

//FIND POST BY SLUG
exports.findPostBySlug = async (req, res, next, queryOptions) => {
    try {
        let blog = await db.blogsModel.findOne(queryOptions);
        return helper.getJsonParseData(blog);
    } catch (e) {
        console.log(e);
    }
}



//FIND POST BY CATEGORY
exports.findPostsByCategory= async (req, res, next, queryOptions) => {
    try {
        let blog = await db.blogsModel.findAll(queryOptions);
        return helper.getJsonParseData(blog);
    } catch (e) {
        console.log(e);
    }
}

//FIND NEXT PREVIOUS POST
exports.findPreviousPost= async (req, res, next, queryOptions) => {
    try {
        let blog = await db.blogsModel.findAll(queryOptions);
        return helper.getJsonParseData(blog);
    } catch (e) {
        console.log(e);
    }
}

//FIND NEXT PREVIOUS POST
exports.findNextPost= async (req, res, next, queryOptions) => {
    try {
        let blog = await db.blogsModel.findAll(queryOptions);
        return helper.getJsonParseData(blog);
    } catch (e) {
        console.log(e);
    }
}

//DELETE POST
exports.deletePost = async (val, ownerId) => {
    try {
        let deletePost = '';
        const transaction = await db.sequelize.transaction(async (t) => {
            await db.blogsModel.update(
                { deleted_by: ownerId },
                { where: { blog_id: val.blog_id }, transaction: t }
            )


            deletePost = await db.blogsModel.destroy({
                where: {
                    blog_id: val.blog_id
                }, transaction: t
            })
        });
        return deletePost;
    } catch (e) {
        console.log(e);
        // throw Error('Error while fetching User')
    }
}

const CustomError = require("../../../utils/customErrorHandler");
const moment = require('moment')
const db = require("../../../models");
const helper = require("../../../common/helper");
const createFolder = require("../../../middleware/createFolder")
const blogService = require("../../../services/v1/admin/blogService");
const url = require('url');
const querystring = require('querystring');
const { Op } = require("sequelize");

/*****************************
 *  CREATE POST
 ******************************/

exports.createPost = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        let payload = {
            blog_title: req.body.blogTitle ? req.body.blogTitle : null,
            author: req.body.authorName ? req.body.authorName : null,
            blog_category_id: req.body.blogCategoryId ? req.body.blogCategoryId : null,
            slug: req.body.slug ? req.body.slug : null,
            description: req.body.description ? req.body.description : null,
            short_description: req.body.shortDescription ? req.body.shortDescription : null,
            alt: req.body.alt ? req.body.alt : null,
            product_id: req.body.productId ? req.body.productId : null,
            meta_title: req.body.metaTitle ? req.body.metaTitle : null,
            meta_keyword: req.body.metaKeyword ? req.body.metaKeyword : null,
            meta_description: req.body.metaDescription ? req.body.metaDescription : null,
            publish_date: req.body.publishDate ? req.body.publishDate : null,
            tracking_code: req.body.trackingCode ? req.body.trackingCode : null,
            active_status: req.body.activeStatus ? req.body.activeStatus : null,
            org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
            created_by: req.tokenData.user_id ? parseInt(req.tokenData.user_id) : null,
            updated_by: null,
            deleted_by: null

        }
        let createPostRes = await db.blogsModel.create(payload, { transaction })
        createPostRes = helper.getJsonParseData(createPostRes);
        // let auditData = {
        //     customer_id: isExistPolicy.customer_id, 
        //     user_id: org_user_id,              
        //     section: 'ADMIN_BLOG',
        //     table_name: 'hws_blogs',
        //     source: 1,
        //     create_user_type: 2,
        //     created_by: org_user_id,
        //     device_id: isExistPolicy.device_id,  
        // }
        if (createPostRes) {
            await transaction.commit();
            const folderPath = `./src/public/org_files/hws_${req.tokenData.org_id}/media_content/blogs`; // Replace this with your folder path template
            let folderRes = await createFolder(folderPath);
            res.status(200).send({ status: 1, data: createPostRes, message: `Post created successfully.` })
        } else {
            throw new CustomError(`Something Went Wrong! Try Again Later`, 500)
        }
    } catch (error) {
        console.log("main error", error);
        await transaction.rollback();
        next(error);
    }
}


/*****************************
 *  GET ALL POSTS
 ******************************/
exports.getAllPosts = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        const searchingValue = req.query.search || '';
        const sortField = req.query.sortField || 'blog_id';
        const sortOrder = req.query.sortOrder || 'DESC';
        let activeStatus = parsedQs.active_status ? parsedQs.active_status : '';
        let searchTimestamp = helper.searchTimeStamp(searchingValue) ? helper.searchTimeStamp(searchingValue) : {}
        let searchPublishDate = helper.isDate(searchingValue)
            ? {
                [Op.or]: [
                    {
                        publish_date: {
                            [Op.gte]: moment(searchingValue, 'MM-DD-YYYY').format(), // Format it to match the database format
                        },
                    },
                ],
            }
            : {};
        let searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    blog_title: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    description: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    short_description: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                }
            ],
            ...searchTimestamp,
            ...searchPublishDate
        } : {};

        let queryOptions = {
            where: {
                org_id:req.tokenData.org_id,
                 ...searchQuery 
                },
            attributes: { exclude: ['deleted_by', 'deleted_at'] },
            include: [
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
        };

        if (activeStatus !== '') {
            queryOptions.where[Op.or] = [
                { active_status: activeStatus }
            ];
        }

        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit
        }

        if (res.pagination) {
            queryOptions.offset = res.pagination.currentPage == 0 ? 0 : ((res.pagination.currentPage - 1) * res.pagination.limit);
        }

        allPosts = await blogService.getAllPosts(req, queryOptions);

        if (res.pagination) {
            res.pagination.total = allPosts.count
            res.pagination.totalPages = Math.ceil(allPosts.count / queryOptions.limit)
        }
        if (allPosts.count > 0) {

            res.status(200).send({ status: 1, data: allPosts.rows, pagination: res.pagination, message: 'Post list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allPosts.rows, pagination: res.pagination, message: 'No Post found' })
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}





/*****************************
 *  GET POSTS BY ID
 ******************************/
exports.getPostById = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        const search = req.query.search || '';
        let activeStatus = parsedQs.active_status ? parsedQs.active_status : '';
        let queryOptions = {
            where: {
                active_status: true
            },
            attributes: {
                exclude: [
                    'created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at']
            }

        };



        // Construct the search query


        allPosts = await blogService.findPostById(req, res, next, queryOptions);


        if (allPosts.count > 0) {
            allPosts.rows.forEach(element => {
                element.image = `${helper.api_baseurl}/org_file/hws_${req.tokenData.org_id ? req.tokenData.org_id : parseInt(req.headers.org_id)}/media_content/blogs/${element.image}`
            });
            res.status(200).send({ status: 1, data: allPosts.rows, pagination: res.pagination, message: 'Post list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allPosts.rows, pagination: res.pagination, message: 'No Post found' })
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}






/*****************************
 *  GET ALL BLOG CATEGORIES
 ******************************/
exports.getAllBlogCategories = async (req, res, next) => {
    try {
        let queryOptions = {
            where: {org_id:req.tokenData.org_id},
            attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
            order: [
                ['blog_category_id', 'DESC']
            ],
        };


        allPosts = await blogService.getAllBlogCategories(req, res, next, queryOptions);


        if (allPosts.count > 0) {
            res.status(200).send({ status: 1, data: allPosts.rows, message: 'Blog Categories found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allPosts.rows, message: 'No Blog Categories found' })
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}

/*****************************
 *  UPLOAD AUTHOR IMAGE
 ******************************/
exports.uploadAuthorImage = async (req, res, next) => {
    try {
        let blog_id = null
        if (req.params.blog_id) {
            // org_id = helper.decodeCrypto(decodeURI(req.params.org_id));
            blog_id = req.params.blog_id
            if (req.file) {

                var image = req.file.filename ? `${req.file.filename}` : null
                req.body.authorImage = image
                let data = {
                    author_image: req.body.authorImage,
                    //updated_by: req.tokenData.user_id
                }
                let orgRes = await db.blogsModel.update(data,
                    { where: { blog_id: blog_id } }
                )
                if (orgRes[0] == 1) {
                    res.status(200).send({ status: 1, message: 'Successfully updated organization logo.' })
                } else {
                    throw new CustomError('Failed to update organization logo.', 500)
                }
            } else {
                throw new CustomError('Something went wrong! The file could not be found.', 500)
            }
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}


/*****************************
 *  UPLOAD BLOG IMAGE
 ******************************/
exports.uploadBlogImage = async (req, res, next) => {
    try {
        let blog_id = null
        if (req.params.blog_id) {
            // org_id = helper.decodeCrypto(decodeURI(req.params.org_id));
            blog_id = req.params.blog_id
            if (req.file) {

                var image = req.file.filename ? `${req.file.filename}` : null
                req.body.blogImage = image
                let data = {
                    image: req.body.blogImage,
                    //updated_by: req.tokenData.user_id
                }
                let orgRes = await db.blogsModel.update(data,
                    { where: { blog_id: blog_id } }
                )
                console.log(orgRes);
                if (orgRes[0] == 1) {
                    res.status(200).send({ status: 1, message: 'Successfully updated blog image.' })
                } else {
                    throw new CustomError('Failed to upload blog image.', 500)
                }
            } else {
                throw new CustomError('Something went wrong! The file could not be found.', 500)
            }
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}


/*****************************
 *  UPLOAD BLOG IMAGE
 ******************************/
exports.uploadBlogDescriptionImage = async (req, res, next) => {
    try {

        if (req.file) {
            var image = req.file.filename ? `${req.file.filename}` : null;
            let data = {
                image: `${helper.api_baseurl}/org_file/hws_${req.tokenData.org_id}/media_content/blogs/${image}`
            }
            if (image) {
                res.status(200).send({ status: 1, data: data, message: 'Successfully uploaded blog image.' })
            } else {
                throw new CustomError('Failed to upload blog image.', 500)
            }
        } else {
            throw new CustomError('Something went wrong! The file could not be found.', 500)
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}


/*****************************
 *  UPDATE POST
 ******************************/
exports.updatePost = async (req, res, next) => {
    try {
        const { blog_id } = req.params;
        const owner_id = req.tokenData.org_user_id
        const postExists = await blogService.findPostById(parseInt(blog_id));
        if (postExists) {
            let post_detail = {
                blog_title: req.body.blogTitle ? req.body.blogTitle : null,
                author: req.body.authorName ? req.body.authorName : null,
                blog_category_id: req.body.blogCategoryId ? req.body.blogCategoryId : null,
                slug: req.body.slug ? req.body.slug : null,
                description: req.body.description ? req.body.description : null,
                short_description: req.body.shortDescription ? req.body.shortDescription : null,
                alt: req.body.alt ? req.body.alt : null,
                product_id: req.body.productId ? req.body.productId : null,
                meta_title: req.body.metaTitle ? req.body.metaTitle : null,
                meta_keyword: req.body.metaKeyword ? req.body.metaKeyword : null,
                meta_description: req.body.metaDescription ? req.body.metaDescription : null,
                publish_date: req.body.publishDate ? req.body.publishDate : null,
                active_status: req.body.activeStatus ? req.body.activeStatus : null,
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
                deleted_by: null
            }
            const transaction = await db.sequelize.transaction(async (t) => {
                await db.blogsModel.update(
                    { updated_by: owner_id },
                    { where: { blog_id: blog_id }, transaction: t })
                await db.blogsModel.update(post_detail, { where: { blog_id: blog_id }, transaction: t })
                res.status(200).send({ status: 1, message: 'Post has been successfully updated.' })
            });
        } else {
            res.status(200).send({ status: 0, message: "Post not found" });
        }
    } catch (error) {
        next(error);
    }
}
/*****************************
 *  DELETE EXISTING BLOG IMAGE
 ******************************/
exports.deleteExistingImage = async (req, res, next) => {
    res.status(200).send({ status: 1 })
    // try {
    //     const { blog_id } = req.params;
    //     const { fileName, imageType } = req.body;
    //     const folderPath = `src/public/org_files/hws_${req.tokenData.org_id}/media_content/blogs`;
    //     const filename = fileName; // Change this to the actual filename you want to remove
    //     if (imageType == 'blogImage') {
    //         // const filePath = `${folderPath}/${filename}`;
    //         fs.readdir(folderPath, (err, files) => {
    //             if (err) {
    //                  res.status(200).send({ status: 0, message: 'Error reading directory' })
    //             }
    //             if (files.length > 0) {
    //                 files.forEach((file) => {
    //                     if (file.includes('-image.jpg')) {
    //                         const filePath = path.join(`${folderPath}`, file);
    //                         // Use fs.unlink to delete the file
    //                         fs.unlink(filePath, (err) => {
    //                             if (err) {
    //                                 res.status(200).send({ status: 0 })
    //                             } else {
    //                                 res.status(200).send({ status: 1 })
    //                             }
    //                         });
    //                     }else{
    //                         res.status(200).send({ status: 1 })
    //                     }
    //                 });
    //             } else {
    //                 res.status(200).send({ status: 1 })
    //             }
    //         });
    //     } else {
    //         res.status(200).send({ status: 0 })
    //     }




    // } catch (error) {
    //     next(error);
    // }
}


/*****************************
 *  DELETE POST
 ******************************/

exports.deletePost = async (req, res, next) => {
    try {
        const { blog_id } = req.params;
        const ownerId = req.tokenData.org_user_id
        const postExists = await blogService.findPostById(parseInt(blog_id));
        if (!postExists) {
            res.status(200).send({ status: 0, message: "Post not found" });
        } else {
            const deletePost = await blogService.deletePost(postExists, ownerId);
            if (deletePost) {
                res.status(200).send({ status: 1, message: 'Post deleted sucessfully.' });
            } else {
                res.status(200).send({ status: 0, message: 'Unable to delete Post.' });
            }
        }
    } catch (error) {
        next(error);
    }
}

/*****************************
 *  TOGGLE BLOG STATUS
 ******************************/
exports.togglePostStatus = async (req, res, next) => {
    try {
        const { blog_id } = req.params;
        const postExists = await blogService.findPostById(parseInt(blog_id));
        if (postExists) {
            let payload = {
                active_status: parseInt(req.body.activeStatus),
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
            }
            const transaction = await db.sequelize.transaction(async (t) => {
                let updateRes = await db.blogsModel.update(
                    payload,
                    { where: { blog_id: blog_id }, transaction: t })
                if (updateRes[0] == 1) {
                    res.status(200).send({ status: 1, message: `Post successfully ${req.body.activeStatus ? 'enabled' : 'disabled'}.` })
                } else {
                    throw new CustomError(`Something went wrong! Post status not updated .`)
                }
            });
        } else {
            res.status(200).send({ status: 0, message: "Post not found" });
        }
    } catch (error) {
        next(error);
    }
}

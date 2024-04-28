require("dotenv").config();
const axios = require('axios');
const SECRET_KEY = process.env.RECAPTCHA_V3_SECRET_KEY;
const config = require("../../../config/config");
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index')
const moment = require("moment");
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require("sequelize");
const helper = require("../../../common/helper");
const marketLeadersService = require("../../../services/v1/admin/marketLeadersService");
const blogService = require("../../../services/v1/admin/blogService");
const productService = require("../../../services/v1/admin/productService");
const websitePagesService = require("../../../services/v1/admin/websitePagesService");
const pageSeoService = require("../../../services/v1/admin/pageSeoService");
const jwt = require('jsonwebtoken');
const os = require('os');
const ejs = require('ejs');
const path = require("path");
const url = require('url');
const querystring = require('querystring');
const { Op } = require("sequelize");
const { forEach } = require("lodash");
const { log } = require("console");

/*****************************
 *  GET ALL PROPERTY SIZE
 ******************************/
exports.getAllPropertySize = async (req, res, next) => {
    try {
        let allPropertySize = await db.propertySizesModel.findAndCountAll();
        if (allPropertySize.count > 0) {
            res.status(200).send({ status: 1, data: allPropertySize.rows, message: 'Property Size list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allPropertySize.rows, message: 'No Property Size found' })
        }

    } catch (error) {
        console.log(error);
        next(error)
    }
}

/*****************************
 *  GET ALL PROPERTY TYPE API
 ******************************/
exports.getAllPropertyType = async (req, res, next) => {
    try {
        let allPropertyType = await db.propertyTypesModel.findAndCountAll({ where: { active_status: 1 }, attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] } });
        if (allPropertyType.count > 0) {
            res.status(200).send({ status: 1, data: allPropertyType.rows, message: 'Property Type list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allPropertyType.rows, message: 'No Property Type found' })
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}

/*****************************
 *  GET ALL PLANS
 ******************************/
exports.getAllPlans = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);

        let activeStatus = parsedQs.active_status ? parsedQs.active_status : '';
        let queryOptions = {
            where: {},
            include: 'plan_term',
            attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
            order: [
                ['created_by', 'DESC']
            ],
        };

        if (activeStatus !== '') {
            queryOptions.where[Op.or] = [
                { active_status: activeStatus }
            ];
        }


        allPlans = await planService.getAllPlans(req, res, next, queryOptions);
        if (allPlans.rows.length > 0) {
            const promises = [];

            allPlans.rows.forEach((element, index) => {
                if (element.plan_id) {
                    allPlans.rows[index].product_list = [];
                    let productIds = element.product_id.split(',');

                    const productPromises = productIds.map(async (item) => {
                        let productDetails = await productService.findProductById(parseInt(item));
                        if (productDetails) {
                            allPlans.rows[index].product_list.push(productDetails);
                        }
                    });

                    promises.push(Promise.all(productPromises));
                }
            });
            Promise.all(promises).then(() => {
                if (res.pagination) {
                    res.pagination.total = allPlans.count;
                    res.pagination.totalPages = Math.ceil(allPlans.count / queryOptions.limit);
                }

                if (allPlans.count > 0) {
                    res.status(200).send({
                        status: 1,
                        data: allPlans.rows,
                        pagination: res.pagination,
                        message: 'Plan list found successfully'
                    });
                } else {
                    res.status(200).send({
                        status: 1,
                        data: allPlans.rows,
                        pagination: res.pagination,
                        message: 'No Plan found'
                    });
                }
            }).catch(error => {
                console.error('Error:', error);
                // Handle error
            });
        } else {
            res.status(200).send({ status: 0, message: "Plans not found" });
        }

    } catch (error) {
        console.log(error);
        next(error)
    }
}

/*****************************
 *  GET ALL ITEMS
 ******************************/
exports.getAllItem = async (req, res, next) => {
    try {


        let allItems = await db.itemsModel.findAndCountAll({
            where: {
                addon_category_id: {
                    [Op.is]: null,
                }
            }
        })
        if (allItems.count > 0) {
            res.status(200).send({ status: 1, data: allItems.rows, message: 'Item list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allItems.rows, message: 'No Item found' })
        }

    } catch (error) {
        console.log(error);
        next(error)
    }
}


/*****************************
 *  GET ALL PRODUCTS
 ******************************/
exports.getAllProducts = async (req, res, next) => {
    try {
        const { org_id } = req.headers
        let queryOptions = {
            where: {
                product_type: 1,
                active_status: 1
            },
            attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
            order: [
                ['product_id', 'DESC']
            ],
        };
        let allProducts = await productService.getAllProducts(org_id, queryOptions)
        if (allProducts.rows.length > 0) {
            res.status(200).send({ status: 1, data: allProducts.rows, message: 'Product list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allProducts.rows, message: 'No product found' })
        }

    } catch (error) {
        console.log(error);
        next(error)
    }
}

/*****************************
 *  GET ALL ADDON ITEMS
 ******************************/
exports.getAllAddonProducts = async (req, res, next) => {
    try {
        let queryOptions = {
            where: {
                product_type: 0,
                active_status: 1
            },
            attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] },
            order: [
                ['product_id', 'DESC']
            ],
        };
        let allAddonProducts = await productService.getAllProducts(req.tokenData ? req.tokenData.org_id : parseInt(req.headers.org_id), queryOptions)
        if (allAddonProducts.rows.length > 0) {
            res.status(200).send({ status: 1, data: allAddonProducts.rows, message: 'Add on product list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allAddonProducts.rows, message: 'No Add on product found' })
        }

    } catch (error) {
        console.log(error);
        next(error)
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
        const sortField = req.query.sortField || 'publish_date';
        const sortOrder = req.query.sortOrder || 'DESC';
        let productId = parsedQs.product_id ? parsedQs.product_id : '';
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
            where: { ...searchQuery },
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
        if (productId !== '') {
            queryOptions.where[Op.or] = [
                { product_id: productId }
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
 *  GET ALL MARKET LEADERS
 ******************************/
exports.getAllMarketLeaders = async (req, res, next) => {
    try {
        const sortField = "market_leader_id";
        const sortOrder = "DESC";
        let queryOptions = {
            where: { active_status: 1 },
            attributes: { exclude: ["deleted_by", "deleted_at"] },
            order: [[sortField, sortOrder]],
        };

        let allMarketLeaders = await marketLeadersService.getAllMarketLeaders(
            req,
            queryOptions
        );
        if (allMarketLeaders.count > 0) {
            res.status(200).send({
                status: 1,
                data: allMarketLeaders.rows,
                pagination: res.pagination,
                message: "Market Leaders list found successfully",
            });
        } else {
            res.status(200).send({
                status: 1,
                data: allMarketLeaders.rows,
                pagination: res.pagination,
                message: "No Market Leaders found",
            });
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
};


/*****************************
 *  GET PAGE DETAILS BY SLUG NAME
 ******************************/
exports.getPageDetails = async (req, res, next) => {
    try {
       var urlParts = url.parse(req.url, true)
       const { route } = urlParts.query;
        let queryOptions = {
            where: {
                route_name: route,
                active_status: 1,
                org_id: req.headers.org_id
            },
            attributes: { exclude: ['created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at'] }
        }
        let pageDetails = await websitePagesService.findPageByRoute(queryOptions);
        if(pageDetails){
            let pageseodata = await pageSeoService.getPageSeoByRouteName(pageDetails.route_name, pageDetails.org_id)
            if (pageseodata) {
                res.status(200).send({ status: 1, data: pageseodata, message: `Page seo data is fetched successfully` })
            } else {
                res.status(200).send({ status: 1, message: `Page seo data not found` })
            }
        }else{
            res.status(200).send({ status: 1, message: `Page not found` })
        }
        

    } catch (error) {
        console.log(error);
        next(error);
    }
};

/*****************************
 *  GET POSTS BY SLUG
 ******************************/
exports.getPostBySlug = async (req, res, next) => {
    try {
        let queryOptions = {
            where: {
                active_status: 1,
                slug: req.params.slug
            },
            attributes: {
                exclude: [
                    'created_by', 'updated_by', 'deleted_by', 'created_at', 'updated_at', 'deleted_at']
            },
            include: [
                {
                    model: db.blogCategoriesModel,
                    as: 'blog_category',
                    attributes: ['blog_category_name'],
                    required: false
                }
            ]
        };
        // Construct the search query
        postResponse = await blogService.findPostBySlug(req, res, next, queryOptions);
        if (postResponse) {
            let queryOptionsForCategory = {
                where: {
                    active_status: 1,
                    blog_id: {
                        [Op.ne]: postResponse.blog_id
                    },
                    blog_category_id: postResponse.blog_category_id
                },
                attributes: ['blog_id', 'blog_title', 'slug', 'image', 'publish_date'],
                include: [
                    {
                        model: db.blogCategoriesModel,
                        as: 'blog_category',
                        attributes: ['blog_category_name'],
                        required: false
                    }
                ],
                limit: 3
            };
            const relatedPosts = await blogService.findPostsByCategory(req, res, next, queryOptionsForCategory);
            if (relatedPosts) {
                relatedPosts.forEach((element, index) => {
                    element.image = `${helper.api_baseurl}/org_file/hws_${parseInt(req.headers.org_id)}/media_content/blogs/${element.image}`
                });
                postResponse.related_posts = relatedPosts;
            }

            let queryOptionsForPrev = {
                where: {
                    active_status: 1,
                    blog_id: {
                        [Op.ne]: postResponse.blog_id,
                        [Op.lt]: postResponse.blog_id,
                    },
                },
                attributes: ['blog_id', 'blog_title', 'slug'],
                limit: 1,
                order: [['blog_id', 'DESC']],
            };
            const prevPosts = await blogService.findPreviousPost(req, res, next, queryOptionsForPrev);
            if (prevPosts) {
                postResponse.prev_posts = prevPosts;
            }

            let queryOptionsForNext = {
                where: {
                    active_status: 1,
                    blog_id: {
                        [Op.ne]: postResponse.blog_id,
                        [Op.gt]: postResponse.blog_id,
                    },
                },
                attributes: ['blog_id', 'blog_title', 'slug'],
                limit: 1,
                order: [['blog_id', 'ASC']],
            };
            const nextPosts = await blogService.findNextPost(req, res, next, queryOptionsForNext);
            if (nextPosts) {
                postResponse.next_posts = nextPosts;
            }
            if (postResponse) {
                postResponse.image = `${helper.api_baseurl}/org_file/hws_${parseInt(req.headers.org_id)}/media_content/blogs/${postResponse.image}`

                res.status(200).send({ status: 1, data: postResponse, message: 'Post found successfully' })
            } else {
                res.status(200).send({ status: 0, message: 'No Post found' })
            }
        } else {
            res.status(200).send({ status: 0, message: 'No Post found' })
        }


    } catch (error) {
        console.log(error);
        next(error)
    }
}

/*****************************
 *  LOCATION BY ZIP CODE
 ******************************/
exports.locationByZip = async (req, res, next) => {
    try {
        if (req.body.zipCodedata) {
            res.status(200).send({ status: 1, data: req.body.zipCodedata, message: 'Zipcode details found successfully' })
        } else {
            res.status(200).send({ status: 0, message: 'Invalid zipcode' })
        }
    } catch (error) {
        next(error);
    }
}


exports.verifyRecaptcha = async (token, secretKey) => {
    try {
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        };
        const data = new URLSearchParams();
        data.append('secret', secretKey);
        data.append('response', token);

        const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
        const response = await axios.post(verifyUrl, data, {
            headers: headers,
        });
        return response.data;
    } catch (error) {
        console.error('Error verifying reCAPTCHA:', error);
    }
}

exports.recaptchaVerification= async(req, res, next) => {   
    const tokenResponse = await this.verifyRecaptcha(req.body.captcha_token, SECRET_KEY);
    if (tokenResponse.success && tokenResponse.score>0.2) {
        res.status(200).send({ status: 1, data: tokenResponse.data, message: 'verifying reCAPTCHA successfully' })       
    } else {
        res.status(200).send({ status: 0,  message: 'verifying reCAPTCHA unsuccessfull' })
    }
}



const db = require("../../../models/index");
const CustomError = require("../../../utils/customErrorHandler");
const pageSeoService = require("../../../services/v1/admin/pageSeoService");
const moment = require("moment");
const fs = require("fs");
const helper = require("../../../common/helper");
const bcrypt = require("bcryptjs");
const DeviceDetector = require("node-device-detector");
const createFolder = require("../../../middleware/createFolder");
const mailService = require("../../../services/v1/admin/mailService");
const blogService = require("../../../services/v1/admin/blogService");
const jwt = require("jsonwebtoken");
const os = require("os");
const ejs = require("ejs");
const path = require("path");
const url = require("url");
const querystring = require("querystring");
const { Op } = require("sequelize");

exports.createPageSeo = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        let pageSeoData = {
            org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
            page_id: req.body.pageId ? req.body.pageId : null,
            title: req.body.title ? req.body.title : null,
            meta_description: req.body.metaDescription ? req.body.metaDescription : null,
            meta_keywords: req.body.metaKeywords ? req.body.metaKeywords : null,
            h1_tag: req.body.h1Tag ? req.body.h1Tag : null,
            schema_markup: req.body.schemaMarkup ? req.body.schemaMarkup : null,
            // active_status: parseInt(req.body.activeStatus),
            created_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
        };
        const createdPageSeoData = await pageSeoService.createPageSeo(pageSeoData);
        if (createdPageSeoData) {
            transaction.commit();
            res.status(200).send({ status: 1, message: "Page seo created successfully.", });
        } else {
            res.status(400).send({ status: 0, message: "Something Went Wrong! Try Again Later" });
        }
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


exports.getAllPageSeo = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        const searchingValue = req.query.search || "";
        const sortField = req.query.sortField || "page_seo_id";
        const sortOrder = req.query.sortOrder || "DESC";

        let searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    title: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    meta_description: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    meta_keywords: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    h1_tag: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                {
                    schema_markup: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                }
            ]
        } : {};

        let queryOptions = {
            where: {
                ...searchQuery,
                org_id:req.tokenData.org_id
            },
            attributes: { exclude: ["deleted_by", "deleted_at"] },
            include: [
                {
                    model: db.websitePagesModel,
                    as: "page_details",
                    attributes: ["page_name", "page_id",'route_name'],
                    where: {  active_status: 1},
                }
            ],
            order: [[sortField, sortOrder]],
        };

      

        // Check if 'limit' and 'offset' are provided in the request query
        if (res.pagination) {
            queryOptions.limit = res.pagination.limit;
        }

        if (res.pagination) {
            queryOptions.offset =
                res.pagination.currentPage == 0? 0: (res.pagination.currentPage - 1) * res.pagination.limit;
        }

        allPosts = await pageSeoService.getAllPageSeo(queryOptions);
        if (allPosts.rows) {
            allPosts.rows = await Promise.all(allPosts.rows.map(async (element) => {
                element.create_info = await helper.getUserInfo(parseInt(element.created_by));
            //  element.create_info = await helper.getUserInfo(parseInt(element.created_by));
              if(element.updated_by){
                element.update_info = await helper.getUserInfo(parseInt(element.updated_by));
              }
              return element;
            }));
          }
        if (res.pagination) {
            res.pagination.total = allPosts.count;
            res.pagination.totalPages = Math.ceil( allPosts.count / queryOptions.limit);
        }
        if (allPosts.count > 0) {
            res.status(200).send({status: 1,  data: allPosts.rows, pagination: res.pagination, message: "Post list found successfully",
                });
        } else {
            res.status(200) .send({status: 1,  data: allPosts.rows, pagination: res.pagination,  message: "No Post found",});

        }
    } catch (error) {
        console.log(error);
        next(error);
    }
};


exports.getPageSeoByRouteName = async (req,res,next)=>{
    try {
        const {route_name} = req.body
        const {org_id} = req.headers
        if (!route_name) {
            throw new CustomError(`Route Name is required`,400);
        }
        if (!org_id) {
            throw new CustomError(`Bad request`,400);
        }
       let pageseodata= await  pageSeoService.getPageSeoByRouteName(route_name,org_id)
        if (pageseodata) {
            res.status(200).send({status:1, data:pageseodata, message:`Page seo data is fetched successfully`})
        }else{
            res.status(200).send({status:0,  message:`Page seo data not found`})
        }
    } catch (error) {
        next(error)
    }
}

// const allPageSeo = db.pageSeoModel.findAll();page_name
// Update Page SEO
exports.updatePageSeo = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { page_seo_id } = req.params;
        const { org_id } = req.tokenData;
        const existingPageSeo = await pageSeoService.getPageSeoById(page_seo_id)
        if (existingPageSeo) {
            let pageSeoData = {
                page_id: req.body.pageId ? req.body.pageId : null,
                title: req.body.title ? req.body.title : null,
                meta_description: req.body.metaDescription ? req.body.metaDescription : null,
                meta_keywords: req.body.metaKeywords ? req.body.metaKeywords : null,
                h1_tag: req.body.h1Tag ? req.body.h1Tag : null,
                schema_markup: req.body.schemaMarkup ? req.body.schemaMarkup : null,
                // active_status: req.body.activeStatus ? req.body.activeStatus : null,
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,

            };

              const updateres= await pageSeoService.updatePageSeo(page_seo_id,org_id,pageSeoData,transaction);
              if (updateres) {
                transaction.commit()
                res.status(200).send({   status: 1,  message: "Page SEO has been successfully updated.",});
              }else{
                throw new CustomError(`Page SEO update was unsuccessful.`,400)
              }

              
        } else {
            res.status(200).send({ status: 0, message: "Page SEO not found" });
        }
    } catch (error) {
        transaction.rollback()
        next(error);
    }
};

// Delete Page SEO
// exports.deletePageSeo = async (req, res, next) => {
//   try {
//     const { page_seo_id } = req.params;

//     const existingPageSeo = await pageSeoService.findByPk(page_seo_id);

//     if (existingPageSeo) {
//       await existingPageSeo.destroy();
//       res.json({ message: "Page SEO deleted successfully" });
//     } else {
//       res.status(404).json({ error: "Page SEO not found" });
//     }
//   } catch (error) {
//     next(error);
//   }

// };

exports.deletePageSeo = async (req, res, next) => {
    try {
        const { page_seo_id } = req.params;
        const ownerId = req.tokenData.org_user_id;
        const postExists = await pageSeoService.findPostById(
            parseInt(page_seo_id),
            ownerId
        );
        if (!postExists) {
            res.status(200).send({ status: 0, message: "Page SEO not found" });
        } else {
            const deletePageSeo = await pageSeoService.deletePageSeo(
                parseInt(page_seo_id),
                ownerId
            );
            if (deletePageSeo) {
                res
                    .status(200)
                    .send({ status: 1, message: "Page SEO deleted sucessfully." });
            } else {
                res.status(200).send({ status: 0, message: "Unable to delete Post." });
            }
        }
    } catch (error) {
        next(error);
    }
};

exports.toggleActiveStatus = async (req, res, next) => {
    try {
        const { page_seo_id } = req.params;

        const postExists = await pageSeoService.findPostById(parseInt(page_seo_id));
        if (postExists) {
            let payload = {
                active_status: parseInt(req.body.activeStatus),
                updated_by: req.tokenData.org_user_id
                    ? parseInt(req.tokenData.org_user_id)
                    : null,
            };
            const transaction = await db.sequelize.transaction(async (t) => {
                let updateRes = await db.pageSeoModel.update(payload, {
                    where: { page_seo_id: page_seo_id },
                    transaction: t,
                });
                if (updateRes[0] == 1) {
                    res
                        .status(200)
                        .send({
                            status: 1,
                            message: `Post successfully ${req.body.activeStatus ? "enabled" : "disabled"
                                }.`,
                        });
                } else {
                    throw new CustomError(
                        `Something went wrong! Post status not updated .`
                    );
                }
            });
        } else {
            res.status(200).send({ status: 0, message: "Post not found" });
        }
    } catch (error) {
        next(error);
    }
};
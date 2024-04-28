const CustomError = require("../../../utils/customErrorHandler");
const moment = require("moment");
const db = require("../../../models");
const fs = require("fs");
const helper = require("../../../common/helper");
const bcrypt = require("bcryptjs");
const DeviceDetector = require("node-device-detector");
const createFolder = require("../../../middleware/createFolder");
const marketLeadersService = require("../../../services/v1/admin/marketLeadersService");
const path = require("path");
const url = require("url");
const querystring = require("querystring");
const { Op } = require("sequelize");
const { forEach } = require("lodash");
const multer = require("multer");
/*****************************
 *  CREATE MARKET LEADERS
 ******************************/
exports.createMarketLeaders = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    let payload = {
      title: req.body.title ? req.body.title : null,
      active_status: req.body.activeStatus ? req.body.activeStatus : null,
      org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
      created_by: req.tokenData.org_user_id
        ? parseInt(req.tokenData.org_user_id)
        : null,
      updated_by: null,
      deleted_by: null,
    };
    let createPostRes = await db.marketLeadersModel.create(payload, {
      transaction,
    });
    createPostRes = helper.getJsonParseData(createPostRes);
    if (createPostRes) {
      await transaction.commit();
      const folderPath = `./src/public/org_files/hws_${req.tokenData.org_id}/media_content/market-leaders`; // Replace this with your folder path template
      let folderRes = await createFolder(folderPath);
      res.status(200).send({
        status: 1,
        data: createPostRes,
        message: `Market Leaders created successfully.`,
      });
    } else {
      throw new CustomError(`Something Went Wrong! Try Again Later`, 500);
    }
  } catch (error) {
    console.log("main error", error);
    await transaction.rollback();
    next(error);
  }
};

/*****************************
 *  GET ALL MARKET LEADERS
 ******************************/
exports.getAllMarketLeaders = async (req, res, next) => {
  try {
    let parsedUrl = url.parse(req.url);
    let parsedQs = querystring.parse(parsedUrl.query);
    const searchingValue = req.query.search || "";
    const sortField = req.query.sortField || "market_leader_id";
    const sortOrder = req.query.sortOrder || "DESC";
    let active_status = parsedQs.active_status ? parsedQs.active_status : "";

    // let searchPublishDate = helper.isDate(searchingValue)
    //   ?
    //  {
    //       [Op.or]: [
    //         {
    //           publish_date: {
    //             [Op.gte]: moment(searchingValue, "MM-DD-YYYY").format(), // Format it to match the database format
    //           },
    //         },
    //       ],
    //     }
    //   : {};
    let searchQuery = searchingValue
      ? {
        [Op.or]: [
          {
            title: {
              [Op.iLike]: `%${searchingValue}%`,
            },
          },
        ]
      }
      : {};

    let queryOptions = {
      where: { ...searchQuery },
      attributes: { exclude: ["deleted_by", "deleted_at"] },
      // include: [
      //   {
      //     model: db.orgUsersModel,
      //     as: "update_info",
      //     attributes: ["first_name", "last_name"],
      //     required: false,
      //   },
      //   {
      //     model: db.orgUsersModel,
      //     as: "create_info",
      //     attributes: ["first_name", "last_name"],
      //     required: false,
      //   },
      // ],
      order: [[sortField, sortOrder]],
    };

    if (active_status !== "") {
      queryOptions.where[Op.or] = [{ active_status: active_status }];
    }

    // Check if 'limit' and 'offset' are provided in the request query
    if (res.pagination) {
      queryOptions.limit = res.pagination.limit;
    }

    if (res.pagination) {
      queryOptions.offset =
        res.pagination.currentPage == 0
          ? 0
          : (res.pagination.currentPage - 1) * res.pagination.limit;
    }

    allPosts = await marketLeadersService.getAllMarketLeaders(
      req,
      queryOptions
    );

    if (allPosts.rows) {
      allPosts.rows = await Promise.all(allPosts.rows.map(async (element) => {
        element.create_info = await helper.getUserInfo(parseInt(element.created_by));
        if(element.updated_by){
          element.update_info = await helper.getUserInfo(parseInt(element.updated_by));
        }
        return element;
      }));
    }

    if (res.pagination) {
      res.pagination.total = allPosts.count;
      res.pagination.totalPages = Math.ceil(
        allPosts.count / queryOptions.limit
      );
    }
    if (allPosts.count > 0) {
      res.status(200).send({
        status: 1,
        data: allPosts.rows,
        pagination: res.pagination,
        message: "Market Leaders list found successfully",
      });
    } else {
      res.status(200).send({
        status: 1,
        data: allPosts.rows,
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
 *  GET MARKET LEADERS BY ID
 ******************************/
exports.getMarketLeadersById = async (req, res, next) => {
  try {
    let parsedUrl = url.parse(req.url);
    let parsedQs = querystring.parse(parsedUrl.query);
    const search = req.query.search || "";
    let active_status = parsedQs.active_status ? parsedQs.active_status : "";
    let queryOptions = {
      where: {
        active_status: true,
      },
      attributes: {
        exclude: [
          "created_by",
          "updated_by",
          "deleted_by",
          "created_at",
          "updated_at",
          "deleted_at",
        ],
      },
    };

    // Construct the search query

    allPosts = await marketLeadersService.findMarketLeadersById(
      req,
      res,
      next,
      queryOptions
    );

    if (allPosts.count > 0) {
      allPosts.rows.forEach((element) => {
        element.image = `${helper.api_baseurl}/org_file/hws_${req.tokenData.org_id
            ? req.tokenData.org_id
            : parseInt(req.headers.org_id)
          }/media_content/market-leaders/${element.image
          }`;
      });
      res.status(200).send({
        status: 1,
        data: allPosts.rows,
        pagination: res.pagination,
        message: "Market Leaders list found successfully",
      });
    } else {
      res.status(200).send({
        status: 1,
        data: allPosts.rows,
        pagination: res.pagination,
        message: "No Market Leaders found",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.uploadImage = async (req, res, next) => {
  try {
    let market_leader_id = null;
    if (req.params.market_leader_id) {
      // org_id = helper.decodeCrypto(decodeURI(req.params.org_id));
      market_leader_id = req.params.market_leader_id;
      if (req.file) {
        var image = req.file.filename ? `${req.file.filename}` : null;
        req.body.image = image;
        let data = {
          image: req.body.image,
          //updated_by: req.tokenData.user_id
        };
        let orgRes = await db.marketLeadersModel.update(data, {
          where: { market_leader_id: market_leader_id },
        });
        if (orgRes[0] == 1) {
          res.status(200).send({
            status: 1,
            message: "Successfully Updated Market Leaders Upload Image.",
          });
        } else {
          throw new CustomError("Failed to Update Market Leaders Upload Image.", 500);
        }
      } else {
        throw new CustomError(
          "Something went wrong! The file could not be found.",
          500
        );
      }
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

/*****************************
 *  UPDATE MARKET LEADERS
 ******************************/
exports.updateMarketLeaders = async (req, res, next) => {
  try {
    const { market_leader_id } = req.params;
    const owner_id = req.tokenData.org_user_id;
    const postExists = await marketLeadersService.findMarketLeaderById(
      parseInt(market_leader_id)
    );
    if (postExists) {
      let post_detail = {
        title: req.body.title ? req.body.title : null,
        active_status: req.body.activeStatus ? req.body.activeStatus : null,
        updated_by: req.tokenData.org_user_id
          ? parseInt(req.tokenData.org_user_id)
          : null,
        deleted_by: null,
      };
      const transaction = await db.sequelize.transaction(async (t) => {
        await db.marketLeadersModel.update(
          { updated_by: owner_id },
          { where: { market_leader_id: market_leader_id }, transaction: t }
        );
        await db.marketLeadersModel.update(post_detail, {
          where: { market_leader_id: market_leader_id },
          transaction: t,
        });
        res
          .status(200)
          .send({ status: 1, message: "Market Leaders has been Successfully Updated." });
      });
    } else {
      res.status(200).send({ status: 0, message: "Market Leaders not found" });
    }
  } catch (error) {
    next(error);
  }
};
/*****************************
 *  DELETE EXISTING IMAGE
 ******************************/
exports.deleteExistingImage = async (req, res, next) => {
  try {
    const { market_leader_id } = req.params;
    const { fileName, imageType } = req.body;
    const folderPath = `src/public/org_files/hws_${req.tokenData.org_id}/media_content/market-leaders`;
    const filename = fileName; // Change this to the actual filename you want to remove
    if (imageType == "marketLeadersImage") {
      // const filePath = `${folderPath}/${filename}`;
      fs.readdir(folderPath, (err, files) => {
        if (err) {
          res
            .status(200)
            .send({ status: 0, message: "Error reading directory" });
        }
        if (files.length > 0) {
          files.forEach((file) => {
            if (file.includes("-image.jpg")) {
              const filePath = path.join(`${folderPath}`, file);
              // Use fs.unlink to delete the file
              fs.unlink(filePath, (err) => {
                if (err) {
                  res.status(200).send({ status: 0 });
                } else {
                  res.status(200).send({ status: 1 });
                }
              });
            } else {
              res.status(200).send({ status: 1 });
            }
          });
        } else {
          res.status(200).send({ status: 1 });
        }
      });
    } else {
      res.status(200).send({ status: 0 });
    }
  } catch (error) {
    next(error);
  }
};

/*****************************
 *  DELETE MARKET LEADERS
 ******************************/

exports.deleteMarketLeaders = async (req, res, next) => {
  try {
    const { market_leader_id } = req.params;
    const ownerId = req.tokenData.org_user_id;
    const postMarketLeader = await marketLeadersService.findMarketLeaderById(
      parseInt(market_leader_id)
    );
    if (!postMarketLeader) {
      res.status(200).send({ status: 0, message: "Market Leaders not found" });
    } else {
      const deleteMarketLeaders = await marketLeadersService.deleteMarketLeader(
        postMarketLeader,
        ownerId
      );
      if (deleteMarketLeaders) {
        res
          .status(200)
          .send({ status: 1, message: "Market Leaders deleted sucessfully." });
      } else {
        res
          .status(200)
          .send({ status: 0, message: "Unable to delete Market Leaders." });
      }
    }
  } catch (error) {
    next(error);
  }
};

/*****************************
 *  TOGGLE MARKET LEADERS STATUS
 ******************************/
exports.toggleMarketLeadersStatus = async (req, res, next) => {
  try {
    const { market_leader_id } = req.params;
    const postExists = await marketLeadersService.findMarketLeaderById(parseInt(market_leader_id));
    if (postExists) {
      let payload = {
        active_status: parseInt(req.body.activeStatus),
        updated_by: req.tokenData.org_user_id
          ? parseInt(req.tokenData.org_user_id)
          : null,
      };
      const transaction = await db.sequelize.transaction(async (t) => {
        let updateRes = await db.marketLeadersModel.update(payload, {
          where: { market_leader_id: market_leader_id },
          transaction: t,
        });
        if (updateRes[0] == 1) {
          res.status(200).send({
            status: 1,
            message: `Market Leaders successfully ${req.body.activeStatus ? "enabled" : "disabled"
              }.`,
          });
        } else {
          throw new CustomError(
            `Something went wrong! Market Leaders status not updated .`
          );
        }
      });
    } else {
      res.status(200).send({ status: 0, message: "Market Leaders not found" });
    }
  } catch (error) {
    next(error);
  }
};
require("dotenv").config();
const helper = require("../../../common/helper");
const db = require("../../../models/index");
const { Op, literal } = require("sequelize");
const moment = require("moment");
const CustomError = require("../../../utils/customErrorHandler");
const termsMasterService = require("../../../services/v1/admin/termsMasterService");

/*****************************
 *  CREATE TERM
 ******************************/
exports.createTerm = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const formData = {
      org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
      term_name: req.body.termName.trim(),
      term_month: parseInt(req.body.termMonth),
      created_by: req.tokenData.org_user_id
        ? parseInt(req.tokenData.org_user_id)
        : null,
      updated_by: null,
      deleted_by: null,
    };

    // Checking duplicate data
    await termsMasterService.checkDuplicateData(formData);

    const createTerm = await termsMasterService.createTerm(
      formData,
      transaction
    );
    if (createTerm) {
      transaction.commit();
      res.status(200).send({
        status: 1,
        data: createTerm,
        message: "Term created Successfully.",
      });
    } else {
      res.status(400).send({
        status: 0,
        data: createTerm,
        message: "Something Went Wrong! Try Again Later",
      });
    }
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/*****************************
 *  UPDATE TERM
 ******************************/
exports.updateTerm = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { term_master_id } = req.params;
    if (!term_master_id) {
      throw new CustomError(`Term id is required`, 400);
    }
    const existsTerm = await termsMasterService.findTermById(
      parseInt(term_master_id)
    );
    if (existsTerm) {
      const formData = {
        term_name: req.body.termName.trim(),
        term_month: parseInt(req.body.termMonth),
        updated_by: req.tokenData.org_user_id
          ? parseInt(req.tokenData.org_user_id)
          : null,
        deleted_by: null,
      };

      // Checking duplicate data
      await termsMasterService.checkDuplicateData(formData, term_master_id);

      const updateTerm = await db.termsMasterModel.update(formData, {
        where: { term_master_id: term_master_id },
        transaction,
      });
      if (updateTerm) {
        transaction.commit();
        res.status(200).send({
          status: 1,
          message: "Term information has been successfully updated",
        });
      }
    } else {
      res.status(200).send({ status: 0, message: "Term not found" });
    }
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/*****************************
 *  GET ALL TERM
 ******************************/
exports.getAllTerms = async (req, res, next) => {
  try {
    const sortField = req.query.sortField || "term_month";
    const sortOrder = req.query.sortOrder || "ASC";
    const searchingValue = (req.query.search || "").trim();
    const searchTimestamp = helper.searchTimeStamp(searchingValue)
      ? helper.searchTimeStamp(searchingValue)
      : {};

    const searchQuery = searchingValue
      ? {
          [Op.or]: [
            {
              term_name: {
                [Op.iLike]: `%${searchingValue}%`,
              },
            },
            literal(`CAST(term_month AS TEXT) ILIKE '%${searchingValue}%'`),
          ],
          ...searchTimestamp,
        }
      : {};
    let queryOptions = {
      where: { ...searchQuery },
      attributes: { exclude: ["deleted_by", "deleted_at"] },
      order: [[sortField, sortOrder]],
      distinct: true,
    };

    if(req.query.activeStatus){
      queryOptions.where.active_status = parseInt(req.query.activeStatus);
    }

    if (res.pagination) {
      queryOptions.limit = res.pagination.limit;
      queryOptions.offset =
        res.pagination.currentPage == 0
          ? 0
          : (res.pagination.currentPage - 1) * res.pagination.limit;
    }

    const allTerms = await termsMasterService.getAllTerms(
      req,
      res,
      next,
      queryOptions
    );
    if (res.pagination) {
      res.pagination.total = allTerms.count;
      res.pagination.totalPages = Math.ceil(
        allTerms.count / queryOptions.limit
      );
    }
    if (allTerms.count > 0) {
      res.status(200).send({
        status: 1,
        data: allTerms.rows,
        pagination: res.pagination,
        message: "Term list found successfully",
      });
    } else {
      res.status(200).send({
        status: 0,
        data: allTerms.rows,
        pagination: res.pagination,
        message: "No term found",
      });
    }
  } catch (error) {
    next(error);
  }
};

/*****************************
 *  GET TERM BY ID
 ******************************/
exports.getTermById = async (req, res, next) => {
  try {
    const { term_master_id } = req.params;
    const existsTerm = await termsMasterService.findTermById(
      parseInt(term_master_id)
    );
    if (existsTerm) {
      res.status(200).send({
        status: 1,
        data: existsTerm,
        message: "Term found sucessfully",
      });
    } else {
      res.status(200).send({ status: 0, message: "Term not found" });
    }
  } catch (error) {
    next(error);
  }
};

/*****************************
 *  DELETE EXISTING TERM
 ******************************/
exports.deleteTerm = async (req, res, next) => {
  try {
    const { term_master_id } = req.params;
    const ownerId = req.tokenData.org_user_id;
    const existsTerm = await termsMasterService.findTermById(
      parseInt(term_master_id)
    );
    if (!existsTerm) {
      res.status(200).send({ status: 0, message: "Term not found" });
    } else {
      const deleteTerm = await termsMasterService.deleteTerm(
        existsTerm,
        ownerId
      );
      if (deleteTerm) {
        res
          .status(200)
          .send({ status: 1, message: "Term deleted sucessfully." });
      } else {
        res
          .status(200)
          .send({ status: 0, message: "Unable to delete the plan term." });
      }
    }
  } catch (error) {
    next(error);
  }
};

/*****************************
 *  TOGGLE TERM STATUS
 ******************************/
exports.toggleTermStatus = async (req, res, next) => {
  try {
    const { term_master_id } = req.params;
    if (!term_master_id) {
      throw new CustomError(`Term id is required`);
    }
    const owner_id = req.tokenData.org_user_id;
    const existsTerm = await termsMasterService.findTermById(
      parseInt(term_master_id)
    );
    if (existsTerm) {
      const formdata = {
        active_status: parseInt(req.body.activeStatus),
        updated_by: owner_id ? parseInt(owner_id) : null,
      };
      await db.sequelize.transaction(async (t) => {
        await db.termsMasterModel.update(formdata, {
          where: { term_master_id: term_master_id },
          transaction: t,
        });
        res.status(200).send({
          status: 1,
          message: `Term successfully ${
            req.body.activeStatus == "1" ? "enabled" : "disabled"
          }.`,
        });
      });
    } else {
      res.status(200).send({ status: 0, message: "Term not found" });
    }
  } catch (error) {
    next(error);
  }
};

require("dotenv").config();
const helper = require("../../../common/helper");
const db = require("../../../models/index");
const { Op, literal } = require("sequelize");
const moment = require("moment");
const CustomError = require("../../../utils/customErrorHandler");
const renewalStatusService = require("../../../services/v1/admin/renewalStatusService");

/*****************************
 *  CREATE RENEWAL STATUS
 ******************************/
exports.createRenewalStatus = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const formData = {
      org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
      value: parseInt(req.body.statusValue),
      status_name: req.body.statusName.trim(),
      status_color: req.body.statusColor,
      created_by: req.tokenData.org_user_id
        ? parseInt(req.tokenData.org_user_id)
        : null,
      updated_by: null,
      deleted_by: null,
    };

    // Checking duplicate data
    await renewalStatusService.checkDuplicateData(formData);

    const createRenewalStatus = await renewalStatusService.createRenewalStatus(
      formData,
      transaction
    );
    if (createRenewalStatus) {
      transaction.commit();
      res.status(200).send({
        status: 1,
        data: createRenewalStatus,
        message: "Renewal status created Successfully.",
      });
    } else {
      res.status(400).send({
        status: 0,
        data: [],
        message: "Something Went Wrong! Try Again Later",
      });
    }
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/*****************************
 *  UPDATE RENEWAL STATUS
 ******************************/
exports.updateRenewalStatus = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { renewal_status_id } = req.params;
    if (!renewal_status_id) {
      throw new CustomError(`Renewal status id is required`, 400);
    }
    const existsRenewalStatusData =
      await renewalStatusService.findRenewalStatusById(
        parseInt(renewal_status_id)
      );
    if (existsRenewalStatusData) {
      const formData = {
        value: parseInt(req.body.statusValue),
        status_name: req.body.statusName.trim(),
        status_color: req.body.statusColor,
        updated_by: req.tokenData.org_user_id
          ? parseInt(req.tokenData.org_user_id)
          : null,
        deleted_by: null,
      };
       
      // Checking duplicate data
      await renewalStatusService.checkDuplicateData(
        formData,
        renewal_status_id
      );

      const updateRenewalStatus = await db.renewalStatusModel.update(formData, {
        where: { renewal_status_id: renewal_status_id },
        transaction,
      });
      if (updateRenewalStatus) {
        transaction.commit();
        res.status(200).send({
          status: 1,
          message: "Renewal status has been successfully updated",
        });
      }
    } else {
      res.status(200).send({ status: 0, message: "Renewal status not found" });
    }
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/*****************************
 *  GET ALL RENEWAL STATUS
 ******************************/
exports.getAllStatus = async (req, res, next) => {
  try {
    const sortField = req.query.sortField || "status_name";
    const sortOrder = req.query.sortOrder || "ASC";
    const searchingValue = (req.query.search || "").trim();
    const searchTimestamp = helper.searchTimeStamp(searchingValue)
      ? helper.searchTimeStamp(searchingValue)
      : {};

    const searchQuery = searchingValue
      ? {
          [Op.or]: [
            {
              status_name: {
                [Op.iLike]: `%${searchingValue}%`,
              },
            },
            literal(`CAST(value AS TEXT) ILIKE '%${searchingValue}%'`),
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

    const allRenewalStatus = await renewalStatusService.getAllStatus(
      queryOptions
    );
    if (res.pagination) {
      res.pagination.total = allRenewalStatus.count;
      res.pagination.totalPages = Math.ceil(
        allRenewalStatus.count / queryOptions.limit
      );
    }
    if (allRenewalStatus.count > 0) {
      res.status(200).send({
        status: 1,
        data: allRenewalStatus.rows,
        pagination: res.pagination,
        message: "Renewal status list found successfully",
      });
    } else {
      res.status(200).send({
        status: 0,
        data: allRenewalStatus.rows,
        pagination: res.pagination,
        message: "No renewal status found",
      });
    }
  } catch (error) {
    next(error);
  }
};

/*****************************
 *  GET RENEWAL STATUS BY ID
 ******************************/
exports.getRenewalStatusById = async (req, res, next) => {
  try {
    const { renewal_status_id } = req.params;
    const renewalStatusExists =
      await renewalStatusService.findRenewalStatusById(
        parseInt(renewal_status_id)
      );
    if (renewalStatusExists) {
      res.status(200).send({
        status: 1,
        data: renewalStatusExists,
        message: "Renewal status found sucessfully",
      });
    } else {
      res.status(200).send({ status: 0, message: "Renewal status not found" });
    }
  } catch (error) {
    next(error);
  }
};

/*****************************
 *  DELETE EXISTING RENEWAL STATUS
 ******************************/
exports.deleteRenewalStatus = async (req, res, next) => {
  try {
    const { renewal_status_id } = req.params;
    const ownerId = req.tokenData.org_user_id;
    const renewalStatusExists =
      await renewalStatusService.findRenewalStatusById(
        parseInt(renewal_status_id)
      );
    if (!renewalStatusExists) {
      res.status(200).send({ status: 0, message: "Renewal status not found" });
    } else {
      const deleterenewalStatus =
        await renewalStatusService.deleteRenewalStatus(
          renewalStatusExists,
          ownerId
        );
      if (deleterenewalStatus) {
        res
          .status(200)
          .send({ status: 1, message: "Renewal status deleted sucessfully." });
      } else {
        res
          .status(200)
          .send({ status: 0, message: "Unable to delete the Renewal status." });
      }
    }
  } catch (error) {
    next(error);
  }
};

/*****************************
 *  TOGGLE RENEWAL STATUS
 ******************************/
exports.toggleRenewalStatus = async (req, res, next) => {
  try {
    const { renewal_status_id } = req.params;
    if (!renewal_status_id) {
      throw new CustomError(`Renewal status id is required`);
    }
    const owner_id = req.tokenData.org_user_id;
    const renewalStatusExists =
      await renewalStatusService.findRenewalStatusById(
        parseInt(renewal_status_id)
      );
    if (renewalStatusExists) {
      const formdata = {
        active_status: parseInt(req.body.activeStatus),
        updated_by: owner_id ? parseInt(owner_id) : null,
      };
      await db.sequelize.transaction(async (t) => {
        await db.renewalStatusModel.update(formdata, {
          where: { renewal_status_id: renewal_status_id },
          transaction: t,
        });
        res.status(200).send({
          status: 1,
          message: `Renewal status successfully ${
            req.body.activeStatus == "1" ? "enabled" : "disabled"
          }.`,
        });
      });
    } else {
      res.status(200).send({ status: 0, message: "Renewal status not found" });
    }
  } catch (error) {
    next(error);
  }
};

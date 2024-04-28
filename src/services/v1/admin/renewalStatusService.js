const db = require("../../../models/index");
const helper = require("../../../common/helper");
const { Op } = require("sequelize");
const CustomError = require("../../../utils/customErrorHandler");

// === CREATE RENEWAL STATUS ===
exports.createRenewalStatus = async (obj, transaction) => {
  try {
    const createRenewalStatus = await db.renewalStatusModel.create(obj, {
      transaction,
    });
    return createRenewalStatus
      ? helper.getJsonParseData(createRenewalStatus)
      : null;
  } catch (e) {
    throw e;
  }
};

// === GET ALL RENEWAL STATUS ===
exports.getAllStatus = async (queryOptions) => {
  try {
    const allRenewalStatus = await db.renewalStatusModel.findAndCountAll(
      queryOptions
    );
    return helper.getJsonParseData(allRenewalStatus);
  } catch (e) {
    throw e;
  }
};

// === FIND RENEWAL STATUS DETAILS BY ID ===
exports.findRenewalStatusById = async (id) => {
  try {
    let renewalStatusDetails = await db.renewalStatusModel.findOne({
      where: { renewal_status_id: id },
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
    });
    renewalStatusDetails = helper.getJsonParseData(renewalStatusDetails);
    return renewalStatusDetails;
  } catch (e) {
    throw e;
  }
};

// === DELETE RENEWAL STATUS ===
exports.deleteRenewalStatus = async (val, ownerId) => {
  try {
    let deleteRenewalStatus = "";
    await db.sequelize.transaction(async (t) => {
      await db.renewalStatusModel.update(
        { deleted_by: ownerId },
        { where: { renewal_status_id: val.renewal_status_id }, transaction: t }
      );

      deleteRenewalStatus = await db.renewalStatusModel.destroy({
        where: {
          renewal_status_id: val.renewal_status_id,
        },
        transaction: t,
      });
    });
    return deleteRenewalStatus;
  } catch (e) {
    throw e;
  }
};

// === Checking Duplicate Data ===
exports.checkDuplicateData = async (formData, renewal_status_id = null) => {
  if (!formData) return;

  // Checking duplicate status_name
  if (formData.status_name) {
    const whereClause = {
      [Op.or]: [{ status_name: { [Op.iLike]: formData.status_name } }],
    };

    if (renewal_status_id !== null) {
      whereClause.renewal_status_id = {
        [Op.not]: renewal_status_id, // Exclude the current status by its ID
      };
    }

    const renewalStatusExists = await db.renewalStatusModel.findOne({
      where: whereClause,
    });
    if (renewalStatusExists) {
      throw new CustomError("Status name must be unique", 409);
    }
  }

  // Checking duplicate status value
  if (formData.value != null || formData.value != undefined) {
    const whereClause = {
      value: formData.value,
    };

    if (renewal_status_id !== null) {
      whereClause.renewal_status_id = {
        [Op.not]: renewal_status_id, // Exclude the current status by its ID
      };
    }

    const renewalStatusExists = await db.renewalStatusModel.findOne({
      where: whereClause,
    });
    if (renewalStatusExists) {
      throw new CustomError("Status id must be unique", 409);
    }
  }
};

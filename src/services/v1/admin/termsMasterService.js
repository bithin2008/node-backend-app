const db = require("../../../models/index");
const helper = require("../../../common/helper");
const { Op } = require("sequelize");
const CustomError = require("../../../utils/customErrorHandler");

// === CREATE TERM ===
exports.createTerm = async (obj, transaction) => {
  try {
    const createTerm = await db.termsMasterModel.create(obj, { transaction });
    return createTerm ? helper.getJsonParseData(createTerm) : null;
  } catch (e) {
    throw e;
  }
};

// === GET ALL TERMS ===
exports.getAllTerms = async (req, res, next, queryOptions) => {
  try {
    const allTerms = await db.termsMasterModel.findAndCountAll(queryOptions);
    return helper.getJsonParseData(allTerms);
  } catch (e) {
    throw e;
  }
};

// === FIND TERM DETAILS BY ID ===
exports.findTermById = async (id) => {
  try {
    let termDetails = await db.termsMasterModel.findOne({
      where: { term_master_id: id },
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
    termDetails = helper.getJsonParseData(termDetails);
    return termDetails;
  } catch (e) {
    throw e;
  }
};

// === DELETE PRODUCT ===
exports.deleteTerm = async (val, ownerId) => {
  try {
    let deleteTermData = "";
    await db.sequelize.transaction(async (t) => {
      await db.termsMasterModel.update(
        { deleted_by: ownerId },
        { where: { term_master_id: val.term_master_id }, transaction: t }
      );

      deleteTermData = await db.termsMasterModel.destroy({
        where: {
          term_master_id: val.term_master_id,
        },
        transaction: t,
      });
    });
    return deleteTermData;
  } catch (e) {
    throw e;
  }
};

// === Checking Duplicate Data ===
exports.checkDuplicateData = async (formData, term_master_id = null) => {
  if (!formData) return;

  // Checking duplicate term_name
  if (formData.term_name) {
    const whereClause = {
      [Op.or]: [{ term_name: { [Op.iLike]: formData.term_name } }],
    };

    if (term_master_id !== null) {
      whereClause.term_master_id = {
        [Op.not]: term_master_id, // Exclude the current term by its ID
      };
    }

    const existingTermName = await db.termsMasterModel.findOne({
      where: whereClause,
    });
    if (existingTermName) {
      throw new CustomError("Term name must be unique", 409);
    }
  }

  // Checking duplicate term_month
  if (formData.term_month) {
    const whereClause = {
      term_month: parseInt(formData.term_month),
    };

    if (term_master_id !== null) {
      whereClause.term_master_id = {
        [Op.not]: term_master_id, // Exclude the current term by its ID
      };
    }

    const existingTermMonth = await db.termsMasterModel.findOne({
      where: whereClause,
    });
    if (existingTermMonth) {
      throw new CustomError("Total month must be unique", 409);
    }
  }
};

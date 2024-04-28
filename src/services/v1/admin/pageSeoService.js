const db = require('../../../models/index');
const CustomError = require('../../../utils/customErrorHandler');
const helper = require('../../../common/helper');

// Create Page SEO
exports.createPageSeo = async (pageSeoData) => {
  try {
    const createdPageSeo = db.pageSeoModel.create(pageSeoData);
    return createdPageSeo;
  } catch (error) {
    throw error;
  }
};


exports.getAllPageSeo = async (queryOptions) => {
  try {
    let allPageSeo = await db.pageSeoModel.findAndCountAll(queryOptions);
    return helper.getJsonParseData(allPageSeo);
  } catch (e) {
    console.log(e);
    throw e;
  }
}
// Get Page SEO By ID
exports.getPageSeoById = async (page_seo_id) => {
  try {
    const pageSeoData = db.pageSeoModel.findByPk(page_seo_id);
    return pageSeoData;
  } catch (error) {
    throw error;
  }
};
exports.getPageSeoByRouteName = async (route_name, org_id) => {
  try {
    const pageSeoData = await db.pageSeoModel.findOne({
      where: { org_id: org_id },
      include: [
        {
          model: db.websitePagesModel,
          as: "page_details",
          attributes: ["page_name", "page_id", 'route_name'],
          where: { route_name: route_name, }
        }]
    });
    return pageSeoData ? helper.getJsonParseData(pageSeoData) : null
  } catch (error) {
    throw error;
  }
};

// Update Page SEO
exports.updatePageSeo = async (page_seo_id, org_id, obj, transaction) => {
  try {

    let updateRes = await db.pageSeoModel.update(obj, { where: { page_seo_id: page_seo_id, org_id: org_id }, transaction });
    return updateRes[0] != 0 ? true : false;
  } catch (e) {
    throw e
    // throw Error('Error while fetching User')
  }
};




exports.deletePageSeo = async (page_seo_id, ownerId) => {
  try {
    let deletePageSeo;
    const transaction = await db.sequelize.transaction(async (t) => {
      await db.pageSeoModel.update(
        { deleted_by: ownerId },
        { where: { page_seo_id: page_seo_id }, transaction: t }
      )
      deletePageSeo = await db.pageSeoModel.destroy({
        where: {
          page_seo_id: page_seo_id
        }, transaction: t
      })
    });
    return deletePageSeo;

  } catch (e) {
    console.log(e);
    throw e
  }
}
require("dotenv").config();
const config = require("../../../config/config");
const CustomError = require("../../../utils/customErrorHandler");
const db = require('../../../models/index')
const moment = require("moment");
const bcrypt = require('bcryptjs');
const createFolder = require("../../../middleware/createFolder")
const url = require('url');
const querystring = require('querystring');
const { Op } = require("sequelize");
const fs = require('fs');
const path = require("path");
const productService = require("../../../services/v1/admin/productService");
//const model =db.sequelize.models// Object.keys(db.sequelize.models);

/*****************************
 *  CREATE PRODUCT
 ******************************/
exports.createProduct = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const data = {
            //  product_categories: req.body.productCategories,
            org_id: req.tokenData.org_id ? parseInt(req.tokenData.org_id) : null,
            product_name: req.body.productName.trim(),
            product_type: req.body.productType,
            monthly_price: req.body.monthlyPrice,
            yearly_price: req.body.yearlyPrice,
            sequence: req.body.sequence,
            active_status: parseInt(req.body.activeStatus),
            created_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
            updated_by: null,
            deleted_by: null
        };
        const createdProduct = await productService.createProduct(data, transaction);
        if (createdProduct) {           
            const folderPath = `./src/public/org_files/hws_${req.tokenData.org_id}/media_content/products`; // Replace this with your folder path template
            let folderRes = await createFolder(folderPath);
            transaction.commit();
            res.status(200).send({
                status: 1,
                data:createdProduct,
                message: "Product created Successfully.",
            });
        } else {
            res.status(400).send({ status: 0, data:createdProduct, message: 'Something Went Wrong! Try Again Later' })
        }
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}

/*****************************
 *  GET ALL PRODUCTS
 ******************************/
exports.getAllProducts = async (req, res, next) => {
    try {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);

        const sortField = req.query.sortField || 'product_id'; // Default to 'org_user_id'
        const sortOrder = req.query.sortOrder || 'DESC';
        let activeStatus = parsedQs.active_status ? parsedQs.active_status : '';
        let product_type = parsedQs.product_type ? { product_type: parsedQs.product_type } : {};
        const searchingValue = req.query.search || '';
        const searchQuery = searchingValue ? {
            [Op.or]: [
                {
                    product_name: {
                        [Op.iLike]: `%${searchingValue}%`,
                    },
                },
                db.Sequelize.literal(`CAST  ("monthly_price" AS TEXT) ILIKE '%${searchingValue}%'`),
                db.Sequelize.literal(`CAST("yearly_price" AS TEXT) ILIKE '%${searchingValue}%'`),
            ],
        } : {};

        let queryOptions = {
            where: { ...searchQuery, ...product_type },
            attributes: { exclude: ['deleted_by', 'deleted_at',] },
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
            distinct: true,
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

        allProducts = await productService.getAllProducts(req.tokenData ? req.tokenData.org_id : parseInt(req.headers.org_id),queryOptions)
        if (res.pagination) {
            res.pagination.total = allProducts.count
            res.pagination.totalPages = Math.ceil(allProducts.count / queryOptions.limit)
        }
        if (allProducts.count > 0) {
            res.status(200).send({ status: 1, data: allProducts.rows, pagination: res.pagination, message: 'Product list found successfully' })
        } else {
            res.status(200).send({ status: 1, data: allProducts.rows, pagination: res.pagination, message: 'No Product found' })
        }

    } catch (error) {
        next(error)
    }
}

/*****************************
 *  UPDATE PRODUCTS
 ******************************/
exports.updateProduct = async (req, res, next) => {
    try {
        const { product_id } = req.params;
        const owner_id = req.tokenData.org_user_id
        const productExists = await productService.findProductById(parseInt(product_id));
        if (productExists) {
            let product_detail = {
                // product_categories: req.body.productCategories,
                product_name: req.body.productName.trim(),
                product_type: req.body.productType,
                monthly_price: req.body.monthlyPrice,
                yearly_price: req.body.yearlyPrice,
                sequence: req.body.sequence,
                active_status: parseInt(req.body.activeStatus),
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
                deleted_by: null
            }

            const transaction = await db.sequelize.transaction(async (t) => {
                await db.productsModel.update(
                    { updated_by: owner_id },
                    { where: { product_id: product_id }, transaction: t })
                await db.productsModel.update(product_detail, { where: { product_id: product_id }, transaction: t })
                res.status(200).send({ status: 1, message: 'Product information has been successfully updated.' })
            });


        } else {
            res.status(200).send({ status: 0, message: "Product not found" });
        }
    } catch (error) {
        next(error);
    }
}


/*****************************
 *  DELETE EXISTING PRODUCT IMAGE
 ******************************/
exports.deleteExistingImage = async (req, res, next) => {
    res.status(200).send({ status: 1 })
    // try {
    //     const { product_id } = req.params;
    //     const { fileName, imageType } = req.body;
    //     const folderPath = `src/public/org_files/hws_${req.tokenData.org_id}/media_content/products`;
    //     const existingFolderPath = `./public/org_files/hws_${req.tokenData.org_id}/media_content/products`;
    //     if (!fs.existsSync(existingFolderPath)) {
    //         const folderPath = `./src/public/org_files/hws_${req.tokenData.org_id}/media_content/products`; // Replace this with your folder path template
    //         let folderRes = await createFolder(folderPath);
    //     }
    //     const filename = fileName; // Change this to the actual filename you want to remove
    //     if (imageType == 'productImage') {
    //         // const filePath = `${folderPath}/${filename}`;
    //         fs.readdir(folderPath, (err, files) => {
    //             if (err) {
    //                 res.status(200).send({ status: 0, message: 'Error reading directory' })
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
    //                     } else {
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
 *  UPLOAD PRODUCT IMAGE
 ******************************/
exports.uploadProductImage = async (req, res, next) => {
    try {
        let product_id = null
        if (req.params.product_id) {
            // org_id = helper.decodeCrypto(decodeURI(req.params.org_id));
            product_id = req.params.product_id
            if (req.file) {

                var image = req.file.filename ? `${req.file.filename}` : null
                req.body.productImage = image
                let data = {
                    product_image: req.body.productImage,
                    //updated_by: req.tokenData.user_id
                }
                let orgRes = await db.productsModel.update(data,
                    { where: { product_id: product_id } }
                )
                if (orgRes[0] == 1) {
                    res.status(200).send({ status: 1, message: 'Successfully updated product image.' })
                } else {
                    throw new CustomError('Failed to upload product image.', 500)
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
 *  TOGGLE PRODUCTS STATUS
 ******************************/
exports.toggleProductStatus = async (req, res, next) => {
    try {
        const { product_id } = req.params;
        console.log('product_id',product_id);
        const owner_id = req.tokenData.org_user_id
        const productExists = await productService.findProductById(parseInt(product_id));
        if (productExists) {
            let product_detail = {
                active_status: parseInt(req.body.activeStatus),
                updated_by: req.tokenData.org_user_id ? parseInt(req.tokenData.org_user_id) : null,
            }
            const transaction = await db.sequelize.transaction(async (t) => {
                await db.productsModel.update(
                    { updated_by: owner_id },
                    { where: { product_id: product_id }, transaction: t })

                await db.productsModel.update(product_detail, { where: { product_id: product_id }, transaction: t })
                res.status(200).send({ status: 1, message: `Product successfully ${req.body.activeStatus == '1' ? 'enabled' : 'disabled'}.` })

            });


        } else {
            res.status(200).send({ status: 0, message: "Product not found" });
        }
    } catch (error) {
        next(error);
    }
}

/*****************************
 *  DELETE PRODUCT
 ******************************/

exports.deleteProduct = async (req, res, next) => {
    try {
        const { product_id } = req.params;
        const ownerId = req.tokenData.org_user_id
        const productExists = await productService.findProductById(parseInt(product_id));
        if (!productExists) {
            res.status(200).send({ status: 0, message: "Product not found" });
        } else {
            const deleteProduct = await productService.deleteProduct(productExists, ownerId);
            if (deleteProduct) {
                res.status(200).send({ status: 1, message: 'Product deleted sucessfully.' });
            } else {
                res.status(200).send({ status: 0, message: 'Unable to delete Product.' });
            }
        }
    } catch (error) {
        next(error);
    }
}
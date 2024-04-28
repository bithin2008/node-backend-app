const db = require('../models/index');
const CustomError = require('../utils/customErrorHandler');

const checkZipCode = async (req, res, next) => {
  try {
    if (!req.body.zip) {
      throw new CustomError('zipcode is required', 400)
    }
    let response = await db.zipcodesModel.findOne({
      attributes: [
        'zipcode', 'city', 'state', 'statecode', 'lat', 'lon', 'is_serviceable', 'active_status','combined_rate'],
      where: {
        zipcode: req.body.zip,
      }
    });
    if (!response) {
      next();
    } else {
      response = JSON.parse(JSON.stringify(response))
      req.body.zipCodedata = response;
      next();
      // if (response.is_serviceable == 1 && response.flag == 1) {
      //   next()
      // } else {combined_rate
      //   throw new CustomError('Unavailable services in this zip code', 503)
      // }
      
    }

  } catch (error) {
    next(error)

    console.error('Error retrieving city and state:', error.message);
  }

}
module.exports = checkZipCode

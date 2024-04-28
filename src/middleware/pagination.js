const url = require('url');
const querystring = require('querystring');


const generatePagination = () => {

    return (req, res, next) => {
        let parsedUrl = url.parse(req.url);
        let parsedQs = querystring.parse(parsedUrl.query);
        let limitAsNumber = Number.parseInt(parsedQs.limit ? parsedQs.limit : 50)
        let offsetAsNumber = Number.parseInt(parsedQs.page ? parsedQs.page : 0);
        let limit = 10;
        if (!Number.isNaN(limitAsNumber) && limitAsNumber > 0) {
            limit = limitAsNumber
        }
        let offset = 0
        if (!Number.isNaN(offsetAsNumber) && offsetAsNumber > 0) {
            offset = offsetAsNumber
        }
        if (parsedQs.limit&& parsedQs.page) {
            const pagination = {
                first:(offset-1)*limit,
                currentPage: offset,
                limit: limit,
                total: null,
                totalPages: null
            }
            res.pagination=pagination
        }
        next();
    };

}


module.exports = generatePagination;
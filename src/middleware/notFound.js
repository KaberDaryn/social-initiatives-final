const { ApiError } = require('../utils/ApiError');

function notFound(_req, _res, next) {
  next(ApiError.notFound('Route not found'));
}

module.exports = { notFound };

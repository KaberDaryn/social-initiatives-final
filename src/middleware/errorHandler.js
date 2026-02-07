const { env } = require('../config/env');
const { ApiError } = require('../utils/ApiError');

function errorHandler(err, req, res, _next) {
  const isApiError = err instanceof ApiError;
  const status = isApiError ? err.statusCode : 500;

  // mongoose duplicate key
  if (!isApiError && err && err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        message: 'Duplicate key error',
        details: err.keyValue
      }
    });
  }

  const payload = {
    success: false,
    error: {
      message: isApiError ? err.message : 'Internal server error',
      details: isApiError ? err.details : undefined
    }
  };

  if (env.nodeEnv !== 'production') {
    payload.error.stack = err.stack;
    payload.error.path = req.path;
  }

  return res.status(status).json(payload);
}

module.exports = { errorHandler };

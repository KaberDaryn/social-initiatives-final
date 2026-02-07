const { ApiError } = require('../utils/ApiError');

function validate(schema) {
  return function (req, _res, next) {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!result.success) {
      const issues = result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message
      }));
      return next(ApiError.badRequest('Validation failed', issues));
    }

    req.validated = result.data;
    next();
  };
}

module.exports = { validate };

const { ApiError } = require('../utils/ApiError');
const { verifyToken } = require('../utils/jwt');
const { env } = require('../config/env');
const { User } = require('../models/User');

async function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return next(ApiError.unauthorized());

  let payload;
  try {
    payload = verifyToken(token, { secret: env.jwtSecret });
  } catch (_e) {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }

  const user = await User.findById(payload.userId).select('_id name email role');
  if (!user) return next(ApiError.unauthorized());

  req.user = user;
  next();
}

function requireRoles(...roles) {
  return function (req, _res, next) {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };
}


async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return next();

  try {
    const payload = verifyToken(token, { secret: env.jwtSecret });
    const user = await User.findById(payload.userId).select('_id name email role');
    if (user) req.user = user;
  } catch (_e) {
    // Ignore invalid tokens for optional auth.
  }
  next();
}


module.exports = { requireAuth, optionalAuth, requireRoles };

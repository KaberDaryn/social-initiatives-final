const { User } = require('../models/User');
const { ApiError } = require('../utils/ApiError');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { env } = require('../config/env');

async function register({ name, email, password }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw ApiError.conflict('Email already in use');

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash });

  const token = signToken({ userId: user._id, role: user.role }, { secret: env.jwtSecret, expiresIn: env.jwtExpiresIn });
  return { token, user: user.toSafeJSON() };
}

async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) throw ApiError.unauthorized('Invalid email or password');

  const token = signToken({ userId: user._id, role: user.role }, { secret: env.jwtSecret, expiresIn: env.jwtExpiresIn });
  return { token, user: user.toSafeJSON() };
}

module.exports = { register, login };

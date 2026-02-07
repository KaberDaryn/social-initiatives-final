const { asyncHandler } = require('../utils/asyncHandler');
const { created, ok } = require('../utils/response');
const authService = require('../services/authService');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.validated.body;
  const result = await authService.register({ name, email, password });
  return created(res, result);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const result = await authService.login({ email, password });
  return ok(res, result);
});

module.exports = { register, login };

const { asyncHandler } = require('../utils/asyncHandler');
const { ok } = require('../utils/response');
const bookingService = require('../services/bookingService');

const listBookings = asyncHandler(async (req, res) => {
  const { query } = req.validated;
  const result = await bookingService.listBookings(query || {});
  return ok(res, result.items, result.meta);
});

module.exports = { listBookings };

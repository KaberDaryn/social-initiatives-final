const { asyncHandler } = require('../utils/asyncHandler');
const { ok, created } = require('../utils/response');
const bookingService = require('../services/bookingService');

const join = asyncHandler(async (req, res) => {
  const { eventId } = req.validated.body;
  const booking = await bookingService.joinEvent(req.user._id, eventId);
  return created(res, booking);
});

const cancel = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const booking = await bookingService.cancelBooking(id, req.user);
  return ok(res, booking);
});

const myBookings = asyncHandler(async (req, res) => {
  const items = await bookingService.myBookings(req.user._id);
  return ok(res, items);
});

const myStatus = asyncHandler(async (req, res) => {
  const { eventId } = req.validated.params;
  const status = await bookingService.getMyBookingStatus(req.user._id, eventId);
  return ok(res, status);
});

module.exports = { join, cancel, myBookings, myStatus };

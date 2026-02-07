const { Booking, BOOKING_STATUS } = require('../models/Booking');
const { Event } = require('../models/Event');
const { ApiError } = require('../utils/ApiError');
const { EVENT_STATUS } = require('../constants/event');
const { ROLES } = require('../constants/roles');

async function joinEvent(userId, eventId) {
  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound('Event not found');
  if (event.status !== EVENT_STATUS.PUBLISHED) {
    throw ApiError.badRequest('You can join only published events');
  }

  // Capacity check (count ACTIVE bookings)
  const activeCount = await Booking.countDocuments({ event: eventId, status: BOOKING_STATUS.ACTIVE });
  if (activeCount >= event.capacity) {
    throw ApiError.badRequest('Event is full');
  }

  // If there is a cancelled booking, allow re-join by creating new ACTIVE and leaving cancelled as history.
  // Unique partial index enforces only one ACTIVE.
  const booking = await Booking.create({ user: userId, event: eventId, status: BOOKING_STATUS.ACTIVE });
  return Booking.findById(booking._id).populate('event').populate('user', 'name email role');
}

async function cancelBooking(bookingId, actor) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking not found');

  const isOwner = booking.user.toString() === actor._id.toString();
  const isAdmin = actor.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) throw ApiError.forbidden();

  booking.status = BOOKING_STATUS.CANCELLED;
  await booking.save();
  return Booking.findById(bookingId).populate('event').populate('user', 'name email role');
}

async function myBookings(userId) {
  return Booking.find({ user: userId, status: BOOKING_STATUS.ACTIVE })
    .populate('event')
    .sort({ createdAt: -1 });
}

async function getMyBookingStatus(userId, eventId) {
  const booking = await Booking.findOne({ user: userId, event: eventId, status: BOOKING_STATUS.ACTIVE });
  return { hasBooking: Boolean(booking), bookingId: booking?._id || null };
}

async function listBookings({ eventId, page = '1', limit = '10' }) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

  const filter = {};
  if (eventId) filter.event = eventId;

  const [items, total] = await Promise.all([
    Booking.find(filter)
      .populate('event')
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l),
    Booking.countDocuments(filter)
  ]);

  return { items, meta: { page: p, limit: l, total, pages: Math.ceil(total / l) } };
}

module.exports = { joinEvent, cancelBooking, myBookings, getMyBookingStatus, listBookings };

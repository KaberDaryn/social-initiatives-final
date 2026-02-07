const { Event } = require('../models/Event');
const { Booking } = require('../models/Booking');
const { ApiError } = require('../utils/ApiError');
const { EVENT_STATUS } = require('../constants/event');

function assertDates(startAt, endAt) {
  if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
    throw ApiError.badRequest('endAt must be after startAt');
  }
}

async function listEvents({ q, type, status, page = '1', limit = '10' }, { isAdmin }) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (!isAdmin) filter.status = EVENT_STATUS.PUBLISHED;
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { location: { $regex: q, $options: 'i' } }
    ];
  }

  const [items, total] = await Promise.all([
    Event.find(filter)
      .populate('organizerUser', 'name email role')
      .sort({ startAt: 1 })
      .skip((p - 1) * l)
      .limit(l),
    Event.countDocuments(filter)
  ]);

  return {
    items,
    meta: { page: p, limit: l, total, pages: Math.ceil(total / l) }
  };
}

async function getEventById(eventId, { isAdmin }) {
  const event = await Event.findById(eventId).populate('organizerUser', 'name email role');
  if (!event) throw ApiError.notFound('Event not found');
  if (!isAdmin && event.status !== EVENT_STATUS.PUBLISHED) {
    throw ApiError.notFound('Event not found');
  }
  return event;
}

async function createEvent(payload, organizerUserId) {
  assertDates(payload.startAt, payload.endAt);
  const event = await Event.create({ ...payload, organizerUser: organizerUserId });
  return Event.findById(event._id).populate('organizerUser', 'name email role');
}

async function updateEvent(eventId, payload) {
  const current = await Event.findById(eventId);
  if (!current) throw ApiError.notFound('Event not found');

  const nextStart = payload.startAt || current.startAt;
  const nextEnd = payload.endAt || current.endAt;
  if (payload.startAt || payload.endAt) {
    assertDates(nextStart, nextEnd);
  }

  const event = await Event.findByIdAndUpdate(eventId, payload, {
    new: true,
    runValidators: true
  }).populate('organizerUser', 'name email role');

  return event;
}

async function deleteEvent(eventId) {
  const event = await Event.findByIdAndDelete(eventId);
  if (!event) throw ApiError.notFound('Event not found');
  await Booking.deleteMany({ event: eventId });
  return { deleted: true };
}

async function setEventStatus(eventId, status) {
  const event = await Event.findByIdAndUpdate(eventId, { status }, { new: true, runValidators: true }).populate(
    'organizerUser',
    'name email role'
  );
  if (!event) throw ApiError.notFound('Event not found');
  return event;
}

module.exports = { listEvents, getEventById, createEvent, updateEvent, deleteEvent, setEventStatus };

const { Update } = require('../models/Update');
const { Event } = require('../models/Event');
const { ApiError } = require('../utils/ApiError');
const { EVENT_STATUS } = require('../constants/event');

async function createUpdate({ eventId, title, content }, authorId) {
  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound('Event not found');
  if (event.status !== EVENT_STATUS.PUBLISHED) {
    throw ApiError.badRequest('Updates can be posted only for published events');
  }

  const update = await Update.create({ event: eventId, author: authorId, title, content });
  return Update.findById(update._id).populate('author', 'name email role');
}

async function listUpdatesForEvent(eventId, { isAdmin }) {
  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound('Event not found');
  if (!isAdmin && event.status !== EVENT_STATUS.PUBLISHED) throw ApiError.notFound('Event not found');

  return Update.find({ event: eventId }).populate('author', 'name email role').sort({ createdAt: -1 });
}

async function deleteUpdate(updateId) {
  const update = await Update.findByIdAndDelete(updateId);
  if (!update) throw ApiError.notFound('Update not found');
  return { deleted: true };
}

module.exports = { createUpdate, listUpdatesForEvent, deleteUpdate };

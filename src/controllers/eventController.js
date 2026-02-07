const { asyncHandler } = require('../utils/asyncHandler');
const { ok, created } = require('../utils/response');
const eventService = require('../services/eventService');
const { ROLES } = require('../constants/roles');

const listEvents = asyncHandler(async (req, res) => {
  const { query } = req.validated;
  const isAdmin = Boolean(req.user && req.user.role === ROLES.ADMIN);
  const result = await eventService.listEvents(query || {}, { isAdmin });
  return ok(res, result.items, result.meta);
});

const getEvent = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const isAdmin = Boolean(req.user && req.user.role === ROLES.ADMIN);
  const event = await eventService.getEventById(id, { isAdmin });
  return ok(res, event);
});

const createEvent = asyncHandler(async (req, res) => {
  const payload = req.validated.body;
  const event = await eventService.createEvent(payload, req.user._id);
  return created(res, event);
});

const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const payload = req.validated.body;
  const event = await eventService.updateEvent(id, payload);
  return ok(res, event);
});

const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const result = await eventService.deleteEvent(id);
  return ok(res, result);
});

const setStatus = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const { status } = req.validated.body;
  const event = await eventService.setEventStatus(id, status);
  return ok(res, event);
});

module.exports = { listEvents, getEvent, createEvent, updateEvent, deleteEvent, setStatus };

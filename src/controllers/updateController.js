const { asyncHandler } = require('../utils/asyncHandler');
const { ok, created } = require('../utils/response');
const updateService = require('../services/updateService');
const { ROLES } = require('../constants/roles');

const createUpdate = asyncHandler(async (req, res) => {
  const payload = req.validated.body;
  const update = await updateService.createUpdate(payload, req.user._id);
  return created(res, update);
});

const listUpdatesForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.validated.params;
  const isAdmin = Boolean(req.user && req.user.role === ROLES.ADMIN);
  const updates = await updateService.listUpdatesForEvent(eventId, { isAdmin });
  return ok(res, updates);
});

const deleteUpdate = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const result = await updateService.deleteUpdate(id);
  return ok(res, result);
});

module.exports = { createUpdate, listUpdatesForEvent, deleteUpdate };

const express = require('express');
const { validate } = require('../middleware/validate');
const { requireAuth, requireRoles, optionalAuth } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');
const updateController = require('../controllers/updateController');
const { createUpdateSchema, updateIdSchema, listEventUpdatesSchema } = require('../validators/updateSchemas');

const router = express.Router();

// Public list (published events only). If admin token provided -> can view drafts' updates (still blocked by service).
router.get('/event/:eventId', optionalAuth, validate(listEventUpdatesSchema), updateController.listUpdatesForEvent);

// Admin create/delete
router.post('/', requireAuth, requireRoles(ROLES.ADMIN), validate(createUpdateSchema), updateController.createUpdate);
router.delete('/:id', requireAuth, requireRoles(ROLES.ADMIN), validate(updateIdSchema), updateController.deleteUpdate);

module.exports = { updateRouter: router };

const express = require('express');
const { validate } = require('../middleware/validate');
const { requireAuth, optionalAuth, requireRoles } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');
const eventController = require('../controllers/eventController');
const { createEventSchema, updateEventSchema, listEventsSchema, idParamSchema, statusSchema } = require('../validators/eventSchemas');

const router = express.Router();

// Public list (published only). If token provided and admin -> can see all with status filter.
router.get('/', optionalAuth, validate(listEventsSchema), eventController.listEvents);
router.get('/:id', optionalAuth, validate(idParamSchema), eventController.getEvent);

// Admin CRUD
router.post('/', requireAuth, requireRoles(ROLES.ADMIN), validate(createEventSchema), eventController.createEvent);
router.put('/:id', requireAuth, requireRoles(ROLES.ADMIN), validate(updateEventSchema), eventController.updateEvent);
router.delete('/:id', requireAuth, requireRoles(ROLES.ADMIN), validate(idParamSchema), eventController.deleteEvent);
router.patch('/:id/status', requireAuth, requireRoles(ROLES.ADMIN), validate(statusSchema), eventController.setStatus);

module.exports = { eventRouter: router };

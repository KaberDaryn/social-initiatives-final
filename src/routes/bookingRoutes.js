const express = require('express');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');
const { joinSchema, bookingIdSchema, eventStatusSchema } = require('../validators/bookingSchemas');

const router = express.Router();

router.post('/', requireAuth, validate(joinSchema), bookingController.join);
router.get('/status/:eventId', requireAuth, validate(eventStatusSchema), bookingController.myStatus);
router.delete('/:id', requireAuth, validate(bookingIdSchema), bookingController.cancel);

module.exports = { bookingRouter: router };

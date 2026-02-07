const express = require('express');
const { authRouter } = require('./authRoutes');
const { eventRouter } = require('./eventRoutes');
const { bookingRouter } = require('./bookingRoutes');
const { updateRouter } = require('./updateRoutes');
const { commentRouter } = require('./commentRoutes');
const { meRouter } = require('./meRoutes');
const { adminRouter } = require('./adminRoutes');
const { requireAuth } = require('../middleware/auth');
const { ok } = require('../utils/response');

const router = express.Router();

router.get('/health', (req, res) => ok(res, { status: 'ok' }));
router.get('/me', requireAuth, (req, res) => ok(res, req.user));

router.use('/auth', authRouter);
router.use('/events', eventRouter);
router.use('/bookings', bookingRouter);
router.use('/updates', updateRouter);
router.use('/comments', commentRouter);
router.use('/me', meRouter);
router.use('/admin', adminRouter);

module.exports = { apiRouter: router };

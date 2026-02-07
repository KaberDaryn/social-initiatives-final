const express = require('express');
const { requireAuth, requireRoles } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { ROLES } = require('../constants/roles');
const adminController = require('../controllers/adminController');
const { listBookingsSchema } = require('../validators/adminSchemas');

const router = express.Router();

router.get('/bookings', requireAuth, requireRoles(ROLES.ADMIN), validate(listBookingsSchema), adminController.listBookings);

module.exports = { adminRouter: router };

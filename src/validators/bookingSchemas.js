const { z, objectId } = require('./common');

const joinSchema = z.object({
  body: z.object({ eventId: objectId }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const bookingIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: objectId }),
  query: z.object({}).optional()
});

const eventStatusSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ eventId: objectId }),
  query: z.object({}).optional()
});

module.exports = { joinSchema, bookingIdSchema, eventStatusSchema };

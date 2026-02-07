const { z, objectId } = require('./common');

const listBookingsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    eventId: objectId.optional(),
    page: z.string().optional(),
    limit: z.string().optional()
  })
});

module.exports = { listBookingsSchema };

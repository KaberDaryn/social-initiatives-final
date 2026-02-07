const { z, objectId } = require('./common');

const createUpdateSchema = z.object({
  body: z.object({
    eventId: objectId,
    title: z.string().min(3).max(120),
    content: z.string().min(5).max(4000)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const updateIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: objectId }),
  query: z.object({}).optional()
});

const listEventUpdatesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ eventId: objectId }),
  query: z.object({}).optional()
});

module.exports = { createUpdateSchema, updateIdSchema, listEventUpdatesSchema };

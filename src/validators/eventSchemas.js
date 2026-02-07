const { z, objectId } = require('./common');
const { EVENT_TYPES, EVENT_STATUS } = require('../constants/event');

const eventBody = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(4000),
  type: z.enum(Object.values(EVENT_TYPES)).optional(),
  status: z.enum(Object.values(EVENT_STATUS)).optional(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  location: z.string().min(2).max(200),
  capacity: z.coerce.number().int().min(1).max(5000)
});

const createEventSchema = z.object({
  body: eventBody,
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const updateEventSchema = z.object({
  body: eventBody.partial(),
  params: z.object({ id: objectId }),
  query: z.object({}).optional()
});

const listEventsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    q: z.string().optional(),
    type: z.enum(Object.values(EVENT_TYPES)).optional(),
    status: z.enum(Object.values(EVENT_STATUS)).optional(),
    page: z.string().optional(),
    limit: z.string().optional()
  })
});

const idParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: objectId }),
  query: z.object({}).optional()
});

const statusSchema = z.object({
  body: z.object({ status: z.enum(Object.values(EVENT_STATUS)) }),
  params: z.object({ id: objectId }),
  query: z.object({}).optional()
});

module.exports = {
  createEventSchema,
  updateEventSchema,
  listEventsSchema,
  idParamSchema,
  statusSchema
};

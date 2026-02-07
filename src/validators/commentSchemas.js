const { z, objectId } = require('./common');

const createCommentSchema = z.object({
  body: z.object({
    updateId: objectId,
    text: z.string().min(1).max(800)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const listUpdateCommentsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ updateId: objectId }),
  query: z.object({}).optional()
});

const commentIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: objectId }),
  query: z.object({}).optional()
});

module.exports = { createCommentSchema, listUpdateCommentsSchema, commentIdSchema };

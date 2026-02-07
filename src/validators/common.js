const { z } = require('zod');

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

const paginationQuery = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10')
});

module.exports = { z, objectId, paginationQuery };

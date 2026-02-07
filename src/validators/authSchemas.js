const { z } = require('./common');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email().max(120),
    password: z
      .string()
      .min(8)
      .max(72)
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email().max(120),
    password: z.string().min(1)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

module.exports = { registerSchema, loginSchema };

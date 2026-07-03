const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('A valid email is required.'),
  password: z.string().min(1, 'Password is required.'),
});

const createLeaveSchema = z.object({
  leaveType: z.enum(['Sick', 'Casual', 'Earned', 'Unpaid', 'Maternity', 'Paternity']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD'),
  reason: z.string().min(3, 'Reason must be at least 3 characters.'),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'endDate cannot be before startDate.',
  path: ['endDate'],
});

const updateLeaveSchema = z.object({
  leaveType: z.enum(['Sick', 'Casual', 'Earned', 'Unpaid', 'Maternity', 'Paternity']).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  reason: z.string().min(3).optional(),
});

const reviewLeaveSchema = z.object({
  comments: z.string().optional(),
});

module.exports = { loginSchema, createLeaveSchema, updateLeaveSchema, reviewLeaveSchema };

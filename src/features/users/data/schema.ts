import { z } from 'zod'

export const userSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  metadata: z.any().nullable(),
  deletedAt: z.string().nullable(),

  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  avatar: z.string().nullable(),
  bio: z.string().nullable(),

  status: z
    .union([
      z.literal('pending_verification'),
      z.literal('active'),
      z.literal('suspended'),
      z.literal('deleted'),
    ])
    .or(z.string()),
})

export const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
})

export const userListSchema = z.object({
  apiVersion: z.string(),
  kind: z.literal('USER'),
  data: z.array(userSchema),
  pagination: paginationSchema,
  metadata: z
    .object({
      correlationId: z.string().optional(),
      message: z.string().optional(),
    })
    .partial()
    .optional(),
})

// ---- TS types for convenience
export type User = z.infer<typeof userSchema>
export type UsersListResponse = z.infer<typeof userListSchema>
export type UsersPagination = z.infer<typeof paginationSchema>

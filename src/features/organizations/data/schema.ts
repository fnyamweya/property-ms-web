import { z } from 'zod'

export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  plan: z.string().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
})

export const userOrganizationsSchema = z.object({
  apiVersion: z.string(),
  kind: z.literal('USER'),
  data: z.array(organizationSchema),
  metadata: z
    .object({
      correlationId: z.string().optional(),
      message: z.string().optional(),
    })
    .partial()
    .optional(),
})

export type Organization = z.infer<typeof organizationSchema>
export type UserOrganizationsResponse = z.infer<typeof userOrganizationsSchema>

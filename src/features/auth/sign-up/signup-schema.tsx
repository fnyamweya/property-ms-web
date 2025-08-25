import { z } from 'zod'

export const signUpSchema = z
  .object({
    // Step 1
    fullName: z.string().min(2, 'Your name'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(7, 'At least 7 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),

    // Step 2 (Organization)
    orgName: z.string().min(2, 'Organization name'),
    typeId: z.string().uuid('Select a valid organization type'),

    domain: z.string().trim().toLowerCase().optional().or(z.literal('')),
    contactEmail: z.string().email('Enter a valid contact email'),
    receiveNotifications: z.boolean().optional(),
    preferredContactMethod: z.enum(['email', 'sms', 'none']).optional(),

    // optional free-form metadata as JSON string in the UI:
    metadataJson: z.string().optional(), // UI sends string; we’ll parse safely

    acceptTerms: z.literal(true, {
      message: 'You must accept the terms',
    }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: "Passwords don't match",
  })

export type SignUpValues = z.infer<typeof signUpSchema>

import { z } from 'zod'

export const PropertyTypeEnum = z.enum([
  'Residential',
  'Commercial',
  'MixedUse',
  'Land',
])

export const PropertyCreateSchema = z.object({
  // required
  name: z.string().min(2, 'Name is required'),
  propertyType: PropertyTypeEnum,
  unitsCount: z.number().int().min(0),
  isActive: z.boolean(),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City/Town is required'),
  addressLine1: z.string().min(1, 'Address is required'),

  // optional
  addressLine2: z.string().optional(),
  description: z.string().max(800).optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  ownerName: z.string().optional(),
  ownerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  ownerPhone: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  images: z.any().optional(),
})

export type PropertyCreateValues = z.infer<typeof PropertyCreateSchema>

/** RHF defaults MUST satisfy required fields to avoid "unknown" widening */
export const propertyCreateDefaults: PropertyCreateValues = {
  name: '',
  propertyType: 'Residential',
  unitsCount: 0,
  isActive: true,
  country: '',
  city: '',
  addressLine1: '',
  addressLine2: undefined,
  description: undefined,
  latitude: undefined,
  longitude: undefined,
  ownerName: undefined,
  ownerEmail: '',
  ownerPhone: undefined,
  amenities: [],
  images: undefined,
}

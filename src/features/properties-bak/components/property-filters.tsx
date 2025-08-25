/*
 * Filter definitions for the properties table. The arrays exported from
 * this module feed into the faceted filter component to allow the
 * user to filter the table by property type and active status. Keep
 * these in sync with the `Property` type defined in
 * `src/types/property.ts`.
 */

export const propertyTypeOptions = [
  { label: 'Residential', value: 'Residential' },
  { label: 'Commercial', value: 'Commercial' },
  { label: 'Mixed Use', value: 'MixedUse' },
  { label: 'Land', value: 'Land' },
]

export const statusOptions = [
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
]
/*
 * Filter option definitions for the locations table. These arrays are
 * consumed by the faceted filter component to display options for
 * counties and towns. Adjust the options to match the data returned
 * from your backend. If you make this dynamic, you could generate
 * these arrays by mapping over unique values from your locations data.
 */

export const countyOptions = [
  { label: 'Nairobi', value: 'Nairobi' },
  { label: 'Mombasa', value: 'Mombasa' },
  { label: 'Kiambu', value: 'Kiambu' },
  { label: 'Machakos', value: 'Machakos' },
]

export const townOptions = [
  { label: 'Nairobi', value: 'Nairobi' },
  { label: 'Mombasa', value: 'Mombasa' },
  { label: 'Ruiru', value: 'Ruiru' },
  { label: 'Mlolongo', value: 'Mlolongo' },
]
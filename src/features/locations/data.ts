/*
 * Sample dataset for locations. Until a real backend is available,
 * components import this array to render a list of locations. Each
 * location has a unique identifier and several fields describing its
 * geographical area. You can replace or extend this file with API
 * integration by fetching data in a store or hook (see
 * `src/store/locations.ts` for inspiration).
 */

import type { Location } from './components/types'

export const locations: Location[] = [
  {
    id: '1',
    localAreaName: 'Westlands',
    county: 'Nairobi',
    town: 'Nairobi',
    street: 'Parklands Rd',
    coverageDetails: 'Central business district outskirts',
    parent: null,
    centerPoint: { type: 'Point', coordinates: [ -1.2648, 36.8172 ] },
    createdAt: '2025-01-10T08:15:00Z',
    updatedAt: '2025-01-10T08:15:00Z',
  },
  {
    id: '2',
    localAreaName: 'Nyali',
    county: 'Mombasa',
    town: 'Mombasa',
    street: 'Links Rd',
    coverageDetails: 'Coastal tourist hub',
    parent: null,
    centerPoint: { type: 'Point', coordinates: [ -4.0435, 39.6696 ] },
    createdAt: '2025-02-18T14:20:00Z',
    updatedAt: '2025-02-18T14:20:00Z',
  },
  {
    id: '3',
    localAreaName: 'Karen',
    county: 'Nairobi',
    town: 'Nairobi',
    street: 'Langata Rd',
    coverageDetails: 'Leafy suburbs and mall',
    parent: null,
    centerPoint: { type: 'Point', coordinates: [ -1.3457, 36.7219 ] },
    createdAt: '2025-03-05T09:00:00Z',
    updatedAt: '2025-03-05T09:00:00Z',
  },
  {
    id: '4',
    localAreaName: 'Ruiru',
    county: 'Kiambu',
    town: 'Ruiru',
    street: 'Thika Rd',
    coverageDetails: 'Industrial and residential mix',
    parent: null,
    centerPoint: { type: 'Point', coordinates: [ -1.1459, 36.9560 ] },
    createdAt: '2025-04-12T12:45:00Z',
    updatedAt: '2025-04-12T12:45:00Z',
  },
  {
    id: '5',
    localAreaName: 'Syokimau',
    county: 'Machakos',
    town: 'Mlolongo',
    street: 'Mombasa Rd',
    coverageDetails: 'Fast–growing commuter suburb',
    parent: null,
    centerPoint: { type: 'Point', coordinates: [ -1.3596, 36.9820 ] },
    createdAt: '2025-05-20T11:30:00Z',
    updatedAt: '2025-05-20T11:30:00Z',
  },
]

export default locations
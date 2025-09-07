/*
 * API endpoint keys used throughout the application. Centralising these keys
 * makes it trivial to update an endpoint path in one place without hunting
 * through dozens of files. Keys are intentionally written in SNAKE_CASE to
 * clearly indicate their constant nature.
 */

export const ENDPOINTS = {
  LOGIN: 'login',
  REFRESH: 'refresh',
  ME: 'me',
  LOGOUT: 'logout',
  GET_USERS: 'getUsers',
  CREATE_USER: 'createUser',
  GET_USER_ORGANIZATIONS: 'getUserOrganizations',
  ADD_ORGANIZATION_MEMBER: 'addOrganizationMember',
  CREATE_ORGANIZATION: 'createOrganization',

  // Locations
  GET_LOCATIONS: 'getLocations',
  GET_LOCATION: 'getLocation',
  CREATE_LOCATION: 'createLocation',
  UPDATE_LOCATION: 'updateLocation',
  DELETE_LOCATION: 'deleteLocation',
  RESTORE_LOCATION: 'restoreLocation',
  GET_LOCATION_PARENTS: 'getLocationParents',
  GET_LOCATION_CHILDREN: 'getLocationChildren',

  // Properties
  GET_PROPERTIES: 'getProperties',
  GET_PROPERTY: 'getProperty',
  CREATE_PROPERTY: 'createProperty',
  UPDATE_PROPERTY: 'updateProperty',
  DELETE_PROPERTY: 'deleteProperty',
  RESTORE_PROPERTY: 'restoreProperty',

  // Property Units
  GET_PROPERTY_UNITS: 'getPropertyUnits',
  GET_PROPERTY_UNIT: 'getPropertyUnit',
  CREATE_PROPERTY_UNIT: 'createPropertyUnit',
  UPDATE_PROPERTY_UNIT: 'updatePropertyUnit',
  DELETE_PROPERTY_UNIT: 'deletePropertyUnit',
  RESTORE_PROPERTY_UNIT: 'restorePropertyUnit',
  GET_PROPERTY_UNIT_BY_NUMBER: 'getPropertyUnitByNumber',
  GET_UNIT_LEASES: 'getUnitLeases',
  GET_TENANT_LEASES: 'getTenantLeases',
  CREATE_TENANT: 'createTenant',
  CREATE_TENANT_WITH_USER: 'createTenantWithUser',

  // Org-scoped helper endpoints
  TENANTS_MY_ORGS: 'tenantsMyOrgs',
  REQUESTS_MY_ORGS: 'requestsMyOrgs',
  SEND_SMS: 'sendSms',

  // Lease mutations
  ADD_UNIT_LEASE: 'addUnitLease',
  UPDATE_LEASE: 'updateLease',
  GET_LEASE_BY_ID: 'getLeaseById',
  // Reports
  RENT_ROLL: 'rentRoll',
  ARREARS: 'arrears',
  LEASE_LEDGER: 'leaseLedger',
  RENT_ROLL_CSV: 'rentRollCsv',
  RENT_ROLL_TAX_CSV: 'rentRollTaxCsv',
  ARREARS_CSV: 'arrearsCsv',
  ARREARS_TAX_CSV: 'arrearsTaxCsv',
} as const

export type EndpointKey = keyof typeof ENDPOINTS

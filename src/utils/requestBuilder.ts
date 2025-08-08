/*
 * Helpers for building request payloads and query objects from form input.
 *
 * These functions encourage consistent naming conventions (e.g. camelCase)
 * across our API layer and decouple form components from the exact
 * structure expected by the backend. Should the API change its schema the
 * mapping logic can be updated here rather than scattered across
 * individual forms.
 */

/**
 * Convert a string to camelCase. This implementation is deliberately
 * lightweight and covers the most common cases (snake_case and kebab-case).
 * It lowercases the first character and capitalises subsequent characters
 * following underscores or hyphens.
 */
function camelCase(str: string): string {
  return str
    .replace(/[-_]+(.)?/g, (_, chr) => (chr ? chr.toUpperCase() : ''))
    .replace(/^([A-Z])/, (match) => match.toLowerCase())
}

/**
 * Create a type‑safe request body by converting form field keys to camelCase.
 * Fields with empty strings are omitted from the resulting object to avoid
 * sending meaningless values to the server.
 */
export function createFormRequest<TBody>(fields: Record<string, string>): TBody {
  const entries = Object.entries(fields)
    .filter(([, value]) => value !== '')
    .map(([key, value]) => [camelCase(key), value])
  return Object.fromEntries(entries) as TBody
}
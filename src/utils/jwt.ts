// Lightweight JWT helpers for client-side expiry checks

function base64UrlDecode(input: string): string {
  // Replace URL-safe chars and add padding if needed
  const replaced = input.replace(/-/g, "+").replace(/_/g, "/")
  const padLength = 4 - (replaced.length % 4 || 4)
  const padded = replaced + "=".repeat(padLength === 4 ? 0 : padLength)
  try {
    return atob(padded)
  } catch {
    return ""
  }
}

export function parseJwt<T = Record<string, unknown>>(token: string): T | undefined {
  try {
    const parts = token.split(".")
    if (parts.length < 2) return undefined
    const payload = base64UrlDecode(parts[1])
    return JSON.parse(payload) as T
  } catch {
    return undefined
  }
}

/**
 * Returns true if the JWT `exp` has passed (with optional skew).
 * If the token is malformed or missing `exp`, returns false.
 */
export function isJwtExpired(token: string, skewSeconds = 30): boolean {
  const payload = parseJwt<{ exp?: number }>(token)
  if (!payload?.exp) return false
  const now = Math.floor(Date.now() / 1000)
  return now >= (payload.exp - skewSeconds)
}


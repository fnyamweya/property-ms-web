/*
 * Utility functions for extracting human readable messages from errors.
 *
 * When interacting with HTTP APIs it's common to receive a variety of error
 * shapes – sometimes a simple string, other times a nested JSON object. The
 * `parseError` helper attempts to normalise these formats into a single
 * message string that can be displayed to end users or logged. You can
 * extend this function to support additional error structures returned by
 * your backend.
 */

import { ApiError } from '@/api/types'

/**
 * Extract a message from an unknown error type. Preference is given to
 * ApiError instances, then generic Error objects, then plain strings.
 */
export function parseError(err: unknown): string {
  if (!err) return 'An unknown error occurred.'
  // ApiError may contain a nested message or data payload.
  if (err instanceof ApiError) {
    if (typeof err.data === 'string') return err.data
    if (err.data && typeof (err.data as any).message === 'string') {
      return (err.data as any).message
    }
    return err.message || 'An unexpected API error occurred.'
  }
  // Standard Error instance.
  if (err instanceof Error) {
    return err.message
  }
  // Fallback to string coercion.
  return String(err)
}
import type { z } from 'zod';

/**
 * Cast utilities for safe type assertions.
 * This is the ONLY file allowed to use the 'unknown' keyword.
 */

/**
 * Safely cast an unknown value to a specific type.
 * This is the centralized location for all unknown type handling.
 */
export function cast<T, X = unknown>(value: X): T {
  return value as unknown as T;
}

/**
 * Safely cast an unknown error to an Error object.
 * This provides centralized error handling for catch blocks.
 */
export function castError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === 'string') {
    return new Error(error);
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return new Error(String(error.message));
  }
  return new Error('Unknown error occurred');
}

/**
 * Parse JSON string and validate with Zod schema.
 * This provides centralized JSON parsing with runtime validation.
 */
export function castJson<T extends z.ZodType<any, any, any>>(
  schema: T,
  json: string
): z.infer<T> {
  const parsed = JSON.parse(json);
  return schema.parse(parsed);
}

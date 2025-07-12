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
 * Parse JSON string and validate with Zod schema.
 * This provides centralized JSON parsing with runtime validation.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function castJson<T extends z.ZodType<any, any, any>>(
  schema: T,
  json: string
): z.infer<T> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsed = JSON.parse(json);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return schema.parse(parsed);
  } catch (error) {
    throw new Error(
      `Failed to parse JSON: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

# CREATIVE PHASE: CAST FUNCTION DESIGN

## Problem Statement

Design a simple, centralized approach for handling `unknown` types in the codebase. The `cast.ts` file will be the only location where the `unknown` keyword is allowed.

## Decision Summary

**Chosen Approach:** Simple Type Assertion Helper

### Design Overview

Create a minimal `src/utils/cast.ts` file that provides type-safe casting utilities:

```typescript
// src/utils/cast.ts - The ONLY file allowed to use 'unknown'

/**
 * Safely cast an unknown value to a specific type.
 * This is the centralized location for all unknown type handling.
 */
export function cast<T>(value: unknown): T {
  return value as T;
}

/**
 * Cast with runtime type checking (optional safety)
 */
export function safeCast<T>(
  value: unknown,
  validator: (value: unknown) => value is T
): T {
  if (!validator(value)) {
    throw new Error('Type validation failed during cast');
  }
  return value;
}

/**
 * Common type guards for use with safeCast
 */
export const guards = {
  isString: (value: unknown): value is string => typeof value === 'string',

  isNumber: (value: unknown): value is number =>
    typeof value === 'number' && !isNaN(value),

  isObject: (value: unknown): value is object =>
    value !== null && typeof value === 'object',

  isArray: (value: unknown): value is unknown[] => Array.isArray(value),
};
```

### Usage Examples

```typescript
// Instead of: const data = JSON.parse(json) as unknown as User;
import { cast } from '@/utils/cast';
const data = cast<User>(JSON.parse(json));

// With validation:
import { safeCast, guards } from '@/utils/cast';
const str = safeCast(value, guards.isString);
```

### ESLint Configuration

Add `unknown` restriction to the existing type/interface rules:

```json
{
  "rules": {
    "no-restricted-syntax": [
      "warn",
      {
        "selector": "TSUnknownKeyword",
        "message": "The 'unknown' type is forbidden here. Use cast utilities from '@/utils/cast' instead."
      },
      {
        "selector": "TSTypeAliasDeclaration",
        "message": "Type definitions must be in src/types/ folder"
      },
      {
        "selector": "TSInterfaceDeclaration",
        "message": "Interface definitions must be in src/interfaces/ folder"
      }
    ]
  },
  "overrides": [
    {
      "files": ["src/utils/cast.ts"],
      "rules": {
        "no-restricted-syntax": [
          "error",
          {
            "selector": "TSTypeAliasDeclaration",
            "message": "Type definitions must be in src/types/ folder"
          },
          {
            "selector": "TSInterfaceDeclaration",
            "message": "Interface definitions must be in src/interfaces/ folder"
          }
        ]
      }
    }
  ]
}
```

## Benefits

1. **Minimal API** - Simple cast function that's easy to understand
2. **Centralized Control** - All unknown handling in one place
3. **Optional Safety** - Can add validation when needed
4. **Easy Migration** - Simple find/replace for existing unknown usage
5. **Clear Intent** - Explicit casting makes code intentions clear

# CREATIVE PHASE: UNKNOWN HANDLER ARCHITECTURE

## Problem Statement

Design a comprehensive architecture for the UnknownHandler system that provides type-safe utilities for all unknown type operations while centralizing handling in a single location.

## Decision Summary

**Chosen Approach:** Flat Static Methods with Individual Exports

### Architecture Overview

Single class with static methods organized into logical sections:

- **Type Guards**: Primitive and complex type checking
- **Converters**: Safe type conversions
- **Validators**: Schema and key-based validation
- **Utilities**: Helper functions for common scenarios

### Key API Methods

#### Type Guards

- `isString(value: unknown): value is string`
- `isNumber(value: unknown): value is number`
- `isBoolean(value: unknown): value is boolean`
- `isObject(value: unknown): value is Record<string, unknown>`
- `isArray(value: unknown): value is unknown[]`
- `isNull(value: unknown): value is null`
- `isUndefined(value: unknown): value is undefined`
- `isNullish(value: unknown): value is null | undefined`

#### Converters

- `toError(value: unknown): Error`
- `toString(value: unknown, defaultValue?: string): string`
- `toNumber(value: unknown, defaultValue?: number): number`

#### Validators

- `cast<T>(value: unknown, keys: (keyof T)[], validator?): T`
- `validate<T>(value: unknown, schema: ZodSchema<T>): T`
- `validateSafe<T>(value: unknown, schema: ZodSchema<T>, defaultValue: T): T`
- `parseJson<T>(json: string, schema?: ZodSchema<T>): T`

#### Utilities

- `getProperty<T>(obj: unknown, path: string, defaultValue?: T): T | undefined`
- `toLoggerMeta(value: unknown): Record<string, string | number | boolean>`

## Design Principles

1. **Dual API**: Support both class methods and individual function imports
2. **Type Safety**: Full TypeScript type inference and narrowing
3. **Zero Overhead**: Type guards have no runtime cost
4. **Comprehensive**: Cover all common unknown type scenarios
5. **Gradual Migration**: Easy drop-in replacements

## Usage Examples

```typescript
// Type guard usage
if (isString(value)) {
  console.log(value.length); // value is typed as string
}

// Cast with validation
const user = cast<User>(data, ['id', 'name', 'email']);

// Error handling
try {
  // ...
} catch (e) {
  const error = toError(e);
  logger.error(error.message);
}

// Zod integration
const validData = validate(unknownData, UserSchema);
```

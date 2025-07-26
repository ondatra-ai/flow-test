# Mock Validation Guide

## Overview

The mock validation utilities provide type-safe mock argument validation without unsafe type assertions. This system replaces usage of `as any` and `as unknown` in test files with proper typing using the `MockArgument` type and the `cast` utility.

## Quick Start

```typescript
import { expectMockCall } from '../test-utils/mock-validation';
import { vi } from 'vitest';

const mockFn = vi.fn();
mockFn('test', { id: 1, name: 'example' });

// Instead of unsafe assertions like:
// expect(mockFn).toHaveBeenCalledWith('test', { id: 1, name: 'example' } as any);

// Use type-safe validation:
expectMockCall(mockFn).toHaveBeenCalledWith('test', { id: 1, name: 'example' });
```

## API Reference

### expectMockCall(mock, mockName?)

Main entry point for mock validation.

**Parameters:**

- `mock: Mock` - The Vitest mock to validate
- `mockName?: string` - Optional name for better error messages

**Returns:** `IMockCallExpectation` - Fluent API for validation

### IMockCallExpectation Methods

#### toHaveBeenCalledWith(...expectedArgs)

Expects the mock to have been called with exact arguments.

```typescript
expectMockCall(mockFn).toHaveBeenCalledWith('arg1', 'arg2', { key: 'value' });
```

#### toHaveBeenCalledWithMatch(pattern)

Expects the mock to have been called with arguments matching a pattern.

```typescript
// For object argument matching
expectMockCall(mockFn).toHaveBeenCalledWithMatch({
  name: 'test',
  id: 123,
});

// For indexed argument matching
expectMockCall(mockFn).toHaveBeenCalledWithMatch({
  '0': 'first-arg',
  '1': 'second-arg',
});
```

#### toHaveBeenCalledWithContaining(partial)

Expects the mock to have been called with arguments containing specified values.

```typescript
// Checks if any call contains these values
expectMockCall(mockFn).toHaveBeenCalledWithContaining({
  id: 123,
});
```

### Negated Assertions

Use `.not` for negated assertions:

```typescript
expectMockCall(mockFn).not.toHaveBeenCalledWith('wrong-arg');
expectMockCall(mockFn).not.toHaveBeenCalledWithMatch({ id: 999 });
expectMockCall(mockFn).not.toHaveBeenCalledWithContaining({ deleted: true });
```

## Migration Patterns

### Before (Unsafe)

```typescript
// Unsafe type assertions
const mockFn = vi.fn();
mockFn({ id: 1, name: 'test' });

expect(mockFn).toHaveBeenCalledWith({ id: 1, name: 'test' } as any);

// Unsafe argument extraction
const callArgs = mockFn.mock.calls[0][0] as any;
expect(callArgs.id).toBe(1);
```

### After (Type-Safe)

```typescript
// Type-safe validation
const mockFn = vi.fn();
mockFn({ id: 1, name: 'test' });

expectMockCall(mockFn).toHaveBeenCalledWith({ id: 1, name: 'test' });
expectMockCall(mockFn).toHaveBeenCalledWithContaining({ id: 1 });
```

## Advanced Usage

### Named Mocks

```typescript
import { namedMock } from '../test-utils/mock-validation';

const mockFn = namedMock(vi.fn(), 'MyServiceMock');
// Error messages will show "MyServiceMock" instead of "Unknown Mock"
```

### Asymmetric Matchers

The system supports Vitest asymmetric matchers:

```typescript
import { expect } from 'vitest';

expectMockCall(mockFn).toHaveBeenCalledWith(
  expect.stringMatching(/^test/),
  expect.objectContaining({ id: expect.any(Number) })
);
```

### Custom Error Messages

```typescript
// The MockValidationError provides detailed error information
try {
  expectMockCall(mockFn).toHaveBeenCalledWith('expected');
} catch (error) {
  if (error instanceof MockValidationError) {
    console.log(error.mockName); // Mock name
    console.log(error.expectedArgs); // Expected arguments
    console.log(error.actualCalls); // Actual calls made
    console.log(error.validationType); // Type of validation that failed
  }
}
```

## Benefits

1. **Type Safety**: Eliminates unsafe `as any` and `as unknown` assertions
2. **Better Error Messages**: Clear, detailed validation failure messages
3. **Consistent API**: Uniform validation approach across all tests
4. **IDE Support**: Full TypeScript intellisense and type checking
5. **Maintainability**: Centralized mock validation logic

## Best Practices

1. **Always use named mocks** for better error messages
2. **Prefer specific validation methods** over generic ones
3. **Use pattern matching** for complex object structures
4. **Use containment checks** for partial validation
5. **Group related assertions** for better test organization

## Integration with ESLint

To prevent unsafe type assertions, configure ESLint:

```json
{
  "rules": {
    "@typescript-eslint/consistent-type-assertions": [
      "error",
      {
        "assertionStyle": "never"
      }
    ]
  },
  "overrides": [
    {
      "files": ["tests/test-utils/**/*.ts"],
      "rules": {
        "@typescript-eslint/consistent-type-assertions": [
          "error",
          {
            "assertionStyle": "as",
            "objectLiteralTypeAssertions": "allow"
          }
        ]
      }
    }
  ]
}
```

This configuration:

- Forbids type assertions in all files
- Allows type assertions only in test utility files
- Prevents unsafe assertions in actual test files

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**: Ensure correct import paths
2. **Type assertion errors**: Replace `as any` with `expectMockCall`
3. **Pattern matching failures**: Check object structure and keys
4. **Asymmetric matcher issues**: Ensure proper Vitest matcher usage

### Debug Tips

1. Use `console.log(mockFn.mock.calls)` to inspect actual calls
2. Check error messages for detailed validation failure information
3. Use pattern matching for flexible object validation
4. Break complex validations into smaller, specific checks

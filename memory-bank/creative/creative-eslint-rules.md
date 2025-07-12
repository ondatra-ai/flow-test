# CREATIVE PHASE: ESLINT RULES DESIGN

## Problem Statement

Design ESLint rule configuration that enforces the new type system constraints:

- All type declarations must be in `src/types/` folder
- All interface declarations must be in `src/interfaces/` folder
- The `unknown` keyword can only be used in `src/utils/cast.ts`

## Decision Summary

**Chosen Approach:** Configuration Using no-restricted-syntax with Three Separate Rules

### Rule Architecture

#### Layer 1: Core Restrictions

Using `no-restricted-syntax` rule with AST selectors:

- `TSUnknownKeyword` - Forbids unknown type usage outside cast.ts
- `TSTypeAliasDeclaration` - Forbids type declarations outside src/types/
- `TSInterfaceDeclaration` - Forbids interface declarations outside src/interfaces/
- `ExportNamedDeclaration > TSTypeAliasDeclaration` - Handles exported types
- `ExportNamedDeclaration > TSInterfaceDeclaration` - Handles exported interfaces

#### Layer 2: Import Organization

- Enforce proper import order with types/interfaces last
- Group @/types, @/interfaces, and @/utils/cast imports together
- Require type imports where possible

#### Layer 3: File-Based Overrides

- Allow type declarations only in `src/types/**/*.ts`
- Allow interface declarations only in `src/interfaces/**/*.ts`
- Allow unknown keyword only in `src/utils/cast.ts`
- Migration support with warnings initially
- Relaxed rules for test files

### Key Configuration Elements

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
    ],
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        "prefer": "type-imports",
        "fixStyle": "separate-type-imports"
      }
    ]
  },
  "overrides": [
    {
      "files": ["src/types/**/*.ts"],
      "rules": {
        "no-restricted-syntax": [
          "error",
          {
            "selector": "TSInterfaceDeclaration",
            "message": "Interfaces should be in src/interfaces/, not src/types/"
          },
          {
            "selector": "TSUnknownKeyword",
            "message": "The 'unknown' type is forbidden here. Use cast utilities from '@/utils/cast' instead."
          }
        ]
      }
    },
    {
      "files": ["src/interfaces/**/*.ts"],
      "rules": {
        "no-restricted-syntax": [
          "error",
          {
            "selector": "TSTypeAliasDeclaration",
            "message": "Types should be in src/types/, not src/interfaces/"
          },
          {
            "selector": "TSUnknownKeyword",
            "message": "The 'unknown' type is forbidden here. Use cast utilities from '@/utils/cast' instead."
          }
        ]
      }
    },
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
    },
    {
      "files": ["tests/**/*.ts"],
      "rules": {
        "no-restricted-syntax": "off"
      }
    }
  ]
}
```

### Migration Strategy

1. **Phase 1**: Add rules as warnings to assess impact
2. **Phase 2**: Create cast.ts with utilities
3. **Phase 3**: Move all types to src/types/ folder
4. **Phase 4**: Move all interfaces to src/interfaces/ folder
5. **Phase 5**: Replace unknown usage with cast utilities
6. **Phase 6**: Switch rules from warn to error

### Error Messages

- Clear, actionable messages with specific guidance
- Different messages for types vs interfaces vs unknown
- Suggest appropriate location/utility for each
- Different severity for migration files (warn vs error)

### Special Considerations

- Test files can define local types, interfaces, and use unknown
- Migration files get warnings instead of errors
- Types, interfaces, and unknown usage are strictly controlled
- Import organization ensures clean imports
- Only cast.ts has permission to use unknown

## Benefits

1. **Clear Separation** - Types, interfaces, and unknown handling in distinct locations
2. **No Custom Plugin** - Uses built-in ESLint rules
3. **Clear Guidance** - Actionable error messages
4. **Flexible Migration** - Supports gradual adoption
5. **Standard Patterns** - Follows ESLint conventions
6. **Performance** - Efficient AST-based detection
7. **Type Safety** - Centralized unknown handling improves type safety

# CREATIVE PHASE: ESLINT RULES DESIGN

## Problem Statement

Design comprehensive ESLint rule configuration that enforces the new type system constraints: forbidding 'unknown' keyword outside designated files and requiring all type/interface declarations to be in src/types/ folder.

## Decision Summary

**Chosen Approach:** Layered Configuration Using no-restricted-syntax

### Rule Architecture

#### Layer 1: Core Restrictions

Using `no-restricted-syntax` rule with AST selectors:

- `TSUnknownKeyword` - Forbids unknown type usage
- `TSTypeAliasDeclaration` - Forbids type declarations
- `TSInterfaceDeclaration` - Forbids interface declarations
- `ExportNamedDeclaration > TS*` - Handles exported types/interfaces

#### Layer 2: Import Organization

- Enforce proper import order with types last
- Group @/types imports together
- Require type imports where possible

#### Layer 3: File-Based Overrides

- Allow all in `src/types/**/*.ts`
- Special rules for `unknown-handler.ts`
- Migration support with warnings
- Relaxed rules for test files

### Key Configuration Elements

```json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "TSUnknownKeyword",
        "message": "The 'unknown' type is forbidden here. Import type utilities from '@/types/unknown-handler' instead."
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
        "no-restricted-syntax": "off"
      }
    }
  ]
}
```

### Migration Strategy

1. **Phase 1**: Add rules as warnings to assess impact
2. **Phase 2**: Move all types to src/types/ folder
3. **Phase 3**: Replace unknown usage with UnknownHandler
4. **Phase 4**: Switch rules from warn to error

### Error Messages

- Clear, actionable messages with specific guidance
- Include import examples for unknown replacement
- Suggest appropriate location for types/interfaces
- Different severity for migration files (warn vs error)

### Special Considerations

- Test files can define local types
- Migration files get warnings instead of errors
- Unknown-handler.ts has all type restrictions disabled
- Import organization ensures clean type imports

## Benefits

1. **No Custom Plugin** - Uses built-in ESLint rules
2. **Clear Guidance** - Actionable error messages
3. **Flexible Migration** - Supports gradual adoption
4. **Standard Patterns** - Follows ESLint conventions
5. **Performance** - Efficient AST-based detection

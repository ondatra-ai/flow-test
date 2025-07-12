# CREATIVE PHASE: TYPE ORGANIZATION ARCHITECTURE

## Problem Statement

The codebase currently has types and interfaces scattered across 13 different files with no consistent organization. We need to design a comprehensive folder structure in `src/types/` that:

- Organizes 12 type definitions and 10 interface definitions logically
- Supports future growth without becoming unwieldy
- Maintains clear separation of concerns
- Enables easy discovery and import of types
- Prevents circular dependencies
- Supports backward compatibility during migration

## Decision Summary

**Chosen Approach:** Domain-Based Nested Structure

### Final Architecture

```
src/types/
├── index.ts                    # Barrel exports for all types
├── unknown-handler.ts          # Centralized unknown handling
├── unknown-handler.test.ts     # Tests for unknown handler
├── flow/                       # Flow-related types
│   ├── index.ts
│   ├── flow.types.ts
│   ├── step.types.ts
│   ├── context.types.ts
│   └── session.types.ts
├── providers/                  # Provider-related types
│   ├── index.ts
│   ├── provider.types.ts
│   └── llm.types.ts
├── github/                     # GitHub-related types
│   ├── index.ts
│   └── github.types.ts
├── config/                     # Configuration types
│   ├── index.ts
│   └── tokens.types.ts
├── validation/                 # Validation types
│   ├── index.ts
│   └── schemas.types.ts
└── utils/                      # Utility types
    ├── index.ts
    └── logger.types.ts
```

## Key Design Decisions

1. **Domain-based organization** for intuitive type discovery
2. **Shallow nesting** (max 2 levels) to avoid complexity
3. **Barrel exports** for clean import paths
4. **Consistent naming** with `.types.ts` suffix
5. **Special handling** for unknown-handler.ts as the only file allowed to use 'unknown'

## Migration Strategy

1. Config types first (least dependencies)
2. GitHub types (standalone)
3. Provider types
4. Flow types (most complex)
5. Validation types
6. Utility types

## Backward Compatibility

During migration, maintain re-exports in original locations:

```typescript
// In src/flow/flow.ts (temporary)
export type { Flow } from '../types/flow/index.js';
```

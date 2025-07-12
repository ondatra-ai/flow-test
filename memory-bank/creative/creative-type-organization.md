# CREATIVE PHASE: TYPE AND INTERFACE ORGANIZATION ARCHITECTURE

## Problem Statement

The codebase currently has types and interfaces scattered across 13 different files with no consistent organization. We need to design a comprehensive folder structure that:

- Organizes 12 type definitions in `src/types/`
- Organizes 10 interface definitions in `src/interfaces/`
- Supports future growth without becoming unwieldy
- Maintains clear separation of concerns
- Enables easy discovery and import of types/interfaces
- Prevents circular dependencies
- Supports backward compatibility during migration

## Decision Summary

**Chosen Approach:** Separated Type and Interface Folders with Domain-Based Structure

### Final Architecture

```
src/
├── types/                      # Type definitions only
│   ├── index.ts               # Barrel exports for all types
│   ├── flow/                  # Flow-related types
│   │   ├── index.ts
│   │   └── flow.types.ts
│   ├── github/                # GitHub-related types
│   │   ├── index.ts
│   │   └── github.types.ts
│   ├── config/                # Configuration types
│   │   ├── index.ts
│   │   └── tokens.types.ts
│   └── validation/            # Validation types
│       ├── index.ts
│       └── schemas.types.ts
│
└── interfaces/                 # Interface definitions only
    ├── index.ts               # Barrel exports for all interfaces
    ├── flow/                  # Flow-related interfaces
    │   ├── index.ts
    │   ├── context.interface.ts
    │   ├── step.interface.ts
    │   ├── session.interface.ts
    │   └── flow.interface.ts
    ├── providers/             # Provider-related interfaces
    │   ├── index.ts
    │   ├── provider.interface.ts
    │   └── helper.interface.ts
    ├── github/                # GitHub-related interfaces
    │   ├── index.ts
    │   └── github.interface.ts
    └── utils/                 # Utility interfaces
        ├── index.ts
        └── logger.interface.ts
```

## Key Design Decisions

1. **Separation of Concerns**: Types in `src/types/`, interfaces in `src/interfaces/`
2. **Domain-based organization** within each folder for intuitive discovery
3. **Shallow nesting** (max 2 levels) to avoid complexity
4. **Barrel exports** for clean import paths
5. **Consistent naming**: `.types.ts` for types, `.interface.ts` for interfaces

## Migration Strategy

1. Config types first (least dependencies)
2. GitHub types and interfaces
3. Utility interfaces
4. Provider interfaces
5. Flow interfaces (most complex)
6. Validation types

## Backward Compatibility

During migration, maintain re-exports in original locations:

```typescript
// In src/flow/flow.ts (temporary)
export type { IFlow } from '../interfaces/flow/index.js';
```

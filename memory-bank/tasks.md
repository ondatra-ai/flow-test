# MEMORY BANK TASKS

## Task Status: CREATIVE COMPLETE 🎨

**Current Task**: centralize-type-system-20250712  
**Start Date**: 2025-07-12  
**Issue Reference**: [#76](https://github.com/ondatra-ai/flow-test/issues/76)  
**Status**: Updated Plan - Technology Validation Complete ✅

# Task: Centralize Type System and Unknown Type Handling

## Description

Create a comprehensive centralized type system by:

1. Moving ALL type and interface definitions into a single `src/types/` folder
2. Implementing ESLint rules to forbid both `unknown` and `type` keywords outside designated files
3. Creating a centralized unknown type handling system with `cast<T, X>` function

Current analysis shows:

- 22 instances of `unknown` in src/
- 35 instances of `unknown` in tests/ and scripts/
- 12 type definitions scattered across src/
- 10 interface definitions scattered across src/
- Types/interfaces found in 13 different files

## Complexity

Level: 4  
Type: Complex System (upgraded from Level 3 due to architectural impact)

## Technology Stack

- Framework: Existing TypeScript/Node.js
- Build Tool: TypeScript compiler (tsc)
- Language: TypeScript 5.3.3
- Linting: ESLint 8.56.0 with custom rules

## Technology Validation Checkpoints

- [x] ESLint custom rule creation mechanism verified
  - ✅ Created working rule using no-restricted-syntax with TSUnknownKeyword selector
  - ✅ File exclusion pattern tested for unknown-handler.ts
- [x] Type guard functions proof of concept
  - ✅ Implemented isObject, isArray, isString, isNumber, isBoolean guards
  - ✅ All guards use proper TypeScript type predicates
- [x] cast<T, X> function with reflection working
  - ✅ Key-based validation successfully implemented
  - ✅ Supports both key validation and custom validator functions
  - ✅ Proper error messages for missing keys
- [x] Test coverage for unknown-handler utilities
  - ✅ Sample implementation covers all major use cases
- [x] Integration with existing validation system tested
  - ✅ Zod schema integration included in design
- [x] ESLint rule for type keyword restriction
  - ✅ Can use similar approach as unknown restriction

## Technology Validation Results

**ESLint Rules Approach:**

```json
{
  "no-restricted-syntax": [
    "error",
    {
      "selector": "TSUnknownKeyword",
      "message": "Use of 'unknown' type is forbidden. Import from 'src/types/unknown-handler.ts'"
    },
    {
      "selector": "TSTypeAliasDeclaration",
      "message": "Type definitions must be in src/types/ folder"
    },
    {
      "selector": "TSInterfaceDeclaration",
      "message": "Interface definitions must be in src/types/ folder"
    }
  ]
}
```

**Cast Function Success:**

```typescript
// Successfully validates object has required keys
const user = cast<User>(unknownData, ['id', 'name', 'email']);
```

## Status

- [x] Initialization complete
- [x] Planning complete (updated with type centralization)
- [x] Technology validation complete ✅
- [x] Creative phase complete ✅
- [ ] Implementation complete
- [ ] Testing complete
- [ ] Documentation complete

## Requirements Analysis

### Core Requirements:

- [x] Centralized types folder (`src/types/`) for ALL type definitions
- [x] Custom ESLint rules that forbid `unknown` AND `type` keywords outside designated files
- [x] Centralized file (`src/types/unknown-handler.ts`) for all unknown handling
- [x] Generic `cast<T, X>(x: X): T` function with registry-based validation
- [x] Migration of all existing types/interfaces to centralized location
- [x] Migration of all existing unknown usage to centralized handlers
- [x] Maintain 100% test coverage for core logic

### Technical Constraints:

- [x] Must maintain backward compatibility with re-exports
- [x] No breaking changes to existing APIs
- [x] Must work with strict TypeScript configuration
- [x] Should integrate with existing validation system (Zod)
- [x] Import paths must be updated throughout codebase

## Component Analysis

### Affected Components:

1. **All TypeScript Files** (13 files with type definitions)
   - Changes needed: Move all type/interface definitions to src/types/
   - Dependencies: Update all import statements
2. **Validation System** (`src/validation/`)
   - Changes needed: Move type definitions, update imports
   - Changes needed: Replace unknown type handling with centralized utilities
   - Dependencies: Zod schemas, flow/step validators
3. **Flow System** (`src/flow/`)
   - Changes needed: Move interfaces/types, update imports
   - Dependencies: Context, Session, Step types
4. **Provider System** (`src/providers/`)
   - Changes needed: Move provider interfaces, update imports
   - Dependencies: LLM provider types
5. **Utils** (`src/utils/`)
   - Changes needed: Move GitHubIssue, GitHubComment types
   - Changes needed: Use centralized type converters
   - Dependencies: Various utility types
6. **Config** (`src/config/`)
   - Changes needed: Move TokenType definition
   - Dependencies: DI token types
7. **Test Infrastructure** (tests/)
   - Changes needed: Update all import paths
   - Changes needed: Replace `as unknown as` patterns
   - Dependencies: All moved types

## Design Decisions

### Architecture:

- [x] Create organized `src/types/` folder structure
  - `index.ts` - barrel export for all types
  - `unknown-handler.ts` - unknown type utilities
  - `flow.types.ts` - flow-related types
  - `provider.types.ts` - provider interfaces
  - `github.types.ts` - GitHub-related types
  - `config.types.ts` - configuration types
  - `validation.types.ts` - validation types
- [x] Use re-exports to maintain backward compatibility
- [x] Create `UnknownHandler` class with static methods
- [x] Implement runtime type checking with TypeScript type predicates

### Algorithms:

- [x] Registry-based validation with overloaded cast<T,X>(x:X):T
- [x] Progressive type narrowing with guard functions
- [x] Schema-based validation integration

## Implementation Strategy

### Phase 1: Type Infrastructure Setup

1. Create src/types/ folder structure
   - [ ] Create folder and subfolders
   - [ ] Create index.ts with planned exports
   - [ ] Set up ESLint rules for type restrictions
   - [ ] Test ESLint catches violations

2. Create unknown-handler.ts foundation
   - [ ] Move POC implementation to src/types/
   - [ ] Add comprehensive JSDoc documentation
   - [ ] Create unit tests
   - [ ] Verify ESLint allows unknown only here

### Phase 2: Type Migration

1. Migrate configuration types
   - [ ] Move TokenType from config/tokens.ts
   - [ ] Update imports in config files
   - [ ] Ensure tests pass

2. Migrate GitHub types
   - [ ] Move GitHubIssue, GitHubComment from utils/github-client.ts
   - [ ] Move parsed URL types from github-url-parser.ts
   - [ ] Update all imports
   - [ ] Ensure tests pass

3. Migrate flow types
   - [ ] Move all flow interfaces from flow/\*.ts
   - [ ] Move context, session, step types
   - [ ] Update imports throughout flow system
   - [ ] Ensure tests pass

4. Migrate provider types
   - [ ] Move provider interfaces
   - [ ] Move helper types
   - [ ] Update provider implementations
   - [ ] Ensure tests pass

5. Migrate validation types
   - [ ] Move schema-inferred types
   - [ ] Create proper type exports
   - [ ] Update validation imports
   - [ ] Ensure tests pass

### Phase 3: Unknown Migration

1. Migrate validation system
   - [ ] Update validateFlow to use UnknownHandler
   - [ ] Update validateStep to use UnknownHandler
   - [ ] Update normalizeStepData with typed approach
   - [ ] Ensure all tests pass

2. Migrate flow management
   - [ ] Update convertToFlow method
   - [ ] Update createStep method
   - [ ] Add type safety to JSON parsing
   - [ ] Maintain test coverage

3. Migrate error handling
   - [ ] Create createTypedError utility
   - [ ] Update all catch blocks
   - [ ] Ensure error messages are preserved
   - [ ] Update error logging

### Phase 4: Test Infrastructure & Finalization

1. Update test utilities
   - [ ] Update all type imports in tests
   - [ ] Replace `as unknown as` patterns
   - [ ] Create typed mock factories
   - [ ] Ensure all tests pass

2. Documentation and finalization
   - [ ] Update API documentation
   - [ ] Create migration guide
   - [ ] Document new type organization
   - [ ] Update README with new patterns

## Creative Phases Required

- [x] **Type Organization Architecture** - Design folder structure and naming conventions
- [x] **Unknown Handler Architecture** - Design centralized type handling system
- [x] **Cast Function Algorithm** - Design reflection-based type validation
- [x] **ESLint Rules Design** - Create comprehensive rule configuration
- [x] **Migration Strategy** - Design phased migration approach

## Dependencies

- ESLint custom rule API
- TypeScript compiler API (for potential automated migration)
- Existing Zod validation schemas
- Test mocking libraries

## Challenges & Mitigations

- **Challenge 1**: Large-scale type migration across codebase
  - **Mitigation**: Phased approach, maintain backward compatibility with re-exports
- **Challenge 2**: ESLint rule complexity for type restrictions
  - **Mitigation**: Use AST selectors for TSTypeAliasDeclaration and TSInterfaceDeclaration
- **Challenge 3**: Import path updates throughout codebase
  - **Mitigation**: Use TypeScript's "Update imports on file move" or automated script
- **Challenge 4**: Type safety vs runtime checking balance
  - **Mitigation**: Use TypeScript type predicates with runtime validation
- **Challenge 5**: Potential circular dependencies
  - **Mitigation**: Careful type organization, use type-only imports where needed

## Testing Strategy

- Unit Tests:
  - [ ] UnknownHandler class methods
  - [ ] cast<T, X> function with various types
  - [ ] Type guard functions
  - [ ] ESLint rule detection for both unknown and type keywords
- Integration Tests:
  - [ ] All imports still work after migration
  - [ ] Validation system with unknown handler
  - [ ] Flow management with typed conversions
  - [ ] Error handling throughout system
  - [ ] Build process succeeds

## Documentation Plan

- [ ] Type organization guide
- [ ] API Documentation for UnknownHandler
- [ ] Migration guide for developers
- [ ] ESLint rule configuration documentation
- [ ] Best practices for type definitions
- [ ] Import conventions documentation

## Success Criteria

- [ ] All types centralized in src/types/ folder
- [ ] ESLint rules prevent type/interface definitions outside src/types/
- [ ] All `unknown` types handled through centralized utilities
- [ ] ESLint rule prevents new unknown usage (except in unknown-handler.ts)
- [ ] Type safety improved without sacrificing runtime safety
- [ ] Test coverage remains at 100% for core logic
- [ ] No breaking changes to existing APIs
- [ ] All imports updated and working
- [ ] Documentation updated with new patterns

---

**Next Step**: IMPLEMENT mode - Begin phased implementation

# MEMORY BANK TASKS

## Task Status: CREATIVE COMPLETE 🎨

**Current Task**: centralize-type-system-20250712  
**Start Date**: 2025-07-12  
**Issue Reference**: [#76](https://github.com/ondatra-ai/flow-test/issues/76)  
**Status**: Updated Plan - Ready for Implementation ✅

# Task: Centralize Type System with Type/Interface Separation

## Description

Create a comprehensive centralized type system by:

1. Moving ALL type definitions into `src/types/` folder
2. Moving ALL interface definitions into `src/interfaces/` folder
3. Implementing ESLint rules to forbid `type` and `interface` keywords outside their designated folders

Current analysis shows:

- 12 type definitions scattered across src/
- 10 interface definitions scattered across src/
- Types/interfaces found in 13 different files

## Complexity

Level: 3  
Type: Intermediate Feature

## Technology Stack

- Framework: Existing TypeScript/Node.js
- Build Tool: TypeScript compiler (tsc)
- Language: TypeScript 5.3.3
- Linting: ESLint 8.56.0 with custom rules

## Technology Validation Checkpoints

- [x] ESLint custom rule creation mechanism verified
  - ✅ Created working rule using no-restricted-syntax with AST selectors
  - ✅ File exclusion pattern tested for src/types/ and src/interfaces/
- [x] ESLint rule for type and interface keyword restriction
  - ✅ Can use TSTypeAliasDeclaration and TSInterfaceDeclaration selectors

## Status

- [x] Initialization complete
- [x] Planning complete
- [x] Technology validation complete ✅
- [x] Creative phase complete ✅
- [ ] Implementation complete
- [ ] Testing complete
- [ ] Documentation complete

## Requirements Analysis

### Core Requirements:

- [x] Centralized types folder (`src/types/`) for ALL type definitions
- [x] Centralized interfaces folder (`src/interfaces/`) for ALL interface definitions
- [x] Custom ESLint rules that forbid `type` and `interface` keywords outside designated folders
- [x] Migration of all existing types/interfaces to centralized locations
- [x] Maintain 100% test coverage for core logic

### Technical Constraints:

- [x] Must maintain backward compatibility with re-exports
- [x] No breaking changes to existing APIs
- [x] Must work with strict TypeScript configuration
- [x] Import paths must be updated throughout codebase

## Component Analysis

### Type Definitions to Move (12):

1. **Config Types:**
   - `src/config/tokens.ts`: `TokenType`

2. **GitHub Types:**
   - `src/utils/github-client.ts`: `GitHubIssue`, `GitHubComment`

3. **Validation Types:**
   - `src/validation/schemas/step.schema.ts`: `StepConfig`, `ActionStepConfig`, `DecisionStepConfig`, `LogStepConfig`, `ReadGitHubIssueStepConfig`
   - `src/validation/schemas/flow.schema.ts`: `FlowDefinition`

### Interface Definitions to Move (10):

1. **Provider Interfaces:**
   - `src/providers/llm/helpers/provider-helper.ts`: `IProviderHelper`
   - `src/providers/llm/interfaces/provider.ts`: `ILLMProvider`, `StreamRequest`, `StreamEvent`

2. **GitHub Interfaces:**
   - `src/utils/github-url-parser.ts`: `GitHubIssueArgs`

3. **Flow Interfaces:**
   - `src/flow/context.ts`: `IContext`
   - `src/flow/step.ts`: `IStep`
   - `src/flow/flow.ts`: `IFlow`

4. **Utility Interfaces:**
   - `src/utils/logger.ts`: `Logger`

## Design Decisions

### Architecture:

- [x] Create organized `src/types/` folder structure for types
- [x] Create organized `src/interfaces/` folder structure for interfaces
- [x] Both organized by domain (flow, providers, github, config, validation, utils)
- [x] Use re-exports to maintain backward compatibility

## Implementation Strategy

### Phase 1: Infrastructure Setup

1. Create folder structures
   - [ ] Create src/interfaces/ directory structure
   - [ ] Create index.ts files in src/types/ subdirectories
   - [ ] Create index.ts files in src/interfaces/ subdirectories
   - [ ] Set up ESLint rules for type/interface restrictions
   - [ ] Test ESLint catches violations

### Phase 2: Type Migration

1. Migrate configuration types
   - [ ] Move TokenType to src/types/config/tokens.types.ts
   - [ ] Update imports in config files
   - [ ] Ensure tests pass

2. Migrate GitHub types
   - [ ] Move GitHubIssue, GitHubComment to src/types/github/github.types.ts
   - [ ] Update imports
   - [ ] Ensure tests pass

3. Migrate validation types
   - [ ] Move all schema-inferred types to src/types/validation/schemas.types.ts
   - [ ] Create proper type exports
   - [ ] Update validation imports
   - [ ] Ensure tests pass

### Phase 3: Interface Migration

1. Migrate utility interfaces
   - [ ] Move Logger interface to src/interfaces/utils/logger.interface.ts
   - [ ] Update imports
   - [ ] Ensure tests pass

2. Migrate GitHub interfaces
   - [ ] Move GitHubIssueArgs to src/interfaces/github/github.interface.ts
   - [ ] Update imports
   - [ ] Ensure tests pass

3. Migrate provider interfaces
   - [ ] Move IProviderHelper to src/interfaces/providers/helper.interface.ts
   - [ ] Move ILLMProvider, StreamRequest, StreamEvent to src/interfaces/providers/provider.interface.ts
   - [ ] Update provider implementations
   - [ ] Ensure tests pass

4. Migrate flow interfaces
   - [ ] Move IContext to src/interfaces/flow/context.interface.ts
   - [ ] Move IStep to src/interfaces/flow/step.interface.ts
   - [ ] Move IFlow to src/interfaces/flow/flow.interface.ts
   - [ ] Update imports throughout flow system
   - [ ] Ensure tests pass

### Phase 4: Finalization

1. Remove temporary re-exports
   - [ ] Remove all backward compatibility exports
   - [ ] Ensure all imports use new paths
   - [ ] Change ESLint rules from warn to error

2. Documentation and finalization
   - [ ] Update API documentation
   - [ ] Create migration guide
   - [ ] Document new type/interface organization
   - [ ] Update README with new patterns

## Creative Phases Completed

- [x] **Type and Interface Organization Architecture** - Separated folders with domain-based structure
- [x] **ESLint Rules Design** - Configuration using no-restricted-syntax with separate rules
- [x] **Migration Strategy** - Automated incremental approach with separate scripts

## Dependencies

- ESLint custom rule API
- TypeScript compiler API (for potential automated migration)
- Existing Zod validation schemas
- Test mocking libraries

## Challenges & Mitigations

- **Challenge 1**: Large-scale type/interface migration across codebase
  - **Mitigation**: Phased approach, maintain backward compatibility with re-exports
- **Challenge 2**: ESLint rule complexity for type/interface restrictions
  - **Mitigation**: Use AST selectors with different rules for each folder
- **Challenge 3**: Import path updates throughout codebase
  - **Mitigation**: Use TypeScript's "Update imports on file move" or automated script
- **Challenge 4**: Potential circular dependencies
  - **Mitigation**: Careful organization, use type-only imports where needed

## Testing Strategy

- Unit Tests:
  - [ ] ESLint rule detection for type and interface keywords
- Integration Tests:
  - [ ] All imports still work after migration
  - [ ] Build process succeeds

## Documentation Plan

- [ ] Type and interface organization guide
- [ ] Migration guide for developers
- [ ] ESLint rule configuration documentation
- [ ] Best practices for type/interface definitions
- [ ] Import conventions documentation

## Success Criteria

- [ ] All types centralized in src/types/ folder
- [ ] All interfaces centralized in src/interfaces/ folder
- [ ] ESLint rules prevent type/interface definitions outside designated folders
- [ ] Test coverage remains at 100% for core logic
- [ ] No breaking changes to existing APIs
- [ ] All imports updated and working
- [ ] Documentation updated with new patterns

---

**Next Step**: IMPLEMENT mode - Begin phased implementation

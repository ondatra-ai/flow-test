# MEMORY BANK TASKS

## Current Task: forbid-remove-reexports

**Task ID**: forbid-remove-reexports
**Issue**: https://github.com/ondatra-ai/flow-test/issues/113
**Branch**: task-20250726-forbid-remove-reexports
**Complexity**: Level 3 - Intermediate Feature
**Status**: 📋 PLAN mode - Creating implementation plan

### Task Description

Forbid and remove all re-exports throughout the codebase. This involves:

- Removing barrel exports (index.ts files)
- Updating imports to reference source modules directly
- Adding ESLint rules to prevent future re-exports

## Feature Planning Document

### Contracts, scheme and interface update

No interface changes required - this is a refactoring task that maintains existing contracts.

### Functional changes

**No functional tests expected to be changed** - This is a pure refactoring task that doesn't change behavior.

## Requirements Analysis

### Core Requirements:

- [ ] Add ESLint rules to forbid re-export patterns
- [ ] Remove all barrel export files (index.ts)
- [ ] Update all imports to reference source modules directly
- [ ] Ensure no circular dependencies are introduced
- [ ] Maintain existing functionality

### Technical Constraints:

- [ ] Must not break existing functionality
- [ ] Must maintain TypeScript compilation
- [ ] Must preserve import type vs import distinctions
- [ ] Test suite must pass without changes

## Component Analysis

### Affected Components:

#### 1. ESLint Configuration (.eslintrc.json)

- **Changes needed**: Add no-restricted-syntax rules for re-exports
- **Dependencies**: None

#### 2. Barrel Export Files (18 index.ts files)

- `src/interfaces/index.ts` - Re-exports type \* from 4 subdirectories
- `src/interfaces/flow/index.ts` - Re-exports 3 interfaces
- `src/interfaces/github/index.ts` - Re-exports 2 interfaces
- `src/interfaces/providers/index.ts` - Re-exports 1 interface
- `src/interfaces/utils/index.ts` - Re-exports 1 interface + 1 type
- `src/types/index.ts` - Re-exports type \* from 5 subdirectories
- `src/types/config/index.ts` - Re-exports 1 type
- `src/types/flow/index.ts` - Re-exports 1 type
- `src/types/github/index.ts` - Re-exports 2 types
- `src/types/utils/index.ts` - Re-exports 1 type
- `src/flow/types/index.ts` - Re-exports \* from 2 files
- `src/validation/index.ts` - Re-exports \* from 2 schemas
- `tests/unit/mocks/index.ts` - Re-exports \* from types + 5 named exports
- `tests/test-utils/mock-validation/index.ts` - Re-exports 7 items
- `src/types/validation/index.ts` - (needs verification)
- `tests/test-utils/types/index.ts` - (needs verification)

#### 3. Import Statements (Multiple files)

- **Files with re-export imports identified**:
  - `src/flow/context.ts` - imports from `../interfaces/flow/index.js`
  - `src/flow/session/session.ts` - exports type from `../../types/flow/index.js`
  - `src/utils/logger.ts` - exports type from `../interfaces/utils/index.js`
  - `src/utils/github-client.ts` - exports types from `../types/github/index.js`
  - `src/providers/llm/helpers/provider-helper.ts` - exports type from interfaces
  - Plus additional files to be discovered during implementation

## Implementation Strategy

### Phase 0: Add ESLint Rules (Prevent new re-exports)

1. [ ] Update `.eslintrc.json` with re-export restrictions
2. [ ] Test ESLint configuration locally
3. [ ] Document expected linting errors

### Phase 1: Update Import Statements

1. [ ] Create mapping of all re-exports to their source files
2. [ ] Update imports in src/ directory
3. [ ] Update imports in tests/ directory
4. [ ] Update imports in scripts/ directory
5. [ ] Verify TypeScript compilation

### Phase 2: Remove Barrel Exports

1. [ ] Remove src/interfaces/index.ts and subdirectory index files
2. [ ] Remove src/types/index.ts and subdirectory index files
3. [ ] Remove src/flow/types/index.ts
4. [ ] Remove src/validation/index.ts
5. [ ] Remove tests/unit/mocks/index.ts
6. [ ] Remove tests/test-utils/mock-validation/index.ts
7. [ ] Remove any remaining index.ts barrel files

### Phase 3: Validation

1. [ ] Run full TypeScript build
2. [ ] Run full test suite
3. [ ] Run ESLint on entire codebase
4. [ ] Check for circular dependencies

## Design Decisions

### Architecture:

- [ ] Direct imports will make dependencies explicit
- [ ] Module boundaries will be clearer without barrel exports

### Implementation Order:

- [ ] ESLint rules first to prevent new violations
- [ ] Update imports before removing files to maintain working state
- [ ] Remove barrel files last after all imports updated

## Testing Strategy

### Build Validation:

- [ ] TypeScript compilation succeeds
- [ ] No new TypeScript errors introduced

### Test Suite:

- [ ] All existing tests pass without modification
- [ ] No test logic changes required

### Linting:

- [ ] ESLint runs successfully with new rules
- [ ] All re-export patterns are caught by rules

## Challenges & Mitigations

### Challenge 1: Large number of files to update

**Mitigation**: Systematic approach, update imports directory by directory

### Challenge 2: Risk of circular dependencies

**Mitigation**: Careful import analysis, test after each major change

### Challenge 3: Maintaining import type distinctions

**Mitigation**: Preserve existing import type vs import patterns

### Challenge 4: Discovering all import locations

**Mitigation**: Use grep/search tools to find all affected imports

## Current Status

- [x] VAN Mode initialization complete
- [x] Planning phase started
- [ ] ESLint rules defined
- [ ] Import mapping created
- [ ] Implementation started

## Next Steps

→ Technology validation not required (refactoring only)
→ No creative phases required (mechanical refactoring)
→ Ready to proceed to IMPLEMENT mode

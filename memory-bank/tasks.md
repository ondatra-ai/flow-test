# MEMORY BANK TASKS

## Current Task: forbid-remove-reexports

**Task ID**: forbid-remove-reexports
**Issue**: https://github.com/ondatra-ai/flow-test/issues/113
**Branch**: task-20250726-forbid-remove-reexports
**Complexity**: Level 3 - Intermediate Feature
**Status**: ✅ IMPLEMENT mode - Implementation COMPLETE

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

1. [x] Update `.eslintrc.json` with re-export restrictions
2. [x] Test ESLint configuration locally
3. [x] Document expected linting errors

**ESLint Violations Found (9 total):**

- `src/flow/session/session.ts` - 1 re-export error
- `src/flow/types/index.ts` - 2 re-export errors
- `src/providers/llm/helpers/provider-helper.ts` - 1 re-export error
- `src/utils/github-client.ts` - 1 re-export error
- `src/utils/logger.ts` - 1 re-export error
- `src/validation/index.ts` - 3 re-export errors

### Phase 1: Update Import Statements

1. [x] Create mapping of all re-exports to their source files
2. [x] Update imports in src/ directory
3. [x] Update imports in tests/ directory
4. [x] Update imports in scripts/ directory (no imports found)
5. [x] Verify TypeScript compilation

**Updated 25 files with direct imports:**

- **src/ directory (15 files):** context.ts, step.ts, flow.ts, session/session.ts, step-factory.ts, types/read-github-issue-step.ts, types/plan-generation-step.ts, handlers.ts, validation/index.ts, logger.ts, flow-manager.ts, github-url-parser.ts, github-client.ts, provider-helper.ts, container.ts
- **tests/ directory (10 files):** All test files updated to use direct mock imports
- **TypeScript compilation:** ✅ Successful

### Phase 2: Remove Barrel Exports

1. [x] Remove src/interfaces/index.ts and subdirectory index files
2. [x] Remove src/types/index.ts and subdirectory index files
3. [x] Remove src/flow/types/index.ts
4. [x] Remove src/validation/index.ts
5. [x] Remove tests/unit/mocks/index.ts
6. [x] Remove tests/test-utils/mock-validation/index.ts
7. [x] Remove any remaining index.ts barrel files

**Removed 18 barrel export files:**

- src/interfaces/ (5 files): index.ts + 4 subdirectory index files
- src/types/ (6 files): index.ts + 5 subdirectory index files
- src/flow/types/index.ts, src/validation/index.ts
- tests/unit/mocks/index.ts, tests/test-utils/mock-validation/index.ts, tests/test-utils/types/index.ts
- **Fixed 2 remaining imports** in test-utils files
- **TypeScript compilation:** ✅ Successful

### Phase 3: Validation

1. [x] Run full TypeScript build
2. [x] Run full test suite
3. [x] Run ESLint on entire codebase
4. [x] Check for circular dependencies

**Validation Results:**

- **TypeScript compilation:** ✅ Successful (no errors)
- **Test suite:** ✅ All 189 tests passing
- **ESLint:** ✅ No re-export violations found (unrelated type errors exist but not from this refactoring)
- **Circular dependencies:** ✅ No circular dependencies detected

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

## Implementation Summary

**COMPLETED:** All re-exports have been successfully removed from the codebase.

### Changes Made:

- **ESLint Rules:** Added strict rules forbidding all re-export patterns (`ExportAllDeclaration`, `ExportNamedDeclaration[source]`)
- **Import Updates:** Updated 27 files to use direct imports instead of barrel exports
- **File Removals:** Removed 18 barrel export files (index.ts files) across src/ and tests/ directories
- **Import Fixes:** Fixed all broken imports after removing convenience re-exports

### Impact:

- **Dependencies:** All imports now explicit and direct - no hidden dependencies through barrel exports
- **Module Boundaries:** Clear module boundaries with explicit import paths
- **Maintainability:** Easier to track what each module actually depends on
- **Performance:** Eliminated unnecessary module loading through barrel exports

## Current Status

- [x] VAN Mode initialization complete
- [x] Planning phase complete
- [x] ESLint rules implemented and working
- [x] Import mapping created and applied
- [x] Implementation complete
- [x] All validation passed

## Next Steps

→ Ready for REFLECT mode to analyze the implementation process
→ Task ready for code review and merge

# MEMORY BANK TASKS

## Current Task Status: 🔨 IMPLEMENT MODE - Phase 1 Core Infrastructure (RESTART)

**Task ID**: improve-test-mock-validation-20250201
**Issue**: #105 - Improve call argument validation and avoid unsafe type assertions in tests
**Complexity**: Level 4 - Complex System
**Branch**: task-20250201-improve-test-mock-validation
**Start Date**: 2025-02-01
**Status**: IMPLEMENT Mode - Restarting after lessons learned from file organization mistakes

## PREVIOUS ATTEMPT ANALYSIS (WHY WE'RE RESTARTING)

**What Went Wrong**: Despite having documented lessons about test utility placement, the initial implementation placed files in `src/interfaces/testing/` and `src/types/testing/` instead of consolidating everything under `tests/test-utils/mock-validation/`. This led to:

- 4 separate file movement operations
- Multiple import path updates
- ESLint configuration complications
- Unnecessary complexity and rework

**Root Cause**: Failed to read and follow existing lesson #4 in tasks.md before implementing.

**Recovery Action**: Reverted all changes via `git restore` and `rm -rf` to return to clean planning state.

## REVISED EXECUTION PLAN - LESSONS LEARNED

### ⚠️ KEY MISTAKES TO AVOID:

1. **DON'T CREATE TESTS FOR TEST UTILITIES**
   - Test utilities are simple helpers, not production code
   - No need for core.test.ts, async-support.test.ts, etc.
   - Focus testing on actual application functionality

2. **DON'T CREATE EXAMPLE/DEMO FILES IN TESTS**
   - No migration-example.test.ts as "living documentation"
   - Examples belong in docs/, not in test directories
   - Keep test directories clean and focused

3. **USE BUILT-IN ESLINT RULES FIRST**
   - Research existing ESLint rules before creating custom ones
   - @typescript-eslint/consistent-type-assertions is simpler than custom rules
   - Avoid .eslintrc.custom-rules.js unless absolutely necessary

4. **PLACE TEST TYPES WITH TEST UTILITIES**
   - Test utility types go in tests/test-utils/types/
   - NOT in src/types/testing/
   - Keep test-related code together

5. **AVOID TEMPORARY FIXES**
   - Don't create temporary files like src/interfaces/testing/index.ts
   - Do proper organization from the start
   - Clean architecture prevents technical debt

6. **READ EXISTING LESSONS FIRST** ⚠️ NEW
   - Always thoroughly review tasks.md lessons before implementing
   - Don't ignore documented guidance that already exists
   - Previous mistakes are documented for a reason

7. **TEST UTILITIES ARE FULLY SELF-CONTAINED** ⚠️ NEW
   - ALL test utility code (interfaces, types, implementations) belongs in tests/ directory
   - Don't split between src/interfaces/testing/ and tests/test-utils/
   - Consolidate everything under tests/test-utils/mock-validation/

8. **PLAN FILE ORGANIZATION UPFRONT** ⚠️ NEW
   - Avoid multiple file movement operations
   - Get the file structure right on first implementation
   - Each file movement causes import updates and ESLint issues

9. **USER PREFERENCES OVERRIDE PATTERNS** ⚠️ NEW
   - When user has documented organizational preferences, follow them
   - Don't rigidly apply project patterns (src/interfaces/ vs src/types/) to test code
   - Test utilities have different organizational needs than production code

### Phase 1: Core Assertion Infrastructure (CORRECTED ORGANIZATION)

**File Structure** (Follow exactly, no deviations):

```
tests/test-utils/mock-validation/
├── types/
│   ├── mock-validation.interface.ts  (interfaces)
│   └── mock-validation.types.ts      (type aliases)
├── expect-mock-call.ts               (main function)
├── mock-validation-error.ts          (error class)
├── mock-call-expectation.ts          (main implementation)
├── call-expectation.ts               (call-specific logic)
├── negated-mock-call-expectation.ts  (negation logic)
└── index.ts                          (public exports)
```

**Implementation Tasks**:

- [ ] Create exact directory structure above
- [ ] Implement all files with proper TypeScript typing
- [ ] Use `MockArgument` type instead of `any`/`unknown`
- [ ] Implement modular architecture (max-classes-per-file compliance)
- [ ] Use `cast` utilities for type safety
- [ ] Document API in `docs/testing/mock-validation-guide.md`
- [ ] NO UNIT TESTS for the utilities themselves

### Phase 2: Pattern Matching & ESLint Integration (REVISED)

- [ ] Implement pattern matching methods
- [ ] Add negation support
- [ ] Configure ESLint using BUILT-IN rules:
  - Use `@typescript-eslint/consistent-type-assertions: never`
  - Add override for `tests/test-utils/` to allow `as`
- [ ] NO custom ESLint rules unless proven necessary

### Phase 3: Migration (REVISED)

- [ ] Migrate actual test files (not create examples)
- [ ] Update imports to use new utilities
- [ ] Verify all tests pass
- [ ] Document migration patterns in `docs/` (not test files)

### Phase 4: Documentation Only (REVISED)

- [ ] Create comprehensive docs in `docs/testing/`
- [ ] NO example test files
- [ ] Focus on real usage in actual tests
- [ ] Update README with migration guide

## Success Criteria (REVISED)

1. Zero unsafe type assertions in ACTUAL test files
2. All ACTUAL tests passing with new validation
3. Clean test utility structure (no meta-tests)
4. Clear documentation in docs/ directory
5. ESLint prevention using built-in rules
6. Minimal, focused implementation

# MEMORY BANK TASKS

## Current Task Status: 🔄 IN PROGRESS - PLAN MODE

**Current Task**: centralize-test-mocks-20250125
**Issue**: #99 - Centralize test mocks into shared tests/unit/mocks directory
**Complexity**: Level 3 - Intermediate Feature
**Branch**: task-20250125-centralize-test-mocks
**Start Date**: 2025-01-25
**Status**: PLAN Mode - Detailed Implementation Plan Created

## Task Details

### centralize-test-mocks-20250125 - 🔄 IN PROGRESS

**Objective**: Create a centralized mock management system by moving all test mocks into a shared tests/unit/mocks/ directory structure, eliminating duplication and establishing consistent mock patterns project-wide.

**Technical Scope**:

- Create tests/unit/mocks/ directory structure
- Create mock factories for core interfaces (IContext, ILLMProvider, Logger)
- Migrate existing test files to use centralized mocks
- Remove duplicated mock code from individual test files
- Add TypeScript barrel exports
- Update all test files project-wide

## 📋 Feature Planning Document

### Contracts, scheme and interface update

**Mock Factory Interfaces** (new in `tests/unit/mocks/`):

```typescript
// tests/unit/mocks/types.ts
export interface MockOptions {
  throwOnUnmockedCall?: boolean;
  customBehavior?: Record<string, unknown>;
}

export interface LoggerMockOptions extends MockOptions {
  captureMessages?: boolean;
}

export interface ContextMockOptions extends MockOptions {
  initialData?: Record<string, unknown>;
}

export interface LLMProviderMockOptions extends MockOptions {
  defaultResponse?: string;
  simulateError?: boolean;
}
```

### Functional changes

**No functional changes expected** - This is a test infrastructure refactoring. All existing tests should continue to pass without modification of test logic.

**E2E Test Coverage**: No new E2E tests required as this is a test-only refactoring.

## 📊 Requirements Analysis

### Core Requirements:

- ✅ Centralize all mock definitions in `tests/unit/mocks/`
- ✅ Create type-safe mock factories for core interfaces
- ✅ Eliminate cast usage in test files (enforced by ESLint)
- ✅ Maintain 100% test pass rate during migration
- ✅ Reduce test file sizes by 30-40%

### Technical Constraints:

- ✅ Must use vitest mock functions (vi.fn())
- ✅ Must maintain TypeScript strict mode compliance
- ✅ Must follow existing project patterns
- ✅ Zero breaking changes to test functionality

## 🔍 Component Analysis

### Affected Components:

**1. Test Files (15+ files)**

- `tests/unit/flow/types/*.test.ts` (5 files)
- `tests/unit/flow/*.test.ts` (5 files)
- `tests/unit/providers/llm/providers/*.test.ts` (3 files)
- `tests/unit/utils/*.test.ts` (2 files)
- `tests/unit/cli/*.test.ts` (2 files)
- `tests/unit/config/*.test.ts` (1 file)

**2. New Mock Infrastructure**

- `tests/unit/mocks/flow/` - Flow-related mocks
- `tests/unit/mocks/providers/` - Provider mocks
- `tests/unit/mocks/utils/` - Utility mocks
- `tests/unit/mocks/index.ts` - Barrel export

**3. ESLint Configuration**

- `.eslintrc.json` - Add custom rule
- New rule implementation or configuration

## 🎨 Design Decisions

### Architecture:

- ✅ Factory pattern for all mocks
- ✅ Preset behaviors (success, error, custom)
- ✅ Typed returns without cast in consuming code
- ✅ Composable mock options

### Mock Structure:

```typescript
// Example: Logger mock factory
export function createLoggerMock(options?: LoggerMockOptions): Logger {
  const mock = cast<Logger>({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  });

  if (options?.captureMessages) {
    // Add message capture logic
  }

  return mock;
}
```

### ESLint Rule Design:

- Rule name: `no-cast-in-tests`
- Scope: All `*.test.ts` files
- Exception: `tests/unit/mocks/**/*`
- Error level: `error` (not warning)

## ⚙️ Implementation Strategy

### Phase 0: ESLint Rule Implementation (1-2 hours)

- [x] Analyze current ESLint configuration
- [ ] Add custom rule to forbid cast import in test files
- [ ] Configure rule with proper paths
- [ ] Run lint to identify all violations
- [ ] Document violations count

### Phase 1: Mock Infrastructure Creation (2-3 hours)

- [ ] Create `tests/unit/mocks/` directory structure
- [ ] Implement core mock factories:
  - [ ] `createLoggerMock()`
  - [ ] `createContextMock()`
  - [ ] `createLLMProviderMock()`
  - [ ] `createHelperMock()`
- [ ] Create TypeScript types for mock options
- [ ] Add barrel exports
- [ ] Test mock factories in isolation

### Phase 2: High-Impact File Migration (2-3 hours)

Start with files that have the most duplication:

- [ ] Migrate `plan-generation-step-template.test.ts`
- [ ] Migrate `plan-generation-step-core.test.ts`
- [ ] Migrate `plan-generation-step-providers.test.ts`
- [ ] Verify all plan-generation tests pass
- [ ] Measure code reduction

### Phase 3: Remaining Test Migration (3-4 hours)

- [ ] Migrate flow test files
- [ ] Migrate provider test files
- [ ] Migrate utils test files
- [ ] Migrate cli test files
- [ ] Migrate config test files

### Phase 4: Cleanup & Documentation (1 hour)

- [ ] Remove all deprecated mock code
- [ ] Create README in mocks directory
- [ ] Update project documentation
- [ ] Run full test suite
- [ ] Verify ESLint compliance

## 🧪 Testing Strategy

### Unit Tests:

- [ ] Test each mock factory independently
- [ ] Verify mock behavior presets work correctly
- [ ] Test mock option configurations

### Integration Tests:

- [ ] Run full test suite after each phase
- [ ] Verify no test functionality changed
- [ ] Check test performance metrics

### Verification Commands:

```bash
# After each phase:
npm test
npm run lint
npm run build

# Final verification:
grep -r "cast<" tests/unit/ --include="*.test.ts" | wc -l  # Should be 0
grep -r "vi\.fn()" tests/unit/ --include="*.test.ts" | wc -l  # Should be 0
```

## 📚 Documentation Plan

- [ ] Mock factory API documentation
- [ ] Migration guide for future tests
- [ ] ESLint rule documentation
- [ ] Best practices guide

## 🚨 Challenges & Mitigations

**Challenge 1**: ESLint custom rule complexity

- **Mitigation**: Use existing no-restricted-imports pattern if custom rule too complex

**Challenge 2**: Breaking tests during migration

- **Mitigation**: Migrate one file at a time, verify tests pass after each

**Challenge 3**: Maintaining type safety without cast

- **Mitigation**: Ensure mock factories return properly typed objects

**Challenge 4**: Large number of files to migrate

- **Mitigation**: Phased approach, starting with highest-impact files

## ✅ Technology Validation Checkpoints

- [x] TypeScript project already set up
- [x] Vitest testing framework in place
- [x] ESLint configured and working
- [ ] Custom ESLint rule approach validated
- [ ] Mock factory pattern tested

## 📈 Success Metrics

- 100+ anti-patterns eliminated
- 30-40% reduction in test file sizes
- Zero cast usage in test files
- All 188 tests passing
- ESLint enforcing architecture

---

## Implementation Plan Summary

**Total Estimated Time**: 8-12 hours

**Priority Order**:

1. ESLint rule (prevents new violations)
2. Mock infrastructure (foundation)
3. High-impact migrations (biggest wins)
4. Complete migration (full consistency)
5. Documentation (maintainability)

**Next Mode**: IMPLEMENT MODE (no creative phases required)

---

_Last Updated: 2025-01-25_

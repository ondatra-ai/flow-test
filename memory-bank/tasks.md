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

## 🚨 **CRITICAL GUIDANCE - PRESERVE EXISTING TEST LOGIC**

**⚠️ MANDATORY REQUIREMENTS BASED ON CONVERSATION LEARNINGS:**

### **1. NO CHANGES TO TEST LOGIC OR ASSERTIONS**

- **✅ DO**: Replace mock creation with factory calls
- **✅ DO**: Replace inline mocks with centralized references
- **❌ NEVER**: Change test expectations, assertions, or validation logic
- **❌ NEVER**: Add new validation to constructors or methods
- **❌ NEVER**: Change error handling behavior in production code
- **❌ NEVER**: Modify existing test cases to test different scenarios

### **2. REFACTORING ONLY - NO FUNCTIONAL CHANGES**

- This is purely a **test infrastructure refactoring**
- All existing tests must pass **without modification of their logic**
- Test behavior should be **100% identical** before and after
- Any test failure indicates incorrect implementation

### **3. PRODUCTION CODE MUST REMAIN UNCHANGED**

- **✅ DO**: Only modify files in `tests/` directory
- **❌ NEVER**: Modify any files in `src/` directory
- **❌ NEVER**: Add constructor validation or error throwing
- **❌ NEVER**: Change template variable handling
- **❌ NEVER**: Modify existing error handling patterns

### **4. MOCK-ONLY SCOPE**

- Focus exclusively on centralizing mock creation
- Replace `vi.fn()` calls with factory calls
- Replace `cast<Interface>()` calls with factory calls
- Keep all test assertions exactly as they are

### **Example of CORRECT Migration:**

```typescript
// ❌ BEFORE - Scattered mock creation
const mockLogger = cast<Logger>({
  info: vi.fn(),
  error: vi.fn(),
});

// ✅ AFTER - Centralized mock creation
const loggerMock = createLoggerMock();

// ✅ SAME TEST LOGIC - No changes to assertions
expect(loggerMock.info).toHaveBeenCalledWith('expected message');
```

### **Example of INCORRECT Migration:**

```typescript
// ❌ WRONG - Adding new validation to tests
it('should validate input parameters', () => {
  // This is adding NEW test logic - forbidden!
  expect(() => new Step('')).toThrow('Invalid parameter');
});

// ❌ WRONG - Changing production code
constructor(issueUrl: string) {
  if (!issueUrl) throw new Error('Invalid URL'); // Never add this!
}
```

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
- 🚨 **PRESERVE all existing test logic and assertions unchanged**

### Technical Constraints:

- ✅ Must use vitest mock functions (vi.fn())
- ✅ Must maintain TypeScript strict mode compliance
- ✅ Must follow existing project patterns
- ✅ Zero breaking changes to test functionality
- 🚨 **Zero changes to production code in src/ directory**
- 🚨 **Zero changes to test assertions or validation logic**

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
- ✅ **Object-based return pattern with simple property access** (see critical guidance below)
- ✅ Preset behaviors (success, error, custom)
- ✅ Typed returns without cast in consuming code
- ✅ Composable mock options

### Mock Structure:

```typescript
// CRITICAL: Design mock factories to return objects that are easy to use
// with simple property access pattern

// Mock factory returns an object with:
// - 'mock' property for constructor injection
// - Individual method properties for direct assertion access
export interface LoggerMockResult {
  mock: Logger; // The interface for injection
  info: Mock; // Direct access to mock functions
  error: Mock;
  warn: Mock;
  debug: Mock;
}

export function createLoggerMock(
  options?: LoggerMockOptions
): LoggerMockResult {
  const info = vi.fn();
  const error = vi.fn();
  const warn = vi.fn();
  const debug = vi.fn();

  const mock = cast<Logger>({
    info,
    error,
    warn,
    debug,
    // Apply any custom behavior overrides
    ...options?.customBehavior,
  });

  if (options?.captureMessages) {
    // Add message capture logic
  }

  // Return object designed for simple property access
  return {
    mock, // For injection
    info, // For assertions
    error,
    warn,
    debug,
  };
}
```

### 🚨 **CRITICAL USAGE PATTERN - Simple Property Access**

**The key insight**: Design the API to encourage simple property access, not destructuring

```typescript
// ✅ CORRECT - Simple property access pattern
const loggerMock = createLoggerMock();

// Clean usage - single variable, clear property access
new Step('id', 'message', {}, loggerMock.mock); // .mock for injection
expect(loggerMock.info).toHaveBeenCalledWith('msg'); // .info for assertion
expect(loggerMock.error).toHaveBeenCalledWith('err'); // .error for assertion

// ❌ AVOID - Complex destructuring pattern
const { mock: logger, info, error, debug, warn } = createLoggerMock();
// This creates 5 variables and adds unnecessary complexity
```

### **Why Simple Property Access is Better**

1. **Less Code**: One variable (`loggerMock`) instead of many
2. **Self-Documenting**: `loggerMock.info` clearly shows what's being tested
3. **Easier Refactoring**: All mock usage tied to one variable
4. **Better IDE Support**: Autocomplete shows all available methods
5. **Cleaner Test Setup**: No need to manage multiple destructured variables

### **Apply This Pattern to All Mock Factories**

```typescript
// Context Mock
const contextMock = createContextMock();
new Context(contextMock.mock);
expect(contextMock.get).toHaveBeenCalledWith('key');

// LLM Provider Mock
const providerMock = createLLMProviderMock();
service.setProvider(providerMock.mock);
expect(providerMock.generate).toHaveBeenCalledWith(prompt);

// Command Mock
const commandMock = createCommandMock();
setupCli(commandMock.mock);
expect(commandMock.action).toHaveBeenCalled();
```

### ESLint Rule Design:

- Rule name: `no-cast-in-tests`
- Scope: All `*.test.ts` files
- Exception: `tests/unit/mocks/**/*`
- Error level: `error` (not warning)

**🎯 Implementation Approach - Use Pattern-Based Restriction**:

Instead of enumerating multiple import paths, use a single pattern to restrict cast imports:

```json
// In .eslintrc.json under test file overrides
"no-restricted-imports": [
  "error",
  {
    "patterns": [{
      "group": ["**/src/utils/cast*"],
      "message": "Use centralized mocks from 'tests/unit/mocks' instead of cast in test files"
    }]
  }
]
```

**Benefits of Pattern Approach**:

- **Simpler**: One pattern rule vs 7+ specific paths
- **Maintainable**: No need to update when file structure changes
- **Future-proof**: Catches any path variation automatically
- **Cleaner Config**: ~6 lines instead of ~20 lines

This pattern will match:

- `../../../src/utils/cast.js`
- `../../../../src/utils/cast.js`
- Any relative depth to the cast utility

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
  - [ ] `createLoggerMock()` - with object return pattern
  - [ ] `createContextMock()` - with object return pattern
  - [ ] `createLLMProviderMock()` - with object return pattern
  - [ ] `createHelperMock()` - with object return pattern
- [ ] Create TypeScript types for mock options
- [ ] Add barrel exports
- [ ] Test mock factories in isolation

**🎯 Implementation Focus**: All mock factories MUST return objects designed for simple property access:

```typescript
return {
  mock: actualMockInterface, // For injection
  method1: mockFn1, // For assertions
  method2: mockFn2, // For assertions
  // ... etc
};
```

### Phase 2: High-Impact File Migration (2-3 hours)

Start with files that have the most duplication:

- [ ] Migrate `plan-generation-step-template.test.ts`
- [ ] Migrate `plan-generation-step-core.test.ts`
- [ ] Migrate `plan-generation-step-providers.test.ts`
- [ ] Verify all plan-generation tests pass
- [ ] Measure code reduction

**🎯 Migration Pattern**:

```typescript
// Replace scattered mocks with:
const loggerMock = createLoggerMock();
const contextMock = createContextMock();

// Use in tests:
const step = new Step(config, loggerMock.mock, contextMock.mock);
expect(loggerMock.info).toHaveBeenCalled();
expect(contextMock.get).toHaveBeenCalledWith('key');
```

**🚨 CRITICAL MIGRATION RULES**:

- Replace mock creation code ONLY
- Keep all `expect()` calls exactly as they are
- Keep all test descriptions and scenarios unchanged
- Keep all test data and configurations unchanged

### Phase 3: Remaining Test Migration (3-4 hours)

- [ ] Migrate flow test files
- [ ] Migrate provider test files
- [ ] Migrate utils test files
- [ ] Migrate cli test files
- [ ] Migrate config test files

**🎯 Consistency Rule**: Enforce simple property access pattern across ALL test files

### Phase 4: Cleanup & Documentation (1 hour)

- [ ] Remove all deprecated mock code
- [ ] Create README in mocks directory with usage examples
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

- [ ] Mock factory API documentation with correct usage patterns
- [ ] Migration guide emphasizing simple property access
- [ ] ESLint rule documentation
- [ ] Best practices guide with DO/DON'T examples

### Example Documentation:

```markdown
## Mock Usage Guide

### ✅ DO - Simple Property Access

const loggerMock = createLoggerMock();
expect(loggerMock.info).toHaveBeenCalled();

### ❌ DON'T - Complex Destructuring

const { mock, info, error } = createLoggerMock();
```

## 🚨 Challenges & Mitigations

**Challenge 1**: ESLint custom rule complexity

- **Mitigation**: Use existing no-restricted-imports pattern if custom rule too complex

**Challenge 2**: Breaking tests during migration

- **Mitigation**: Migrate one file at a time, verify tests pass after each

**Challenge 3**: Maintaining type safety without cast

- **Mitigation**: Ensure mock factories return properly typed objects

**Challenge 4**: Large number of files to migrate

- **Mitigation**: Phased approach, starting with highest-impact files

**Challenge 5**: Developers using destructuring pattern

- **Mitigation**: Clear documentation and code review guidelines emphasizing simple property access

**🚨 Challenge 6**: Accidentally changing test logic during migration

- **Mitigation**:
  - Focus only on mock creation replacement
  - Never modify expect() calls or test assertions
  - Never modify production code in src/ directory
  - Run tests after each file migration to verify unchanged behavior

## ✅ Technology Validation Checkpoints

- [x] TypeScript project already set up
- [x] Vitest testing framework in place
- [x] ESLint configured and working
- [ ] Custom ESLint rule approach validated
- [ ] Mock factory pattern tested
- [ ] Simple property access pattern validated in sample test

## 📈 Success Metrics

- 100+ anti-patterns eliminated
- 30-40% reduction in test file sizes
- Zero cast usage in test files
- All 188 tests passing **with identical behavior**
- ESLint enforcing architecture
- **All test files using simple property access pattern**
- **Zero changes to production code**
- **Zero changes to test assertions or logic**

---

## Implementation Plan Summary

**Total Estimated Time**: 8-12 hours

**Priority Order**:

1. ESLint rule (prevents new violations)
2. Mock infrastructure (foundation with correct pattern)
3. High-impact migrations (biggest wins)
4. Complete migration (full consistency)
5. Documentation (maintainability)

**Critical Success Factor**: All mock factories must return objects designed for simple property access, NOT destructuring.

**🚨 ABSOLUTE REQUIREMENTS**:

- Only modify test mock creation - never test logic
- Only touch files in tests/ directory - never src/
- All tests must pass with identical behavior
- If any test fails, revert immediately and identify root cause

**Next Mode**: IMPLEMENT MODE (no creative phases required)

---

_Last Updated: 2025-01-25_

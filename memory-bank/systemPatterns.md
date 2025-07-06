# SYSTEM PATTERNS & STANDARDS

## MANDATORY QUALITY ASSURANCE FOR ALL TASKS

### Testing & Linting Requirements

**⚠️ CRITICAL: These requirements apply to EVERY task regardless of complexity level**

#### Pre-Completion Checklist (MANDATORY)

Every task MUST pass these checks before being marked as complete:

1. **Tests**: `npm run test` - All tests must pass
2. **Linting**: `npm run lint` - All linting rules must pass
3. **Type Checking**: `npm run type-check` - TypeScript compilation must succeed
4. **Code Formatting**: `npm run format:check` - Code formatting must be correct

#### Quality Gates

- **No exceptions** - If any check fails, the task is NOT complete
- **Fix before proceed** - All issues must be resolved before task completion
- **Document fixes** - Any quality issues found and fixed should be noted

### Standard Task Completion Pattern

Every task completion checklist MUST include:

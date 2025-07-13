# MEMORY BANK TASKS

## Task Status: ✅ PLAN COMPLETE → READY FOR IMPLEMENT

**Task ID**: improve-naming-consistency-20250119
**Start Date**: 2025-01-19
**Issue Reference**: Issue #90
**Branch**: task-20250119-improve-naming-consistency
**Pull Request**: TBD
**Complexity Level**: Level 2 - Simple Enhancement
**Status**: ✅ PLAN Complete → Ready for IMPLEMENT Mode

## 📋 TASK OVERVIEW

**Primary Objective**: Improve naming consistency across schema definitions

**Task Type**: Refactoring - Breaking Change (Direct Rename)
**Impact**: Clean break - no backward compatibility

## 🎯 USER DECISIONS SUMMARY

✅ **All Questions Answered**

- **Breaking Changes**: Direct rename without support
- **Migration**: No helpers needed
- **Compatibility**: None - clean break
- **Documentation**: No updates needed (except techContext.md)
- **Testing**: Ensure existing tests pass
- **Review**: Standard process

## 📊 DETAILED IMPLEMENTATION PLAN

### Direct Rename Approach

**Pattern**: Use "Config" suffix for all schemas

- FlowDefinitionSchema → FlowConfigSchema
- FlowDefinition → FlowConfig

### Pre-Phase: File Name Verification (5 minutes)

1. Verify file naming consistency
   - [ ] Check if any files need renaming to match new convention
   - [ ] Ensure schema files follow consistent pattern
   - [ ] Update any file names if needed

### Phase 0: Documentation (10 minutes)

1. Update memory-bank/techContext.md
   - [ ] Add "Schema Naming Conventions" section
   - [ ] Document "Config" suffix pattern decision
   - [ ] Provide examples of correct naming
   - [ ] Explain rationale for consistency

### Phase 1: Schema Renaming (20 minutes)

1. Update src/validation/schemas/flow.schema.ts
   - [ ] Rename FlowDefinitionSchema to FlowConfigSchema
   - [ ] Update export statements
2. Update src/types/validation/schemas.types.ts
   - [ ] Change FlowDefinition type to FlowConfig
   - [ ] Update type inference from FlowConfigSchema

### Phase 2: Import Updates (10 minutes)

1. Update src/types/validation/index.ts
   - [ ] Change FlowDefinition export to FlowConfig
2. Update src/utils/flow-manager.ts
   - [ ] Update FlowDefinitionSchema import
   - [ ] Update FlowDefinition type references
   - [ ] Update function signatures and comments

3. Update test files (14 references)
   - [ ] Update all test imports
   - [ ] Update type declarations in tests

### Phase 3: Testing & Verification (10 minutes)

1. Run TypeScript compilation
2. Run all unit tests
3. Run integration tests
4. Fix any broken imports

**Total Estimated Time**: 45 minutes

## ⚠️ CHALLENGES & MITIGATIONS

1. **Import Path Consistency**
   - Use search/replace for accuracy
   - Double-check all import statements

2. **Test Coverage**
   - Ensure all renamed entities are tested
   - No test logic changes needed

## 📝 CHECKLIST

- [x] VAN mode analysis complete
- [x] PLAN mode complete
- [x] User questions answered
- [x] Branch created
- [ ] Documentation in techContext.md
- [ ] Schema renaming
- [ ] Import updates
- [ ] Tests passing
- [ ] PR created

## 🚀 NEXT STEPS

**Ready for IMPLEMENT Mode** - Direct rename strategy

---

**Planning Completed**: 2025-01-19
**Memory Bank Status**: Plan Finalized
**Next Mode**: IMPLEMENT

## 📁 FILE NAMING PATTERNS TO VERIFY

During Pre-Phase, check for:

1. **Schema Files**:
   - Current: flow.schema.ts, step.schema.ts ✓
   - Pattern: [entity].schema.ts (lowercase, no 'Config' or 'Definition')

2. **Type Files**:
   - Current: schemas.types.ts ✓
   - Pattern: [purpose].types.ts

3. **Test Files**:
   - Pattern: [entity].test.ts or [entity].spec.ts
   - Should match source file names

4. **No files should contain**:
   - 'definition' in filename
   - 'Definition' in filename
   - These are reserved for type/schema names only

Note: Current file names are already following good patterns - just verify consistency.

# PLAN MODE - Naming Consistency Implementation Plan

## 📋 TASK PLANNING: Improve Naming Consistency

### Task Overview

- **Issue**: #90
- **Type**: Level 2 - Simple Enhancement (Refactoring)
- **Impact**: Breaking change affecting external consumers

### 🎯 IMPLEMENTATION APPROACH

**Selected Pattern**: Use "Config" suffix for all schemas

**Renames Required**:

1. FlowDefinitionSchema → FlowConfigSchema
2. FlowDefinition → FlowConfig

### 📊 DETAILED IMPLEMENTATION STEPS

#### Phase 1: Schema Renaming (30 minutes)

1. Update src/validation/schemas/flow.schema.ts
   - [ ] Rename FlowDefinitionSchema to FlowConfigSchema
   - [ ] Update export statements
2. Update src/types/validation/schemas.types.ts
   - [ ] Change FlowDefinition type to FlowConfig
   - [ ] Update type inference from FlowConfigSchema

#### Phase 2: Import Updates (45 minutes)

1. Update src/types/validation/index.ts
   - [ ] Change FlowDefinition export to FlowConfig
2. Update src/utils/flow-manager.ts
   - [ ] Update FlowDefinitionSchema import
   - [ ] Update FlowDefinition type references
   - [ ] Update function signatures and comments

3. Update test files (14 references)
   - [ ] Update all test imports
   - [ ] Update type declarations in tests

#### Phase 3: Documentation Updates (15 minutes)

1. Update any JSDoc comments
2. Update README if applicable
3. Create migration guide for breaking change

#### Phase 4: Testing & Verification (30 minutes)

1. Run TypeScript compilation
2. Run all unit tests
3. Run integration tests
4. Verify no broken imports

### ⚠️ CHALLENGES & MITIGATIONS

1. **Breaking Change Communication**
   - Create clear migration guide
   - Update PR description with breaking change notice
   - Consider semantic versioning bump

2. **Import Path Consistency**
   - Use search/replace with regex for accuracy
   - Double-check all import statements

3. **Test Coverage**
   - Ensure all renamed entities are tested
   - No test logic changes needed

### 🔧 TECHNOLOGY VALIDATION

- **Language**: TypeScript (existing)
- **Build Tool**: Existing build configuration
- **Testing**: Vitest (existing)

✅ No new technology stack - using existing infrastructure

### 📋 PRE-IMPLEMENTATION CHECKLIST

- [ ] Naming convention confirmed
- [ ] Breaking change process understood
- [ ] Migration strategy defined
- [ ] Test strategy clear

## 🤔 QUESTIONS FOR USER - MUST ANSWER BEFORE IMPLEMENTATION

### 1. Breaking Change Management

**Q1**: How should we handle the breaking change? Options:

- no braking changes support. Just make them and that's it.

### 2. Migration Strategy

**Q2**: Should we provide any migration helpers?

- no need to care about migration, just break everyhing

### 3. Backward Compatibility

**Q3**: Should we maintain temporary backward compatibility?

- Don't support backward compartililiy

### 4. Documentation Updates

**Q4**: Which documentation needs updating?

- no need

### 5. Release Communication

**Q5**: How should we communicate this change?

- we don't have release flow noe

### 6. Testing Priority

**Q6**: Any specific test scenarios to prioritize?

- Just ensure existing tests pass?

### 7. PR Review Process

**Q7**: Who should review this breaking change?

- Standard review process

**Please provide answers to proceed with implementation.**

## ✅ USER DECISIONS RECEIVED

### Implementation Approach Based on Answers:

1. **Breaking Change Strategy**: Direct rename without support
2. **Migration**: No migration helpers - clean break
3. **Backward Compatibility**: None - remove old names immediately
4. **Documentation**: No additional documentation needed
5. **Release**: No formal release process required
6. **Testing**: Ensure existing tests pass
7. **Review**: Standard review process

### SIMPLIFIED IMPLEMENTATION PLAN

Based on your decisions, this is now a straightforward rename operation:

#### Phase 1: Direct Renaming (20 minutes)

1. Rename FlowDefinitionSchema → FlowConfigSchema
2. Rename FlowDefinition → FlowConfig
3. Update all imports and references

#### Phase 2: Testing (10 minutes)

1. Run TypeScript compilation
2. Run all tests
3. Fix any broken imports

**Total Time**: ~30 minutes (reduced from 2 hours)

### Ready for Implementation

✅ All questions answered
✅ Simplified approach confirmed
✅ No migration/compatibility overhead
✅ Direct rename strategy

**Next Mode**: IMPLEMENT

### Additional Step: Document Naming Convention

#### Phase 0: Documentation (10 minutes)

1. Update memory-bank/techContext.md
   - [ ] Add "Schema Naming Conventions" section
   - [ ] Document the decision to use "Config" suffix pattern
   - [ ] Provide examples of correct naming
   - [ ] Explain rationale for consistency

This will ensure the naming convention decision is documented for future reference.

**Updated Total Time**: ~40 minutes

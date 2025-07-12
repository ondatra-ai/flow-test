# MEMORY BANK TASKS

## Task Status: CREATIVE COMPLETE 🎨

**Current Task**: centralize-type-system-20250712  
**Start Date**: 2025-07-12  
**Issue Reference**: [#76](https://github.com/ondatra-ai/flow-test/issues/76)  
**Status**: Updated Plan - Ready for Implementation (ESLint-First Approach) ✅

# Task: Centralize Type System with ESLint-First Migration

## Description

Implement ESLint rules to enforce type system constraints, then fix violations systematically:

1. Implement ESLint rules that forbid:
   - Type definitions outside `src/types/`
   - Interface definitions outside `src/interfaces/`
   - Unknown keyword outside `src/utils/cast.ts`
2. Run linter to identify all violations
3. Fix violations step by step:
   - Move types to `src/types/`
   - Move interfaces to `src/interfaces/`
   - Replace unknown usage with cast utilities

## Complexity

Level: 3  
Type: Intermediate Feature

## Technology Stack

- Framework: Existing TypeScript/Node.js
- Build Tool: TypeScript compiler (tsc)
- Language: TypeScript 5.3.3
- Linting: ESLint 8.56.0 with no-restricted-syntax rules

## Status

- [x] Initialization complete
- [x] Planning complete
- [x] Technology validation complete ✅
- [x] Creative phase complete ✅
- [ ] Implementation complete
- [ ] Testing complete
- [ ] Documentation complete

## Implementation Strategy (ESLint-First Approach)

### Phase 1: Implement ESLint Rules ⚡ START HERE

1. **Update .eslintrc.json**:

   ```json
   {
     "rules": {
       "no-restricted-syntax": [
         "error",
         {
           "selector": "TSUnknownKeyword",
           "message": "The 'unknown' type is forbidden here. Use cast utilities from '@/utils/cast' instead."
         },
         {
           "selector": "TSTypeAliasDeclaration",
           "message": "Type definitions must be in src/types/ folder"
         },
         {
           "selector": "TSInterfaceDeclaration",
           "message": "Interface definitions must be in src/interfaces/ folder"
         }
       ]
     },
     "overrides": [
       {
         "files": ["src/types/**/*.ts"],
         "rules": {
           "no-restricted-syntax": [
             "error",
             {
               "selector": "TSInterfaceDeclaration",
               "message": "Interfaces should be in src/interfaces/, not src/types/"
             },
             {
               "selector": "TSUnknownKeyword",
               "message": "The 'unknown' type is forbidden here. Use cast utilities from '@/utils/cast' instead."
             }
           ]
         }
       },
       {
         "files": ["src/interfaces/**/*.ts"],
         "rules": {
           "no-restricted-syntax": [
             "error",
             {
               "selector": "TSTypeAliasDeclaration",
               "message": "Types should be in src/types/, not src/interfaces/"
             },
             {
               "selector": "TSUnknownKeyword",
               "message": "The 'unknown' type is forbidden here. Use cast utilities from '@/utils/cast' instead."
             }
           ]
         }
       },
       {
         "files": ["src/utils/cast.ts"],
         "rules": {
           "no-restricted-syntax": [
             "error",
             {
               "selector": "TSTypeAliasDeclaration",
               "message": "Type definitions must be in src/types/ folder"
             },
             {
               "selector": "TSInterfaceDeclaration",
               "message": "Interface definitions must be in src/interfaces/ folder"
             }
           ]
         }
       },
       {
         "files": ["tests/**/*.ts"],
         "rules": {
           "no-restricted-syntax": "off"
         }
       }
     ]
   }
   ```

2. **Run ESLint**:
   - [ ] Run `npm run lint` to see all violations
   - [ ] Document violation counts for each rule
   - [ ] Create priority list for fixes

### Phase 2: Fix Type Violations

For each type violation shown by ESLint:

1. **Create target location**:
   - [ ] Create appropriate subdirectory in src/types/
   - [ ] Create .types.ts file

2. **Move type**:
   - [ ] Cut type definition from source
   - [ ] Paste into new location
   - [ ] Add to barrel export (index.ts)
   - [ ] Update import in original file
   - [ ] Add temporary re-export in original file
   - [ ] Run tests to ensure nothing breaks

3. **Repeat until no type violations remain**

### Phase 3: Fix Interface Violations

For each interface violation shown by ESLint:

1. **Create target location**:
   - [ ] Create src/interfaces/ if not exists
   - [ ] Create appropriate subdirectory
   - [ ] Create .interface.ts file

2. **Move interface**:
   - [ ] Cut interface definition from source
   - [ ] Paste into new location
   - [ ] Add to barrel export (index.ts)
   - [ ] Update import in original file
   - [ ] Add temporary re-export in original file
   - [ ] Run tests to ensure nothing breaks

3. **Repeat until no interface violations remain**

### Phase 4: Fix Unknown Violations

1. **Create cast utilities**:
   - [ ] Create src/utils/cast.ts
   - [ ] Implement cast<T> function
   - [ ] Add safeCast and type guards

2. **For each unknown violation**:
   - [ ] Import cast from @/utils/cast
   - [ ] Replace unknown usage with cast
   - [ ] Run tests to ensure functionality preserved

3. **Repeat until no unknown violations remain**

### Phase 5: Cleanup

1. **Remove temporary re-exports**:
   - [ ] Remove all re-exports from original files
   - [ ] Update any remaining import paths
   - [ ] Ensure all tests still pass

2. **Final validation**:
   - [ ] Run `npm run lint` - should have zero violations
   - [ ] Run `npm test` - all tests should pass
   - [ ] Run `npm run build` - build should succeed

## Expected Violations (Estimated)

Based on initial analysis:

- Type violations: ~12
- Interface violations: ~10
- Unknown violations: ~20-30

## Success Criteria

- [ ] ESLint rules implemented and active
- [ ] Zero ESLint violations for type/interface/unknown rules
- [ ] All types in src/types/
- [ ] All interfaces in src/interfaces/
- [ ] All unknown usage replaced with cast utilities
- [ ] All tests passing
- [ ] No breaking changes to APIs

## Benefits of ESLint-First Approach

1. **Clear Guidance**: ESLint tells us exactly what to fix
2. **Progress Tracking**: Violation count decreases as we fix issues
3. **No Guesswork**: Each error has clear location and fix
4. **Immediate Feedback**: Know when each violation is resolved
5. **Confidence**: ESLint validates our fixes in real-time

---

**Next Step**: Update .eslintrc.json with the rules above and run `npm run lint`

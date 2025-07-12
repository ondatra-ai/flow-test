# Memory Bank: Active Context

## Current Focus

Ready to implement ESLint-first migration approach for type system centralization (GitHub Issue #76)

## Status

**Mode**: READY FOR IMPLEMENTATION  
**Approach**: ESLint-First Migration  
**Task**: centralize-type-system-20250712

## New Implementation Approach

### ESLint-First Strategy

Instead of creating infrastructure first, we will:

1. **Implement ESLint rules immediately** to identify all violations
2. **Use ESLint errors as a guide** to fix issues systematically
3. **Fix violations incrementally** with immediate validation

### Implementation Order

1. **Phase 1**: Add ESLint rules to .eslintrc.json
2. **Phase 2**: Run lint and document all violations
3. **Phase 3**: Fix type violations one by one
4. **Phase 4**: Fix interface violations one by one
5. **Phase 5**: Fix unknown violations one by one
6. **Phase 6**: Remove temporary re-exports and cleanup

## Key Architectural Decisions (Unchanged)

1. All types must reside in `src/types/` organized by domain
2. All interfaces must reside in `src/interfaces/` organized by domain
3. Only `src/utils/cast.ts` may use the `unknown` keyword
4. Use path aliases (@/types, @/interfaces, @/utils/cast) for clean imports
5. Temporary re-exports for backward compatibility during migration
6. Test files can define local types, interfaces, and use unknown

## Benefits of New Approach

- **Immediate Visibility**: See all problems upfront
- **Guided Process**: ESLint errors tell us exactly what to fix
- **Progress Tracking**: Watch violation count decrease
- **No Infrastructure Waste**: Only create folders/files as needed
- **Validation Built-in**: ESLint confirms when each fix is correct

## Next Immediate Steps

1. Open `.eslintrc.json`
2. Add the no-restricted-syntax rules from tasks.md
3. Run `npm run lint` to see all violations
4. Start fixing violations based on ESLint output

## Expected Initial Results

After adding rules and running lint:

- ~12 type definition errors
- ~10 interface definition errors
- ~20-30 unknown keyword errors

Each error will show:

- Exact file and line number
- Clear message about what's wrong
- Where it should be moved/how to fix it

## Context for Implementation

The ESLint-first approach transforms the migration from a planning exercise to a systematic fixing process. Each ESLint error becomes a clear task with a known solution.

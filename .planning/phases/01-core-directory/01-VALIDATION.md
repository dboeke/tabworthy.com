---
phase: 1
slug: core-directory
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 1 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.x (unit/integration) + Playwright (e2e, if needed) |
| **Config file** | `vitest.config.ts` (created by Plan 01 Task 1) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run && npx playwright test` |
| **Build verification** | `npm run build` (primary verification for most tasks) |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build` (build-based verification is the primary gate for Phase 1)
- **After every plan wave:** Run `npm run build && npx vitest run` (if tests exist)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Verification Approach

Phase 1 uses **build-based verification** as the primary automated gate. Plans use `npm run build` and `npx tsc --noEmit` to verify correctness. Unit tests via Vitest are available for targeted testing of specific behaviors (e.g., query logic, component rendering) but are not the primary verification mechanism for every task.

The rationale: Phase 1 is a greenfield build where the TypeScript compiler and Next.js build process catch the majority of integration issues (missing imports, type mismatches, invalid routes). Adding comprehensive Vitest tests for every component would double the implementation scope without proportional benefit at this stage.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| T1 | 01 | 1 | TECH-04 | build | `npm run build` | pending |
| T2 | 01 | 1 | TECH-04, CHAN-06 | typecheck | `npx tsc --noEmit` | pending |
| T1 | 02 | 2 | TAXO-01, TAXO-02 | typecheck | `npx tsc --noEmit src/lib/db/queries/taxonomy.ts` | pending |
| T2 | 02 | 2 | TAXO-01, TAXO-04, TECH-03 | build | `npm run build` | pending |
| T3 | 02 | 2 | TAXO-02 | build | `npm run build` | pending |
| T1 | 03 | 2 | CHAN-01, CHAN-05, CHAN-06 | build | `npm run build` | pending |
| T2 | 03 | 2 | CHAN-02, CHAN-03, CHAN-04 | build | `npm run build` | pending |
| T1 | 04 | 3 | TAXO-03, TECH-02 | build | `npm run build` | pending |
| T2 | 04 | 3 | TAXO-03, TECH-02 | build | `npm run build` | pending |
| T3 | 04 | 3 | ALL | manual | Visual end-to-end verification | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [x] `vitest.config.ts` -- Created by Plan 01 Task 1
- [x] `src/__tests__/setup.ts` -- Created by Plan 01 Task 1
- [x] Framework install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom` -- Done in Plan 01 Task 1
- [ ] `src/__tests__/helpers/db-mock.ts` -- Mock Drizzle client for unit tests (create if/when unit tests are added)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Responsive layout at mobile/tablet/desktop | TECH-01 | Visual layout verification requires human judgment | Resize browser to 375px, 768px, 1280px and verify content reflows correctly |
| End-to-end browsing flow | ALL | Requires visual + functional human judgment | Plan 04 Task 3 checkpoint covers this |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands (build-based)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers test infrastructure setup
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter (pending execution)

**Approval:** pending

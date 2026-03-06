---
phase: 1
slug: core-directory
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.x (unit/integration) + Playwright (e2e, if needed) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run && npx playwright test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | 01 | 1 | TAXO-01 | integration | `npx vitest run src/__tests__/taxonomy.test.ts -t "category"` | No — W0 | pending |
| TBD | 01 | 1 | TAXO-02 | unit | `npx vitest run src/__tests__/filtering.test.ts` | No — W0 | pending |
| TBD | 01 | 1 | TAXO-03 | unit | `npx vitest run src/__tests__/breadcrumb.test.ts` | No — W0 | pending |
| TBD | 01 | 1 | TAXO-04 | integration | `npx vitest run src/__tests__/routing.test.ts` | No — W0 | pending |
| TBD | 02 | 1 | CHAN-01 | unit | `npx vitest run src/__tests__/channel-profile.test.ts` | No — W0 | pending |
| TBD | 02 | 1 | CHAN-02 | unit | `npx vitest run src/__tests__/platform-badge.test.ts` | No — W0 | pending |
| TBD | 02 | 1 | CHAN-03 | unit | `npx vitest run src/__tests__/highlights.test.ts` | No — W0 | pending |
| TBD | 02 | 1 | CHAN-04 | unit | `npx vitest run src/__tests__/related-channels.test.ts` | No — W0 | pending |
| TBD | 02 | 1 | CHAN-05 | unit | covered by CHAN-01 test | No — W0 | pending |
| TBD | 02 | 1 | CHAN-06 | integration | `npx vitest run src/__tests__/creator-grouping.test.ts` | No — W0 | pending |
| TBD | 03 | 2 | TECH-01 | manual-only | Visual check at breakpoints | N/A | pending |
| TBD | 03 | 2 | TECH-02 | unit | `npx vitest run src/__tests__/json-ld.test.ts` | No — W0 | pending |
| TBD | 03 | 2 | TECH-03 | integration | `npx vitest run src/__tests__/public-access.test.ts` | No — W0 | pending |
| TBD | 03 | 2 | TECH-04 | unit | `npx vitest run src/__tests__/platform-agnostic.test.ts` | No — W0 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — Vitest configuration with path aliases matching tsconfig
- [ ] `src/__tests__/` directory — test file stubs for all requirements above
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- [ ] `src/__tests__/helpers/supabase-mock.ts` — mock Supabase client for unit tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Responsive layout at mobile/tablet/desktop | TECH-01 | Visual layout verification requires human judgment | Resize browser to 375px, 768px, 1280px and verify content reflows correctly |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

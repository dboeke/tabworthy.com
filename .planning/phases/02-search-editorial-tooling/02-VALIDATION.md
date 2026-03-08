---
phase: 2
slug: search-editorial-tooling
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-07
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

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
| 02-01-01 | 01 | 0 | SRCH-01 | unit | `npx vitest run src/__tests__/search.test.ts -t "search"` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 0 | SRCH-02 | unit | `npx vitest run src/__tests__/search.test.ts -t "autocomplete"` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 0 | TAXO-05 | unit | `npx vitest run src/__tests__/feeds.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 0 | EDIT-01 | unit | `npx vitest run src/__tests__/admin-channels.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-05 | 01 | 0 | EDIT-02 | unit | `npx vitest run src/__tests__/admin-taxonomy.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/search.test.ts` — stubs for SRCH-01, SRCH-02
- [ ] `src/__tests__/feeds.test.ts` — stubs for TAXO-05
- [ ] `src/__tests__/admin-channels.test.ts` — stubs for EDIT-01
- [ ] `src/__tests__/admin-taxonomy.test.ts` — stubs for EDIT-02
- [ ] `src/__tests__/auth.test.ts` — stubs for admin session validation
- [ ] Test setup for mocking Drizzle DB queries

*Wave 0 must be the first task in the first plan.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drag-and-drop reordering | EDIT-02 | Browser interaction required | 1. Navigate to /admin/categories 2. Drag item to new position 3. Verify order persists after refresh |
| Split-panel responsive layout | SRCH-01 | Visual layout testing | 1. Open homepage 2. Resize to mobile width 3. Verify panels stack vertically |
| Search autocomplete UX | SRCH-02 | Typing interaction | 1. Type in search bar 2. Verify results appear inline as you type 3. Verify debounce behavior |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

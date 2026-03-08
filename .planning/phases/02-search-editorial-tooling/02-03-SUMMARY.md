---
phase: 02-search-editorial-tooling
plan: 03
subsystem: ui
tags: [admin, taxonomy, dnd-kit, sortable, crud, drizzle]

# Dependency graph
requires:
  - phase: 01-core-directory
    provides: "Database schema for categories, topics, tags tables"
  - phase: 02-01
    provides: "Admin auth, layout shell, sidebar nav"
provides:
  - "Taxonomy CRUD server actions (categories, topics, tags)"
  - "Drag-and-drop SortableList component using @dnd-kit"
  - "TaxonomyForm reusable form component"
  - "Admin pages at /admin/categories, /admin/topics, /admin/tags"
  - "Admin query functions for taxonomy entities"
  - "Shared slugify utility"
affects: [02-04, admin-channels]

# Tech tracking
tech-stack:
  added: []
  patterns: ["@dnd-kit sortable list with server action reorder", "reusable taxonomy form with type-driven fields", "extracted slugify utility for testability"]

key-files:
  created:
    - src/lib/actions/taxonomy.ts
    - src/lib/utils/slugify.ts
    - src/components/admin/sortable-list.tsx
    - src/components/admin/taxonomy-form.tsx
    - src/app/admin/categories/page.tsx
    - src/app/admin/categories/category-sortable-list.tsx
    - src/app/admin/categories/new/page.tsx
    - src/app/admin/categories/[id]/edit/page.tsx
    - src/app/admin/topics/page.tsx
    - src/app/admin/topics/topic-sortable-list.tsx
    - src/app/admin/topics/new/page.tsx
    - src/app/admin/topics/[id]/edit/page.tsx
    - src/app/admin/tags/page.tsx
    - src/app/admin/tags/new/page.tsx
    - src/app/admin/tags/[id]/edit/page.tsx
    - src/__tests__/admin-taxonomy.test.ts
  modified:
    - src/lib/db/queries/admin.ts

key-decisions:
  - "Extracted slugify to src/lib/utils/slugify.ts for testability (avoids DB import in tests)"
  - "Separate client components for sortable lists (CategorySortableList, TopicSortableList) to keep pages as server components"
  - "Topics page grouped by category with per-category sortable lists"
  - "Tags displayed in table format (no reorder needed per plan)"

patterns-established:
  - "SortableList generic component: pass items, onReorder callback, renderItem function"
  - "TaxonomyForm type-driven: single component handles category/topic/tag with conditional fields"
  - "Server component pages with client-only interactivity split into dedicated components"

requirements-completed: [EDIT-02]

# Metrics
duration: 5min
completed: 2026-03-08
---

# Phase 2 Plan 3: Taxonomy Management Summary

**Admin taxonomy CRUD with drag-and-drop reordering for categories and topics using @dnd-kit/sortable**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-08T01:57:34Z
- **Completed:** 2026-03-08T02:03:34Z
- **Tasks:** 2
- **Files modified:** 17

## Accomplishments
- Full CRUD server actions for categories, topics, and tags with revalidation
- Drag-and-drop reordering for categories and topics via SortableList component
- Admin pages at /admin/categories, /admin/topics, /admin/tags with create/edit/delete
- Reusable TaxonomyForm with auto-slug generation and type-specific fields
- 11 unit tests for slug generation and reorder logic

## Task Commits

Each task was committed atomically:

1. **Task 1: Taxonomy server actions, sortable list component, and tests** - `5c1c2a9` (feat)
2. **Task 2: Admin taxonomy pages (categories, topics, tags)** - `1f508ff` (feat)

## Files Created/Modified
- `src/lib/actions/taxonomy.ts` - Server actions for taxonomy CRUD and reorder
- `src/lib/utils/slugify.ts` - Shared slug generation utility
- `src/components/admin/sortable-list.tsx` - Generic drag-and-drop sortable list using @dnd-kit
- `src/components/admin/taxonomy-form.tsx` - Reusable form for category/topic/tag editing
- `src/app/admin/categories/page.tsx` - Category list with drag-and-drop reordering
- `src/app/admin/categories/category-sortable-list.tsx` - Client wrapper for category reordering
- `src/app/admin/categories/new/page.tsx` - New category form
- `src/app/admin/categories/[id]/edit/page.tsx` - Edit category form
- `src/app/admin/topics/page.tsx` - Topics grouped by category with reordering
- `src/app/admin/topics/topic-sortable-list.tsx` - Client wrapper for topic reordering
- `src/app/admin/topics/new/page.tsx` - New topic form with category selector
- `src/app/admin/topics/[id]/edit/page.tsx` - Edit topic form
- `src/app/admin/tags/page.tsx` - Tag table list with channel counts
- `src/app/admin/tags/new/page.tsx` - New tag form
- `src/app/admin/tags/[id]/edit/page.tsx` - Edit tag form
- `src/__tests__/admin-taxonomy.test.ts` - Tests for slugify and reorder logic
- `src/lib/db/queries/admin.ts` - Added taxonomy admin queries

## Decisions Made
- Extracted slugify to shared utility (src/lib/utils/slugify.ts) to avoid DB connection during tests
- Used separate client components for sortable lists to keep page.tsx as server components
- Topics page displays grouped by category with per-category sortable lists
- Tags use a simple table view (no drag-and-drop since tags have no display order)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Extracted slugify to separate module**
- **Found during:** Task 1 (test verification)
- **Issue:** Importing slugify from taxonomy.ts triggered DB connection, failing tests in sandbox
- **Fix:** Created src/lib/utils/slugify.ts with the pure function, imported in both taxonomy.ts and tests
- **Files modified:** src/lib/utils/slugify.ts, src/lib/actions/taxonomy.ts, src/__tests__/admin-taxonomy.test.ts
- **Verification:** All 11 tests pass
- **Committed in:** 5c1c2a9 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for testability. No scope creep.

## Issues Encountered
- Build fails due to Google Fonts TLS error (sandbox network limitation) and pre-existing channels.ts issue from Plan 02 -- both out of scope
- TypeScript compilation passes cleanly with no errors

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Taxonomy management complete, ready for channel management (Plan 04)
- SortableList component reusable for any future admin lists requiring reorder
- All taxonomy admin queries available for channel form (category/topic selectors)

---
*Phase: 02-search-editorial-tooling*
*Completed: 2026-03-08*

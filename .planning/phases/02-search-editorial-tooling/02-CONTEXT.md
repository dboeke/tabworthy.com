# Phase 2: Search & Editorial Tooling - Context

**Gathered:** 2026-03-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can find channels via semantic search with autocomplete, editors can manage directory content through a password-protected admin interface, and the directory signals freshness through "newest" and "editor's picks" feeds. The homepage is redesigned around search as the primary interaction.

</domain>

<decisions>
## Implementation Decisions

### Search experience
- Search bar is a hero-level element on the homepage — the primary interaction, not a utility
- Homepage layout is a split panel: categories/topics on the left, channels on the right
- Default state (no query): left shows all categories, right toggles between "Newest" and "Editor's Picks"
- Searching: left shows matching topics/categories, right shows matching channels — results update live inline as user types (no dropdown overlay)
- Clicking a topic/category on the left adds it as a constraint filter (e.g., `category:science`) and refines channel results on the right
- Search is semantic, not just keyword matching
- No-results behavior: system broadens the search context automatically (e.g., "star trek podcasts" → "sci-fi podcasts") and shows those results with a message indicating the broadened search
- The current homepage category grid is replaced by this new search-first layout

### "New this week" / Editor's Picks
- Right panel default state shows channels in two toggleable modes: "Newest" and "Editor's Picks"
- "Newest" shows the last N most recently added channels by `created_at` timestamp (not a time window — always has content)
- "Editor's Picks" uses a simple boolean `is_editors_pick` flag on the channels table
- No editor-set featured dates — freshness is purely automatic

### Admin authentication
- Shared password stored in environment variable
- Admin lives at `/admin` — standard, discoverable path
- Cookie-based session persists for 30 days
- Solo editor — no per-user tracking, audit logs, or permissions needed
- Will be replaced by proper auth in Phase 3 when user accounts are added

### Admin editorial workflow
- Save = published. No draft/publish states. Everything is live immediately
- Taxonomy reordering (categories, topics, tags) via drag-and-drop
- Editorial summary ("why watch") edited with a markdown editor with preview
- All related entities (tags, topics, highlights, related channels) managed inline on the channel edit form — one form for everything
- Admin landing is simple list pages with sidebar nav (Channels, Categories, Topics, Tags) — no dashboard/stats
- Channel CRUD: create, edit, delete (hard delete is fine for solo editor)

### Claude's Discretion
- Semantic search implementation approach (embeddings, pg_trgm, or other)
- Drag-and-drop library choice
- Markdown editor library choice
- Admin form layout and component design
- Session/cookie implementation details
- Search result ranking and relevance tuning
- Mobile responsive behavior of the split-panel layout

</decisions>

<specifics>
## Specific Ideas

- Homepage becomes search-first — "think of it as the new front door"
- The split layout (categories left, channels right) should feel like browsing a well-organized library catalog that also has a great search function
- No-results fallback is semantic broadening, not just "try again" — the system should be smart about it
- Editor's Picks toggle alongside Newest gives the homepage two useful default states

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/channels/channel-card.tsx`: Primary channel display component — reuse in search results and admin lists
- `src/components/taxonomy/category-card.tsx`: Category display — adapt for left panel category list
- `src/components/taxonomy/topic-pills.tsx`: Topic display — adapt for left panel topic filtering
- `src/components/channels/tag-filter-bar.tsx`: Tag filtering with URL params — pattern reusable for search constraints
- `src/components/ui/card.tsx`, `badge.tsx`, `button.tsx`: shadcn/ui primitives
- `src/components/seo/`: JSON-LD components for search result pages

### Established Patterns
- Drizzle ORM with Neon HTTP driver for all database queries
- Query barrel exports at `src/lib/db/queries/index.ts`
- Server components for data fetching (no client-side data fetching patterns yet)
- Tag filter state in URL search params (`?tags=slug1,slug2`) — extend for search constraints
- `displayOrder` columns on categories, topics, content_highlights for ordering
- Inferred return types from query functions (no manual type duplication)

### Integration Points
- Homepage (`src/app/page.tsx`): Will be completely redesigned with search hero + split layout
- Schema (`src/lib/db/schema.ts`): Needs `is_editors_pick` column on channels, possibly search indexes
- New `/admin` route group with middleware for auth
- New API routes for search (real-time results need client-server communication)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-search-editorial-tooling*
*Context gathered: 2026-03-07*

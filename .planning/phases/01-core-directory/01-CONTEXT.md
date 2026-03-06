# Phase 1: Core Directory - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can browse a two-level taxonomy (Category > Topic) and view rich, editorially curated channel profiles across multiple platforms. All 42 categories launch with content. Channels are filterable by tags within topics. Every page has clean URLs, breadcrumbs, mobile-responsive layout, and JSON-LD structured data.

</domain>

<decisions>
## Implementation Decisions

### Taxonomy structure
- 42 predefined categories (from `design/category-list.txt`), all present at launch with editorial content
- Predefined topics underneath categories (not emergent)
- Max 9 channels at any browsing level — if a category exceeds 9 channels, it must be split into topics
- Channels can exist at both category level (direct) and topic level
- Category pages with topics show: topic links/cards at top, then any channels assigned directly to the category below

### Channel profile completeness
- "Why Watch" editorial summary is required for every channel — no channel goes live without it
- Other sections (Best Of, Related Channels, Cross-Platform links) are optional
- Empty optional sections are hidden — no placeholders or "coming soon" messages
- No subscriber counts — editorial quality over popularity metrics
- 3-9 channels per topic at launch

### Tag system
- Global tag set (same tags across all categories and topics)
- Freeform creation by editors with periodic cleanup (not a locked controlled vocabulary)
- AND logic for multi-tag filtering (selecting multiple tags narrows results)
- No limit on tags per channel — trust editors
- Tag filtering updates URL search params for shareable filtered views

### Editorial voice & tone
- Conversational, opinionated, enthusiastic — like a knowledgeable friend recommending channels
- Same voice applies to category descriptions, topic descriptions, and why-watch summaries
- Why-watch summaries are 2-3 sentences — quick and punchy
- Honest with caveats — mention trade-offs so users know what they're getting into (e.g., inconsistent uploads, not for beginners)

### Tech stack
- Next.js App Router + Tailwind CSS v4 + shadcn/ui (confirmed)
- Drizzle ORM with Neon or PlanetScale (serverless Postgres or MySQL) — NOT Supabase
- Deployed on Vercel

### Claude's Discretion
- Loading states and skeleton designs
- Exact spacing, typography, and responsive breakpoints beyond what the v0 spec defines
- Error state handling
- JSON-LD structured data schema specifics
- Database choice between Neon (Postgres) and PlanetScale (MySQL)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- No codebase exists yet — this is a greenfield project
- `design/v0-spec.md` provides detailed page layouts, component inventory, and sample data
- `design/category-list.txt` provides the 42 launch categories

### Established Patterns
- None yet — Phase 1 establishes all patterns

### Integration Points
- Vercel deployment pipeline (to be set up)
- Neon or PlanetScale database connection
- shadcn/ui component library installation

</code_context>

<specifics>
## Specific Ideas

- "Think Michelin Guide for content creators" — the product metaphor
- Homepage category grid should feel like a library catalog, not a social feed
- Channel cards should be the most reused component — must work in grid and list layouts
- The v0 spec's sample data (Fireship, 3Blue1Brown, Internet Historian) sets the editorial quality bar
- Design principles from v0 spec: editorial confidence, content-first, platform-agnostic identity, browsable over searchable, no algorithmic vibes

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-core-directory*
*Context gathered: 2026-03-05*

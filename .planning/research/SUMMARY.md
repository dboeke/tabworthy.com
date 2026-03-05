# Project Research Summary

**Project:** Tabworthy - Human-Curated Video Channel Directory
**Domain:** Curated content directory / creator discovery platform
**Researched:** 2026-03-05
**Confidence:** HIGH

## Executive Summary

Tabworthy is a human-curated, platform-agnostic video channel directory inspired by Yahoo Directory's browsable hierarchy model. The product sits in a clear market gap: existing tools like Favoree and ChannelCrawler are data-driven and YouTube-only, while Tabworthy's value proposition is editorial voice across platforms. Experts build this type of product as a server-rendered content directory with a relational data model (two-level taxonomy plus tags), a clear editorial workflow, and community input gated by curation. The recommended stack -- Next.js 16, Supabase, Drizzle ORM, Tailwind 4, shadcn/ui on Vercel -- is well-matched: read-heavy browsing benefits from React Server Components and ISR caching, while Supabase bundles auth, storage, and Postgres into a single managed service appropriate for a passion project.

The recommended approach is to build the core directory experience first (taxonomy browsing, channel profiles, search, SEO), then layer on editorial tooling, then community features (nominations, voting), and finally personalization (favorites, lists). This order follows natural dependencies: community features need content to exist, editorial tools need schema to exist, and personalization needs auth to exist. The platform-agnostic data model (Platform Link Registry pattern, generic field names) must be established in Phase 1 -- this cannot be retrofitted.

The top risks are: (1) taxonomy designed for editors instead of users, which must be validated through card-sorting before content entry at scale; (2) the stale directory death spiral that killed DMOZ, mitigated by baking `last_verified` into the schema and scheduling maintenance cycles; (3) editorial bottleneck limiting growth to 5-10 channels/week, mitigated by building efficient editorial tooling with API pre-fill and editorial tiers; and (4) thin content SEO penalties on programmatic category pages, mitigated by requiring unique editorial content on every topic page. All four risks are preventable with upfront design decisions, but all four are expensive to fix retroactively.

## Key Findings

### Recommended Stack

The stack prioritizes read-heavy optimization, progressive complexity, and minimal operational overhead. Every technology choice has a clear rationale tied to the directory use case. No exotic choices -- this is a well-trodden path.

**Core technologies:**
- **Next.js 16 + React 19:** Server Components for SEO-friendly taxonomy pages; ISR for caching infrequently-changing directory content; Server Actions for nominations/voting
- **Supabase (Postgres 15+, Auth, Storage):** Single managed service replaces separate database, auth, and file storage providers. RLS keeps auth rules in the database. Free tier (500MB, 50K MAUs) covers launch
- **Drizzle ORM:** 7.4KB bundle, zero cold-start overhead, SQL-like API that maps naturally to relational taxonomy model. Chosen over Prisma for serverless performance
- **Tailwind 4 + shadcn/ui:** Zero-config CSS with accessible component primitives. shadcn copies into project (no vendor lock-in)
- **Vercel:** Zero-config Next.js hosting with ISR, CDN, and image optimization on free tier
- **Postgres Full-Text Search (Phase 1) -> Meilisearch (when needed):** Start simple, upgrade when search becomes a core UX differentiator

### Expected Features

**Must have (table stakes):**
- Browsable two-level taxonomy (Category > Topic) with tag filtering -- this IS the product
- Channel profile pages with editorial "why watch" summaries, platform links, best-of content, related channels
- Full-text search across channels, categories, topics, and tags
- Public browsing without login requirement
- SEO-optimized pages with structured data (JSON-LD)
- Mobile-responsive browsing
- Shareable, clean URLs mirroring taxonomy hierarchy
- Platform badges/icons on listings
- "New this week" feed signaling the directory is alive

**Should have (differentiators):**
- Editorial voice / staff picks on every listing (the core differentiator vs. Favoree/ChannelCrawler)
- Community nominations with editorial gate (Product Hunt model)
- Community voting on nominations (informs editors, does not auto-promote)
- User favorites / "my channels" list
- Cross-platform channel grouping (one creator across YouTube/Twitch/Patreon)
- Seasonal/thematic editorial collections

**Defer (v2+):**
- User-created lists (high complexity, needs mature user base)
- Cross-platform creator entity grouping (complex data modeling; use "related channels" initially)
- Autocomplete search (layer on after basic search works)
- Notifications / email digests (premature; validate retention first)

**Anti-features (never build):**
- Embedded video playback, user reviews/ratings, algorithmic recommendations, creator self-service, real-time chat, automated channel ingestion

### Architecture Approach

The architecture is a four-layer monolith: public browsing layer (taxonomy browser, channel profiles, search, nominations), auth/personalization layer (accounts, favorites, lists), editorial/admin layer (channel editor, taxonomy manager, nomination queue), and data/services layer (Postgres with relational schema). The data model uses a two-level taxonomy (categories -> topics) with flat tags for cross-cutting attributes, a Platform Link Registry pattern for extensible multi-platform support, and a clear editorial workflow (draft -> published -> archived). URL structure mirrors taxonomy: `/category-slug/topic-slug` for browsing, `/channel/channel-slug` for profiles.

**Major components:**
1. **Taxonomy Browser** -- renders Category > Topic hierarchy with tag filters and breadcrumbs
2. **Channel Profiles** -- rich pages with editorial content, platform links, featured videos, related channels
3. **Search Interface** -- full-text search across all content types
4. **Nomination & Voting** -- community submission with editorial review queue
5. **Editorial Tools** -- channel CRUD, taxonomy management, nomination review, batch operations
6. **Platform Link Registry** -- extensible platform-agnostic link storage (not hardcoded columns)

### Critical Pitfalls

1. **Taxonomy reflects editors, not users** -- Design taxonomy from real channels up, not top-down. Run card sorts. Allow channels in multiple topics via tags. Must be validated before content entry at scale; retrofitting after 500+ channels is extremely painful.
2. **Stale directory death spiral** -- Bake `last_verified` into the schema from day one. Schedule quarterly review sweeps. Add "report outdated" button. This killed DMOZ and is the existential risk for any curated directory.
3. **Editorial bottleneck kills growth** -- At 30-60 min/channel, reaching critical mass (500+ channels) takes over a year. Build efficient tooling: API pre-fill, templates, editorial tiers (Listed vs. Featured vs. Editor's Pick), batch workflows. Target under 15 min/channel.
4. **Thin content SEO penalty** -- Programmatic category pages with just channel links get deindexed. Every topic page needs 200+ words of unique editorial content. Monitor Google Search Console.
5. **Platform-agnostic in name only** -- Design the core schema from 3+ platforms simultaneously. Use generic field names (`audience_size` not `subscribers`). YouTube-specific data belongs in platform metadata extensions, not the core model.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation (Data Model + Core Browsing)
**Rationale:** Everything depends on the core data model and taxonomy. Architecture research confirms this is the dependency root. Taxonomy must be validated before content entry at scale.
**Delivers:** Database schema, taxonomy browser (Category > Topic + tags), channel profile pages with editorial content, platform link registry, seed content (50-100 channels across 10+ topics)
**Addresses:** Browsable taxonomy, channel profiles, platform badges, shareable URLs, editorial summaries, related channels, "best of" content
**Avoids:** Taxonomy-reflects-team pitfall (validate with card sorts), platform-agnostic-in-name-only pitfall (design from 3 platforms), stale directory pitfall (`last_verified` in schema from day one)

### Phase 2: Search + Editorial Tooling
**Rationale:** Editors need tools to efficiently manage content (biggest operational risk). Search makes the directory usable beyond browsing. Both depend on Phase 1 data being in place.
**Delivers:** Full-text search (Postgres FTS), admin channel editor with API pre-fill, taxonomy manager, editorial tiers and batch workflows, "new this week" feed
**Addresses:** Search, editorial voice at scale, freshness signals
**Avoids:** Editorial bottleneck pitfall (efficient tooling), thin content SEO pitfall (editorial guidelines for topic pages), YouTube API quota pitfall (caching strategy, rolling refresh)

### Phase 3: SEO + Public Polish
**Rationale:** Before driving traffic via community features, the public-facing directory must be SEO-ready. Structured data, meta descriptions, and content quality determine whether Google indexes the site.
**Delivers:** JSON-LD structured data, per-page meta descriptions, mobile UX polish, performance optimization (ISR caching, image optimization), empty state handling
**Addresses:** SEO-optimized directory pages, mobile-responsive browsing
**Avoids:** Thin content SEO penalty (unique editorial content verified per topic page)

### Phase 4: Community Layer (Nominations + Voting)
**Rationale:** Community features require content to exist and editorial tools to process the queue. Auth is only needed once community features arrive.
**Delivers:** User authentication (Supabase Auth), nomination submission form, public nomination list, voting system, editorial review queue for nominations
**Addresses:** Community nominations with editorial gate, community voting, user accounts
**Avoids:** Nomination gaming pitfall (rate limits, account age gating, editorial queue ignores raw vote counts)

### Phase 5: Personalization
**Rationale:** Requires auth (Phase 4) and a populated directory to be meaningful. Creates return visits but is not core to the directory's value.
**Delivers:** Favorites / "my channels" list, user profile/dashboard, nomination status tracking for users
**Addresses:** User favorites, nomination feedback loop

### Phase Ordering Rationale

- **Phase 1 before everything:** The relational data model is the dependency root. Taxonomy, platform link registry, and channel schema decisions propagate everywhere. Getting these wrong is the most expensive mistake.
- **Phase 2 before community:** Without efficient editorial tooling, the directory cannot reach critical mass. Community nominations are useless if editors cannot process them. This is the biggest operational risk.
- **Phase 3 before community:** SEO groundwork must be laid before driving traffic. Community features bring users, but those users must find a polished, indexable directory.
- **Phase 4 before personalization:** Auth is the gate. Ship auth with community features (the reason users create accounts), then layer personalization on top.
- **Grouping search with editorial tools:** Both depend on Phase 1 data and both are needed for the directory to function as a product (users search, editors manage).

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Taxonomy design needs user validation (card sorting). Platform link registry needs schema review against 3+ real platforms (YouTube, Twitch, Substack minimum).
- **Phase 2:** Editorial tooling UX needs wireframing. YouTube API integration patterns need quota budget calculation before implementation.
- **Phase 4:** Nomination abuse prevention needs concrete rate limiting and fraud detection design.

Phases with standard patterns (skip deep research):
- **Phase 3 (SEO):** Well-documented patterns for Next.js structured data, meta tags, and ISR caching. Standard implementation.
- **Phase 5 (Personalization):** Simple CRUD (favorites, lists) with Supabase Auth. No novel patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies are mainstream, well-documented, and version-verified. No experimental choices. |
| Features | HIGH | Clear reference platforms (Yahoo Directory, Letterboxd, Product Hunt, Favoree). Market gaps are well-defined. |
| Architecture | MEDIUM-HIGH | Data model is solid and well-reasoned. Scaling path is clear. Slight uncertainty on editorial tooling UX (no direct reference). |
| Pitfalls | HIGH | Every pitfall is documented with real-world examples (DMOZ death, YouTube quota math, SEO penalties). Prevention strategies are concrete. |

**Overall confidence:** HIGH

### Gaps to Address

- **Taxonomy validation:** The two-level hierarchy is theoretically sound but needs testing with real channel data and real users. Plan for a card-sorting exercise in Phase 1 before committing to category/topic names.
- **Editorial velocity targets:** Research identifies the bottleneck but does not quantify how fast Supabase Studio can serve as a stopgap admin UI in Phase 1. Validate during Phase 1 whether Supabase Studio is sufficient or if custom editorial tooling needs to be pulled earlier.
- **Meilisearch migration trigger:** Research says "upgrade when needed" but does not define the threshold. During Phase 2, establish concrete metrics (search latency p95, result quality) that trigger the Postgres FTS -> Meilisearch migration.
- **Content seeding strategy:** Reaching 500+ channels for critical mass requires a plan. How many channels per topic before launching publicly? This is an editorial planning question, not a technical one, but it gates the launch timeline.

## Sources

### Primary (HIGH confidence)
- Next.js 16 release notes and upgrade guide (version verification)
- Supabase pricing and documentation (free tier limits, auth/storage capabilities)
- Drizzle ORM npm and comparison analyses (performance data, bundle size)
- YouTube Data API quota documentation (unit costs, daily limits)
- Google Developers quota and compliance audit guides

### Secondary (MEDIUM confidence)
- Nielsen Norman Group taxonomy best practices
- Earley Information Science taxonomy mistakes analysis
- Stack Overflow vote fraud documentation
- Search Engine Land on DMOZ/Yahoo Directory closures
- Ahrefs fresh content ranking analysis
- Schema markup SEO impact studies

### Tertiary (LOW confidence)
- Meilisearch version and feature claims (verify at integration time)
- Zustand necessity (may not be needed at all if RSC covers client state)
- Biome stability for Next.js 16 (relatively new pairing, verify compatibility)

---
*Research completed: 2026-03-05*
*Ready for roadmap: yes*

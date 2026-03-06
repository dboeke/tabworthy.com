# Roadmap: Tabworthy

## Overview

Tabworthy delivers a human-curated channel directory in three phases: first the core browsable directory with rich channel profiles (the product's reason to exist), then search and editorial tooling (making the directory findable and manageable at scale), and finally user accounts with community nominations and personalization (the engagement layer that requires content to already exist).

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Core Directory** - Browsable taxonomy, rich channel profiles, and platform-agnostic foundation
- [ ] **Phase 2: Search & Editorial Tooling** - Full-text search for users, admin tools for editors, freshness signals
- [ ] **Phase 3: Accounts & Community** - User accounts, favorites, nominations, voting, and editorial review queue

## Phase Details

### Phase 1: Core Directory
**Goal**: Users can browse a two-level taxonomy and view rich, editorially curated channel profiles across multiple platforms
**Depends on**: Nothing (first phase)
**Requirements**: TAXO-01, TAXO-02, TAXO-03, TAXO-04, CHAN-01, CHAN-02, CHAN-03, CHAN-04, CHAN-05, CHAN-06, TECH-01, TECH-02, TECH-03, TECH-04
**Success Criteria** (what must be TRUE):
  1. User can navigate from homepage to a category, then to a topic within that category, and see channel listings at each level
  2. User can filter channels within a topic by tags (e.g., beginner-friendly, long-form) and see results update
  3. User can view a channel profile page showing editorial summary, platform badges, best-of content highlights, and related channels
  4. All taxonomy and channel pages have clean shareable URLs, breadcrumb navigation, mobile-responsive layout, and JSON-LD structured data
  5. A creator present on multiple platforms appears as a single entity with cross-platform links
**Plans:** 4 plans

Plans:
- [ ] 01-01-PLAN.md — Project scaffolding, Drizzle schema, seed data
- [ ] 01-02-PLAN.md — Taxonomy browsing pages (homepage, category, topic) with tag filtering
- [ ] 01-03-PLAN.md — Channel profile page with editorial content sections
- [ ] 01-04-PLAN.md — Breadcrumbs, JSON-LD structured data, and visual verification

### Phase 2: Search & Editorial Tooling
**Goal**: Users can find channels via search, editors can efficiently manage directory content, and the directory signals freshness
**Depends on**: Phase 1
**Requirements**: SRCH-01, SRCH-02, TAXO-05, EDIT-01, EDIT-02
**Success Criteria** (what must be TRUE):
  1. User can search across channels, categories, topics, and tags and get relevant results with autocomplete suggestions
  2. User can view a "new this week" feed showing recently added channels
  3. Editor can create, edit, and archive channel listings through an admin interface
  4. Editor can manage the taxonomy (create, edit, reorder categories, topics, and tags) through an admin interface
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Accounts & Community
**Goal**: Users can create accounts, react to channels with statuses, subscribe to categories/tags, nominate channels, and vote on nominations while editors manage the queue
**Depends on**: Phase 2
**Requirements**: USER-01, USER-02, USER-03, USER-04, COMM-01, COMM-02, COMM-03, EDIT-03
**Success Criteria** (what must be TRUE):
  1. User can create an account, log in, and access a personal dashboard showing their marked channels, nominations, and activity
  2. User can mark channels with status reactions (Love, Like, Curious, Hide) and filter their dashboard by status
  3. User can subscribe to categories or tags and receive alerts when new channels are added
  4. Authenticated user can nominate a new channel and upvote existing nominations
  5. All users (including anonymous) can browse nominations on category pages or a dedicated nominations section
  6. Editor can review, approve, or reject community nominations through a review queue
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core Directory | 0/4 | Not started | - |
| 2. Search & Editorial Tooling | 0/2 | Not started | - |
| 3. Accounts & Community | 0/2 | Not started | - |

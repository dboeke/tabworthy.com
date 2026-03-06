# Requirements: Tabworthy

**Defined:** 2026-03-05
**Core Value:** People can browse by topic and find creators worth following — curated by humans, not algorithms

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Taxonomy & Browsing

- [ ] **TAXO-01**: User can browse channels organized in a two-level hierarchy (Category > Topic)
- [ ] **TAXO-02**: User can filter channels within a topic using tags (e.g., beginner-friendly, long-form, weekly uploads)
- [ ] **TAXO-03**: User sees breadcrumb navigation showing their position in the hierarchy
- [ ] **TAXO-04**: Every category, topic, and channel page has a clean, shareable URL
- [ ] **TAXO-05**: User can view a "new this week" feed of recently added channels

### Channel Profiles

- [x] **CHAN-01**: User can view a rich channel profile with name, description, and platform links
- [x] **CHAN-02**: Channel profiles display platform badges/icons showing where the channel lives
- [x] **CHAN-03**: Channel profiles show editorial "best of" content highlights (3-5 representative pieces)
- [x] **CHAN-04**: Channel profiles show editorially curated related channels
- [x] **CHAN-05**: Every channel profile includes a human-written "why watch" editorial summary
- [x] **CHAN-06**: Creators with presences on multiple platforms are grouped as a single entity with cross-platform links

### Search

- [ ] **SRCH-01**: User can search across channels, categories, topics, and tags via full-text search
- [ ] **SRCH-02**: Search provides autocomplete suggestions as the user types

### Community

- [ ] **COMM-01**: Authenticated user can nominate a new channel for editorial review
- [ ] **COMM-02**: Authenticated user can upvote existing nominations
- [ ] **COMM-03**: Nominations are visible to all users (on category pages or a dedicated nominations section)

### User Accounts

- [ ] **USER-01**: User can create an account and log in
- [ ] **USER-02**: User can mark channels with status reactions: Love, Like, Curious, or Hide
- [ ] **USER-03**: User can view a dashboard showing their marked channels (filtered by status), nominations, and activity
- [ ] **USER-04**: User can subscribe to categories or tags and receive alerts when new channels are added

### Editorial & Admin

- [ ] **EDIT-01**: Editor can create, edit, and archive channel listings
- [ ] **EDIT-02**: Editor can manage taxonomy (create/edit/reorder categories, topics, and tags)
- [ ] **EDIT-03**: Editor can review and approve/reject community nominations via a queue

### SEO & Technical

- [ ] **TECH-01**: All pages are mobile-responsive
- [ ] **TECH-02**: Directory pages include JSON-LD structured data for search engine rich results
- [ ] **TECH-03**: All browsing is public without login requirement
- [x] **TECH-04**: Data model is platform-agnostic — supports adding new platforms without schema changes

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Personalization

- **PERS-01**: User can create and share custom lists (e.g., "Best cooking channels")
- **PERS-02**: User can view nomination status updates on their dashboard

### Editorial

- **EDIT-04**: Editor can create seasonal/thematic curated collections
- **EDIT-05**: Editor can assign editorial tiers (Listed vs Featured vs Editor's Pick)

### Community

- **COMM-04**: User can report outdated or incorrect channel information

### Search

- **SRCH-03**: Search results include faceted filtering by platform, category, tags

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Embedded video playback | Tabworthy is the directory, not the player — avoids licensing complexity |
| User reviews/ratings | Conflicts with editorial-first model; Favoree already occupies this space |
| Algorithmic recommendations | Human curation IS the value prop — algorithms undermine it |
| Creator self-service / profile claiming | Undermines editorial independence; opens door to spam |
| Real-time chat / social features | Creates moderation burden; not core to directory purpose |
| Automated channel ingestion / scraping | Destroys editorial quality; every channel is intentionally selected |
| Comments on channel profiles | Low value vs moderation cost for a directory |
| General email digests / newsletters | Category subscriptions cover targeted alerts; broad digests are premature |
| Follower/following social graph | Users come to discover channels, not follow other users |
| Monetization features | Passion project for v1 |
| Mobile native app | Web-first; responsive design covers mobile needs |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TAXO-01 | Phase 1 | Pending |
| TAXO-02 | Phase 1 | Pending |
| TAXO-03 | Phase 1 | Pending |
| TAXO-04 | Phase 1 | Pending |
| TAXO-05 | Phase 2 | Pending |
| CHAN-01 | Phase 1 | Complete |
| CHAN-02 | Phase 1 | Complete |
| CHAN-03 | Phase 1 | Complete |
| CHAN-04 | Phase 1 | Complete |
| CHAN-05 | Phase 1 | Complete |
| CHAN-06 | Phase 1 | Complete |
| SRCH-01 | Phase 2 | Pending |
| SRCH-02 | Phase 2 | Pending |
| COMM-01 | Phase 3 | Pending |
| COMM-02 | Phase 3 | Pending |
| COMM-03 | Phase 3 | Pending |
| USER-01 | Phase 3 | Pending |
| USER-02 | Phase 3 | Pending |
| USER-03 | Phase 3 | Pending |
| USER-04 | Phase 3 | Pending |
| EDIT-01 | Phase 2 | Pending |
| EDIT-02 | Phase 2 | Pending |
| EDIT-03 | Phase 3 | Pending |
| TECH-01 | Phase 1 | Pending |
| TECH-02 | Phase 1 | Pending |
| TECH-03 | Phase 1 | Pending |
| TECH-04 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 27 total
- Mapped to phases: 27
- Unmapped: 0

---
*Requirements defined: 2026-03-05*
*Last updated: 2026-03-05 after adding status reactions and category subscriptions*

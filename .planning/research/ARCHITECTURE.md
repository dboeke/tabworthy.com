# Architecture Research

**Domain:** Curated content directory / creator discovery platform
**Researched:** 2026-03-05
**Confidence:** MEDIUM-HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Public Browsing Layer                        │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────────┐  │
│  │ Taxonomy   │  │ Channel   │  │ Search    │  │ Nomination  │  │
│  │ Browser    │  │ Profiles  │  │ Interface │  │ & Voting    │  │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └──────┬──────┘  │
│        │              │              │               │          │
├────────┴──────────────┴──────────────┴───────────────┴──────────┤
│                     Auth & Personalization                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ User Accounts│  │ Favorites &  │  │ Nomination           │   │
│  │ & Sessions   │  │ Lists        │  │ Permissions          │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
│         │                 │                      │              │
├─────────┴─────────────────┴──────────────────────┴──────────────┤
│                     Editorial / Admin Layer                      │
│  ┌────────────────┐  ┌──────────────┐  ┌──────────────────┐     │
│  │ Channel Editor │  │ Taxonomy     │  │ Nomination       │     │
│  │ & Profile Mgmt │  │ Manager      │  │ Review Queue     │     │
│  └───────┬────────┘  └──────┬───────┘  └────────┬─────────┘     │
│          │                  │                    │              │
├──────────┴──────────────────┴────────────────────┴──────────────┤
│                     Data & Services Layer                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │ Channels │  │ Taxonomy │  │ Users &  │  │ Nominations  │    │
│  │ Store    │  │ Store    │  │ Prefs    │  │ & Votes      │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Platform Link Registry                       │   │
│  │  (YouTube, Twitch, Patreon, Nebula, Substack, ...)       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| **Taxonomy Browser** | Renders Category > Topic hierarchy, tag filters, breadcrumbs | Taxonomy Store, Channel Store |
| **Channel Profiles** | Rich profile pages with description, best videos, platform links, related channels | Channel Store, Platform Link Registry |
| **Search Interface** | Full-text search across channels, categories, topics | Channel Store, Taxonomy Store |
| **Nomination & Voting** | Community-submitted channel nominations, upvote/downvote | Nominations Store, User Auth |
| **User Accounts** | Authentication, session management | Users Store |
| **Favorites & Lists** | Saved channels, custom lists | Users Store, Channel Store |
| **Channel Editor** | Admin CRUD for channel profiles, featured content curation | Channel Store, Platform Registry |
| **Taxonomy Manager** | Admin CRUD for categories, topics, tags | Taxonomy Store |
| **Nomination Review Queue** | Editorial workflow for approving/rejecting nominations | Nominations Store, Channel Store |
| **Platform Link Registry** | Stores platform-specific URLs and metadata per channel, platform-agnostic by design | Channel Store |

## Recommended Data Model

### Core Entities and Relationships

```
categories
  ├── id, name, slug, description, display_order, icon
  └── has_many → topics

topics
  ├── id, category_id, name, slug, description, display_order
  └── has_many → channel_topics (junction)

tags
  ├── id, name, slug, tag_group (optional grouping)
  └── has_many → channel_tags (junction)

channels
  ├── id, name, slug, tagline, description, editorial_notes
  ├── featured_at (nullable - for homepage/section featuring)
  ├── status (draft | published | archived)
  ├── created_by (editor user id)
  └── has_many → channel_topics, channel_tags, platform_links, featured_videos

channel_topics (junction)
  ├── channel_id, topic_id
  └── is_primary (boolean - primary topic for this channel)

channel_tags (junction)
  └── channel_id, tag_id

platform_links
  ├── id, channel_id, platform_id, url, handle, external_id (nullable)
  └── is_primary (boolean - main platform for this creator)

platforms
  ├── id, name, slug, base_url, icon
  └── (YouTube, Twitch, Patreon, Nebula, Substack, etc.)

featured_videos
  ├── id, channel_id, title, url, description, display_order
  └── added_by (editor user id)

related_channels (junction, self-referential)
  └── channel_id, related_channel_id, relationship_type

nominations
  ├── id, channel_name, channel_url, suggested_topic_id
  ├── reason (why this channel belongs), nominated_by (user_id)
  ├── status (pending | approved | rejected | merged)
  ├── vote_count (denormalized), reviewed_by, reviewed_at
  └── has_many → nomination_votes

nomination_votes
  └── nomination_id, user_id, created_at

users
  ├── id, email, display_name, role (viewer | contributor | editor | admin)
  └── has_many → favorites, lists, nomination_votes, nominations

favorites
  └── user_id, channel_id, created_at

lists
  ├── id, user_id, name, description, is_public
  └── has_many → list_channels (junction with display_order)
```

### Schema Design Rationale

**Two-level taxonomy with tags (not deeper nesting):** A Category > Topic hierarchy with flat tags is the right call. Deeper nesting (3+ levels) creates navigation confusion and makes URLs unwieldy. Tags provide the cross-cutting dimension -- a channel about "Woodworking" lives under Crafts > Woodworking but can be tagged "ASMR", "Beginner-Friendly", "Long-form". This mirrors the proven pattern from sites like Yelp (Category > Subcategory + attributes) and the original Yahoo Directory.

**Platform Link Registry as separate table:** Each channel has one-to-many platform links rather than hardcoded YouTube/Twitch columns. This is critical for the platform-agnostic requirement. Adding a new platform means inserting one row in `platforms`, not a schema migration.

**Denormalized vote count on nominations:** Vote counts are read-heavy and write-infrequent. Storing a denormalized `vote_count` on the nomination row avoids counting joins on every page load. Update it via trigger or application logic on vote insert/delete.

**Channel status workflow:** Draft > Published > Archived gives editors a staging area. Channels are invisible to the public until published.

## Architectural Patterns

### Pattern 1: Editorial-First with Community Input (Moderation Queue)

**What:** All community nominations flow into a review queue. Editors approve, reject, or merge (when a nomination duplicates an existing channel). Approved nominations create draft channel entries that editors then enrich before publishing.

**When to use:** Always -- this is the core curation model.

**Trade-offs:** Slower than open submission (nominations sit in queue), but maintains the editorial quality that is the whole value proposition. The queue must be designed so it does not become a bottleneck -- sorting by vote count surfaces high-demand nominations first.

**Flow:**
```
User nominates channel
    ↓
Nomination appears in public list (ranked by votes)
    ↓
Other users vote on nominations
    ↓
Editor reviews queue (sorted by votes, recency)
    ↓
Approve → Creates draft channel → Editor enriches profile → Publish
Reject → Nomination marked rejected with reason
Merge → Nomination linked to existing channel
```

### Pattern 2: Platform-Agnostic Link Registry

**What:** Instead of modeling platforms as columns on the channel table (`youtube_url`, `twitch_url`), model them as a separate `platform_links` table with a foreign key to a `platforms` lookup table.

**When to use:** Any time the set of platforms is open-ended or expected to grow.

**Trade-offs:** Slightly more complex queries (join through platform_links) vs. dead-simple column access. Worth it for extensibility. Use eager loading to avoid N+1 queries.

**Example:**
```
Channel: "Technology Connections"
  ├── platform_link: YouTube   → youtube.com/@TechConnections (primary)
  ├── platform_link: Patreon   → patreon.com/technologyconnections
  └── platform_link: Nebula    → nebula.tv/technologyconnections
```

### Pattern 3: Hybrid Server-Rendered + Client-Enhanced Pages

**What:** Server-render taxonomy browsing and channel profile pages for SEO and fast initial load. Layer on client-side interactivity for voting, favoriting, filtering, and search-as-you-type.

**When to use:** Content directories where discoverability via search engines is critical. Tabworthy's value depends on people finding it through Google searches like "best woodworking YouTube channels."

**Trade-offs:** More complex than pure SPA or pure server-rendered. Modern meta-frameworks (Next.js, Nuxt, SvelteKit, Astro) handle this well with built-in SSR + hydration. Pick a framework that makes this the default path, not a configuration burden.

### Pattern 4: Slug-Based URL Hierarchy Mirroring Taxonomy

**What:** URL structure mirrors the taxonomy: `/category-slug/topic-slug` for topic pages, `/channel/channel-slug` for channel profiles. Tags as query params: `/crafts/woodworking?tags=beginner,asmr`.

**When to use:** Always for a directory site. Clean URLs are table stakes for SEO and shareability.

**Trade-offs:** Slug uniqueness must be enforced. Category and topic slugs must not collide with reserved routes (`/search`, `/nominations`, `/account`).

## Data Flow

### Browse Flow (Primary Use Case)

```
User visits /crafts/woodworking
    ↓
Server resolves category "crafts" → topic "woodworking"
    ↓
Query: channels joined through channel_topics WHERE topic = woodworking
    ↓
Optional: filter by tags via query params
    ↓
Return: sorted channel cards with name, tagline, primary platform, tags
    ↓
User clicks channel → /channel/technology-connections
    ↓
Query: channel + platform_links + featured_videos + related_channels
    ↓
Return: full rich profile page
```

### Nomination Flow

```
Authenticated user submits nomination form
    ↓
Create nomination record (pending status)
    ↓
Nomination appears on /nominations (public, sorted by votes)
    ↓
Users vote (one vote per user per nomination, enforced by unique constraint)
    ↓
vote_count incremented on nomination record
    ↓
Editor opens admin review queue (sorted by vote_count DESC)
    ↓
Approve → insert channel (draft) + link to nomination
Reject → update status, add rejection reason
    ↓
Editor enriches draft channel → publishes
```

### Search Flow

```
User types query in search bar
    ↓
Client sends query to search endpoint
    ↓
Search across: channel names, descriptions, topic names, tag names
    ↓
Return ranked results grouped by type (channels, topics, categories)
    ↓
User clicks result → navigates to channel or topic page
```

### Key Data Flows Summary

1. **Browse (read-heavy):** Taxonomy hierarchy -> filtered channel lists -> channel profiles. This is 80%+ of traffic. Optimize with database indexes on topic/tag junctions and consider page-level caching.
2. **Nominate + Vote (write-light):** User creates nomination -> other users vote -> editor reviews. Low volume relative to browsing. No real-time requirements.
3. **Editorial (admin):** Editor creates/edits channels, manages taxonomy, reviews nominations. Low volume, high importance. Needs good admin UX but not performance optimization.
4. **Personalization (per-user):** Favorites and lists are user-scoped reads. Simple queries with user_id filter.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Monolith with server-rendered pages. Single database. No caching needed beyond browser defaults. This handles Tabworthy's initial scale easily. |
| 1k-100k users | Add page-level caching (CDN or reverse proxy) for taxonomy and channel pages since they change infrequently. Add full-text search index (Postgres full-text or lightweight search service). Database indexes on junction tables become important. |
| 100k+ users | CDN for all public pages with cache invalidation on editorial changes. Dedicated search service if Postgres full-text becomes slow. Consider read replicas if database becomes bottleneck. Nomination voting may need rate limiting. |

### Scaling Priorities

1. **First bottleneck: Taxonomy/channel page load times.** These are the most-hit pages. Fix with CDN caching and database indexes on `channel_topics`, `channel_tags`, `platform_links` foreign keys.
2. **Second bottleneck: Search performance.** Full-text search across channels + taxonomy gets slow as the directory grows past a few thousand channels. Postgres `tsvector` handles this well up to ~50k records. Beyond that, consider a dedicated search index.
3. **Voting is unlikely to bottleneck.** Even popular nominations will see hundreds of votes, not thousands per second. Simple unique constraint + denormalized count is sufficient.

## Anti-Patterns

### Anti-Pattern 1: Deep Taxonomy Nesting

**What people do:** Build 3, 4, or 5 levels of categories thinking it adds precision (Category > Subcategory > Sub-subcategory > Topic).
**Why it's wrong:** Users get lost. Navigation becomes a tree-exploration exercise. Breadcrumbs become unwieldy. Content ends up miscategorized because editors disagree on which sub-sub-category fits. The Yahoo Directory itself struggled with this as it grew.
**Do this instead:** Two levels (Category > Topic) plus flat tags for cross-cutting concerns. Tags give you the filtering power without the navigation complexity.

### Anti-Pattern 2: Hardcoded Platform Columns

**What people do:** Add `youtube_url`, `twitch_url`, `patreon_url` as columns on the channel table.
**Why it's wrong:** Every new platform requires a schema migration. The UI must be updated to show the new column. Channels without a given platform have NULL columns cluttering the schema. Queries to "find all channels on platform X" require scanning every platform column.
**Do this instead:** Platform Link Registry pattern (see Pattern 2 above). One `platform_links` table, one `platforms` lookup table.

### Anti-Pattern 3: Open Submission Without Editorial Gate

**What people do:** Let anyone add channels directly to the directory, planning to "moderate later."
**Why it's wrong:** Quality collapses immediately. Spam and self-promotion flood the directory. The editorial voice -- the whole value proposition -- is lost. Retroactive moderation is far harder than proactive curation.
**Do this instead:** Community can nominate and vote, but only editors can publish channels to the directory. The nomination queue is the pressure valve.

### Anti-Pattern 4: Building Full CMS When You Need a Directory

**What people do:** Start with a general-purpose CMS (WordPress, Strapi) and try to bend it into a directory with custom post types, taxonomies, and plugins.
**Why it's wrong:** The data model for a directory (channels, platform links, nominations, votes, taxonomy with ordering) is specific enough that you spend more time fighting the CMS than building. Custom fields and relationships become a tangled mess of plugin dependencies.
**Do this instead:** Build the data model directly in your database. Use a web framework that gives you routing, auth, and rendering without imposing a content model. The schema above is straightforward -- it does not need a CMS abstraction layer.

### Anti-Pattern 5: Fetching External Platform Data at Request Time

**What people do:** Pull subscriber counts, video thumbnails, or channel metadata from YouTube/Twitch APIs on every page load.
**Why it's wrong:** External API rate limits, latency spikes, and outages make your pages unreliable. Platform APIs change without notice. Your page load time becomes dependent on third-party response times.
**Do this instead:** If you want external data (subscriber counts, thumbnails), fetch it via a background job on a schedule and cache it locally. For v1, editorial-entered data (description, best videos, platform URLs) is sufficient and avoids API complexity entirely.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| YouTube Data API | Background fetch (optional, not for v1) | Rate limited to 10k units/day on free tier. Only needed if you want to auto-populate subscriber counts or thumbnails. Editors can manually enter this data initially. |
| Twitch API | Background fetch (optional, not for v1) | OAuth required. Same pattern as YouTube -- defer until the manual approach becomes painful. |
| Authentication Provider | OAuth or magic link via framework auth | Do not build custom auth. Use framework-provided auth (NextAuth, Lucia, Supabase Auth, etc.). Email + social login covers the user base. |
| Search Index | Postgres full-text initially, Meilisearch/Typesense if needed later | Start with what the database gives you. Dedicated search is a scaling optimization, not a launch requirement. |
| CDN | Reverse proxy cache for public pages | Vercel, Cloudflare, or Netlify provide this automatically for SSR frameworks. Cache taxonomy and channel pages aggressively. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Public site <-> Data layer | Server-side queries (SSR) + API routes for interactive features | Taxonomy browsing and channel pages are server-rendered. Voting, favoriting, search-as-you-type use API routes. |
| Admin/Editorial <-> Data layer | Authenticated API routes or server actions | Protected by role-based access (editor/admin roles). Same database, same app -- no separate admin service needed at this scale. |
| Nomination system <-> Channel system | Nomination approval creates a draft channel | The nomination and channel are linked but separate entities. Approval is a one-way flow from nomination to channel draft. |
| User preferences <-> Public browsing | Session-based personalization | Favorites and lists are loaded per-session and overlaid on public pages. No need for separate personalization service. |

## Build Order (Dependencies)

The components have clear dependencies that suggest a build order:

```
Phase 1: Foundation
  ├── Database schema (categories, topics, tags, channels, platforms, platform_links)
  ├── Taxonomy browser (Category > Topic pages)
  └── Channel profiles (rich profile pages)

  WHY FIRST: Everything else depends on the core data model and browsing experience.
  These are the "is this useful?" proof point.

Phase 2: Search + Editorial Tools
  ├── Search (requires channels + taxonomy to exist)
  ├── Admin channel editor (requires channel schema)
  └── Admin taxonomy manager (requires taxonomy schema)

  WHY SECOND: Editors need tools to manage content. Search makes the directory
  usable beyond browsing. Both depend on Phase 1 data being in place.

Phase 3: Community Layer
  ├── User accounts + authentication
  ├── Nomination submission + voting (requires auth)
  └── Nomination review queue (requires nominations + admin tools)

  WHY THIRD: Community features require both the content to exist (so nominations
  make sense) and admin tools (so editors can process the queue). Auth is only
  needed once community features arrive -- public browsing works without it.

Phase 4: Personalization
  ├── Favorites (requires auth + channels)
  └── Custom lists (requires auth + channels)

  WHY FOURTH: Personalization is valuable but not core. It requires both auth
  and a populated directory to be meaningful. Ship it after the directory has
  enough content to save.
```

## Sources

- [Content Taxonomy: The Invisible Infrastructure Powering Digital Experiences (Credera)](https://www.credera.com/insights/content-taxonomy-the-invisible-infrastructure-powering-digital-experiences)
- [How to Design Taxonomies When Content Belongs to Multiple Categories (Medium)](https://medium.com/@trishita.singh_38113/how-to-design-taxonomies-when-content-belong-to-multiple-categories-5528bc66f687)
- [Taxonomy 101: Definition, Best Practices (Nielsen Norman Group)](https://www.nngroup.com/articles/taxonomy-101/)
- [Editorial Workflow Design (ePublishing)](https://www.epublishing.com/news/2025/apr/23/editorial-workflow-design/)
- [Best Social Media APIs for Cross-Platform Data Aggregation](https://www.companionlink.com/blog/2025/12/best-5-social-media-apis-for-cross-platform-data-aggregation/)
- [Product Hunt Alternatives and Directory Architecture Discussion](https://www.producthunt.com/ask/244-what-is-the-best-way-to-build-a-directory-site-with-voting-functionality-similar-to-product-hunt)

---
*Architecture research for: Tabworthy -- curated video channel directory*
*Researched: 2026-03-05*

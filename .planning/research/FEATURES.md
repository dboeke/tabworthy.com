# Feature Landscape

**Domain:** Curated video channel directory / discovery platform
**Researched:** 2026-03-05
**Confidence:** HIGH (well-established domain with clear reference platforms)

## Reference Platforms Analyzed

| Platform | Relevance | Key Lesson |
|----------|-----------|------------|
| Yahoo Directory (1994-2014) | Direct inspiration | Browsable hierarchy + human curation is the core value prop |
| Letterboxd | Social discovery model | Ratings, reviews, watchlists, and lists create retention loops |
| Product Hunt | Community curation model | Upvoting + commenting surfaces quality; editorial + community blend |
| Favoree | Closest competitor | YouTube-focused channel reviews/ratings; lacks editorial curation and multi-platform support |
| ChannelCrawler | Data-driven discovery | Filter-heavy approach works for power users but lacks editorial voice |
| DMOZ / Open Directory | Historical precedent | Volunteer-curated directories can scale but need quality control |

## Table Stakes

Features users expect. Missing = product feels incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Browsable taxonomy (Category > Topic)** | Core value prop; Yahoo Directory's defining feature. Users expect to drill down by interest area. | Medium | Two-level hierarchy per PROJECT.md. Must feel fast and intuitive. Breadcrumbs essential. |
| **Channel profile pages** | Rich profiles make Tabworthy a destination, not a link farm. Users expect name, description, platform links, subscriber/follower context. | Medium | Must include: channel name, description, key platform links, representative content highlights, related channels. |
| **Search** | Users expect to find channels by name or topic. Absence feels broken even if browsing is primary mode. | Medium | Full-text search across channel names, descriptions, categories, topics, and tags. Autocomplete strongly recommended. |
| **Tag-based filtering within topics** | Once in a topic, users need to narrow further. Standard UX pattern from any directory/e-commerce site. | Low-Med | Tags are cross-cutting attributes (e.g., "beginner-friendly", "long-form", "weekly uploads"). Filter UI within topic pages. |
| **Platform badges/icons on listings** | Users need to know where a channel lives (YouTube, Twitch, Nebula, etc.) at a glance. | Low | Visual indicators on cards and profile pages. Platform-agnostic data model per PROJECT.md. |
| **Mobile-responsive browsing** | Web-first per PROJECT.md, but mobile traffic dominates. Non-responsive = unusable for most visitors. | Medium | Not a native app, but responsive web is non-negotiable. |
| **Public browsing without login** | Gating content behind auth kills discovery. Users expect to browse freely. | Low | Explicitly required in PROJECT.md. Auth only for personalization features. |
| **Shareable URLs** | Every category, topic, and channel profile needs a stable, shareable URL. Critical for SEO and social sharing. | Low | Clean URL structure: `/category/topic`, `/channel/channel-name`. |
| **"Best of" / featured content on channel profiles** | Users want to know where to start. A channel profile without highlighted content is just metadata. | Low-Med | Editorial picks of 3-5 representative videos/streams/posts per channel. |
| **Related channels** | "If you like X, try Y" is expected in any discovery context. | Medium | Can be editorial (manually curated) or tag-based. Editorial is higher quality and fits the curation model. |

## Differentiators

Features that set Tabworthy apart. Not expected, but create competitive advantage.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Editorial voice / staff picks** | Favoree and ChannelCrawler are data-driven. Tabworthy's human curation IS the differentiator. Short editorial blurbs explaining WHY a channel is worth watching. | Low-Med | This is the Yahoo Directory lesson: the value is the human judgment, not the data. Every listing should have a brief editorial note. |
| **Community nominations with editorial gate** | Product Hunt's model: community surfaces candidates, editors decide what gets in. Maintains quality while leveraging crowd knowledge. | Medium-High | Nomination form + moderation queue + editorial review workflow. Nominations visible (ranked at bottom of category pages or dedicated section per PROJECT.md). |
| **Community voting on nominations** | Lets community signal which nominations editors should prioritize. Creates engagement without sacrificing editorial control. | Medium | Upvote-only (not downvote). Vote count informs editorial priority but doesn't auto-promote. |
| **User favorites / "my channels" list** | Letterboxd's watchlist model. Personal list of channels to follow up on. Simple but creates return visits. | Low-Med | Requires user accounts. Simple add/remove. Viewable on user profile or dashboard. |
| **User-created lists** | Letterboxd's killer feature. "My favorite cooking channels", "Best science explainers". Shareable, discoverable. | Medium-High | Powerful for SEO and virality. Defer to post-MVP -- favorites list covers the basic need first. |
| **"New this week/month" feed** | Freshness signal. Shows the directory is alive and actively curated. Product Hunt's daily launches model adapted for a directory. | Low | Simple reverse-chronological feed of recently added channels. Low effort, high signal. |
| **Cross-platform channel grouping** | A creator on YouTube AND Twitch AND Patreon appears as one entity with multiple platform presences. No other directory does this well. | Medium-High | Data modeling challenge. Needs a "creator" entity that groups platform-specific channels. Strong differentiator given multi-platform creator economy. |
| **Seasonal / thematic collections** | "Cozy channels for winter", "Back to school learning". Curated editorial collections that go beyond taxonomy. | Low-Med | Like Letterboxd's curated lists or Product Hunt's collections. Time-boxed editorial features. |
| **SEO-optimized directory pages** | Schema markup (ItemList, CreativeWork), clean URLs, meta descriptions per category/topic. Directories are inherently SEO-friendly when done right. | Medium | JSON-LD structured data. Category and topic pages as landing pages. 20-40% CTR improvement with rich results. |
| **Channel "why watch" summaries** | Beyond description -- a 2-3 sentence editorial pitch for WHY this channel is worth your time. | Low | The most important editorial content on each profile. Differentiates from Favoree's data-driven approach. |

## Anti-Features

Features to explicitly NOT build. These are traps that would dilute the product or create unsustainable maintenance burden.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Embedded video playback** | Explicitly out of scope per PROJECT.md. Turns Tabworthy into a content aggregator, creates licensing complexity, and competes with the platforms themselves. | Link out to channels on their native platforms. Tabworthy is the directory, not the player. |
| **User reviews / ratings of channels** | Favoree already does this and it creates moderation burden, toxic dynamics, and quality issues. Tabworthy's value is editorial curation, not crowdsourced ratings. | Editorial "why watch" summaries replace the need for user reviews. Community input happens through nominations, not ratings. |
| **Real-time chat or social features** | Out of scope per PROJECT.md. Social features create moderation burden and distract from the directory's core purpose. | Nominations and voting provide sufficient community interaction. |
| **Creator self-service / profile claiming** | Out of scope per PROJECT.md. Opens the door to spam, pay-to-play dynamics, and undermines editorial independence. | Editorial team maintains all profiles. Creators can submit corrections via a simple contact form later. |
| **Algorithmic recommendations** | "Because you viewed X" undermines the human-curated value prop. Algorithms are what Tabworthy exists as an alternative to. | Use editorial "related channels" and curated collections instead. Manual curation is the feature, not a limitation. |
| **Comments on channel profiles** | Creates moderation burden with low value. Comments on a directory listing don't serve discovery. | Channel profiles are editorial content, not discussion spaces. |
| **Automated channel ingestion / scraping** | Bulk importing channels destroys editorial quality. Every channel should be intentionally selected. | Manual editorial additions, informed by community nominations. Quality over quantity. |
| **Notifications / email digests** | Premature optimization. Build audience and retention through content quality first, not push mechanisms. | Defer entirely until post-launch validation shows retention patterns. |
| **Monetization features** | Explicitly out of scope for v1 per PROJECT.md. Passion project. | Focus on building a quality directory. Monetization is a future concern. |
| **Follower/following social graph** | Letterboxd model doesn't fit a directory. Users come to discover channels, not to follow other users. | User accounts for personalization (favorites, lists) without social networking overhead. |

## Feature Dependencies

```
Public browsing (no auth) ─── required for all browsing features
    |
    ├── Browsable taxonomy (Category > Topic)
    |       └── Tag-based filtering within topics
    |
    ├── Search
    |       └── Autocomplete (enhancement)
    |
    ├── Channel profile pages
    |       ├── Platform badges/icons
    |       ├── "Best of" / featured content
    |       ├── Related channels
    |       ├── Editorial "why watch" summaries
    |       └── Cross-platform channel grouping
    |
    └── Shareable URLs (all pages)

User accounts ─── gate for personalization
    ├── Favorites / "my channels" list
    ├── User-created lists (post-MVP)
    ├── Community nominations (submit)
    └── Community voting on nominations

Editorial tools (admin) ─── gate for curation workflow
    ├── Channel CRUD (create/edit/archive)
    ├── Taxonomy management (categories, topics, tags)
    ├── Nomination review queue
    ├── Editorial summaries / "why watch"
    └── Collections / thematic features

Nomination system
    ├── Requires: User accounts (to submit)
    ├── Requires: Editorial tools (to review)
    └── Enables: Community voting
```

## MVP Recommendation

**Prioritize (Phase 1 -- Core Directory):**
1. Browsable taxonomy (Category > Topic) with tag filtering -- this IS the product
2. Channel profile pages with editorial summaries, platform links, best-of content, related channels
3. Search across channels, categories, and topics
4. Public browsing without auth requirement
5. SEO-optimized pages with structured data
6. "New this week" additions feed -- signals the directory is alive

**Prioritize (Phase 2 -- Community + Personalization):**
1. User accounts (lightweight auth)
2. Favorites / "my channels" list
3. Community nominations with editorial review queue
4. Community voting on nominations

**Defer:**
- **User-created lists**: High complexity, requires mature user base. Favorites covers the immediate need.
- **Cross-platform channel grouping**: Valuable differentiator but data modeling is complex. Start with channels-as-entries (one per platform presence), group editorially via "related channels" initially.
- **Seasonal / thematic collections**: Nice editorial feature but not core. Add once the base directory has enough content to curate from.
- **Autocomplete search**: Enhancement that can be layered on after basic search works.

## Competitive Gaps (Tabworthy's Opportunity)

| Gap in Market | Who Falls Short | Tabworthy's Approach |
|---------------|-----------------|---------------------|
| No editorial voice in channel discovery | Favoree (data-driven), ChannelCrawler (filter-driven) | Every listing has a human-written "why watch" summary |
| YouTube-only discovery | Favoree, ChannelCrawler | Platform-agnostic from day one |
| No browsable hierarchy | Favoree (search/filter only) | Category > Topic taxonomy inspired by Yahoo Directory |
| Community input without quality gate | Product Hunt (community-driven launches can be gamed) | Nominations inform editors, but editors decide |
| No cross-platform creator view | All competitors treat each platform separately | Eventual cross-platform grouping (post-MVP) |

## Sources

- [Yahoo Directory - Wikipedia](https://en.wikipedia.org/wiki/Yahoo_Directory)
- [Yahoo Directory - ClickRank](https://www.clickrank.ai/seo-glossary/y/what-is-yahoo-directory-historical/)
- [Bring back the human-curated web directory - Jack Yan](https://jackyan.com/blog/2023/09/bring-back-the-human-curated-web-directory/)
- [Letterboxd](https://letterboxd.com/)
- [Letterboxd - Wikipedia](https://en.wikipedia.org/wiki/Letterboxd)
- [Product Hunt](https://www.producthunt.com/)
- [Favoree - What is Favoree](https://blog.favoree.io/what-is-favoree/)
- [Favoree is like IMDB but for YouTube - Innovation Origins](https://innovationorigins.com/en/favoree-lets-you-review-youtube-videos/)
- [ChannelCrawler](https://channelcrawler.com/)
- [Favoree on AlternativeTo](https://alternativeto.net/software/favoree/about/)
- [Schema Markup in 2026 - ALM Corp](https://almcorp.com/blog/schema-markup-detailed-guide-2026-serp-visibility/)
- [Search Filters UX Best Practices - Algolia](https://www.algolia.com/blog/ux/search-filter-ux-best-practices)
- [Future of Product Discovery - OpenHunts](https://openhunts.com/blog/future-product-discovery-platforms-2025)

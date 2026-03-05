# Technology Stack

**Project:** Tabworthy - Human-Curated Video Channel Directory
**Researched:** 2026-03-05
**Overall Confidence:** HIGH

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Next.js | 16.1.x | Full-stack framework | Industry standard for content-heavy React apps. App Router with RSC gives us server-rendered taxonomy pages (great for SEO on a browsable directory), Server Actions for nominations/voting, and ISR for caching curated pages that change infrequently. Turbopack is now default and stable. | HIGH |
| React | 19.x | UI library | Ships with Next.js 16. Server Components reduce client bundle for browse-heavy pages where most content is read-only. | HIGH |
| TypeScript | 5.x | Type safety | Non-negotiable for any greenfield project in 2026. Catches schema/API mismatches early. | HIGH |

### Database & Backend

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Supabase | Latest | Backend platform (Postgres, Auth, Storage) | Provides managed PostgreSQL, built-in auth (email, OAuth, magic links), file storage for channel thumbnails, and real-time subscriptions for nomination voting. Free tier (500MB DB, 50K MAUs) is generous enough for launch. Eliminates need to build auth, file uploads, and API layers from scratch. | HIGH |
| Drizzle ORM | 0.45.x | Database ORM | Chosen over Prisma for: tiny bundle (7.4KB vs Prisma's engine), zero cold-start overhead on serverless/edge, SQL-like TypeScript API that maps cleanly to the relational taxonomy model (categories -> topics -> channels -> tags). Code-first schema definition means no separate schema language. | HIGH |
| PostgreSQL | 15+ (via Supabase) | Primary database | Relational model is ideal for hierarchical taxonomy (Category > Topic), many-to-many relationships (channels <-> tags, channels <-> platforms), and full-text search. Supabase manages it. | HIGH |

### Styling & UI

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tailwind CSS | 4.x | Utility-first CSS | v4 is 5x faster builds, zero-config, CSS-native. Standard pairing with Next.js. Creative team can work with design tokens that map to Tailwind variables. | HIGH |
| shadcn/ui | Latest | Component library | Not a dependency -- copies components into your project. Provides accessible, composable primitives (dialog, dropdown, tabs, command palette) built on Radix UI. Avoids vendor lock-in. New unified `radix-ui` package (Feb 2026) simplifies dependencies. | HIGH |
| Lucide React | Latest | Icons | Default icon set for shadcn/ui. Consistent, tree-shakeable. | HIGH |

### Search

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| PostgreSQL Full-Text Search | (via Supabase) | Phase 1 search | For MVP, Postgres `tsvector`/`tsquery` handles search across channels, categories, and topics without additional infrastructure. Supabase exposes this through its client. Good enough for hundreds to low thousands of channels. | HIGH |
| Meilisearch | 1.35.x | Phase 2+ search (when needed) | Upgrade path when search needs outgrow Postgres FTS. Typo-tolerant, faceted filtering (by platform, category, tag), sub-50ms responses. Self-hostable and free. Rust-based, far simpler to operate than Elasticsearch. Deploy only when search becomes a core UX differentiator. | MEDIUM |

### Authentication

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Supabase Auth | (bundled) | User authentication | Already included with Supabase. Supports email/password, magic links, and OAuth providers (Google, GitHub, etc.). SSR-compatible with Next.js App Router via `@supabase/ssr`. Eliminates need for separate Auth.js/NextAuth setup. RLS (Row Level Security) in Postgres means auth rules live in the database, not scattered across API routes. | HIGH |

### State Management

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| React Server Components | (built-in) | Server state | Most of Tabworthy is read-heavy (browsing taxonomy, viewing channel profiles). RSC handles this without client-side state. | HIGH |
| Zustand | 5.x | Client state (minimal) | Only needed for: search UI state, nomination form drafts, UI preferences. 3KB, zero boilerplate. Most pages won't need it -- RSC covers the common case. | MEDIUM |

### Deployment & Infrastructure

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Vercel | - | Hosting & CDN | Native Next.js support (they build it). Free tier handles hobby projects. ISR, edge middleware, and image optimization work out of the box. Passion project = minimize ops overhead. | HIGH |
| Vercel Analytics | - | Performance monitoring | Built-in, zero-config with Vercel deployment. Web Vitals tracking for a browse-heavy site matters. | MEDIUM |

### Development Tools

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Biome | Latest | Linting & formatting | Replaces ESLint + Prettier with a single, faster tool. Rust-based, opinionated defaults. Next.js 16 deprecated `next lint` -- Biome fills the gap. | MEDIUM |
| Drizzle Kit | 0.45.x | Database migrations | Companion CLI for Drizzle ORM. Generates SQL migrations from schema changes or pushes directly. | HIGH |
| Supabase CLI | Latest | Local development | Run Supabase locally (Postgres, Auth, Storage) for dev/test without hitting the cloud. | HIGH |

### Content & Media

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Supabase Storage | (bundled) | Channel thumbnails & assets | S3-compatible object storage included with Supabase. CDN-backed. No need for separate Cloudinary/Uploadthing for a directory site. | HIGH |
| Next.js Image | (built-in) | Image optimization | Automatic WebP/AVIF conversion, lazy loading, responsive sizing for channel thumbnails in grid layouts. | HIGH |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Next.js 16 | Remix / SvelteKit | Next.js has the largest ecosystem, best Vercel integration, and RSC for content-heavy pages. Remix is strong for forms but Tabworthy is read-heavy. SvelteKit is excellent but smaller ecosystem and harder to hire for. |
| ORM | Drizzle | Prisma | Prisma 7 closed the perf gap but still has larger bundle, separate schema language, and heavier cold starts. Drizzle's SQL-like API is more natural for a relational taxonomy model. |
| Database | Supabase (Postgres) | PlanetScale / Neon | PlanetScale dropped its free tier. Neon is good but Supabase bundles auth + storage + realtime, reducing total service count. For a passion project, fewer services = less ops. |
| Auth | Supabase Auth | Auth.js v5 (NextAuth) | Adding Auth.js on top of Supabase creates two auth systems. Supabase Auth + RLS is more cohesive. Auth.js makes sense if you're NOT using Supabase. |
| CSS | Tailwind 4 | CSS Modules / Vanilla Extract | Tailwind is the standard pairing with shadcn/ui. Creative team can work with design tokens. CSS Modules add friction for rapid iteration. |
| Components | shadcn/ui | Radix Primitives / Headless UI | shadcn/ui wraps Radix with sensible defaults and Tailwind styling. Using raw Radix means rebuilding what shadcn already provides. |
| Search | Postgres FTS -> Meilisearch | Algolia / Typesense | Algolia is SaaS-only and expensive at scale. Typesense is viable but Meilisearch has better DX, simpler setup, and Rust performance. Start with Postgres FTS to avoid premature complexity. |
| State | Zustand (minimal) | Redux Toolkit / Jotai | Redux is overkill for a content directory. Jotai's atomic model adds complexity without benefit here -- Tabworthy's client state is simple (search input, UI toggles). |
| Hosting | Vercel | Railway / Cloudflare Pages | Vercel is purpose-built for Next.js. Railway/Render are better for custom backends. Cloudflare Pages has Next.js limitations. For a passion project, Vercel free tier + zero config wins. |
| Icons | Lucide | Heroicons / Phosphor | Lucide is the default for shadcn/ui. Using a different set means fighting the defaults. |
| Lint/Format | Biome | ESLint + Prettier | Biome is faster (Rust), single tool, and Next.js 16 deprecated built-in linting. Fewer config files. |

## What NOT to Use

| Technology | Why Not |
|------------|---------|
| MongoDB | Relational data (taxonomy, tags, platforms) needs joins. Document DB is wrong model. |
| Firebase | Vendor lock-in, no real Postgres, weaker querying for relational data. |
| tRPC | Adds complexity for a project where Server Actions + Supabase client cover API needs. No separate API consumers (no mobile app). |
| GraphQL | Same reason as tRPC -- no separate consumers that benefit from GraphQL's flexibility. REST/Server Actions are simpler. |
| Contentful / Sanity CMS | The taxonomy IS the product, not blog content. CMS adds indirection. Curators should work directly with the data model. |
| Redux | Massive overkill. Most state is server-side (RSC). Client state is trivial. |
| Chakra UI / MUI | Opinionated design systems fight against custom creative team designs. shadcn/ui is unstyled/customizable. |
| Docker (for dev) | Supabase CLI handles local Postgres/Auth. Docker adds friction for a solo/small team passion project. |

## Installation

```bash
# Create Next.js project
npx create-next-app@latest tabworthy --typescript --tailwind --app --src-dir

# Core dependencies
npm install @supabase/supabase-js @supabase/ssr drizzle-orm postgres

# UI
npx shadcn@latest init
npm install lucide-react

# State (add when needed, not upfront)
npm install zustand

# Dev dependencies
npm install -D drizzle-kit supabase @types/node
npm install -D @biomejs/biome
```

## Architecture Notes for Roadmap

The stack is designed around three principles:

1. **Read-heavy optimization**: RSC + ISR means taxonomy/channel pages are server-rendered and cached. Users browsing the directory get fast, SEO-friendly pages without client-side data fetching.

2. **Progressive complexity**: Start with Postgres FTS, upgrade to Meilisearch when needed. Start with Supabase free tier, upgrade to Pro ($25/mo) when traffic grows. No premature infrastructure.

3. **Editorial workflow**: Supabase's dashboard + Drizzle's migration system give curators a path to manage content. Phase 1 can use Supabase Studio as a basic admin UI before building a custom editorial interface.

## Sources

- [Next.js 16 releases](https://github.com/vercel/next.js/releases) - Version verification
- [Next.js best practices 2025](https://www.raftlabs.com/blog/building-with-next-js-best-practices-and-benefits-for-performance-first-teams/)
- [Drizzle ORM npm](https://www.npmjs.com/package/drizzle-orm) - v0.45.1 current
- [Drizzle vs Prisma 2026](https://designrevision.com/blog/prisma-vs-drizzle) - Comparison analysis
- [Drizzle vs Prisma deep dive](https://makerkit.dev/blog/tutorials/drizzle-vs-prisma) - Performance data
- [Supabase pricing](https://supabase.com/pricing) - Free tier limits verified
- [Supabase pricing breakdown](https://uibakery.io/blog/supabase-pricing) - 2026 plan details
- [Tailwind CSS v4 release](https://tailwindcss.com/blog/tailwindcss-v4) - January 2025
- [shadcn/ui changelog](https://ui.shadcn.com/docs/changelog) - Feb 2026 unified Radix
- [Meilisearch releases](https://github.com/meilisearch/meilisearch/releases) - v1.35.x current
- [Meilisearch vs Algolia vs Typesense](https://www.meilisearch.com/blog/algolia-vs-typesense) - Search comparison
- [Zustand vs Jotai 2026](https://viprasol.com/blog/state-management-react-2026/) - State management comparison
- [Vercel alternatives comparison](https://www.digitalocean.com/resources/articles/vercel-alternatives) - Hosting options
- [Next.js upgrading to v16](https://nextjs.org/docs/app/guides/upgrading/version-16) - next lint deprecation

# Phase 1: Core Directory - Research

> **IMPORTANT: OUTDATED DATABASE REFERENCES**
> This research was conducted before the tech stack decision was finalized. All references to **Supabase** (client libraries, RLS policies, `supabase gen types`, Supabase CLI, `@supabase/ssr`, etc.) are **outdated and should be ignored**.
>
> The actual implementation uses **Drizzle ORM + Neon (serverless Postgres)**. See `01-CONTEXT.md` for the locked decision. Plans 01-04 reflect the correct stack.
>
> Sections that remain valid: project structure, JSON-LD patterns, Tailwind v4, shadcn/ui, Next.js App Router patterns, data model design, and anti-patterns.

**Researched:** 2026-03-05
**Domain:** Next.js App Router + Supabase content directory with taxonomy browsing, rich channel profiles, and SEO
**Confidence:** HIGH

## Summary

Phase 1 builds the browsable core of Tabworthy: a two-level taxonomy (Category > Topic) with tag filtering, rich channel profile pages, and platform-agnostic data modeling. The tech stack is Next.js 16 (App Router) deployed on Vercel with Supabase (PostgreSQL) as the database, Tailwind CSS v4 for styling, and shadcn/ui for components.

The project is greenfield -- no existing code. The .gitignore already defines a Next.js + Vercel + TypeScript project structure. The data model is the critical foundation: it must support multi-platform creators as single entities, many-to-many tag relationships, and a clean two-level category/topic hierarchy. All pages are public (no auth in Phase 1), statically generated or ISR-cached for performance, with JSON-LD structured data for SEO.

**Primary recommendation:** Start with the Supabase schema and type generation, then build pages top-down from the taxonomy hierarchy (homepage > category > topic > channel profile), using Next.js static generation with ISR for content freshness.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TAXO-01 | Two-level hierarchy browsing (Category > Topic) | Database schema with categories/topics tables; Next.js dynamic routes `/categories/[slug]` and `/categories/[slug]/[topic]` |
| TAXO-02 | Tag-based filtering within topics | Many-to-many channel_tags join table; client-side or URL-param filtering on topic pages |
| TAXO-03 | Breadcrumb navigation | Reusable Breadcrumb component using category/topic hierarchy; BreadcrumbList JSON-LD |
| TAXO-04 | Clean shareable URLs | Next.js App Router file-based routing with slug-based dynamic segments |
| CHAN-01 | Rich channel profile (name, description, platform links) | Channels table with creator entity grouping; platform_links table for multi-platform |
| CHAN-02 | Platform badges/icons | Platform reference table with icon metadata; badge component |
| CHAN-03 | Editorial "best of" content highlights | Content_highlights table (3-5 per channel) with title, URL, description |
| CHAN-04 | Related channels | Related_channels join table (editor-curated, not algorithmic) |
| CHAN-05 | Human-written "why watch" editorial summary | `editorial_summary` text field on channels table |
| CHAN-06 | Multi-platform creator grouping | Creators table as parent entity; channels belong to a creator |
| TECH-01 | Mobile-responsive layout | Tailwind CSS v4 responsive utilities; shadcn/ui responsive components |
| TECH-02 | JSON-LD structured data | schema-dts types; BreadcrumbList, ItemList, Organization schemas per page type |
| TECH-03 | Public browsing without login | No auth middleware in Phase 1; all pages publicly accessible; Supabase RLS allows anonymous reads |
| TECH-04 | Platform-agnostic data model | Platforms reference table; channels link to platforms via foreign key; adding a platform = inserting a row |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.x | Full-stack React framework | Current stable; App Router with Turbopack, React Compiler; Vercel-native deployment |
| React | 19.x | UI library | Ships with Next.js 16; Server Components for data fetching |
| Supabase | latest | PostgreSQL database + client | Managed Postgres with auto-generated REST API, RLS, type generation |
| @supabase/ssr | latest | Server-side Supabase client | Official package for Next.js App Router server components |
| @supabase/supabase-js | latest | Supabase JS client | Core client library for database queries |
| TypeScript | 5.x | Type safety | Ships with Next.js; Supabase generates types from schema |

### Styling & UI
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | 4.x | Utility-first CSS | CSS-first config, automatic content detection, 70% smaller output vs v3 |
| shadcn/ui | latest | Component library | Copies source into project; works with Server Components; accessible by default |
| lucide-react | latest | Icons | Default icon set for shadcn/ui; includes platform-relevant icons |

### SEO & Structured Data
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| schema-dts | latest | TypeScript types for schema.org | Type-safe JSON-LD generation; recommended by Next.js docs |

### Development
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| supabase (CLI) | latest | Local dev, migrations, type generation | `supabase gen types typescript` for end-to-end type safety |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase | Prisma + raw Postgres | More control but loses auto REST API, Studio admin UI, and managed hosting |
| shadcn/ui | Radix UI directly | shadcn wraps Radix with pre-styled components; saves significant time |
| Tailwind v4 | Tailwind v3 | v4 is current for new projects; simpler config, smaller output |

**Installation:**
```bash
npx create-next-app@latest tabworthy --typescript --tailwind --eslint --app --src-dir
cd tabworthy
npx shadcn@latest init
npm install @supabase/supabase-js @supabase/ssr schema-dts
npm install -D supabase
npx supabase init
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Homepage - category grid
│   ├── categories/
│   │   ├── [slug]/
│   │   │   ├── page.tsx        # Category page - topic list + channel listings
│   │   │   └── [topic]/
│   │   │       └── page.tsx    # Topic page - filtered channel listings
│   ├── channels/
│   │   └── [slug]/
│   │       └── page.tsx        # Channel profile page
│   └── not-found.tsx
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── taxonomy/               # Breadcrumbs, CategoryCard, TopicList
│   ├── channels/               # ChannelCard, ChannelProfile, PlatformBadge
│   └── seo/                    # JsonLd wrapper components
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server component client
│   │   └── types.ts            # Re-export generated types
│   ├── schemas/                # JSON-LD schema builders
│   └── utils.ts
└── types/
    └── database.types.ts       # Auto-generated by Supabase CLI
```

### Pattern 1: Data Model -- Creator-Channel Separation
**What:** Creators are the parent entity; channels are platform-specific presences belonging to a creator. This satisfies CHAN-06 (multi-platform grouping).
**When to use:** Always -- this is the core data model.

```sql
-- Platforms reference table (TECH-04: platform-agnostic)
CREATE TABLE platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,          -- 'youtube', 'twitch', 'nebula', etc.
  display_name TEXT NOT NULL,         -- 'YouTube', 'Twitch', 'Nebula'
  icon_url TEXT,
  base_url TEXT,                      -- 'https://youtube.com'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Categories (top level of taxonomy)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Topics (second level, belongs to a category)
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(category_id, slug)
);

-- Creators (the person/entity behind channels)
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Channels (a creator's presence on a specific platform)
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id),
  platform_id UUID NOT NULL REFERENCES platforms(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  platform_url TEXT NOT NULL,         -- Full URL to the channel on the platform
  description TEXT,
  editorial_summary TEXT,             -- CHAN-05: human-written "why watch"
  subscriber_count TEXT,              -- Display string, not live count
  is_primary BOOLEAN DEFAULT false,   -- Which channel is the "main" one
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Channel-Topic mapping (many-to-many)
CREATE TABLE channel_topics (
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (channel_id, topic_id)
);

-- Tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,          -- 'beginner-friendly', 'long-form', 'weekly'
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL
);

-- Channel-Tag mapping (many-to-many for TAXO-02 filtering)
CREATE TABLE channel_tags (
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (channel_id, tag_id)
);

-- Content highlights (CHAN-03: best-of content)
CREATE TABLE content_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Related channels (CHAN-04: editorial curation, not algorithmic)
CREATE TABLE related_channels (
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  related_channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  display_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (channel_id, related_channel_id),
  CHECK (channel_id != related_channel_id)
);
```

### Pattern 2: Server Component Data Fetching with ISR
**What:** Use Next.js server components to fetch from Supabase, with ISR revalidation for content freshness.
**When to use:** All taxonomy and channel pages.

```typescript
// Source: Next.js docs + Supabase docs
// app/categories/[slug]/page.tsx

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

// Revalidate every 60 minutes -- content changes infrequently
export const revalidate = 3600

export async function generateStaticParams() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('slug')
  return (categories ?? []).map((c) => ({ slug: c.slug }))
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select(`
      *,
      topics (
        id, name, slug, description, display_order
      )
    `)
    .eq('slug', slug)
    .order('display_order', { referencedTable: 'topics' })
    .single()

  if (!category) notFound()

  return (
    // ... render category with topics
  )
}
```

### Pattern 3: JSON-LD Structured Data Components
**What:** Type-safe JSON-LD using schema-dts, rendered as script tags in server components.
**When to use:** Every public page (homepage, category, topic, channel profile).

```typescript
// Source: Next.js official JSON-LD guide
// components/seo/JsonLd.tsx

import { Thing, WithContext } from 'schema-dts'

export function JsonLd<T extends Thing>({ data }: { data: WithContext<T> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}

// Usage in a category page:
import { BreadcrumbList, ItemList, WithContext } from 'schema-dts'

const breadcrumbLd: WithContext<BreadcrumbList> = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tabworthy.com' },
    { '@type': 'ListItem', position: 2, name: category.name, item: `https://tabworthy.com/categories/${category.slug}` },
  ],
}
```

### Pattern 4: Tag Filtering via URL Search Params
**What:** Filter channels by tags using URL search parameters for shareable filtered views.
**When to use:** Topic pages (TAXO-02).

```typescript
// app/categories/[slug]/[topic]/page.tsx
// URL: /categories/gaming/speedrunning?tags=beginner-friendly,long-form

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; topic: string }>
  searchParams: Promise<{ tags?: string }>
}) {
  const { slug, topic } = await params
  const { tags } = await searchParams
  const activeTags = tags?.split(',') ?? []

  const supabase = await createClient()

  let query = supabase
    .from('channels')
    .select(`
      *,
      creator:creators(*),
      platform:platforms(*),
      tags:channel_tags(tag:tags(*)),
      channel_topics!inner(topic:topics!inner(slug, category:categories!inner(slug)))
    `)
    .eq('channel_topics.topic.slug', topic)
    .eq('channel_topics.topic.category.slug', slug)

  // Tag filtering uses a Supabase RPC or post-query filter
  // (Supabase nested filtering on many-to-many is limited)

  const { data: channels } = await query
  // ...
}
```

### Anti-Patterns to Avoid
- **Flat channel model without creator entity:** Breaks CHAN-06; you cannot group multi-platform presences without a parent creator entity. Always model Creator -> Channels.
- **Hardcoding platform list in code:** Violates TECH-04. Platforms must be a database table, not an enum or constant array.
- **Client-side data fetching for page content:** Defeats SSR/SSG benefits; hurts SEO. Use server components for all page-level data fetching.
- **Nested layouts for taxonomy levels:** Avoid wrapping category layout around topic pages; they share a root layout but have different enough content that nested layouts add complexity without benefit.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| UI component system | Custom buttons, cards, dialogs | shadcn/ui | Accessible, themeable, copy-paste ownership |
| Database client setup | Manual fetch + cookie handling | @supabase/ssr createClient utilities | Handles cookie auth, server/client contexts correctly |
| Type generation | Manual TypeScript interfaces matching DB | `supabase gen types typescript` | Auto-generated from actual schema; stays in sync |
| Responsive layout | Custom media query system | Tailwind CSS responsive prefixes | Industry standard, well-documented |
| Breadcrumb logic | Custom breadcrumb state management | Derive from URL segments + route data | URL structure IS the breadcrumb hierarchy |
| JSON-LD types | Manual schema.org type definitions | schema-dts package | Complete, up-to-date schema.org TypeScript definitions |
| Slug generation | Custom slug function | slugify or similar | Handles unicode, special chars, collisions |

**Key insight:** Phase 1 is a content-display directory with no auth, no user writes, no real-time features. Keep it simple: server components reading from Supabase, rendered as static/ISR pages.

## Common Pitfalls

### Pitfall 1: Supabase Nested Many-to-Many Filtering
**What goes wrong:** Supabase's PostgREST API has limited support for filtering on deeply nested many-to-many relationships. Trying to filter channels by tags through join tables with `.eq()` on nested references can produce unexpected results or errors.
**Why it happens:** PostgREST flattens joins; deep nesting confuses the query planner.
**How to avoid:** For tag filtering, use a Supabase RPC (database function) that handles the JOIN + filtering in SQL, or fetch all channels for a topic and filter client-side (acceptable for small datasets in Phase 1).
**Warning signs:** Empty results when filtering, or queries returning all records regardless of filter.

### Pitfall 2: Missing generateStaticParams for Dynamic Routes
**What goes wrong:** Dynamic route pages return 404 on production if `generateStaticParams` is not defined and the page defaults to dynamic rendering without proper fallback.
**Why it happens:** Next.js App Router requires explicit static param generation for pre-rendered dynamic routes.
**How to avoid:** Always implement `generateStaticParams` for `/categories/[slug]`, `/categories/[slug]/[topic]`, and `/channels/[slug]`. Set `dynamicParams = true` to allow ISR fallback for new content.
**Warning signs:** Pages work in dev but 404 in production.

### Pitfall 3: Duplicate JSON-LD Tags from Hydration
**What goes wrong:** JSON-LD script tags render twice (server + client hydration), producing duplicate structured data.
**Why it happens:** React hydration re-renders the script tag on the client.
**How to avoid:** Place JSON-LD in server components only (not in client components). The official Next.js pattern using `dangerouslySetInnerHTML` in server components avoids this.
**Warning signs:** Google Search Console showing duplicate structured data warnings.

### Pitfall 4: Slug Collisions Between Categories and Topics
**What goes wrong:** A topic slug collides with another topic slug in a different category, or URL routing conflicts.
**Why it happens:** Slugs are often generated from names which can overlap across categories.
**How to avoid:** Topic slugs are unique per category (enforced by `UNIQUE(category_id, slug)` constraint). Channel slugs are globally unique. URL structure `/categories/[category-slug]/[topic-slug]` naturally scopes topics.
**Warning signs:** Wrong page content loading for certain URLs.

### Pitfall 5: Forgetting RLS Policies on Supabase Tables
**What goes wrong:** API calls from the client return empty arrays even though data exists.
**Why it happens:** Supabase enables RLS by default on new tables. Without a policy allowing reads, anonymous clients get no data.
**How to avoid:** For Phase 1 (all public, no auth), add `SELECT` policies for `anon` role on all content tables: `CREATE POLICY "Public read" ON table_name FOR SELECT USING (true);`
**Warning signs:** Data visible in Supabase Studio but empty in the app.

## Code Examples

### Supabase Server Client Setup
```typescript
// Source: Supabase official docs
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component -- can't set cookies
          }
        },
      },
    }
  )
}
```

### Supabase Browser Client Setup
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

### Type Generation
```bash
# Generate types from remote Supabase project
npx supabase gen types typescript --project-id "$PROJECT_REF" --schema public > src/types/database.types.ts

# Or from local Supabase
npx supabase gen types typescript --local > src/types/database.types.ts
```

### RLS Policies for Public Read Access
```sql
-- All content tables need public read access for Phase 1
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON categories FOR SELECT USING (true);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON topics FOR SELECT USING (true);

ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON creators FOR SELECT USING (true);

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON channels FOR SELECT USING (true);

ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON platforms FOR SELECT USING (true);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON tags FOR SELECT USING (true);

ALTER TABLE channel_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON channel_tags FOR SELECT USING (true);

ALTER TABLE channel_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON channel_topics FOR SELECT USING (true);

ALTER TABLE content_highlights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON content_highlights FOR SELECT USING (true);

ALTER TABLE related_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON related_channels FOR SELECT USING (true);
```

### Seed Data Pattern
```sql
-- Seed platforms
INSERT INTO platforms (name, display_name, base_url) VALUES
  ('youtube', 'YouTube', 'https://youtube.com'),
  ('twitch', 'Twitch', 'https://twitch.tv'),
  ('nebula', 'Nebula', 'https://nebula.tv'),
  ('patreon', 'Patreon', 'https://patreon.com'),
  ('substack', 'Substack', 'https://substack.com');

-- Seed a category + topic
INSERT INTO categories (name, slug, description, display_order) VALUES
  ('Technology', 'technology', 'Tech reviews, programming, and digital culture', 1);

INSERT INTO topics (category_id, name, slug, description, display_order)
  SELECT id, 'Programming', 'programming', 'Software development tutorials and talks', 1
  FROM categories WHERE slug = 'technology';
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Next.js Pages Router | App Router (stable since Next.js 13.4, default since 14) | 2023 | Server components, nested layouts, streaming |
| @supabase/auth-helpers | @supabase/ssr | 2024 | Unified SSR cookie handling; auth-helpers deprecated |
| Tailwind v3 (JS config) | Tailwind v4 (CSS-first @theme) | 2025 | No tailwind.config.js; @import "tailwindcss" in CSS |
| getStaticProps / getServerSideProps | Server components + revalidate export | Next.js 13+ | Per-component data fetching, not page-level |
| Next.js 15 | Next.js 16 (Turbopack default, React Compiler) | Late 2025 | Faster builds, auto-memoization |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Replaced by `@supabase/ssr`
- `tailwind.config.js`: Replaced by CSS-first `@theme` directive in Tailwind v4
- `getStaticProps` / `getServerSideProps`: App Router uses server components + `revalidate` export
- `next/head`: Replaced by Metadata API (`generateMetadata` / `metadata` export)

## Open Questions

1. **Seed data strategy for development**
   - What we know: Supabase supports SQL seed files via `supabase/seed.sql`
   - What's unclear: How much sample data is needed for Phase 1 development (number of categories, topics, channels)
   - Recommendation: Create 3-5 categories with 2-3 topics each and 5-10 sample channels to exercise all UI patterns

2. **Tag filtering UX on topic pages**
   - What we know: Tags are many-to-many; URL params keep filtered views shareable
   - What's unclear: Whether to filter server-side (new page load) or client-side (instant toggle)
   - Recommendation: Use client-side filtering with URL param sync for Phase 1 (dataset is small); switch to server-side RPC if data grows

3. **Editorial content entry in Phase 1**
   - What we know: Phase 2 adds editorial tooling; STATE.md mentions Supabase Studio as Phase 1 stopgap
   - What's unclear: Whether Supabase Studio is sufficient for entering initial channel data
   - Recommendation: Use Supabase Studio + SQL seed files for Phase 1; defer admin UI to Phase 2

4. **Channel slug strategy**
   - What we know: Channel slugs must be globally unique for `/channels/[slug]` routing
   - What's unclear: Naming convention when multiple creators share similar names
   - Recommendation: Use `creator-name-platform` pattern (e.g., `techlinked-youtube`) or just the channel name if unique enough

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.x (unit/integration) + Playwright (e2e, if needed) |
| Config file | none -- see Wave 0 |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run && npx playwright test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TAXO-01 | Category page lists topics; topic page lists channels | integration | `npx vitest run src/__tests__/taxonomy.test.ts -t "category"` | No -- Wave 0 |
| TAXO-02 | Tag filter returns matching channels | unit | `npx vitest run src/__tests__/filtering.test.ts` | No -- Wave 0 |
| TAXO-03 | Breadcrumb renders correct hierarchy | unit | `npx vitest run src/__tests__/breadcrumb.test.ts` | No -- Wave 0 |
| TAXO-04 | Routes resolve to correct pages with clean URLs | integration | `npx vitest run src/__tests__/routing.test.ts` | No -- Wave 0 |
| CHAN-01 | Channel profile renders all fields | unit | `npx vitest run src/__tests__/channel-profile.test.ts` | No -- Wave 0 |
| CHAN-02 | Platform badges render for channel's platforms | unit | `npx vitest run src/__tests__/platform-badge.test.ts` | No -- Wave 0 |
| CHAN-03 | Best-of highlights display on profile | unit | `npx vitest run src/__tests__/highlights.test.ts` | No -- Wave 0 |
| CHAN-04 | Related channels display on profile | unit | `npx vitest run src/__tests__/related-channels.test.ts` | No -- Wave 0 |
| CHAN-05 | Editorial summary renders on profile | unit | covered by CHAN-01 test | No -- Wave 0 |
| CHAN-06 | Creator with multiple channels shows cross-platform links | integration | `npx vitest run src/__tests__/creator-grouping.test.ts` | No -- Wave 0 |
| TECH-01 | Pages are responsive | manual-only | Visual check at mobile/tablet/desktop breakpoints | N/A |
| TECH-02 | JSON-LD present and valid on pages | unit | `npx vitest run src/__tests__/json-ld.test.ts` | No -- Wave 0 |
| TECH-03 | All pages accessible without auth | integration | `npx vitest run src/__tests__/public-access.test.ts` | No -- Wave 0 |
| TECH-04 | New platform can be added without schema changes | unit | `npx vitest run src/__tests__/platform-agnostic.test.ts` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- Vitest configuration with path aliases matching tsconfig
- [ ] `src/__tests__/` directory -- test files for all requirements above
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- [ ] `src/__tests__/helpers/db-mock.ts` -- mock Drizzle client for unit tests

## Sources

### Primary (HIGH confidence)
- [Next.js 16 official docs](https://nextjs.org/docs/app) -- App Router, JSON-LD guide, metadata, routing
- [Next.js JSON-LD guide](https://nextjs.org/docs/app/guides/json-ld) -- Exact code pattern for structured data
- [Supabase official docs](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) -- Next.js quickstart, SSR client setup
- [Supabase type generation docs](https://supabase.com/docs/guides/api/rest/generating-types) -- CLI command for TypeScript types
- [Tailwind CSS v4 docs](https://tailwindcss.com/docs/guides/nextjs) -- Next.js installation guide
- [schema.org](https://schema.org/BreadcrumbList) -- BreadcrumbList, ItemList type definitions

### Secondary (MEDIUM confidence)
- [Supabase many-to-many discussions](https://github.com/orgs/supabase/discussions/710) -- Join table patterns and query approaches
- [shadcn/ui installation](https://ui.shadcn.com/docs/installation/next) -- Next.js setup instructions

### Tertiary (LOW confidence)
- Tag filtering approach (client vs server) -- based on general patterns, not project-specific benchmarks

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- .gitignore confirms Next.js/Vercel/TypeScript; Supabase mentioned in STATE.md; all current stable versions verified
- Architecture: HIGH -- data model follows standard relational patterns for taxonomy/tagging; Next.js App Router patterns from official docs
- Pitfalls: HIGH -- based on documented Supabase and Next.js behaviors; RLS and PostgREST limitations well-known

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable stack, 30-day validity)

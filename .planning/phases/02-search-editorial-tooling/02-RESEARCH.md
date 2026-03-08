# Phase 2: Search & Editorial Tooling - Research

**Researched:** 2026-03-07
**Domain:** Full-text search (PostgreSQL), admin UI with CRUD/drag-and-drop, cookie-based auth
**Confidence:** MEDIUM-HIGH

## Summary

Phase 2 adds three major capabilities: (1) a search-first homepage with live inline results and autocomplete, (2) a password-protected admin interface for editorial CRUD and taxonomy management, and (3) "Newest" / "Editor's Picks" feeds. The project runs Next.js 16.1.6 with React 19, Drizzle ORM on Neon Postgres (HTTP driver), and shadcn/ui components.

For search, the best approach for this small curated directory is a hybrid: PostgreSQL full-text search (`tsvector` with GIN indexes) for relevance-ranked results combined with `pg_trgm` for fuzzy autocomplete on short fields (names, titles). This keeps everything in Postgres -- no external search service needed. The "semantic broadening" behavior (e.g., "star trek podcasts" broadening to "sci-fi podcasts") should be handled via taxonomy-aware fallback queries rather than AI embeddings, which would be overkill for the dataset size.

For the admin interface, the stack is straightforward: Next.js server actions for mutations, `proxy.ts` (Next.js 16's rename of middleware) for route protection, and encrypted cookie sessions. Drag-and-drop reordering uses `@dnd-kit/sortable` (stable, well-documented) since the newer `@dnd-kit/react` is still pre-1.0. The markdown editor for editorial summaries uses `@uiw/react-md-editor` -- lightweight, textarea-based, with built-in preview.

**Primary recommendation:** Use PostgreSQL-native search (tsvector + pg_trgm) with Drizzle raw SQL, `@dnd-kit/core` + `@dnd-kit/sortable` for drag-and-drop, `@uiw/react-md-editor` for markdown editing, and `iron-session` for cookie-based admin auth.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Search bar is a hero-level element on the homepage -- the primary interaction, not a utility
- Homepage layout is a split panel: categories/topics on the left, channels on the right
- Default state (no query): left shows all categories, right toggles between "Newest" and "Editor's Picks"
- Searching: left shows matching topics/categories, right shows matching channels -- results update live inline as user types (no dropdown overlay)
- Clicking a topic/category on the left adds it as a constraint filter and refines channel results on the right
- Search is semantic, not just keyword matching
- No-results behavior: system broadens the search context automatically and shows those results with a message indicating the broadened search
- The current homepage category grid is replaced by this new search-first layout
- "Newest" shows the last N most recently added channels by `created_at` timestamp (not a time window)
- "Editor's Picks" uses a simple boolean `is_editors_pick` flag on the channels table
- Shared password stored in environment variable
- Admin lives at `/admin` -- standard, discoverable path
- Cookie-based session persists for 30 days
- Solo editor -- no per-user tracking, audit logs, or permissions needed
- Will be replaced by proper auth in Phase 3
- Save = published. No draft/publish states
- Taxonomy reordering via drag-and-drop
- Editorial summary edited with a markdown editor with preview
- All related entities managed inline on the channel edit form
- Admin landing is simple list pages with sidebar nav (Channels, Categories, Topics, Tags)
- Channel CRUD: create, edit, delete (hard delete)

### Claude's Discretion
- Semantic search implementation approach (embeddings, pg_trgm, or other)
- Drag-and-drop library choice
- Markdown editor library choice
- Admin form layout and component design
- Session/cookie implementation details
- Search result ranking and relevance tuning
- Mobile responsive behavior of the split-panel layout

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SRCH-01 | User can search across channels, categories, topics, and tags via full-text search | PostgreSQL tsvector with GIN indexes + pg_trgm for fuzzy matching; Drizzle raw SQL queries; weighted search across multiple entity types |
| SRCH-02 | Search provides autocomplete suggestions as the user types | pg_trgm similarity + ILIKE with GIN index for fast prefix/fuzzy matching on names; debounced client-side fetch to API route |
| TAXO-05 | User can view a "new this week" feed of recently added channels | Simple query: `ORDER BY created_at DESC LIMIT N` on channels table; no schema changes needed beyond `is_editors_pick` |
| EDIT-01 | Editor can create, edit, and archive channel listings | Server actions for mutations; inline form with all related entities; `is_editors_pick` boolean column addition |
| EDIT-02 | Editor can manage taxonomy (create/edit/reorder categories, topics, and tags) | CRUD server actions; @dnd-kit/sortable for drag-and-drop reordering; update `displayOrder` columns |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.1.6 | Framework (already installed) | Project standard; proxy.ts for route protection |
| drizzle-orm | ^0.45.1 | ORM (already installed) | Project standard; raw SQL for tsvector/tsquery |
| @neondatabase/serverless | ^1.0.2 | DB driver (already installed) | Project standard; Neon HTTP |
| iron-session | ^8.0.4 | Encrypted cookie sessions | Stateless, simple, works with Next.js app router and server actions |
| @dnd-kit/core | ^6.3.1 | Drag-and-drop primitives | Stable, well-documented, React 18/19 compatible via `@dnd-kit/core` |
| @dnd-kit/sortable | ^10.0.0 | Sortable list preset | Thin layer over core; handles reorder logic |
| @dnd-kit/utilities | ^3.2.2 | CSS transform utilities | Helper for sortable animations |
| @uiw/react-md-editor | latest | Markdown editor with preview | Lightweight (~4.6KB gzip), textarea-based, no heavy deps |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-markdown | latest | Render markdown in channel profiles | Display editorial summaries on public pages |
| remark-gfm | latest | GitHub Flavored Markdown | Tables, strikethrough in editorial summaries |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| iron-session | jose (raw JWT) | More control but more boilerplate; iron-session handles encryption |
| @dnd-kit/sortable | @hello-pangea/dnd | Does NOT support React 19 (peer dep ^18); @dnd-kit/react is pre-1.0 |
| @uiw/react-md-editor | @mdxeditor/editor | MDXEditor is heavier (Lexical-based); overkill for simple markdown fields |
| pg_trgm + tsvector | pgvector embeddings | Embeddings require an AI service for generating vectors; massive overkill for <1000 channels |
| pg_trgm + tsvector | pg_search (ParadeDB) | BM25 is great but adds extension complexity; tsvector is built-in and sufficient |

**Installation:**
```bash
npm install iron-session @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @uiw/react-md-editor react-markdown remark-gfm
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  app/
    page.tsx                          # Redesigned homepage (search hero + split panel)
    api/
      search/route.ts                 # GET endpoint for live search results
    admin/
      layout.tsx                      # Admin layout with sidebar nav
      page.tsx                        # Redirect to /admin/channels
      login/page.tsx                  # Login form
      channels/
        page.tsx                      # Channel list
        new/page.tsx                  # Create channel
        [id]/edit/page.tsx            # Edit channel (inline related entities)
      categories/
        page.tsx                      # Category list with drag-and-drop reorder
        new/page.tsx                  # Create category
        [id]/edit/page.tsx            # Edit category
      topics/
        page.tsx                      # Topic list with drag-and-drop reorder
        new/page.tsx                  # Create topic
        [id]/edit/page.tsx            # Edit topic
      tags/
        page.tsx                      # Tag list
        new/page.tsx                  # Create tag
        [id]/edit/page.tsx            # Edit tag
  lib/
    db/
      schema.ts                       # Add is_editors_pick, search indexes
      queries/
        search.ts                     # Search query functions
        admin.ts                      # Admin CRUD query functions
    auth/
      session.ts                      # iron-session config and helpers
    actions/
      channels.ts                     # Server actions for channel CRUD
      taxonomy.ts                     # Server actions for category/topic/tag CRUD
      auth.ts                         # Login/logout server actions
  components/
    search/
      search-bar.tsx                  # Hero search input with debounce
      search-results.tsx              # Split panel results container
      category-filter-panel.tsx       # Left panel: categories/topics
      channel-results-panel.tsx       # Right panel: channels
    admin/
      sidebar-nav.tsx                 # Admin sidebar navigation
      sortable-list.tsx               # Reusable drag-and-drop sortable list
      channel-form.tsx                # Channel create/edit form
      taxonomy-form.tsx               # Category/topic/tag form
      markdown-field.tsx              # Markdown editor wrapper
  proxy.ts                            # Route protection for /admin/*
```

### Pattern 1: Search API Route with Debounced Client Fetch
**What:** Live search results via a GET API route, called from a client component with debounced input
**When to use:** Any time you need real-time search results as the user types
**Example:**
```typescript
// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { searchAll } from '@/lib/db/queries/search'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') ?? ''
  const category = request.nextUrl.searchParams.get('category') ?? undefined

  if (query.length < 2) {
    return NextResponse.json({ channels: [], categories: [], topics: [] })
  }

  const results = await searchAll(query, { category })
  return NextResponse.json(results)
}
```

```typescript
// Client component with debounce
'use client'
import { useState, useEffect, useRef } from 'react'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}
```

### Pattern 2: Server Actions for Admin Mutations
**What:** Form submissions handled by server actions with revalidation
**When to use:** All admin create/edit/delete operations
**Example:**
```typescript
// src/lib/actions/channels.ts
'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { channels } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function createChannel(formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  // ... validate and insert

  await db.insert(channels).values({ /* ... */ })
  revalidatePath('/admin/channels')
  redirect('/admin/channels')
}

export async function deleteChannel(id: string) {
  await db.delete(channels).where(eq(channels.id, id))
  revalidatePath('/admin/channels')
  redirect('/admin/channels')
}
```

### Pattern 3: Proxy-based Route Protection
**What:** `proxy.ts` checks for session cookie on `/admin/*` routes
**When to use:** Protecting the entire admin section
**Example:**
```typescript
// src/proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginRoute = request.nextUrl.pathname === '/admin/login'
  const sessionCookie = request.cookies.get('admin_session')

  if (isAdminRoute && !isLoginRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

### Pattern 4: Drag-and-Drop Sortable List
**What:** Reusable sortable list component for taxonomy reordering
**When to use:** Categories, topics, tags reordering in admin
**Example:**
```typescript
// Reusable sortable list with @dnd-kit
'use client'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}
```

### Anti-Patterns to Avoid
- **Client-side data fetching for initial page loads:** Keep admin list pages as server components; only use client fetching for search
- **Storing admin password in client-side code:** Password check happens in a server action; only the encrypted session cookie goes to the client
- **Revalidating entire site on every admin change:** Use targeted `revalidatePath()` for specific routes
- **Building a custom drag-and-drop from scratch:** Use @dnd-kit -- handling accessibility, touch events, keyboard navigation properly is extremely hard
- **Using `middleware.ts`:** Next.js 16 renames this to `proxy.ts`; use the new convention

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session encryption | Custom crypto for cookies | iron-session | Handles seal/unseal, cookie options, expiry |
| Drag-and-drop reordering | Custom mouse/touch handlers | @dnd-kit/sortable | Accessibility, keyboard nav, touch, animations |
| Markdown editing | Custom textarea + preview | @uiw/react-md-editor | Toolbar, keyboard shortcuts, split view |
| Full-text search | Custom LIKE queries | PostgreSQL tsvector + GIN | Stemming, ranking, stop words, performance |
| Fuzzy matching | Custom string distance | pg_trgm extension | Trigram indexing, ILIKE acceleration |
| Debounce logic | setTimeout management | Simple `useDebounce` hook | But don't npm-install a debounce library for this |
| Markdown rendering | Custom parser | react-markdown + remark-gfm | XSS safety, GFM support |

**Key insight:** For a curated directory with hundreds (not millions) of entries, PostgreSQL built-in search is more than sufficient. Adding Elasticsearch, Meilisearch, or AI embeddings would add operational complexity with no user-visible benefit at this scale.

## Common Pitfalls

### Pitfall 1: Search Performance on Neon HTTP Driver
**What goes wrong:** Each search keystroke triggers a new HTTP request to Neon, adding latency
**Why it happens:** Neon HTTP driver has per-query connection overhead vs persistent connections
**How to avoid:** Debounce search input (300ms minimum); return early for queries under 2 characters; consider connection pooling if latency is noticeable
**Warning signs:** Search feels sluggish, especially on the first query after idle

### Pitfall 2: tsvector Without GIN Index
**What goes wrong:** Full-text search degrades to sequential scan
**Why it happens:** Forgetting to add GIN index on the tsvector expression
**How to avoid:** Create GIN index in schema definition using Drizzle's `index().using('gin', sql`...`)` syntax
**Warning signs:** Search gets slower as data grows; EXPLAIN shows Seq Scan

### Pitfall 3: Drag-and-Drop in Server Components
**What goes wrong:** @dnd-kit components fail because they use hooks and browser APIs
**Why it happens:** Next.js server components can't use `useState`, `useEffect`, or DOM APIs
**How to avoid:** Mark all drag-and-drop components with `'use client'`; keep the sortable list as a client component that receives data as props
**Warning signs:** Hydration errors, "useState is not a function"

### Pitfall 4: Admin Session Not Validated Server-Side
**What goes wrong:** Proxy checks cookie existence but not validity; expired or tampered cookies pass through
**Why it happens:** Proxy is meant for lightweight checks, not full session management
**How to avoid:** Use iron-session to decrypt and validate the session in server components/actions, not just check cookie existence in proxy
**Warning signs:** Users can access admin after cookie expiry by manually setting a cookie

### Pitfall 5: Stale Revalidation After Admin Edits
**What goes wrong:** Public pages show old data after admin creates/edits content
**Why it happens:** Next.js caches server component output; `revalidate = 3600` on homepage means up to 1 hour delay
**How to avoid:** Call `revalidatePath('/')` and other affected paths in server actions after mutations
**Warning signs:** Admin saves a channel but it doesn't appear on the public site immediately

### Pitfall 6: Search Query Injection
**What goes wrong:** User input passed directly into `to_tsquery` causes syntax errors
**Why it happens:** tsquery has its own syntax (| for OR, & for AND); raw user input breaks parsing
**How to avoid:** Use `websearch_to_tsquery()` or `plainto_tsquery()` which safely parse natural language input
**Warning signs:** Search crashes on inputs like "C++ programming" or "rock & roll"

### Pitfall 7: Split Panel Layout on Mobile
**What goes wrong:** Two-column layout is unusable on small screens
**Why it happens:** Designing desktop-first without considering responsive behavior
**How to avoid:** Stack panels vertically on mobile; show categories as collapsible section above channel results
**Warning signs:** Horizontal scrolling on mobile, tiny unreadable columns

## Code Examples

### Full-Text Search Query with Drizzle
```typescript
// src/lib/db/queries/search.ts
import { db } from '../index'
import { sql } from 'drizzle-orm'
import { channels, categories, topics, tags } from '../schema'

export async function searchChannels(query: string, categorySlug?: string) {
  const searchQuery = query.trim().split(/\s+/).join(' & ')

  const results = await db
    .select({
      id: channels.id,
      name: channels.name,
      slug: channels.slug,
      description: channels.description,
      editorialSummary: channels.editorialSummary,
      createdAt: channels.createdAt,
      rank: sql<number>`ts_rank(
        setweight(to_tsvector('english', ${channels.name}), 'A') ||
        setweight(to_tsvector('english', coalesce(${channels.description}, '')), 'B') ||
        setweight(to_tsvector('english', ${channels.editorialSummary}), 'C'),
        websearch_to_tsquery('english', ${query})
      )`.as('rank'),
    })
    .from(channels)
    .where(
      sql`(
        setweight(to_tsvector('english', ${channels.name}), 'A') ||
        setweight(to_tsvector('english', coalesce(${channels.description}, '')), 'B') ||
        setweight(to_tsvector('english', ${channels.editorialSummary}), 'C')
      ) @@ websearch_to_tsquery('english', ${query})`
    )
    .orderBy(sql`rank DESC`)
    .limit(20)

  return results
}
```

### pg_trgm Autocomplete Query
```typescript
// Fuzzy autocomplete across entity names
export async function autocomplete(query: string) {
  const channelResults = await db
    .select({ id: channels.id, name: channels.name, slug: channels.slug, type: sql<string>`'channel'` })
    .from(channels)
    .where(sql`${channels.name} % ${query} OR ${channels.name} ILIKE ${'%' + query + '%'}`)
    .orderBy(sql`similarity(${channels.name}, ${query}) DESC`)
    .limit(5)

  const categoryResults = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug, type: sql<string>`'category'` })
    .from(categories)
    .where(sql`${categories.name} % ${query} OR ${categories.name} ILIKE ${'%' + query + '%'}`)
    .orderBy(sql`similarity(${categories.name}, ${query}) DESC`)
    .limit(5)

  // ... similar for topics and tags
  return { channels: channelResults, categories: categoryResults }
}
```

### iron-session Configuration
```typescript
// src/lib/auth/session.ts
import { getIronSession, type SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  isLoggedIn: boolean
}

export const sessionOptions: SessionOptions = {
  password: process.env.ADMIN_SESSION_SECRET!,
  cookieName: 'admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}
```

### Login Server Action
```typescript
// src/lib/actions/auth.ts
'use server'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'

export async function login(formData: FormData) {
  const password = formData.get('password') as string

  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Invalid password' }
  }

  const session = await getSession()
  session.isLoggedIn = true
  await session.save()
  redirect('/admin/channels')
}

export async function logout() {
  const session = await getSession()
  session.destroy()
  redirect('/admin/login')
}
```

### Schema Migration: Add is_editors_pick and Search Indexes
```typescript
// Addition to src/lib/db/schema.ts - channels table
isEditorsPick: boolean('is_editors_pick').notNull().default(false),

// GIN index for full-text search on channels
// In table definition options:
index('channels_search_idx').using(
  'gin',
  sql`(
    setweight(to_tsvector('english', ${channels.name}), 'A') ||
    setweight(to_tsvector('english', coalesce(${channels.description}, '')), 'B') ||
    setweight(to_tsvector('english', ${channels.editorialSummary}), 'C')
  )`
),

// pg_trgm GIN index for fuzzy name matching
index('channels_name_trgm_idx').using(
  'gin',
  sql`${channels.name} gin_trgm_ops`
),
```

### Enabling PostgreSQL Extensions (Migration)
```sql
-- Run once on Neon database
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- tsvector is built-in, no extension needed
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| middleware.ts | proxy.ts | Next.js 16 (2026) | Rename only; same functionality; use new convention |
| @dnd-kit/core + /sortable | @dnd-kit/react (new API) | 2025+ | New package still pre-1.0 (v0.3.2); use stable core+sortable for now |
| react-beautiful-dnd | @hello-pangea/dnd (fork) | 2023 | Fork doesn't support React 19; not viable for this project |
| External search (Algolia, etc.) | PostgreSQL native (tsvector + pg_trgm) | Always viable | For <10K records, Postgres search matches external services |

**Deprecated/outdated:**
- `middleware.ts`: Renamed to `proxy.ts` in Next.js 16; codemod available
- `react-beautiful-dnd`: Archived by Atlassian; @hello-pangea/dnd fork lacks React 19 support
- Edge runtime for middleware/proxy: Next.js 16 proxy runs on Node.js only

## Open Questions

1. **pg_trgm extension availability on Neon**
   - What we know: Neon docs list pg_trgm as a supported extension
   - What's unclear: Whether it needs manual enabling via `CREATE EXTENSION` or is pre-enabled
   - Recommendation: Run `CREATE EXTENSION IF NOT EXISTS pg_trgm;` in a migration; this is safe even if already enabled

2. **Semantic broadening behavior**
   - What we know: User wants the system to broaden "star trek podcasts" to "sci-fi podcasts" when no results found
   - What's unclear: How to map specific queries to broader categories without AI
   - Recommendation: Use taxonomy-aware fallback: when channel search returns no results, search for the query in topics/categories, then return channels from the best-matching topic/category. This leverages the existing curated taxonomy as a semantic layer.

3. **@dnd-kit/core + /sortable with React 19**
   - What we know: These packages list React 18+ as peer dependency; community reports them working with React 19
   - What's unclear: Whether any edge cases exist in the React 19 + Next.js 16 combination
   - Recommendation: Proceed with @dnd-kit/core + @dnd-kit/sortable; they are client components only ("use client") which avoids most RSC compatibility issues

4. **@uiw/react-md-editor with React 19**
   - What we know: The library is actively maintained and lightweight
   - What's unclear: Explicit React 19 compatibility status
   - Recommendation: Install and test; if issues arise, fall back to a simple textarea + react-markdown preview (two-panel approach)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vitest.config.ts` (exists) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SRCH-01 | Full-text search returns relevant channels, categories, topics | unit | `npx vitest run src/__tests__/search.test.ts -t "search"` | No - Wave 0 |
| SRCH-02 | Autocomplete returns fuzzy matches for partial input | unit | `npx vitest run src/__tests__/search.test.ts -t "autocomplete"` | No - Wave 0 |
| TAXO-05 | Newest feed returns channels ordered by created_at | unit | `npx vitest run src/__tests__/feeds.test.ts` | No - Wave 0 |
| EDIT-01 | Channel CRUD operations (create, edit, delete) | unit | `npx vitest run src/__tests__/admin-channels.test.ts` | No - Wave 0 |
| EDIT-02 | Taxonomy CRUD and reorder operations | unit | `npx vitest run src/__tests__/admin-taxonomy.test.ts` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/search.test.ts` -- covers SRCH-01, SRCH-02 (will need to mock DB)
- [ ] `src/__tests__/feeds.test.ts` -- covers TAXO-05
- [ ] `src/__tests__/admin-channels.test.ts` -- covers EDIT-01
- [ ] `src/__tests__/admin-taxonomy.test.ts` -- covers EDIT-02
- [ ] `src/__tests__/auth.test.ts` -- covers admin session validation
- [ ] Test setup for mocking Drizzle DB queries (no test DB infrastructure exists yet)

## Sources

### Primary (HIGH confidence)
- [Drizzle ORM - PostgreSQL full-text search](https://orm.drizzle.team/docs/guides/postgresql-full-text-search) - tsvector/tsquery patterns with Drizzle
- [Drizzle ORM - Full-text search with generated columns](https://orm.drizzle.team/docs/guides/full-text-search-with-generated-columns) - Alternative approach
- [Next.js 16 proxy.ts docs](https://nextjs.org/docs/app/getting-started/proxy) - Middleware to proxy rename, API, matcher config
- [Neon pg_trgm extension](https://neon.com/docs/extensions/pg_trgm) - Trigram search on Neon
- [dnd-kit official docs](https://docs.dndkit.com/presets/sortable) - Sortable preset documentation

### Secondary (MEDIUM confidence)
- [iron-session GitHub](https://github.com/vvo/iron-session) - v8.0.4, app router support verified
- [@uiw/react-md-editor](https://uiwjs.github.io/react-md-editor/) - Lightweight markdown editor
- [@dnd-kit/react npm](https://www.npmjs.com/package/@dnd-kit/react) - v0.3.2 (pre-1.0, not recommended)
- [@hello-pangea/dnd React 19 discussion](https://github.com/hello-pangea/dnd/discussions/810) - Not compatible with React 19

### Tertiary (LOW confidence)
- [dnd-kit React 19 compatibility issue](https://github.com/clauderic/dnd-kit/issues/1654) - "use client" directive needed
- [@uiw/react-md-editor React 19 compatibility](https://www.npmjs.com/package/@uiw/react-md-editor) - No explicit React 19 mention; needs validation

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM-HIGH - core libraries verified; @dnd-kit/sortable and @uiw/react-md-editor React 19 compat needs validation
- Architecture: HIGH - patterns well-established for Next.js 16 + Drizzle + server actions
- Search implementation: MEDIUM - tsvector + pg_trgm approach is proven but Drizzle raw SQL patterns need careful implementation
- Pitfalls: HIGH - well-documented issues across multiple sources

**Research date:** 2026-03-07
**Valid until:** 2026-04-07 (30 days; stable technologies)

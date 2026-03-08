# Tabworthy — v0 Design Spec

**Product:** A human-curated directory of the best content channels across platforms (YouTube, Twitch, Nebula, Substack, etc.). Think "Michelin Guide for content creators." Users browse by topic, discover channels worth following, and eventually nominate their own favorites.

**Core value:** People can browse by topic and find creators worth following — curated by humans, not algorithms.

**Tech stack:** Next.js App Router, Tailwind CSS v4, shadcn/ui, Neon

---

## Global Layout & Navigation

### Header
- Logo ("Tab Worthy") top-left looking like a generic browser tab
- Primary nav: Browse, Search, Nominate
- Right side: Sign In / Sign Up (or user avatar with dropdown when logged in)
- Mobile: hamburger menu 

### Footer
- About, Contact, Privacy, Terms
- "Curated by humans, not algorithms" tagline
- Social links

### Breadcrumbs
- Present on all pages below homepage
- Pattern: Home > Category > Topic or Home > Channel Name
- Clean, subtle styling — not the hero of any page

### Responsive Breakpoints
- Mobile: 375px+ (single column, stacked cards)
- Tablet: 768px+ (2-column grids)
- Desktop: 1280px+ (3-4 column grids)

---

## Pages

### 1. Homepage

**URL:** `/`

**Purpose:** Entry point — show all categories as a visual grid, convey the editorial/curated brand.

**Layout:**
- Hero section: Short tagline ("The best channels on the internet, picked by people who actually watch them"), brief explanation of what Tabworthy is (1-2 sentences), and a search bar
- Category grid below: Cards in a responsive grid (3-4 columns desktop, 2 tablet, 1 mobile)
- Each category card shows: category name, short description (1 line), number of channels, subtle icon or illustration
- Optional: "New This Week" section at bottom showing 5-6 recently added channels as small horizontal cards
- Optional: "Editor's Picks" featured row — 3 standout channels with larger cards

**Sample categories:**
- Technology (142 channels) — "Tech reviews, programming, and digital culture"
- Science (98 channels) — "Physics, biology, space, and scientific thinking"
- History (76 channels) — "Ancient civilizations to modern events"
- Cooking (64 channels) — "Recipes, techniques, and food culture"
- Finance (53 channels) — "Personal finance, investing, and economics"
- Creative (89 channels) — "Art, music, filmmaking, and design"

**Tone:** Clean, editorial, confident. Not flashy or cluttered. Think Wirecutter meets a library catalog.

---

### 2. Category Page

**URL:** `/categories/[slug]` (e.g., `/categories/technology`)

**Purpose:** Show all topics within a category and list channels at the category level.

**Layout:**
- Category name as page title with description paragraph
- Topics section: horizontal pills/chips or a sidebar list showing all topics in this category (e.g., under Technology: Programming, AI & Machine Learning, Tech Reviews, Cybersecurity, Gaming Tech)
- Channel listing below: grid of channel cards for this entire category (or the selected topic)
- Sort/filter bar: "Sort by: Recently Added / A-Z / Most Platforms" and tag filter pills

**Channel card design:**
- Channel name (prominent)
- Creator name (smaller, linked)
- Platform badges (small icons — YouTube, Twitch, etc.)
- 1-2 line editorial excerpt from the "why watch" summary
- Tags as small pills (e.g., "beginner-friendly", "long-form", "weekly")
- Click opens the full channel profile

**Sample data for Technology category:**
- Topics: Programming, AI & Machine Learning, Tech Reviews, Cybersecurity, DIY Electronics
- Channels: "Fireship" (YouTube) — "Fast-paced dev tutorials", "ThePrimeagen" (YouTube, Twitch) — "Code reviews and hot takes"

---

### 3. Topic Page

**URL:** `/categories/[slug]/[topic]` (e.g., `/categories/technology/programming`)

**Purpose:** Filtered view of channels within a specific topic. This is where tag filtering really shines.

**Layout:**
- Topic name as title, with parent category as breadcrumb link
- Topic description paragraph
- Tag filter bar: horizontal row of toggle-able tag pills. Active tags are filled/highlighted, inactive are outlined. Clicking a tag filters the channel list instantly (client-side). Multiple tags can be active (AND logic).
- Channel grid: same card design as category page, filtered by active tags
- If no channels match active tags: friendly empty state ("No channels match these filters. Try removing a tag.")

**Sample tags:** beginner-friendly, long-form, short-form, weekly uploads, deep-dives, tutorials, entertainment, educational

**Interaction:** Tag filtering updates the URL search params (e.g., `?tags=beginner-friendly,long-form`) so filtered views are shareable.

---

### 4. Channel Profile Page

**URL:** `/channels/[slug]` (e.g., `/channels/fireship`)

**Purpose:** The richest page — full editorial profile of a channel. This is what makes Tabworthy special.

**Layout:**

**Header section:**
- Channel name (large)
- Creator name with link to creator's other channels (if multi-platform)
- Platform badges with links: clickable icons (YouTube, Twitch, etc.) that open the actual channel in a new tab
- Tags as pills

**Editorial section:**
- "Why Watch" — the human-written editorial summary (2-3 paragraphs). This is the centerpiece. Styled like a magazine write-up, not a data dump.

**Best Of section:**
- "Best Of" or "Start Here" — 3-5 curated content highlights
- Each highlight: title (linked to actual content URL), 1-line description
- Styled as a numbered or bulleted list with subtle card treatment

**Cross-platform section (if creator has multiple channels):**
- "Also on..." section showing the creator's other platform presences
- Each platform: icon + platform name + channel name, linked to the external URL
- Visual grouping makes it clear this is one creator across platforms

**Related channels section:**
- "You might also like" — 3-6 editorially curated related channels
- Same card design as the browse grid but in a horizontal scroll or smaller grid
- Each links to its own channel profile

**Sidebar or metadata strip:**
- Category & topic breadcrumb
- Subscriber count (approximate, displayed as text like "1.2M subscribers")
- Platform(s)
- Tags

**Mobile:** Stacks vertically — header, editorial, best-of, cross-platform, related.

---

### 5. Search

**URL:** `/search?q=[query]`

**Purpose:** Full-text search across channels, categories, topics, and tags.

**Layout:**
- Large search input at top (same style as homepage hero search)
- Autocomplete dropdown as user types: shows matching channels, categories, and topics in grouped sections
- Results page: list of matching channels using the standard channel card design
- Results grouped or labeled by type: "Channels", "Categories", "Topics"
- Empty state: "No results for '[query]'. Try a different search term."

---

### 6. New This Week

**URL:** `/new` or section on homepage

**Purpose:** Feed of recently added channels to signal freshness and encourage return visits.

**Layout:**
- Simple chronological list of channels added in the last 7 days
- Each entry: channel card with "Added [date]" badge
- Grouped by day if enough volume

---

### 7. Sign In / Sign Up

**URL:** `/login`, `/signup`

**Purpose:** Simple auth pages.

**Layout:**
- Centered card with form
- Sign up: email, password, confirm password
- Sign in: email, password, "Forgot password?" link
- Social auth buttons if applicable (Google, GitHub)
- Minimal — don't over-design these

---

### 8. User Dashboard

**URL:** `/dashboard`

**Purpose:** Personal hub showing the user's marked channels, nominations, and subscriptions.

**Layout:**

**Tab or section navigation:** My Channels | Nominations | Subscriptions

**My Channels tab:**
- Filter bar with status pills: All, Love, Like, Curious, Hide
- Grid of channel cards the user has reacted to, filtered by selected status
- Each card shows the user's reaction status as a small badge/icon
- Empty state per filter: "You haven't marked any channels as [status] yet. Browse the directory to find channels you love."

**Status reactions on channel cards (everywhere in the app):**
- Small icon row or dropdown on every channel card (when logged in)
- Four options: Love (heart), Like (thumbs up), Curious (bookmark/eye), Hide (x/eye-off)
- Only one status per channel at a time
- Clicking the active status removes it

**Nominations tab:**
- List of channels the user has nominated
- Each shows: channel name, platform, status (pending/approved/rejected), nomination date
- Button: "Nominate a Channel"

**Subscriptions tab:**
- List of categories and tags the user subscribes to
- Each shows: name, type (category/tag), toggle to unsubscribe
- "You'll be notified when new channels are added to these categories or matching these tags"

---

### 9. Nominate a Channel

**URL:** `/nominate` (requires login)

**Purpose:** Let users suggest channels for editorial review.

**Layout:**
- Form: channel name, platform URL, category suggestion, why you recommend it (textarea)
- Sidebar or below: "How nominations work" explainer (submitted > reviewed by editors > approved or not)
- After submission: confirmation message, link to view their nominations

---

### 10. Nominations Browse

**URL:** `/nominations` or section on category pages

**Purpose:** Public view of community-submitted nominations. Anyone can see them, logged-in users can upvote.

**Layout:**
- List of pending nominations sorted by votes
- Each nomination: channel name, platform, nominator name, vote count, upvote button (requires login)
- Filter by category
- Approved nominations get a badge and link to the full channel profile

---

### 11. Admin / Editorial Interface

**URL:** `/admin/*` (protected)

**Purpose:** Editors manage the directory content.

**Pages:**

**Channel management (`/admin/channels`):**
- Table view: channel name, creator, platform, category, status (draft/published/archived), last edited
- Actions: edit, archive, view profile
- "Add Channel" button opens a form with all channel fields (name, creator, platform, URL, editorial summary, best-of highlights, related channels, tags, category/topic assignment)

**Taxonomy management (`/admin/taxonomy`):**
- Tree view or nested list: Categories > Topics
- Drag-to-reorder
- Inline edit for names/descriptions
- Add/remove categories and topics

**Tag management (`/admin/tags`):**
- Simple list with add/edit/delete
- Shows count of channels using each tag

**Nominations queue (`/admin/nominations`):**
- Table of pending nominations
- Each row: channel name, platform, nominator, votes, date submitted
- Actions: Approve (creates a draft channel listing), Reject (with optional reason), View details

---

## Design Principles

1. **Editorial confidence** — The design should feel like a curated publication, not a user-generated database. Clean typography, generous whitespace, strong hierarchy.

2. **Content-first** — The editorial summaries and best-of picks are the product. Don't bury them behind UI chrome.

3. **Platform-agnostic identity** — Platform badges should be present but not dominant. Tabworthy is about the creator and content, not the platform.

4. **Browsable over searchable** — The taxonomy and tag filtering are the primary discovery mechanism. Search is secondary. The layout should invite browsing.

5. **No algorithmic vibes** — Avoid anything that looks like "recommended for you" or personalized feeds. This is a curated directory. The editorial voice is the algorithm.

---

## Component Inventory

| Component | Used On | Notes |
|-----------|---------|-------|
| Channel Card | Category, Topic, Search, Dashboard, Related, New This Week | Most reused component. Must work in grid and list layouts |
| Platform Badge | Channel Card, Channel Profile | Small icon + optional label. Clickable to external URL |
| Tag Pill | Channel Card, Topic filter bar, Channel Profile | Toggle-able on topic page, static display elsewhere |
| Breadcrumb | All pages except homepage | Derives from URL structure |
| Category Card | Homepage | Larger card with description and channel count |
| Search Input | Homepage hero, Search page, Header | Autocomplete variant on search page |
| Status Reaction | Channel Card (logged in), Dashboard | Heart/thumbs/bookmark/x icon row |
| Editorial Summary | Channel Profile | Styled prose block, the centerpiece of profiles |
| Best-Of List | Channel Profile | Numbered list of content highlights with external links |
| Nomination Card | Nominations page, Dashboard | Channel name + platform + votes + upvote button |
| Admin Table | All admin pages | Sortable, filterable data table with actions |

---

## Sample Data for Prototyping

### Categories (6)
1. Technology — "Tech reviews, programming, and digital culture" (142 channels)
2. Science — "Physics, biology, space, and scientific thinking" (98 channels)
3. History — "Ancient civilizations to modern events" (76 channels)
4. Cooking — "Recipes, techniques, and food culture" (64 channels)
5. Finance — "Personal finance, investing, and economics" (53 channels)
6. Creative — "Art, music, filmmaking, and design" (89 channels)

### Sample Channels
1. **Fireship** — Creator: Jeff Delaney — YouTube — Technology > Programming
   - Tags: short-form, tutorials, weekly
   - Why Watch: "Fireship delivers the fastest, most entertaining code tutorials on the internet. Jeff Delaney has a gift for distilling complex topics into 100-second videos that actually teach you something. Whether it's a new framework, a language comparison, or a mass tech layoff, Fireship covers it with sharp editing and sharper opinions."
   - Best Of: "God-Tier Developer Roadmap", "I built the mass mass mass mass mass mass with Firebase", "100 Seconds of Tailwind"

2. **3Blue1Brown** — Creator: Grant Sanderson — YouTube, Patreon — Science > Mathematics
   - Tags: long-form, deep-dives, educational, beginner-friendly
   - Why Watch: "Grant Sanderson makes you feel what math looks like. His signature animation style turns abstract concepts into visual intuitions that stick with you forever. If you ever wondered why linear algebra matters or what neural networks actually compute, start here."
   - Best Of: "Essence of Linear Algebra", "But what is a neural network?", "The Brachistochrone"

3. **Internet Historian** — Creator: Internet Historian — YouTube, Nebula — History > Internet Culture
   - Tags: long-form, entertainment, deep-dives
   - Also on: Nebula (ad-free extended cuts)

### Sample Tags
beginner-friendly, long-form, short-form, weekly, deep-dives, tutorials, entertainment, educational, daily, monthly, live-streams

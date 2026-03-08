import { getCategories } from '@/lib/db/queries'
import { getNewestChannels, getEditorsPicks } from '@/lib/db/queries/search'
import { SearchResults } from '@/components/search/search-results'
import { JsonLd } from '@/components/seo/json-ld'

export const revalidate = 3600

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://tabworthy.com'

export default async function Home() {
  let categories: Awaited<ReturnType<typeof getCategories>> = []
  let newestChannels: Awaited<ReturnType<typeof getNewestChannels>> = []
  let editorsPicksChannels: Awaited<ReturnType<typeof getEditorsPicks>> = []

  try {
    ;[categories, newestChannels, editorsPicksChannels] = await Promise.all([
      getCategories(),
      getNewestChannels(10),
      getEditorsPicks(10),
    ])
  } catch {
    // DB unavailable during build -- render empty state
  }

  return (
    <>
      {/* WebSite JSON-LD */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Tabworthy',
          description:
            'The best channels on the internet, picked by people who actually watch them.',
          url: BASE_URL,
        }}
      />

      {/* ItemList JSON-LD for categories */}
      {categories.length > 0 && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Browse Categories',
            numberOfItems: categories.length,
            itemListElement: categories.map((cat, index) => ({
              '@type': 'ListItem' as const,
              position: index + 1,
              name: cat.name,
              url: `${BASE_URL}/categories/${cat.slug}`,
            })),
          }}
        />
      )}

      {/* Hero */}
      <section className="border-b bg-muted/30 px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            The best channels on the internet, picked by people who actually
            watch them.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
            A human-curated directory of content creators worth following.
            Browse by topic, discover hidden gems, and skip the algorithm.
          </p>
        </div>
      </section>

      {/* Search + Split Panel */}
      <SearchResults
        initialCategories={categories}
        initialNewestChannels={newestChannels}
        initialEditorsPicksChannels={editorsPicksChannels}
      />
    </>
  )
}

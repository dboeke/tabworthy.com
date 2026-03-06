import { getCategories } from '@/lib/db/queries'
import { CategoryCard } from '@/components/taxonomy/category-card'
import { JsonLd } from '@/components/seo/json-ld'

export const revalidate = 3600

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://tabworthy.com'

export default async function Home() {
  let categories: Awaited<ReturnType<typeof getCategories>> = []
  try {
    categories = await getCategories()
  } catch {
    // DB unavailable during build -- render empty grid
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
      <section className="border-b bg-muted/30 px-4 py-16 sm:py-20 md:py-24">
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

      {/* Category Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <h2 className="mb-8 text-2xl font-semibold tracking-tight">
          Browse Categories
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              name={category.name}
              slug={category.slug}
              description={category.description}
              channelCount={category.channelCount}
            />
          ))}
        </div>
      </section>
    </>
  )
}

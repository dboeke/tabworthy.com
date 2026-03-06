import { getCategories } from '@/lib/db/queries'
import { CategoryCard } from '@/components/taxonomy/category-card'

export const revalidate = 3600

export default async function Home() {
  let categories: Awaited<ReturnType<typeof getCategories>> = []
  try {
    categories = await getCategories()
  } catch {
    // DB unavailable during build -- render empty grid
  }

  return (
    <div className="min-h-screen">
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

      {/* Footer tagline */}
      <footer className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
        Curated by humans, not algorithms.
      </footer>
    </div>
  )
}

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Load env from .env.local for local dev
import { config } from 'dotenv'
config({ path: '.env.local' })

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required. Set it in .env.local')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)
const db = drizzle(sql, { schema })

// ─── Helper ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ─── Category data (all 42 from design/category-list.txt) ────────────────────

const categoryData = [
  { name: 'Adventure', description: 'Exploration and outdoor thrills' },
  { name: 'AI', description: 'Artificial intelligence and machine learning' },
  { name: 'Animation', description: 'Animated content and motion design' },
  { name: 'Arts', description: 'Visual arts, painting, and sculpture' },
  { name: 'Automotive', description: 'Cars, motorcycles, and vehicles' },
  { name: 'Aviation', description: 'Flight, aircraft, and aerospace' },
  { name: 'Books', description: 'Book reviews, literature, and reading' },
  { name: 'Business', description: 'Entrepreneurship and business strategy' },
  { name: 'Coding', description: 'Programming, dev tools, and software' },
  { name: 'Comedy', description: 'Humor, sketches, and stand-up' },
  { name: 'Creator Tools', description: 'Tools and tips for content creators' },
  { name: 'Culture', description: 'Cultural commentary and analysis' },
  { name: 'Design', description: 'Graphic, product, and UX design' },
  { name: 'Education', description: 'Learning, teaching, and academics' },
  { name: 'Engineering', description: 'Mechanical, civil, and electrical engineering' },
  { name: 'Entertainment', description: 'Pop culture, media, and showbiz' },
  { name: 'Fashion', description: 'Style, clothing, and fashion trends' },
  { name: 'Film & TV', description: 'Movies, television, and cinema' },
  { name: 'Food', description: 'Recipes, techniques, and food culture' },
  { name: 'Gaming', description: 'Video games, reviews, and esports' },
  { name: 'Health', description: 'Wellness, fitness, and medicine' },
  { name: 'History', description: 'Ancient civilizations to modern events' },
  { name: 'Home & Living', description: 'Interior design and home improvement' },
  { name: 'Languages', description: 'Language learning and linguistics' },
  { name: 'Lifestyle', description: 'Daily living and personal style' },
  { name: 'Making Things', description: 'DIY, crafts, and hands-on building' },
  { name: 'Money', description: 'Personal finance, investing, and economics' },
  { name: 'Music', description: 'Production, theory, and music reviews' },
  { name: 'Nature', description: 'Wildlife, ecology, and the natural world' },
  { name: 'News', description: 'Current events and journalism' },
  { name: 'Outdoors', description: 'Hiking, camping, and outdoor activities' },
  { name: 'Parenting', description: 'Raising kids and family life' },
  { name: 'Productivity', description: 'Time management and getting things done' },
  { name: 'Relationships', description: 'Dating, friendships, and social skills' },
  { name: 'Religion & Spirituality', description: 'Faith, philosophy, and spiritual practice' },
  { name: 'Science', description: 'Physics, biology, space, and scientific thinking' },
  { name: 'Self-Improvement', description: 'Personal growth and development' },
  { name: 'Sports', description: 'Athletics, competition, and sports culture' },
  { name: 'Tech', description: 'Tech reviews, gadgets, and digital culture' },
  { name: 'Travel', description: 'Destinations, guides, and travel culture' },
  { name: 'True Crime', description: 'Investigations, mysteries, and criminal cases' },
  { name: 'Urbanism', description: 'Cities, transit, and urban planning' },
]

// ─── Topic data (3-5 topics for selected categories) ─────────────────────────

const topicsByCategory: Record<string, { name: string; description: string }[]> = {
  Coding: [
    { name: 'Programming', description: 'General programming and software development' },
    { name: 'Web Development', description: 'Frontend, backend, and full-stack web dev' },
    { name: 'DevOps', description: 'Infrastructure, CI/CD, and deployment' },
  ],
  Science: [
    { name: 'Physics', description: 'Mechanics, quantum, and astrophysics' },
    { name: 'Biology', description: 'Life sciences and biological systems' },
    { name: 'Space', description: 'Astronomy, space exploration, and cosmology' },
  ],
  History: [
    { name: 'Ancient', description: 'Ancient civilizations and classical history' },
    { name: 'Modern', description: 'Modern history and contemporary events' },
    { name: 'Internet Culture', description: 'Online culture, memes, and digital history' },
  ],
  Food: [
    { name: 'Recipes', description: 'Step-by-step cooking guides' },
    { name: 'Techniques', description: 'Cooking methods and kitchen skills' },
    { name: 'Food Culture', description: 'Food history, traditions, and culture' },
  ],
  Music: [
    { name: 'Production', description: 'Music production and beat-making' },
    { name: 'Theory', description: 'Music theory and composition' },
    { name: 'Reviews', description: 'Album reviews and music criticism' },
  ],
}

// ─── Platform data ───────────────────────────────────────────────────────────

const platformData = [
  { name: 'youtube', displayName: 'YouTube', baseUrl: 'https://youtube.com' },
  { name: 'twitch', displayName: 'Twitch', baseUrl: 'https://twitch.tv' },
  { name: 'nebula', displayName: 'Nebula', baseUrl: 'https://nebula.tv' },
  { name: 'patreon', displayName: 'Patreon', baseUrl: 'https://patreon.com' },
  { name: 'substack', displayName: 'Substack', baseUrl: 'https://substack.com' },
]

// ─── Tag data ────────────────────────────────────────────────────────────────

const tagData = [
  { name: 'beginner-friendly', displayName: 'Beginner Friendly' },
  { name: 'long-form', displayName: 'Long Form' },
  { name: 'short-form', displayName: 'Short Form' },
  { name: 'weekly', displayName: 'Weekly' },
  { name: 'deep-dives', displayName: 'Deep Dives' },
  { name: 'tutorials', displayName: 'Tutorials' },
  { name: 'entertainment', displayName: 'Entertainment' },
  { name: 'educational', displayName: 'Educational' },
]

// ─── Seed function ───────────────────────────────────────────────────────────

async function seed() {
  console.log('Seeding database...')

  // 1. Seed categories
  console.log('Seeding categories...')
  const insertedCategories = await db
    .insert(schema.categories)
    .values(
      categoryData.map((cat, i) => ({
        name: cat.name,
        slug: slugify(cat.name),
        description: cat.description,
        displayOrder: i + 1,
      }))
    )
    .returning()

  const categoryMap = new Map(insertedCategories.map((c) => [c.name, c]))
  console.log(`  Inserted ${insertedCategories.length} categories`)

  // 2. Seed platforms
  console.log('Seeding platforms...')
  const insertedPlatforms = await db
    .insert(schema.platforms)
    .values(
      platformData.map((p) => ({
        name: p.name,
        displayName: p.displayName,
        baseUrl: p.baseUrl,
      }))
    )
    .returning()

  const platformMap = new Map(insertedPlatforms.map((p) => [p.name, p]))
  console.log(`  Inserted ${insertedPlatforms.length} platforms`)

  // 3. Seed topics
  console.log('Seeding topics...')
  const allTopics: Array<{
    categoryId: string
    name: string
    slug: string
    description: string
    displayOrder: number
  }> = []

  for (const [catName, topics] of Object.entries(topicsByCategory)) {
    const category = categoryMap.get(catName)
    if (!category) continue
    topics.forEach((t, i) => {
      allTopics.push({
        categoryId: category.id,
        name: t.name,
        slug: slugify(t.name),
        description: t.description,
        displayOrder: i + 1,
      })
    })
  }

  const insertedTopics = await db
    .insert(schema.topics)
    .values(allTopics)
    .returning()

  const topicMap = new Map(insertedTopics.map((t) => [t.name, t]))
  console.log(`  Inserted ${insertedTopics.length} topics`)

  // 4. Seed tags
  console.log('Seeding tags...')
  const insertedTags = await db
    .insert(schema.tags)
    .values(
      tagData.map((t) => ({
        name: t.name,
        slug: t.name,
        displayName: t.displayName,
      }))
    )
    .returning()

  const tagMap = new Map(insertedTags.map((t) => [t.name, t]))
  console.log(`  Inserted ${insertedTags.length} tags`)

  // 5. Seed creators
  console.log('Seeding creators...')
  const creatorData = [
    { name: 'Jeff Delaney', slug: 'jeff-delaney', bio: 'Creator of Fireship, delivering fast-paced dev tutorials.' },
    { name: 'Grant Sanderson', slug: 'grant-sanderson', bio: 'Mathematician and animator behind 3Blue1Brown.' },
    { name: 'Internet Historian', slug: 'internet-historian', bio: 'Documenting the wildest events in internet history.' },
  ]

  const insertedCreators = await db
    .insert(schema.creators)
    .values(creatorData)
    .returning()

  const creatorMap = new Map(insertedCreators.map((c) => [c.slug, c]))
  console.log(`  Inserted ${insertedCreators.length} creators`)

  // 6. Seed channels
  console.log('Seeding channels...')
  const youtube = platformMap.get('youtube')!
  const patreon = platformMap.get('patreon')!
  const nebula = platformMap.get('nebula')!

  const channelData = [
    {
      creatorId: creatorMap.get('jeff-delaney')!.id,
      platformId: youtube.id,
      name: 'Fireship',
      slug: 'fireship',
      platformUrl: 'https://youtube.com/@fireship',
      description: 'Fast-paced dev tutorials and tech news',
      editorialSummary:
        'Fireship delivers the fastest, most entertaining code tutorials on the internet. Jeff Delaney has a gift for distilling complex topics into 100-second videos that actually teach you something. Whether it\'s a new framework, a language comparison, or a mass tech layoff, Fireship covers it with sharp editing and sharper opinions.',
      isPrimary: true,
    },
    {
      creatorId: creatorMap.get('grant-sanderson')!.id,
      platformId: youtube.id,
      name: '3Blue1Brown',
      slug: '3blue1brown',
      platformUrl: 'https://youtube.com/@3blue1brown',
      description: 'Visual math explanations through animation',
      editorialSummary:
        'Grant Sanderson makes you feel what math looks like. His signature animation style turns abstract concepts into visual intuitions that stick with you forever. If you ever wondered why linear algebra matters or what neural networks actually compute, start here.',
      isPrimary: true,
    },
    {
      creatorId: creatorMap.get('grant-sanderson')!.id,
      platformId: patreon.id,
      name: '3Blue1Brown (Patreon)',
      slug: '3blue1brown-patreon',
      platformUrl: 'https://patreon.com/3blue1brown',
      description: 'Support 3Blue1Brown on Patreon',
      editorialSummary:
        'Support Grant Sanderson\'s mathematical visualizations on Patreon. Get early access to videos and behind-the-scenes content about the animation process.',
      isPrimary: false,
    },
    {
      creatorId: creatorMap.get('internet-historian')!.id,
      platformId: youtube.id,
      name: 'Internet Historian',
      slug: 'internet-historian',
      platformUrl: 'https://youtube.com/@InternetHistorian',
      description: 'Documenting internet culture and events',
      editorialSummary:
        'Internet Historian turns chaotic online events into cinematic documentaries. From the Fyre Festival to Balloon Boy, each video is a masterclass in storytelling that makes you laugh, cringe, and occasionally feel something real about the internet we built.',
      isPrimary: true,
    },
    {
      creatorId: creatorMap.get('internet-historian')!.id,
      platformId: nebula.id,
      name: 'Internet Historian (Nebula)',
      slug: 'internet-historian-nebula',
      platformUrl: 'https://nebula.tv/internet-historian',
      description: 'Ad-free extended cuts on Nebula',
      editorialSummary:
        'Extended, ad-free cuts of Internet Historian\'s documentaries on Nebula. If you love the YouTube versions, these are the director\'s cuts.',
      isPrimary: false,
    },
  ]

  const insertedChannels = await db
    .insert(schema.channels)
    .values(channelData)
    .returning()

  const channelMap = new Map(insertedChannels.map((c) => [c.slug, c]))
  console.log(`  Inserted ${insertedChannels.length} channels`)

  // 7. Seed channel-category associations
  console.log('Seeding channel-category associations...')
  await db.insert(schema.channelCategories).values([
    { channelId: channelMap.get('fireship')!.id, categoryId: categoryMap.get('Coding')!.id },
    { channelId: channelMap.get('3blue1brown')!.id, categoryId: categoryMap.get('Science')!.id },
    { channelId: channelMap.get('3blue1brown')!.id, categoryId: categoryMap.get('Education')!.id },
    { channelId: channelMap.get('internet-historian')!.id, categoryId: categoryMap.get('History')!.id },
    { channelId: channelMap.get('internet-historian')!.id, categoryId: categoryMap.get('Entertainment')!.id },
  ])

  // 8. Seed channel-topic associations
  console.log('Seeding channel-topic associations...')
  await db.insert(schema.channelTopics).values([
    { channelId: channelMap.get('fireship')!.id, topicId: topicMap.get('Programming')!.id },
    { channelId: channelMap.get('fireship')!.id, topicId: topicMap.get('Web Development')!.id },
    { channelId: channelMap.get('3blue1brown')!.id, topicId: topicMap.get('Physics')!.id },
    { channelId: channelMap.get('internet-historian')!.id, topicId: topicMap.get('Internet Culture')!.id },
  ])

  // 9. Seed channel-tag associations
  console.log('Seeding channel-tag associations...')
  await db.insert(schema.channelTags).values([
    { channelId: channelMap.get('fireship')!.id, tagId: tagMap.get('short-form')!.id },
    { channelId: channelMap.get('fireship')!.id, tagId: tagMap.get('tutorials')!.id },
    { channelId: channelMap.get('fireship')!.id, tagId: tagMap.get('weekly')!.id },
    { channelId: channelMap.get('3blue1brown')!.id, tagId: tagMap.get('long-form')!.id },
    { channelId: channelMap.get('3blue1brown')!.id, tagId: tagMap.get('deep-dives')!.id },
    { channelId: channelMap.get('3blue1brown')!.id, tagId: tagMap.get('educational')!.id },
    { channelId: channelMap.get('3blue1brown')!.id, tagId: tagMap.get('beginner-friendly')!.id },
    { channelId: channelMap.get('internet-historian')!.id, tagId: tagMap.get('long-form')!.id },
    { channelId: channelMap.get('internet-historian')!.id, tagId: tagMap.get('entertainment')!.id },
    { channelId: channelMap.get('internet-historian')!.id, tagId: tagMap.get('deep-dives')!.id },
  ])

  // 10. Seed content highlights
  console.log('Seeding content highlights...')
  await db.insert(schema.contentHighlights).values([
    {
      channelId: channelMap.get('fireship')!.id,
      title: 'God-Tier Developer Roadmap',
      url: 'https://www.youtube.com/watch?v=pEfrdAtAmqk',
      description: 'A comprehensive roadmap for becoming a top developer',
      displayOrder: 1,
    },
    {
      channelId: channelMap.get('fireship')!.id,
      title: '100 Seconds of Tailwind',
      url: 'https://www.youtube.com/watch?v=mr15Xzb1Ook',
      description: 'Tailwind CSS explained in 100 seconds',
      displayOrder: 2,
    },
    {
      channelId: channelMap.get('3blue1brown')!.id,
      title: 'Essence of Linear Algebra',
      url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab',
      description: 'A visual journey through the heart of linear algebra',
      displayOrder: 1,
    },
    {
      channelId: channelMap.get('3blue1brown')!.id,
      title: 'But what is a neural network?',
      url: 'https://www.youtube.com/watch?v=aircAruvnKk',
      description: 'Neural networks explained with beautiful animations',
      displayOrder: 2,
    },
    {
      channelId: channelMap.get('3blue1brown')!.id,
      title: 'The Brachistochrone',
      url: 'https://www.youtube.com/watch?v=Cld0p3a43fU',
      description: 'The fastest path between two points is not a straight line',
      displayOrder: 3,
    },
    {
      channelId: channelMap.get('internet-historian')!.id,
      title: 'The Cost of Concordia',
      url: 'https://www.youtube.com/watch?v=Qh9KBwqGxTI',
      description: 'The full story of the Costa Concordia disaster',
      displayOrder: 1,
    },
    {
      channelId: channelMap.get('internet-historian')!.id,
      title: 'The Engoodening of No Man\'s Sky',
      url: 'https://www.youtube.com/watch?v=O5BJVO3PDeQ',
      description: 'How No Man\'s Sky went from disaster to redemption',
      displayOrder: 2,
    },
  ])

  // 11. Seed related channels
  console.log('Seeding related channels...')
  await db.insert(schema.relatedChannels).values([
    {
      channelId: channelMap.get('fireship')!.id,
      relatedChannelId: channelMap.get('3blue1brown')!.id,
      displayOrder: 1,
    },
    {
      channelId: channelMap.get('3blue1brown')!.id,
      relatedChannelId: channelMap.get('fireship')!.id,
      displayOrder: 1,
    },
    {
      channelId: channelMap.get('internet-historian')!.id,
      relatedChannelId: channelMap.get('3blue1brown')!.id,
      displayOrder: 1,
    },
  ])

  console.log('\nSeeding complete!')
  console.log(`  ${insertedCategories.length} categories`)
  console.log(`  ${insertedPlatforms.length} platforms`)
  console.log(`  ${insertedTopics.length} topics`)
  console.log(`  ${insertedTags.length} tags`)
  console.log(`  ${insertedCreators.length} creators`)
  console.log(`  ${insertedChannels.length} channels`)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})

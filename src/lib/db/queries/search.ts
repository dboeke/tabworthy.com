import { db } from '../index'
import { eq, desc, sql, and } from 'drizzle-orm'
import {
  channels,
  creators,
  platforms,
  channelTags,
  tags,
  categories,
  topics,
  channelCategories,
  channelTopics,
} from '../schema'

// ─── Channel Search (Full-Text) ─────────────────────────────────────────────

interface SearchChannelsOptions {
  categorySlug?: string
  limit?: number
}

export async function searchChannels(
  query: string,
  options: SearchChannelsOptions = {}
) {
  const { categorySlug, limit = 20 } = options

  const conditions = [
    sql`(
      setweight(to_tsvector('english', coalesce(${channels.name}, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(${channels.description}, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(${channels.editorialSummary}, '')), 'C')
    ) @@ websearch_to_tsquery('english', ${query})`,
  ]

  let baseQuery

  if (categorySlug) {
    // Join through categories to filter by category slug
    baseQuery = db
      .select({
        id: channels.id,
        name: channels.name,
        slug: channels.slug,
        description: channels.description,
        editorialSummary: channels.editorialSummary,
        platformUrl: channels.platformUrl,
        isPrimary: channels.isPrimary,
        isEditorsPick: channels.isEditorsPick,
        createdAt: channels.createdAt,
        updatedAt: channels.updatedAt,
        creatorId: channels.creatorId,
        platformId: channels.platformId,
        creatorName: creators.name,
        creatorSlug: creators.slug,
        creatorBio: creators.bio,
        creatorCreatedAt: creators.createdAt,
        platformName: platforms.name,
        platformDisplayName: platforms.displayName,
        platformIconUrl: platforms.iconUrl,
        platformBaseUrl: platforms.baseUrl,
        platformCreatedAt: platforms.createdAt,
        rank: sql<number>`ts_rank(
          setweight(to_tsvector('english', coalesce(${channels.name}, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(${channels.description}, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(${channels.editorialSummary}, '')), 'C'),
          websearch_to_tsquery('english', ${query})
        )`.as('rank'),
      })
      .from(channels)
      .innerJoin(creators, eq(creators.id, channels.creatorId))
      .innerJoin(platforms, eq(platforms.id, channels.platformId))
      .innerJoin(
        channelCategories,
        eq(channelCategories.channelId, channels.id)
      )
      .innerJoin(
        categories,
        and(
          eq(categories.id, channelCategories.categoryId),
          eq(categories.slug, categorySlug)
        )
      )
      .where(
        sql`(
          setweight(to_tsvector('english', coalesce(${channels.name}, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(${channels.description}, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(${channels.editorialSummary}, '')), 'C')
        ) @@ websearch_to_tsquery('english', ${query})`
      )
      .orderBy(sql`rank DESC`)
      .limit(limit)
  } else {
    baseQuery = db
      .select({
        id: channels.id,
        name: channels.name,
        slug: channels.slug,
        description: channels.description,
        editorialSummary: channels.editorialSummary,
        platformUrl: channels.platformUrl,
        isPrimary: channels.isPrimary,
        isEditorsPick: channels.isEditorsPick,
        createdAt: channels.createdAt,
        updatedAt: channels.updatedAt,
        creatorId: channels.creatorId,
        platformId: channels.platformId,
        creatorName: creators.name,
        creatorSlug: creators.slug,
        creatorBio: creators.bio,
        creatorCreatedAt: creators.createdAt,
        platformName: platforms.name,
        platformDisplayName: platforms.displayName,
        platformIconUrl: platforms.iconUrl,
        platformBaseUrl: platforms.baseUrl,
        platformCreatedAt: platforms.createdAt,
        rank: sql<number>`ts_rank(
          setweight(to_tsvector('english', coalesce(${channels.name}, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(${channels.description}, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(${channels.editorialSummary}, '')), 'C'),
          websearch_to_tsquery('english', ${query})
        )`.as('rank'),
      })
      .from(channels)
      .innerJoin(creators, eq(creators.id, channels.creatorId))
      .innerJoin(platforms, eq(platforms.id, channels.platformId))
      .where(
        sql`(
          setweight(to_tsvector('english', coalesce(${channels.name}, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(${channels.description}, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(${channels.editorialSummary}, '')), 'C')
        ) @@ websearch_to_tsquery('english', ${query})`
      )
      .orderBy(sql`rank DESC`)
      .limit(limit)
  }

  const rows = await baseQuery

  // Fetch tags for each channel
  const channelIds = rows.map((r) => r.id)
  const channelTagRows =
    channelIds.length > 0
      ? await db
          .select({
            channelId: channelTags.channelId,
            tagId: tags.id,
            tagName: tags.name,
            tagSlug: tags.slug,
            tagDisplayName: tags.displayName,
          })
          .from(channelTags)
          .innerJoin(tags, eq(tags.id, channelTags.tagId))
          .where(
            sql`${channelTags.channelId} IN ${channelIds.length > 0 ? sql`(${sql.join(channelIds.map((id) => sql`${id}`), sql`, `)})` : sql`(NULL)`}`
          )
      : []

  const tagsByChannel = new Map<
    string,
    Array<{ id: string; name: string; slug: string; displayName: string }>
  >()
  for (const row of channelTagRows) {
    const existing = tagsByChannel.get(row.channelId) ?? []
    existing.push({
      id: row.tagId,
      name: row.tagName,
      slug: row.tagSlug,
      displayName: row.tagDisplayName,
    })
    tagsByChannel.set(row.channelId, existing)
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    editorialSummary: row.editorialSummary,
    platformUrl: row.platformUrl,
    isPrimary: row.isPrimary,
    isEditorsPick: row.isEditorsPick,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    creator: {
      id: row.creatorId,
      name: row.creatorName,
      slug: row.creatorSlug,
      bio: row.creatorBio,
      createdAt: row.creatorCreatedAt,
    },
    platform: {
      id: row.platformId,
      name: row.platformName,
      displayName: row.platformDisplayName,
      iconUrl: row.platformIconUrl,
      baseUrl: row.platformBaseUrl,
      createdAt: row.platformCreatedAt,
    },
    tags: tagsByChannel.get(row.id) ?? [],
  }))
}

// ─── Taxonomy Search (pg_trgm) ──────────────────────────────────────────────

export async function searchTaxonomy(query: string) {
  const categoryResults = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      displayOrder: categories.displayOrder,
      similarity: sql<number>`similarity(${categories.name}, ${query})`.as(
        'sim'
      ),
    })
    .from(categories)
    .where(
      sql`(${categories.name} % ${query} OR ${categories.name} ILIKE ${'%' + query + '%'})`
    )
    .orderBy(sql`sim DESC`)
    .limit(5)

  const topicResults = await db
    .select({
      id: topics.id,
      name: topics.name,
      slug: topics.slug,
      description: topics.description,
      categoryId: topics.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      similarity: sql<number>`similarity(${topics.name}, ${query})`.as('sim'),
    })
    .from(topics)
    .innerJoin(categories, eq(categories.id, topics.categoryId))
    .where(
      sql`(${topics.name} % ${query} OR ${topics.name} ILIKE ${'%' + query + '%'})`
    )
    .orderBy(sql`sim DESC`)
    .limit(10)

  return {
    categories: categoryResults.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      displayOrder: c.displayOrder,
    })),
    topics: topicResults.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      category: {
        id: t.categoryId,
        name: t.categoryName,
        slug: t.categorySlug,
      },
    })),
  }
}

// ─── Broaden Search (taxonomy fallback) ──────────────────────────────────────

export async function broadenSearch(query: string) {
  // Find best matching taxonomy entity
  const taxonomy = await searchTaxonomy(query)

  // Try topics first (more specific)
  if (taxonomy.topics.length > 0) {
    const bestTopic = taxonomy.topics[0]
    const topicChannelRows = await db
      .select({ channelId: channelTopics.channelId })
      .from(channelTopics)
      .innerJoin(topics, eq(topics.id, channelTopics.topicId))
      .where(eq(topics.id, bestTopic.id))

    const channelIds = topicChannelRows.map((r) => r.channelId)
    if (channelIds.length > 0) {
      const channelResults = await getChannelsByIds(channelIds)
      return {
        channels: channelResults,
        broadened: true,
        matchedEntity: bestTopic.name,
        matchedType: 'topic' as const,
      }
    }
  }

  // Fall back to categories
  if (taxonomy.categories.length > 0) {
    const bestCategory = taxonomy.categories[0]
    const categoryChannelRows = await db
      .select({ channelId: channelCategories.channelId })
      .from(channelCategories)
      .where(eq(channelCategories.categoryId, bestCategory.id))

    const channelIds = categoryChannelRows.map((r) => r.channelId)
    if (channelIds.length > 0) {
      const channelResults = await getChannelsByIds(channelIds)
      return {
        channels: channelResults,
        broadened: true,
        matchedEntity: bestCategory.name,
        matchedType: 'category' as const,
      }
    }
  }

  return {
    channels: [],
    broadened: false,
    matchedEntity: null,
    matchedType: null,
  }
}

// ─── Autocomplete (pg_trgm fuzzy) ───────────────────────────────────────────

export async function autocomplete(query: string) {
  const [channelMatches, categoryMatches, topicMatches, tagMatches] =
    await Promise.all([
      db
        .select({
          id: channels.id,
          name: channels.name,
          slug: channels.slug,
          type: sql<string>`'channel'`.as('type'),
          similarity: sql<number>`similarity(${channels.name}, ${query})`.as(
            'sim'
          ),
        })
        .from(channels)
        .where(
          sql`(${channels.name} % ${query} OR ${channels.name} ILIKE ${'%' + query + '%'})`
        )
        .orderBy(sql`sim DESC`)
        .limit(5),

      db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          type: sql<string>`'category'`.as('type'),
          similarity:
            sql<number>`similarity(${categories.name}, ${query})`.as('sim'),
        })
        .from(categories)
        .where(
          sql`(${categories.name} % ${query} OR ${categories.name} ILIKE ${'%' + query + '%'})`
        )
        .orderBy(sql`sim DESC`)
        .limit(5),

      db
        .select({
          id: topics.id,
          name: topics.name,
          slug: topics.slug,
          type: sql<string>`'topic'`.as('type'),
          similarity: sql<number>`similarity(${topics.name}, ${query})`.as(
            'sim'
          ),
        })
        .from(topics)
        .where(
          sql`(${topics.name} % ${query} OR ${topics.name} ILIKE ${'%' + query + '%'})`
        )
        .orderBy(sql`sim DESC`)
        .limit(5),

      db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
          type: sql<string>`'tag'`.as('type'),
          similarity: sql<number>`similarity(${tags.name}, ${query})`.as(
            'sim'
          ),
        })
        .from(tags)
        .where(
          sql`(${tags.name} % ${query} OR ${tags.name} ILIKE ${'%' + query + '%'})`
        )
        .orderBy(sql`sim DESC`)
        .limit(5),
    ])

  return {
    channels: channelMatches,
    categories: categoryMatches,
    topics: topicMatches,
    tags: tagMatches,
  }
}

// ─── Feeds ──────────────────────────────────────────────────────────────────

export async function getNewestChannels(limit = 10) {
  const rows = await db.query.channels.findMany({
    orderBy: (channels, { desc }) => [desc(channels.createdAt)],
    limit,
    with: {
      creator: true,
      platform: true,
      channelTags: {
        with: {
          tag: true,
        },
      },
    },
  })

  return rows.map((ch) => ({
    ...ch,
    tags: ch.channelTags.map((ct) => ct.tag),
  }))
}

export async function getEditorsPicks(limit = 10) {
  const rows = await db.query.channels.findMany({
    where: eq(channels.isEditorsPick, true),
    orderBy: (channels, { desc }) => [desc(channels.updatedAt)],
    limit,
    with: {
      creator: true,
      platform: true,
      channelTags: {
        with: {
          tag: true,
        },
      },
    },
  })

  return rows.map((ch) => ({
    ...ch,
    tags: ch.channelTags.map((ct) => ct.tag),
  }))
}

// ─── Internal helpers ───────────────────────────────────────────────────────

async function getChannelsByIds(channelIds: string[]) {
  const rows = await db.query.channels.findMany({
    where: sql`${channels.id} IN (${sql.join(channelIds.map((id) => sql`${id}`), sql`, `)})`,
    with: {
      creator: true,
      platform: true,
      channelTags: {
        with: {
          tag: true,
        },
      },
    },
  })

  return rows.map((ch) => ({
    ...ch,
    tags: ch.channelTags.map((ct) => ct.tag),
  }))
}

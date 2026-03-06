import { db } from '../index'
import { eq, and, inArray, sql } from 'drizzle-orm'
import {
  categories,
  topics,
  channels,
  channelCategories,
  channelTopics,
  channelTags,
  tags,
  creators,
  platforms,
} from '../schema'

/**
 * Get all categories ordered by displayOrder, with channel count.
 */
export async function getCategories() {
  const result = await db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.displayOrder)],
  })

  // Get channel counts per category (channels assigned via channelCategories + channelTopics)
  const counts = await db
    .select({
      categoryId: categories.id,
      count: sql<number>`count(distinct ${channels.id})`.as('count'),
    })
    .from(categories)
    .leftJoin(channelCategories, eq(channelCategories.categoryId, categories.id))
    .leftJoin(topics, eq(topics.categoryId, categories.id))
    .leftJoin(channelTopics, eq(channelTopics.topicId, topics.id))
    .leftJoin(
      channels,
      sql`${channels.id} = ${channelCategories.channelId} OR ${channels.id} = ${channelTopics.channelId}`
    )
    .groupBy(categories.id)

  const countMap = new Map(counts.map((c) => [c.categoryId, Number(c.count)]))

  return result.map((cat) => ({
    ...cat,
    channelCount: countMap.get(cat.id) ?? 0,
  }))
}

/**
 * Get a category by slug with its topics and directly assigned channels.
 */
export async function getCategoryBySlug(slug: string) {
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
    with: {
      topics: {
        orderBy: (topics, { asc }) => [asc(topics.displayOrder)],
      },
      channelCategories: {
        with: {
          channel: {
            with: {
              creator: true,
              platform: true,
              channelTags: {
                with: {
                  tag: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!category) return null

  // Flatten the channel data
  const directChannels = category.channelCategories.map((cc) => ({
    ...cc.channel,
    tags: cc.channel.channelTags.map((ct) => ct.tag),
  }))

  return {
    ...category,
    directChannels,
  }
}

/**
 * Get a topic by slug within a category, with parent category info.
 */
export async function getTopicBySlug(categorySlug: string, topicSlug: string) {
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, categorySlug),
  })

  if (!category) return null

  const topic = await db.query.topics.findFirst({
    where: and(eq(topics.categoryId, category.id), eq(topics.slug, topicSlug)),
    with: {
      category: true,
    },
  })

  if (!topic) return null

  return topic
}

/**
 * Get channels for a topic, optionally filtered by tags (AND logic).
 */
export async function getChannelsForTopic(
  topicId: string,
  tagSlugs?: string[]
) {
  // Get all channel IDs in this topic
  const topicChannelRows = await db
    .select({ channelId: channelTopics.channelId })
    .from(channelTopics)
    .where(eq(channelTopics.topicId, topicId))

  let channelIds = topicChannelRows.map((r) => r.channelId)

  if (channelIds.length === 0) return []

  // If tag filtering, narrow down to channels that have ALL specified tags
  if (tagSlugs && tagSlugs.length > 0) {
    // Get tag IDs from slugs
    const matchingTags = await db
      .select({ id: tags.id })
      .from(tags)
      .where(inArray(tags.slug, tagSlugs))

    const tagIds = matchingTags.map((t) => t.id)

    if (tagIds.length !== tagSlugs.length) {
      // Some tags don't exist -- no results possible
      return []
    }

    // For AND logic: find channels that have ALL specified tags
    const filteredRows = await db
      .select({
        channelId: channelTags.channelId,
        tagCount: sql<number>`count(distinct ${channelTags.tagId})`.as(
          'tag_count'
        ),
      })
      .from(channelTags)
      .where(
        and(
          inArray(channelTags.channelId, channelIds),
          inArray(channelTags.tagId, tagIds)
        )
      )
      .groupBy(channelTags.channelId)
      .having(sql`count(distinct ${channelTags.tagId}) = ${tagIds.length}`)

    channelIds = filteredRows.map((r) => r.channelId)

    if (channelIds.length === 0) return []
  }

  // Fetch full channel data
  const result = await db.query.channels.findMany({
    where: inArray(channels.id, channelIds),
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

  return result.map((ch) => ({
    ...ch,
    tags: ch.channelTags.map((ct) => ct.tag),
  }))
}

/**
 * Get channels directly assigned to a category via channelCategories.
 */
export async function getChannelsForCategory(categoryId: string) {
  const rows = await db.query.channelCategories.findMany({
    where: eq(channelCategories.categoryId, categoryId),
    with: {
      channel: {
        with: {
          creator: true,
          platform: true,
          channelTags: {
            with: {
              tag: true,
            },
          },
        },
      },
    },
  })

  return rows.map((r) => ({
    ...r.channel,
    tags: r.channel.channelTags.map((ct) => ct.tag),
  }))
}

/**
 * Get all unique tags used by channels in a topic.
 */
export async function getAllTagsForTopic(topicId: string) {
  const rows = await db
    .selectDistinct({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      displayName: tags.displayName,
    })
    .from(tags)
    .innerJoin(channelTags, eq(channelTags.tagId, tags.id))
    .innerJoin(channelTopics, eq(channelTopics.channelId, channelTags.channelId))
    .where(eq(channelTopics.topicId, topicId))

  return rows
}

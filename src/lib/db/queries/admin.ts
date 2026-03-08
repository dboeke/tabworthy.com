import { db } from '../index'
import { eq, sql, desc } from 'drizzle-orm'
import {
  channels,
  creators,
  platforms,
  categories,
  topics,
  tags,
} from '../schema'

/**
 * Get all channels for the admin list page.
 * Includes creator name, platform name, topic count, tag count, isEditorsPick.
 * Ordered by updatedAt descending.
 */
export async function getAdminChannels() {
  const result = await db.query.channels.findMany({
    orderBy: [desc(channels.updatedAt)],
    with: {
      creator: true,
      platform: true,
      channelTopics: true,
      channelTags: true,
    },
  })

  return result.map((ch) => ({
    id: ch.id,
    name: ch.name,
    slug: ch.slug,
    isEditorsPick: ch.isEditorsPick,
    updatedAt: ch.updatedAt,
    creatorName: ch.creator.name,
    platformName: ch.platform.displayName,
    topicCount: ch.channelTopics.length,
    tagCount: ch.channelTags.length,
  }))
}

/**
 * Get a single channel by ID with ALL relations loaded for the edit form.
 */
export async function getAdminChannelById(id: string) {
  const channel = await db.query.channels.findFirst({
    where: eq(channels.id, id),
    with: {
      creator: true,
      platform: true,
      channelTopics: {
        with: {
          topic: {
            with: {
              category: true,
            },
          },
        },
      },
      channelCategories: {
        with: {
          category: true,
        },
      },
      channelTags: {
        with: {
          tag: true,
        },
      },
      contentHighlights: {
        orderBy: (highlights, { asc }) => [asc(highlights.displayOrder)],
      },
      relatedFrom: {
        orderBy: (rel, { asc }) => [asc(rel.displayOrder)],
        with: {
          relatedChannel: true,
        },
      },
    },
  })

  return channel ?? null
}

/**
 * Get all form data needed for channel create/edit forms.
 * Returns creators, platforms, categories (with topics), and tags.
 */
export async function getAdminFormData() {
  const [allCreators, allPlatforms, allCategories, allTags, allChannels] =
    await Promise.all([
      db.query.creators.findMany({
        orderBy: (creators, { asc }) => [asc(creators.name)],
      }),
      db.query.platforms.findMany({
        orderBy: (platforms, { asc }) => [asc(platforms.displayName)],
      }),
      db.query.categories.findMany({
        orderBy: (categories, { asc }) => [asc(categories.displayOrder)],
        with: {
          topics: {
            orderBy: (topics, { asc }) => [asc(topics.displayOrder)],
          },
        },
      }),
      db.query.tags.findMany({
        orderBy: (tags, { asc }) => [asc(tags.name)],
      }),
      db.query.channels.findMany({
        columns: { id: true, name: true },
        orderBy: (channels, { asc }) => [asc(channels.name)],
      }),
    ])

  return {
    creators: allCreators,
    platforms: allPlatforms,
    categories: allCategories,
    tags: allTags,
    channels: allChannels,
  }
}

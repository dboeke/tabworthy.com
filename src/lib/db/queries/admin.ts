import { db } from '../index'
import { eq, sql, desc } from 'drizzle-orm'
import {
  channels,
  creators,
  platforms,
  categories,
  topics,
  tags,
  channelCategories,
  channelTopics,
  channelTags,
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

// ─── Taxonomy Admin Queries ─────────────────────────────────────────────────

/**
 * Get all categories ordered by displayOrder, with topic count and channel count.
 */
export async function getAdminCategories() {
  const result = await db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.displayOrder)],
    with: {
      topics: true,
      channelCategories: true,
    },
  })

  return result.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    displayOrder: cat.displayOrder,
    createdAt: cat.createdAt,
    topicCount: cat.topics.length,
    channelCount: cat.channelCategories.length,
  }))
}

/**
 * Get a single category by ID with its topics.
 */
export async function getAdminCategoryById(id: string) {
  return db.query.categories.findFirst({
    where: eq(categories.id, id),
    with: {
      topics: {
        orderBy: (topics, { asc }) => [asc(topics.displayOrder)],
      },
    },
  })
}

/**
 * Get all topics grouped by category, with channel count.
 * Optionally filter by categoryId.
 */
export async function getAdminTopics(categoryId?: string) {
  const allCategories = await db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.displayOrder)],
    with: {
      topics: {
        orderBy: (topics, { asc }) => [asc(topics.displayOrder)],
        with: {
          channelTopics: true,
        },
      },
    },
  })

  const result = allCategories.flatMap((cat) =>
    cat.topics
      .filter(() => !categoryId || cat.id === categoryId)
      .map((topic) => ({
        id: topic.id,
        name: topic.name,
        slug: topic.slug,
        description: topic.description,
        displayOrder: topic.displayOrder,
        categoryId: cat.id,
        categoryName: cat.name,
        channelCount: topic.channelTopics.length,
        createdAt: topic.createdAt,
      }))
  )

  return result
}

/**
 * Get topics for a specific category (for sortable list).
 */
export async function getAdminTopicsByCategory(categoryId: string) {
  return db.query.topics.findMany({
    where: eq(topics.categoryId, categoryId),
    orderBy: (topics, { asc }) => [asc(topics.displayOrder)],
  })
}

/**
 * Get a single topic by ID with its category.
 */
export async function getAdminTopicById(id: string) {
  return db.query.topics.findFirst({
    where: eq(topics.id, id),
    with: {
      category: true,
    },
  })
}

/**
 * Get all tags with channel usage count.
 */
export async function getAdminTags() {
  const result = await db.query.tags.findMany({
    orderBy: (tags, { asc }) => [asc(tags.name)],
    with: {
      channelTags: true,
    },
  })

  return result.map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    displayName: tag.displayName,
    channelCount: tag.channelTags.length,
  }))
}

/**
 * Get a single tag by ID.
 */
export async function getAdminTagById(id: string) {
  return db.query.tags.findFirst({
    where: eq(tags.id, id),
  })
}

/**
 * Get all categories (minimal) for topic form parent selector.
 */
export async function getAdminCategoriesForSelect() {
  return db.query.categories.findMany({
    columns: { id: true, name: true },
    orderBy: (categories, { asc }) => [asc(categories.displayOrder)],
  })
}

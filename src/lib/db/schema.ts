import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  primaryKey,
  unique,
  check,
  index,
} from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'

// ─── Platforms ───────────────────────────────────────────────────────────────
// Database table (not enum) — satisfies TECH-04 (platform-agnostic, extensible)

export const platforms = pgTable('platforms', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  iconUrl: varchar('icon_url', { length: 500 }),
  baseUrl: varchar('base_url', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const platformsRelations = relations(platforms, ({ many }) => ({
  channels: many(channels),
}))

// ─── Categories ──────────────────────────────────────────────────────────────

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    description: text('description'),
    displayOrder: integer('display_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('categories_name_trgm_idx').using(
      'gin',
      sql`${table.name} gin_trgm_ops`
    ),
  ]
)

export const categoriesRelations = relations(categories, ({ many }) => ({
  topics: many(topics),
  channelCategories: many(channelCategories),
}))

// ─── Topics ──────────────────────────────────────────────────────────────────

export const topics = pgTable(
  'topics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull(),
    description: text('description'),
    displayOrder: integer('display_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('topics_category_slug_unique').on(table.categoryId, table.slug),
    index('topics_name_trgm_idx').using(
      'gin',
      sql`${table.name} gin_trgm_ops`
    ),
  ]
)

export const topicsRelations = relations(topics, ({ one, many }) => ({
  category: one(categories, {
    fields: [topics.categoryId],
    references: [categories.id],
  }),
  channelTopics: many(channelTopics),
}))

// ─── Creators ────────────────────────────────────────────────────────────────
// Separated from channels — satisfies CHAN-06 (multi-platform grouping)

export const creators = pgTable('creators', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  bio: text('bio'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const creatorsRelations = relations(creators, ({ many }) => ({
  channels: many(channels),
}))

// ─── Channels ────────────────────────────────────────────────────────────────
// No subscriber_count field — user decision: no subscriber counts

export const channels = pgTable(
  'channels',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    creatorId: uuid('creator_id')
      .notNull()
      .references(() => creators.id, { onDelete: 'cascade' }),
    platformId: uuid('platform_id')
      .notNull()
      .references(() => platforms.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 200 }).notNull(),
    slug: varchar('slug', { length: 200 }).notNull().unique(),
    platformUrl: varchar('platform_url', { length: 500 }),
    description: text('description'),
    editorialSummary: text('editorial_summary').notNull(),
    isPrimary: boolean('is_primary').notNull().default(false),
    isEditorsPick: boolean('is_editors_pick').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('channels_search_idx').using(
      'gin',
      sql`(
        setweight(to_tsvector('english', coalesce(${table.name}, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(${table.description}, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(${table.editorialSummary}, '')), 'C')
      )`
    ),
    index('channels_name_trgm_idx').using(
      'gin',
      sql`${table.name} gin_trgm_ops`
    ),
  ]
)

export const channelsRelations = relations(channels, ({ one, many }) => ({
  creator: one(creators, {
    fields: [channels.creatorId],
    references: [creators.id],
  }),
  platform: one(platforms, {
    fields: [channels.platformId],
    references: [platforms.id],
  }),
  channelTopics: many(channelTopics),
  channelCategories: many(channelCategories),
  channelTags: many(channelTags),
  contentHighlights: many(contentHighlights),
  relatedFrom: many(relatedChannels, { relationName: 'relatedFrom' }),
  relatedTo: many(relatedChannels, { relationName: 'relatedTo' }),
}))

// ─── Channel-Topics (many-to-many) ──────────────────────────────────────────

export const channelTopics = pgTable(
  'channel_topics',
  {
    channelId: uuid('channel_id')
      .notNull()
      .references(() => channels.id, { onDelete: 'cascade' }),
    topicId: uuid('topic_id')
      .notNull()
      .references(() => topics.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.channelId, table.topicId] })]
)

export const channelTopicsRelations = relations(channelTopics, ({ one }) => ({
  channel: one(channels, {
    fields: [channelTopics.channelId],
    references: [channels.id],
  }),
  topic: one(topics, {
    fields: [channelTopics.topicId],
    references: [topics.id],
  }),
}))

// ─── Channel-Categories (many-to-many) ──────────────────────────────────────
// Channels assigned directly to a category (not just through topics)

export const channelCategories = pgTable(
  'channel_categories',
  {
    channelId: uuid('channel_id')
      .notNull()
      .references(() => channels.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.channelId, table.categoryId] })]
)

export const channelCategoriesRelations = relations(
  channelCategories,
  ({ one }) => ({
    channel: one(channels, {
      fields: [channelCategories.channelId],
      references: [channels.id],
    }),
    category: one(categories, {
      fields: [channelCategories.categoryId],
      references: [categories.id],
    }),
  })
)

// ─── Tags ────────────────────────────────────────────────────────────────────

export const tags = pgTable(
  'tags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    displayName: varchar('display_name', { length: 100 }).notNull(),
  },
  (table) => [
    index('tags_name_trgm_idx').using(
      'gin',
      sql`${table.name} gin_trgm_ops`
    ),
  ]
)

export const tagsRelations = relations(tags, ({ many }) => ({
  channelTags: many(channelTags),
}))

// ─── Channel-Tags (many-to-many) ────────────────────────────────────────────

export const channelTags = pgTable(
  'channel_tags',
  {
    channelId: uuid('channel_id')
      .notNull()
      .references(() => channels.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.channelId, table.tagId] })]
)

export const channelTagsRelations = relations(channelTags, ({ one }) => ({
  channel: one(channels, {
    fields: [channelTags.channelId],
    references: [channels.id],
  }),
  tag: one(tags, {
    fields: [channelTags.tagId],
    references: [tags.id],
  }),
}))

// ─── Content Highlights ──────────────────────────────────────────────────────

export const contentHighlights = pgTable('content_highlights', {
  id: uuid('id').primaryKey().defaultRandom(),
  channelId: uuid('channel_id')
    .notNull()
    .references(() => channels.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 300 }).notNull(),
  url: varchar('url', { length: 500 }),
  description: text('description'),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const contentHighlightsRelations = relations(
  contentHighlights,
  ({ one }) => ({
    channel: one(channels, {
      fields: [contentHighlights.channelId],
      references: [channels.id],
    }),
  })
)

// ─── Related Channels ────────────────────────────────────────────────────────

export const relatedChannels = pgTable(
  'related_channels',
  {
    channelId: uuid('channel_id')
      .notNull()
      .references(() => channels.id, { onDelete: 'cascade' }),
    relatedChannelId: uuid('related_channel_id')
      .notNull()
      .references(() => channels.id, { onDelete: 'cascade' }),
    displayOrder: integer('display_order').notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.channelId, table.relatedChannelId] }),
    check(
      'related_channels_no_self_ref',
      sql`${table.channelId} != ${table.relatedChannelId}`
    ),
  ]
)

export const relatedChannelsRelations = relations(
  relatedChannels,
  ({ one }) => ({
    channel: one(channels, {
      fields: [relatedChannels.channelId],
      references: [channels.id],
      relationName: 'relatedFrom',
    }),
    relatedChannel: one(channels, {
      fields: [relatedChannels.relatedChannelId],
      references: [channels.id],
      relationName: 'relatedTo',
    }),
  })
)

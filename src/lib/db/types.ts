import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import * as schema from './schema'

// Select types (for reading from DB)
export type Platform = InferSelectModel<typeof schema.platforms>
export type Category = InferSelectModel<typeof schema.categories>
export type Topic = InferSelectModel<typeof schema.topics>
export type Creator = InferSelectModel<typeof schema.creators>
export type Channel = InferSelectModel<typeof schema.channels>
export type Tag = InferSelectModel<typeof schema.tags>
export type ChannelTopic = InferSelectModel<typeof schema.channelTopics>
export type ChannelCategory = InferSelectModel<typeof schema.channelCategories>
export type ChannelTag = InferSelectModel<typeof schema.channelTags>
export type ContentHighlight = InferSelectModel<typeof schema.contentHighlights>
export type RelatedChannel = InferSelectModel<typeof schema.relatedChannels>

// Insert types (for writing to DB)
export type NewPlatform = InferInsertModel<typeof schema.platforms>
export type NewCategory = InferInsertModel<typeof schema.categories>
export type NewTopic = InferInsertModel<typeof schema.topics>
export type NewCreator = InferInsertModel<typeof schema.creators>
export type NewChannel = InferInsertModel<typeof schema.channels>
export type NewTag = InferInsertModel<typeof schema.tags>
export type NewContentHighlight = InferInsertModel<typeof schema.contentHighlights>

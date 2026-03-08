'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import {
  channels,
  creators,
  channelTopics,
  channelCategories,
  channelTags,
  contentHighlights,
  relatedChannels,
} from '@/lib/db/schema'
import slugify from 'slugify'

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function generateSlug(name: string): string {
  return slugify(name, { lower: true, strict: true })
}

function parseJsonField<T>(formData: FormData, key: string): T[] {
  const raw = formData.get(key) as string | null
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function revalidateAll() {
  revalidatePath('/admin/channels')
  revalidatePath('/')
  revalidatePath('/categories', 'layout')
}

// ─── Create Channel ─────────────────────────────────────────────────────────

export async function createChannel(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  if (!name) throw new Error('Channel name is required')

  const slug = (formData.get('slug') as string)?.trim() || generateSlug(name)
  const platformId = formData.get('platformId') as string
  const platformUrl = (formData.get('platformUrl') as string)?.trim() || null
  const description = (formData.get('description') as string)?.trim() || null
  const editorialSummary = (formData.get('editorialSummary') as string)?.trim() || ''
  const isEditorsPick = formData.get('isEditorsPick') === 'on'
  const isPrimary = formData.get('isPrimary') === 'on'

  // Handle creator: either existing ID or create new
  let creatorId = formData.get('creatorId') as string
  const newCreatorName = (formData.get('newCreatorName') as string)?.trim()

  if (newCreatorName && !creatorId) {
    const [newCreator] = await db
      .insert(creators)
      .values({
        name: newCreatorName,
        slug: generateSlug(newCreatorName),
      })
      .returning({ id: creators.id })
    creatorId = newCreator.id
  }

  if (!creatorId) throw new Error('Creator is required')
  if (!platformId) throw new Error('Platform is required')

  // Insert channel
  const [channel] = await db
    .insert(channels)
    .values({
      name,
      slug,
      creatorId,
      platformId,
      platformUrl,
      description,
      editorialSummary,
      isEditorsPick,
      isPrimary,
    })
    .returning({ id: channels.id })

  // Insert junction rows
  const topicIds = parseJsonField<string>(formData, 'topicIds')
  const categoryIds = parseJsonField<string>(formData, 'categoryIds')
  const tagIds = parseJsonField<string>(formData, 'tagIds')
  const highlights = parseJsonField<{
    title: string
    url?: string
    description?: string
    displayOrder: number
  }>(formData, 'highlights')
  const related = parseJsonField<{
    relatedChannelId: string
    displayOrder: number
  }>(formData, 'relatedChannels')

  const promises: Promise<unknown>[] = []

  if (topicIds.length > 0) {
    promises.push(
      db.insert(channelTopics).values(
        topicIds.map((topicId) => ({
          channelId: channel.id,
          topicId,
        }))
      )
    )
  }

  if (categoryIds.length > 0) {
    promises.push(
      db.insert(channelCategories).values(
        categoryIds.map((categoryId) => ({
          channelId: channel.id,
          categoryId,
        }))
      )
    )
  }

  if (tagIds.length > 0) {
    promises.push(
      db.insert(channelTags).values(
        tagIds.map((tagId) => ({
          channelId: channel.id,
          tagId,
        }))
      )
    )
  }

  if (highlights.length > 0) {
    promises.push(
      db.insert(contentHighlights).values(
        highlights.map((h) => ({
          channelId: channel.id,
          title: h.title,
          url: h.url || null,
          description: h.description || null,
          displayOrder: h.displayOrder,
        }))
      )
    )
  }

  if (related.length > 0) {
    promises.push(
      db.insert(relatedChannels).values(
        related.map((r) => ({
          channelId: channel.id,
          relatedChannelId: r.relatedChannelId,
          displayOrder: r.displayOrder,
        }))
      )
    )
  }

  await Promise.all(promises)

  revalidateAll()
  redirect('/admin/channels')
}

// ─── Update Channel ─────────────────────────────────────────────────────────

export async function updateChannel(id: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  if (!name) throw new Error('Channel name is required')

  const slug = (formData.get('slug') as string)?.trim() || generateSlug(name)
  const platformId = formData.get('platformId') as string
  const platformUrl = (formData.get('platformUrl') as string)?.trim() || null
  const description = (formData.get('description') as string)?.trim() || null
  const editorialSummary = (formData.get('editorialSummary') as string)?.trim() || ''
  const isEditorsPick = formData.get('isEditorsPick') === 'on'
  const isPrimary = formData.get('isPrimary') === 'on'

  // Handle creator
  let creatorId = formData.get('creatorId') as string
  const newCreatorName = (formData.get('newCreatorName') as string)?.trim()

  if (newCreatorName && !creatorId) {
    const [newCreator] = await db
      .insert(creators)
      .values({
        name: newCreatorName,
        slug: generateSlug(newCreatorName),
      })
      .returning({ id: creators.id })
    creatorId = newCreator.id
  }

  if (!creatorId) throw new Error('Creator is required')
  if (!platformId) throw new Error('Platform is required')

  // Update channel
  await db
    .update(channels)
    .set({
      name,
      slug,
      creatorId,
      platformId,
      platformUrl,
      description,
      editorialSummary,
      isEditorsPick,
      isPrimary,
      updatedAt: new Date(),
    })
    .where(eq(channels.id, id))

  // Delete-and-reinsert pattern for junction tables
  await Promise.all([
    db.delete(channelTopics).where(eq(channelTopics.channelId, id)),
    db.delete(channelCategories).where(eq(channelCategories.channelId, id)),
    db.delete(channelTags).where(eq(channelTags.channelId, id)),
    db.delete(contentHighlights).where(eq(contentHighlights.channelId, id)),
    db.delete(relatedChannels).where(eq(relatedChannels.channelId, id)),
  ])

  // Re-insert junction rows
  const topicIds = parseJsonField<string>(formData, 'topicIds')
  const categoryIds = parseJsonField<string>(formData, 'categoryIds')
  const tagIds = parseJsonField<string>(formData, 'tagIds')
  const highlights = parseJsonField<{
    title: string
    url?: string
    description?: string
    displayOrder: number
  }>(formData, 'highlights')
  const related = parseJsonField<{
    relatedChannelId: string
    displayOrder: number
  }>(formData, 'relatedChannels')

  const promises: Promise<unknown>[] = []

  if (topicIds.length > 0) {
    promises.push(
      db.insert(channelTopics).values(
        topicIds.map((topicId) => ({ channelId: id, topicId }))
      )
    )
  }

  if (categoryIds.length > 0) {
    promises.push(
      db.insert(channelCategories).values(
        categoryIds.map((categoryId) => ({ channelId: id, categoryId }))
      )
    )
  }

  if (tagIds.length > 0) {
    promises.push(
      db.insert(channelTags).values(
        tagIds.map((tagId) => ({ channelId: id, tagId }))
      )
    )
  }

  if (highlights.length > 0) {
    promises.push(
      db.insert(contentHighlights).values(
        highlights.map((h) => ({
          channelId: id,
          title: h.title,
          url: h.url || null,
          description: h.description || null,
          displayOrder: h.displayOrder,
        }))
      )
    )
  }

  if (related.length > 0) {
    promises.push(
      db.insert(relatedChannels).values(
        related.map((r) => ({
          channelId: id,
          relatedChannelId: r.relatedChannelId,
          displayOrder: r.displayOrder,
        }))
      )
    )
  }

  await Promise.all(promises)

  revalidateAll()
  redirect('/admin/channels')
}

// ─── Delete Channel ─────────────────────────────────────────────────────────

export async function deleteChannel(id: string) {
  await db.delete(channels).where(eq(channels.id, id))
  revalidateAll()
  redirect('/admin/channels')
}

// ─── Toggle Editor's Pick ───────────────────────────────────────────────────

export async function toggleEditorsPick(id: string, value: boolean) {
  await db
    .update(channels)
    .set({ isEditorsPick: value, updatedAt: new Date() })
    .where(eq(channels.id, id))
  revalidateAll()
}

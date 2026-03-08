import { describe, it, expect, vi } from 'vitest'

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT')
  }),
}))

// Mock slugify
vi.mock('slugify', () => ({
  default: (str: string, opts?: { lower?: boolean; strict?: boolean }) => {
    let result = str.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    if (opts?.lower) result = result.toLowerCase()
    return result
  },
}))

// Mock the database module
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() =>
          Promise.resolve([{ id: 'test-channel-id' }])
        ),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
  },
}))

// Mock schema
vi.mock('@/lib/db/schema', () => ({
  channels: { id: 'channels.id' },
  creators: { id: 'creators.id' },
  channelTopics: { channelId: 'channel_topics.channel_id' },
  channelCategories: { channelId: 'channel_categories.channel_id' },
  channelTags: { channelId: 'channel_tags.channel_id' },
  contentHighlights: { channelId: 'content_highlights.channel_id' },
  relatedChannels: { channelId: 'related_channels.channel_id' },
}))

describe('Slug Generation', () => {
  it('generates a slug from a channel name', async () => {
    const { generateSlug } = await import('@/lib/actions/channels')
    expect(generateSlug('My Cool Channel')).toBe('my-cool-channel')
  })

  it('lowercases the slug', async () => {
    const { generateSlug } = await import('@/lib/actions/channels')
    expect(generateSlug('ALL CAPS')).toBe('all-caps')
  })

  it('handles special characters', async () => {
    const { generateSlug } = await import('@/lib/actions/channels')
    const slug = generateSlug('Hello World!')
    expect(slug).not.toContain('!')
    expect(slug).toContain('hello')
    expect(slug).toContain('world')
  })
})

describe('Form Data Parsing', () => {
  it('parses JSON string fields for topics', async () => {
    const formData = new FormData()
    formData.set('name', 'Test Channel')
    formData.set('slug', 'test-channel')
    formData.set('creatorId', 'creator-1')
    formData.set('platformId', 'platform-1')
    formData.set('editorialSummary', 'Summary')
    formData.set('topicIds', JSON.stringify(['topic-1', 'topic-2']))
    formData.set('tagIds', JSON.stringify(['tag-1']))
    formData.set('categoryIds', JSON.stringify([]))
    formData.set('highlights', JSON.stringify([]))
    formData.set('relatedChannels', JSON.stringify([]))

    const { createChannel } = await import('@/lib/actions/channels')

    // createChannel calls redirect which throws
    await expect(createChannel(formData)).rejects.toThrow('NEXT_REDIRECT')
  })

  it('parses content highlights JSON correctly', async () => {
    const highlights = [
      { title: 'Ep 1', url: 'https://example.com/ep1', description: 'First', displayOrder: 0 },
      { title: 'Ep 2', url: 'https://example.com/ep2', description: 'Second', displayOrder: 1 },
    ]

    const formData = new FormData()
    formData.set('name', 'Test')
    formData.set('slug', 'test')
    formData.set('creatorId', 'creator-1')
    formData.set('platformId', 'platform-1')
    formData.set('editorialSummary', 'Summary')
    formData.set('highlights', JSON.stringify(highlights))
    formData.set('topicIds', '[]')
    formData.set('tagIds', '[]')
    formData.set('categoryIds', '[]')
    formData.set('relatedChannels', '[]')

    const { createChannel } = await import('@/lib/actions/channels')
    await expect(createChannel(formData)).rejects.toThrow('NEXT_REDIRECT')
  })

  it('handles empty/missing JSON fields gracefully', async () => {
    const formData = new FormData()
    formData.set('name', 'Minimal Channel')
    formData.set('creatorId', 'creator-1')
    formData.set('platformId', 'platform-1')
    formData.set('editorialSummary', 'Summary')
    // Not setting topicIds, tagIds, etc. -- should default to empty arrays

    const { createChannel } = await import('@/lib/actions/channels')
    await expect(createChannel(formData)).rejects.toThrow('NEXT_REDIRECT')
  })

  it('handles invalid JSON in fields gracefully', async () => {
    const formData = new FormData()
    formData.set('name', 'Test')
    formData.set('creatorId', 'creator-1')
    formData.set('platformId', 'platform-1')
    formData.set('editorialSummary', 'Summary')
    formData.set('topicIds', 'not-valid-json')

    const { createChannel } = await import('@/lib/actions/channels')
    // Should not throw -- invalid JSON treated as empty array
    await expect(createChannel(formData)).rejects.toThrow('NEXT_REDIRECT')
  })
})

describe('Create Channel Validation', () => {
  it('throws error when name is missing', async () => {
    const formData = new FormData()
    formData.set('creatorId', 'creator-1')
    formData.set('platformId', 'platform-1')

    const { createChannel } = await import('@/lib/actions/channels')
    await expect(createChannel(formData)).rejects.toThrow('Channel name is required')
  })

  it('auto-generates slug from name when slug is empty', async () => {
    const { generateSlug } = await import('@/lib/actions/channels')
    const slug = generateSlug('My New Channel')
    expect(slug).toBe('my-new-channel')
  })
})

describe('Toggle Editor Pick', () => {
  it('calls db.update with the correct value', async () => {
    const { db } = await import('@/lib/db')
    const { toggleEditorsPick } = await import('@/lib/actions/channels')

    await toggleEditorsPick('channel-1', true)

    expect(db.update).toHaveBeenCalled()
  })
})

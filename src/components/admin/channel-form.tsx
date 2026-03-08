'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MarkdownField } from '@/components/admin/markdown-field'
import { createChannel, updateChannel, deleteChannel } from '@/lib/actions/channels'
import { slugify } from '@/lib/utils/slugify'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Creator {
  id: string
  name: string
  slug: string
}

interface Platform {
  id: string
  name: string
  displayName: string
}

interface Topic {
  id: string
  name: string
  slug: string
}

interface Category {
  id: string
  name: string
  slug: string
  topics: Topic[]
}

interface Tag {
  id: string
  name: string
  slug: string
  displayName: string
}

interface ChannelOption {
  id: string
  name: string
}

interface ContentHighlight {
  title: string
  url: string
  description: string
  displayOrder: number
}

interface RelatedChannel {
  relatedChannelId: string
  displayOrder: number
  name?: string
}

interface FormData {
  creators: Creator[]
  platforms: Platform[]
  categories: Category[]
  tags: Tag[]
  channels: ChannelOption[]
}

interface ChannelData {
  id: string
  name: string
  slug: string
  creatorId: string
  platformId: string
  platformUrl: string | null
  description: string | null
  editorialSummary: string
  isEditorsPick: boolean
  isPrimary: boolean
  creator: Creator
  platform: Platform
  channelTopics: Array<{ topicId: string; topic: Topic & { category: { id: string; name: string } } }>
  channelCategories: Array<{ categoryId: string; category: { id: string; name: string } }>
  channelTags: Array<{ tagId: string; tag: Tag }>
  contentHighlights: Array<{
    id: string
    title: string
    url: string | null
    description: string | null
    displayOrder: number
  }>
  relatedFrom: Array<{
    relatedChannelId: string
    displayOrder: number
    relatedChannel: { id: string; name: string }
  }>
}

interface ChannelFormProps {
  channel?: ChannelData | null
  formData: FormData
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ChannelForm({ channel, formData }: ChannelFormProps) {
  const isEdit = !!channel

  // Basic fields
  const [name, setName] = useState(channel?.name ?? '')
  const [slug, setSlug] = useState(channel?.slug ?? '')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [creatorId, setCreatorId] = useState(channel?.creatorId ?? '')
  const [newCreatorName, setNewCreatorName] = useState('')
  const [platformId, setPlatformId] = useState(channel?.platformId ?? '')
  const [platformUrl, setPlatformUrl] = useState(channel?.platformUrl ?? '')
  const [description, setDescription] = useState(channel?.description ?? '')
  const [isEditorsPick, setIsEditorsPick] = useState(channel?.isEditorsPick ?? false)
  const [isPrimary, setIsPrimary] = useState(channel?.isPrimary ?? false)

  // Related entities
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(
    new Set(channel?.channelTopics?.map((ct) => ct.topicId) ?? [])
  )
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    new Set(channel?.channelCategories?.map((cc) => cc.categoryId) ?? [])
  )
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(
    new Set(channel?.channelTags?.map((ct) => ct.tagId) ?? [])
  )
  const [highlights, setHighlights] = useState<ContentHighlight[]>(
    channel?.contentHighlights?.map((h) => ({
      title: h.title,
      url: h.url ?? '',
      description: h.description ?? '',
      displayOrder: h.displayOrder,
    })) ?? []
  )
  const [relatedChannelsList, setRelatedChannelsList] = useState<RelatedChannel[]>(
    channel?.relatedFrom?.map((r) => ({
      relatedChannelId: r.relatedChannelId,
      displayOrder: r.displayOrder,
      name: r.relatedChannel.name,
    })) ?? []
  )

  const [submitting, setSubmitting] = useState(false)

  // Auto-fill slug from name
  const handleNameChange = useCallback(
    (value: string) => {
      setName(value)
      if (!slugManuallyEdited) {
        setSlug(slugify(value))
      }
    },
    [slugManuallyEdited]
  )

  const handleSlugChange = useCallback((value: string) => {
    setSlugManuallyEdited(true)
    setSlug(value)
  }, [])

  // Topic toggle
  const toggleTopic = useCallback((topicId: string) => {
    setSelectedTopicIds((prev) => {
      const next = new Set(prev)
      if (next.has(topicId)) next.delete(topicId)
      else next.add(topicId)
      return next
    })
  }, [])

  // Category toggle
  const toggleCategory = useCallback((categoryId: string) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) next.delete(categoryId)
      else next.add(categoryId)
      return next
    })
  }, [])

  // Tag toggle
  const toggleTag = useCallback((tagId: string) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev)
      if (next.has(tagId)) next.delete(tagId)
      else next.add(tagId)
      return next
    })
  }, [])

  // Highlight management
  const addHighlight = useCallback(() => {
    setHighlights((prev) => [
      ...prev,
      { title: '', url: '', description: '', displayOrder: prev.length },
    ])
  }, [])

  const removeHighlight = useCallback((index: number) => {
    setHighlights((prev) =>
      prev.filter((_, i) => i !== index).map((h, i) => ({ ...h, displayOrder: i }))
    )
  }, [])

  const updateHighlight = useCallback(
    (index: number, field: keyof ContentHighlight, value: string | number) => {
      setHighlights((prev) =>
        prev.map((h, i) => (i === index ? { ...h, [field]: value } : h))
      )
    },
    []
  )

  // Related channels management
  const addRelatedChannel = useCallback(
    (channelId: string) => {
      if (channelId === channel?.id) return // prevent self-reference
      if (relatedChannelsList.some((r) => r.relatedChannelId === channelId)) return // prevent dupes
      const ch = formData.channels.find((c) => c.id === channelId)
      setRelatedChannelsList((prev) => [
        ...prev,
        {
          relatedChannelId: channelId,
          displayOrder: prev.length,
          name: ch?.name,
        },
      ])
    },
    [channel?.id, formData.channels, relatedChannelsList]
  )

  const removeRelatedChannel = useCallback((index: number) => {
    setRelatedChannelsList((prev) =>
      prev.filter((_, i) => i !== index).map((r, i) => ({ ...r, displayOrder: i }))
    )
  }, [])

  // Submit handler
  const handleSubmit = async (formDataObj: globalThis.FormData) => {
    setSubmitting(true)

    // Inject JSON fields into formData
    formDataObj.set('topicIds', JSON.stringify(Array.from(selectedTopicIds)))
    formDataObj.set('categoryIds', JSON.stringify(Array.from(selectedCategoryIds)))
    formDataObj.set('tagIds', JSON.stringify(Array.from(selectedTagIds)))
    formDataObj.set('highlights', JSON.stringify(highlights))
    formDataObj.set(
      'relatedChannels',
      JSON.stringify(
        relatedChannelsList.map(({ relatedChannelId, displayOrder }) => ({
          relatedChannelId,
          displayOrder,
        }))
      )
    )

    try {
      if (isEdit) {
        await updateChannel(channel.id, formDataObj)
      } else {
        await createChannel(formDataObj)
      }
    } catch (e) {
      // redirect throws NEXT_REDIRECT -- that's expected
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!channel) return
    if (!window.confirm(`Delete "${channel.name}"? This cannot be undone.`)) return
    await deleteChannel(channel.id)
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      {/* ── Basic Info ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="auto-generated from name"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="creatorId">Creator</Label>
              <select
                id="creatorId"
                name="creatorId"
                value={creatorId}
                onChange={(e) => {
                  setCreatorId(e.target.value)
                  if (e.target.value) setNewCreatorName('')
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">-- Select or create new --</option>
                {formData.creators.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {!creatorId && (
                <Input
                  name="newCreatorName"
                  value={newCreatorName}
                  onChange={(e) => setNewCreatorName(e.target.value)}
                  placeholder="New creator name"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="platformId">
                Platform <span className="text-destructive">*</span>
              </Label>
              <select
                id="platformId"
                name="platformId"
                value={platformId}
                onChange={(e) => setPlatformId(e.target.value)}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">-- Select platform --</option>
                {formData.platforms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="platformUrl">Platform URL</Label>
            <Input
              id="platformUrl"
              name="platformUrl"
              type="url"
              value={platformUrl}
              onChange={(e) => setPlatformUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <MarkdownField
            name="editorialSummary"
            label="Editorial Summary"
            defaultValue={channel?.editorialSummary ?? ''}
          />

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                name="isEditorsPick"
                checked={isEditorsPick}
                onChange={(e) => setIsEditorsPick(e.target.checked)}
              />
              Editor&apos;s Pick
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                name="isPrimary"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
              />
              Primary Channel
            </label>
          </div>
        </CardContent>
      </Card>

      {/* ── Topics ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.categories.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <Checkbox
                      checked={selectedCategoryIds.has(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                    />
                    {cat.name}
                  </label>
                </div>
                <div className="ml-6 flex flex-wrap gap-2">
                  {cat.topics.map((topic) => (
                    <label
                      key={topic.id}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
                        selectedTopicIds.has(topic.id)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      <Checkbox
                        className="sr-only"
                        checked={selectedTopicIds.has(topic.id)}
                        onChange={() => toggleTopic(topic.id)}
                      />
                      {topic.name}
                    </label>
                  ))}
                  {cat.topics.length === 0 && (
                    <span className="text-xs text-muted-foreground">No topics</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Tags ──────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <label
                key={tag.id}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
                  selectedTagIds.has(tag.id)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                <Checkbox
                  className="sr-only"
                  checked={selectedTagIds.has(tag.id)}
                  onChange={() => toggleTag(tag.id)}
                />
                {tag.displayName}
              </label>
            ))}
            {formData.tags.length === 0 && (
              <span className="text-sm text-muted-foreground">No tags available</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Content Highlights ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Content Highlights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {highlights.map((h, i) => (
            <div key={i} className="rounded-md border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Highlight {i + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => removeHighlight(i)}
                  className="text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Title</Label>
                  <Input
                    value={h.title}
                    onChange={(e) => updateHighlight(i, 'title', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>URL</Label>
                  <Input
                    type="url"
                    value={h.url}
                    onChange={(e) => updateHighlight(i, 'url', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea
                  value={h.description}
                  onChange={(e) => updateHighlight(i, 'description', e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addHighlight}>
            + Add Highlight
          </Button>
        </CardContent>
      </Card>

      {/* ── Related Channels ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Related Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {relatedChannelsList.map((r, i) => (
            <div
              key={r.relatedChannelId}
              className="flex items-center justify-between rounded-md border px-4 py-2"
            >
              <span className="text-sm">{r.name || r.relatedChannelId}</span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => removeRelatedChannel(i)}
                className="text-destructive hover:text-destructive"
              >
                Remove
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <select
              className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  addRelatedChannel(e.target.value)
                  e.target.value = ''
                }
              }}
            >
              <option value="">-- Add related channel --</option>
              {formData.channels
                .filter(
                  (c) =>
                    c.id !== channel?.id &&
                    !relatedChannelsList.some((r) => r.relatedChannelId === c.id)
                )
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* ── Actions ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Update Channel' : 'Create Channel'}
        </Button>
        <Button type="button" variant="outline" asChild>
          <a href="/admin/channels">Cancel</a>
        </Button>
        {isEdit && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            className="ml-auto"
          >
            Delete Channel
          </Button>
        )}
      </div>
    </form>
  )
}

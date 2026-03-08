'use client'

import { useEffect, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { slugify } from '@/lib/utils/slugify'
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createTopic,
  updateTopic,
  deleteTopic,
  createTag,
  updateTag,
  deleteTag,
} from '@/lib/actions/taxonomy'

type TaxonomyType = 'category' | 'topic' | 'tag'

interface CategoryItem {
  id: string
  name: string
  slug: string
  description: string | null
}

interface TopicItem {
  id: string
  name: string
  slug: string
  description: string | null
  categoryId: string
}

interface TagItem {
  id: string
  name: string
  slug: string
  displayName: string
}

type TaxonomyItem = CategoryItem | TopicItem | TagItem

interface TaxonomyFormProps {
  type: TaxonomyType
  item?: TaxonomyItem | null
  categories?: { id: string; name: string }[]
  defaultCategoryId?: string
}

export function TaxonomyForm({
  type,
  item,
  categories: categoryOptions,
  defaultCategoryId,
}: TaxonomyFormProps) {
  const isEdit = !!item
  const [name, setName] = useState(item?.name ?? '')
  const [slug, setSlugValue] = useState(item?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(false)
  const [description, setDescription] = useState(
    (item && 'description' in item ? item.description : null) ?? ''
  )
  const [categoryId, setCategoryId] = useState(
    (item && 'categoryId' in item ? item.categoryId : defaultCategoryId) ?? ''
  )
  const [displayName, setDisplayName] = useState(
    (item && 'displayName' in item ? item.displayName : '') ?? ''
  )
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Auto-fill slug from name unless manually edited
  useEffect(() => {
    if (!slugTouched) {
      setSlugValue(slugify(name))
    }
  }, [name, slugTouched])

  // Auto-fill displayName from name for tags
  useEffect(() => {
    if (type === 'tag' && !isEdit && displayName === '') {
      setDisplayName(name)
    }
  }, [name, type, isEdit, displayName])

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      let result: { error: string } | undefined

      if (type === 'category') {
        if (isEdit) {
          result = await updateCategory(item!.id, formData) as { error: string } | undefined
        } else {
          result = await createCategory(formData) as { error: string } | undefined
        }
      } else if (type === 'topic') {
        if (isEdit) {
          result = await updateTopic(item!.id, formData) as { error: string } | undefined
        } else {
          result = await createTopic(formData) as { error: string } | undefined
        }
      } else {
        if (isEdit) {
          result = await updateTag(item!.id, formData) as { error: string } | undefined
        } else {
          result = await createTag(formData) as { error: string } | undefined
        }
      }

      if (result?.error) {
        setError(result.error)
      }
    })
  }

  function handleDelete() {
    if (!item || !confirm(`Delete this ${type}? This cannot be undone.`)) return

    startTransition(async () => {
      if (type === 'category') {
        await deleteCategory(item.id)
      } else if (type === 'topic') {
        await deleteTopic(item.id)
      } else {
        await deleteTag(item.id)
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-lg">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true)
            setSlugValue(e.target.value)
          }}
          required
        />
        <p className="text-xs text-muted-foreground">
          Auto-generated from name. Edit to override.
        </p>
      </div>

      {(type === 'category' || type === 'topic') && (
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      )}

      {type === 'topic' && categoryOptions && (
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Select a category</option>
            {categoryOptions.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {type === 'tag' && (
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            name="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            How the tag appears to users (e.g., "Machine Learning" vs "machine-learning").
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'} {type}
        </Button>

        {isEdit && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  )
}

'use server'

import { db } from '@/lib/db/index'
import { categories, topics, tags } from '@/lib/db/schema'
import { eq, max, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { slugify } from '@/lib/utils/slugify'

// ─── Helpers ────────────────────────────────────────────────────────────────

function revalidateTaxonomy() {
  revalidatePath('/admin/categories')
  revalidatePath('/admin/topics')
  revalidatePath('/admin/tags')
  revalidatePath('/')
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function createCategory(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim() || slugify(name)
  const description = (formData.get('description') as string)?.trim() || null

  if (!name || !slug) {
    return { error: 'Name and slug are required' }
  }

  // Get next display order
  const [result] = await db
    .select({ maxOrder: max(categories.displayOrder) })
    .from(categories)
  const nextOrder = (result?.maxOrder ?? -1) + 1

  await db.insert(categories).values({
    name,
    slug,
    description,
    displayOrder: nextOrder,
  })

  revalidateTaxonomy()
  redirect('/admin/categories')
}

export async function updateCategory(id: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim() || slugify(name)
  const description = (formData.get('description') as string)?.trim() || null

  if (!name || !slug) {
    return { error: 'Name and slug are required' }
  }

  await db
    .update(categories)
    .set({ name, slug, description })
    .where(eq(categories.id, id))

  revalidateTaxonomy()
  redirect('/admin/categories')
}

export async function deleteCategory(id: string) {
  await db.delete(categories).where(eq(categories.id, id))
  revalidateTaxonomy()
  redirect('/admin/categories')
}

export async function reorderCategories(orderedIds: string[]) {
  await db.transaction(async (tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await tx
        .update(categories)
        .set({ displayOrder: i })
        .where(eq(categories.id, orderedIds[i]))
    }
  })

  revalidateTaxonomy()
}

// ─── Topics ─────────────────────────────────────────────────────────────────

export async function createTopic(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim() || slugify(name)
  const description = (formData.get('description') as string)?.trim() || null
  const categoryId = (formData.get('categoryId') as string)?.trim()

  if (!name || !slug || !categoryId) {
    return { error: 'Name, slug, and category are required' }
  }

  // Get next display order within this category
  const [result] = await db
    .select({ maxOrder: max(topics.displayOrder) })
    .from(topics)
    .where(eq(topics.categoryId, categoryId))
  const nextOrder = (result?.maxOrder ?? -1) + 1

  await db.insert(topics).values({
    name,
    slug,
    description,
    categoryId,
    displayOrder: nextOrder,
  })

  revalidateTaxonomy()
  redirect('/admin/topics')
}

export async function updateTopic(id: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim() || slugify(name)
  const description = (formData.get('description') as string)?.trim() || null
  const categoryId = (formData.get('categoryId') as string)?.trim()

  if (!name || !slug || !categoryId) {
    return { error: 'Name, slug, and category are required' }
  }

  await db
    .update(topics)
    .set({ name, slug, description, categoryId })
    .where(eq(topics.id, id))

  revalidateTaxonomy()
  redirect('/admin/topics')
}

export async function deleteTopic(id: string) {
  await db.delete(topics).where(eq(topics.id, id))
  revalidateTaxonomy()
  redirect('/admin/topics')
}

export async function reorderTopics(categoryId: string, orderedIds: string[]) {
  await db.transaction(async (tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await tx
        .update(topics)
        .set({ displayOrder: i })
        .where(eq(topics.id, orderedIds[i]))
    }
  })

  revalidateTaxonomy()
}

// ─── Tags ───────────────────────────────────────────────────────────────────

export async function createTag(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim() || slugify(name)
  const displayName = (formData.get('displayName') as string)?.trim() || name

  if (!name || !slug) {
    return { error: 'Name and slug are required' }
  }

  await db.insert(tags).values({
    name,
    slug,
    displayName,
  })

  revalidateTaxonomy()
  redirect('/admin/tags')
}

export async function updateTag(id: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim() || slugify(name)
  const displayName = (formData.get('displayName') as string)?.trim() || name

  if (!name || !slug) {
    return { error: 'Name and slug are required' }
  }

  await db
    .update(tags)
    .set({ name, slug, displayName })
    .where(eq(tags.id, id))

  revalidateTaxonomy()
  redirect('/admin/tags')
}

export async function deleteTag(id: string) {
  await db.delete(tags).where(eq(tags.id, id))
  revalidateTaxonomy()
  redirect('/admin/tags')
}

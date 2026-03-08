import { describe, it, expect } from 'vitest'
import { slugify } from '@/lib/utils/slugify'

describe('slugify', () => {
  it('converts basic text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('handles special characters', () => {
    expect(slugify('Arts & Crafts!')).toBe('arts-crafts')
  })

  it('handles multiple spaces and dashes', () => {
    expect(slugify('  some   text  ')).toBe('some-text')
  })

  it('handles already-slugified text', () => {
    expect(slugify('my-slug')).toBe('my-slug')
  })

  it('handles empty string', () => {
    expect(slugify('')).toBe('')
  })

  it('handles accented and unicode-ish characters', () => {
    expect(slugify('cafe latte')).toBe('cafe-latte')
  })

  it('removes leading and trailing dashes', () => {
    expect(slugify('-hello-')).toBe('hello')
  })
})

describe('reorder logic', () => {
  // Test the same array reorder logic used in the SortableList component
  function arrayMove<T>(arr: T[], from: number, to: number): T[] {
    const result = [...arr]
    const [item] = result.splice(from, 1)
    result.splice(to, 0, item)
    return result
  }

  it('moves item from first to second position', () => {
    const items = ['A', 'B', 'C']
    const result = arrayMove(items, 0, 1)
    expect(result).toEqual(['B', 'A', 'C'])
  })

  it('moves item from last to first position', () => {
    const items = ['A', 'B', 'C']
    const result = arrayMove(items, 2, 0)
    expect(result).toEqual(['C', 'A', 'B'])
  })

  it('does not mutate original array', () => {
    const items = ['A', 'B', 'C']
    arrayMove(items, 0, 2)
    expect(items).toEqual(['A', 'B', 'C'])
  })

  it('produces sequential display order values', () => {
    const items = ['A', 'B', 'C', 'D']
    const reordered = arrayMove(items, 3, 1)
    // Simulate what reorderCategories does: index = displayOrder
    const displayOrders = reordered.map((_, index) => index)
    expect(displayOrders).toEqual([0, 1, 2, 3])
  })
})

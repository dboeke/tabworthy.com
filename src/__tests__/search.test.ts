import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the db module before importing search functions
vi.mock('@/lib/db/index', () => ({
  db: {
    execute: vi.fn(),
    query: {
      channels: { findMany: vi.fn() },
      categories: { findMany: vi.fn() },
      topics: { findMany: vi.fn() },
    },
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        leftJoin: vi.fn(() => ({
          leftJoin: vi.fn(() => ({
            leftJoin: vi.fn(() => ({
              where: vi.fn(() => ({
                orderBy: vi.fn(() => ({
                  limit: vi.fn(() => Promise.resolve([])),
                })),
              })),
            })),
          })),
        })),
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([])),
          })),
        })),
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
  },
}))

describe('Search API Route', () => {
  it('returns empty results for queries under 2 characters', async () => {
    const { GET } = await import('@/app/api/search/route')

    const request = new Request('http://localhost:3000/api/search?q=a')
    const response = await GET(request)
    const data = await response.json()

    expect(data.channels).toEqual([])
    expect(data.categories).toEqual([])
    expect(data.topics).toEqual([])
  })

  it('returns empty results for empty query', async () => {
    const { GET } = await import('@/app/api/search/route')

    const request = new Request('http://localhost:3000/api/search?q=')
    const response = await GET(request)
    const data = await response.json()

    expect(data.channels).toEqual([])
    expect(data.categories).toEqual([])
    expect(data.topics).toEqual([])
  })

  it('returns empty results when no query parameter', async () => {
    const { GET } = await import('@/app/api/search/route')

    const request = new Request('http://localhost:3000/api/search')
    const response = await GET(request)
    const data = await response.json()

    expect(data.channels).toEqual([])
    expect(data.categories).toEqual([])
    expect(data.topics).toEqual([])
  })

  it('accepts optional category constraint parameter', async () => {
    const { GET } = await import('@/app/api/search/route')

    const request = new Request(
      'http://localhost:3000/api/search?q=cooking&category=food'
    )
    const response = await GET(request)
    const data = await response.json()

    // Should return valid JSON structure (even if empty from mocks)
    expect(data).toHaveProperty('channels')
    expect(data).toHaveProperty('categories')
    expect(data).toHaveProperty('topics')
  })
})

describe('Search Query Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('searchChannels is exported and callable', async () => {
    const { searchChannels } = await import('@/lib/db/queries/search')
    expect(typeof searchChannels).toBe('function')
  })

  it('searchTaxonomy is exported and callable', async () => {
    const { searchTaxonomy } = await import('@/lib/db/queries/search')
    expect(typeof searchTaxonomy).toBe('function')
  })

  it('autocomplete is exported and callable', async () => {
    const { autocomplete } = await import('@/lib/db/queries/search')
    expect(typeof autocomplete).toBe('function')
  })

  it('broadenSearch is exported and callable', async () => {
    const { broadenSearch } = await import('@/lib/db/queries/search')
    expect(typeof broadenSearch).toBe('function')
  })

  it('getNewestChannels is exported and callable', async () => {
    const { getNewestChannels } = await import('@/lib/db/queries/search')
    expect(typeof getNewestChannels).toBe('function')
  })

  it('getEditorsPicks is exported and callable', async () => {
    const { getEditorsPicks } = await import('@/lib/db/queries/search')
    expect(typeof getEditorsPicks).toBe('function')
  })
})

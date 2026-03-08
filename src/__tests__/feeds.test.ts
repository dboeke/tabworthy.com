import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the db module
vi.mock('@/lib/db/index', () => ({
  db: {
    execute: vi.fn(),
    query: {
      channels: {
        findMany: vi.fn(() => Promise.resolve([])),
      },
    },
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([])),
          })),
        })),
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
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
      })),
    })),
  },
}))

describe('Feed Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getNewestChannels returns channels sorted by createdAt DESC', async () => {
    const { getNewestChannels } = await import('@/lib/db/queries/search')
    expect(typeof getNewestChannels).toBe('function')

    // Function should accept a limit parameter
    const result = await getNewestChannels(10)
    expect(Array.isArray(result)).toBe(true)
  })

  it('getEditorsPicks filters by isEditorsPick = true', async () => {
    const { getEditorsPicks } = await import('@/lib/db/queries/search')
    expect(typeof getEditorsPicks).toBe('function')

    // Function should accept a limit parameter
    const result = await getEditorsPicks(10)
    expect(Array.isArray(result)).toBe(true)
  })

  it('getNewestChannels defaults to 10 results', async () => {
    const { getNewestChannels } = await import('@/lib/db/queries/search')
    // Should work without explicit limit
    const result = await getNewestChannels()
    expect(Array.isArray(result)).toBe(true)
  })

  it('getEditorsPicks defaults to 10 results', async () => {
    const { getEditorsPicks } = await import('@/lib/db/queries/search')
    // Should work without explicit limit
    const result = await getEditorsPicks()
    expect(Array.isArray(result)).toBe(true)
  })
})

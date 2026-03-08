import { NextResponse } from 'next/server'
import {
  searchChannels,
  searchTaxonomy,
  broadenSearch,
} from '@/lib/db/queries/search'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') ?? ''
  const categorySlug = searchParams.get('category') ?? undefined
  const type = searchParams.get('type') ?? 'all'

  // Return empty results for queries under 2 characters
  if (query.length < 2) {
    return NextResponse.json({
      channels: [],
      categories: [],
      topics: [],
      broadened: false,
      broadenedMessage: null,
    })
  }

  try {
    let channelResults: Awaited<ReturnType<typeof searchChannels>> = []
    let taxonomyResults: Awaited<ReturnType<typeof searchTaxonomy>> = {
      categories: [],
      topics: [],
    }
    let broadened = false
    let broadenedMessage: string | null = null

    if (type === 'channels' || type === 'all') {
      channelResults = await searchChannels(query, { categorySlug })

      // If no channel results, try broadening via taxonomy
      if (channelResults.length === 0) {
        const broadenResult = await broadenSearch(query)
        if (broadenResult.broadened) {
          channelResults = broadenResult.channels
          broadened = true
          broadenedMessage = `No exact matches. Showing results for "${broadenResult.matchedEntity}".`
        }
      }
    }

    if (type === 'taxonomy' || type === 'all') {
      taxonomyResults = await searchTaxonomy(query)
    }

    return NextResponse.json({
      channels: channelResults,
      categories: taxonomyResults.categories,
      topics: taxonomyResults.topics,
      broadened,
      broadenedMessage,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      {
        channels: [],
        categories: [],
        topics: [],
        broadened: false,
        broadenedMessage: null,
        error: 'Search failed',
      },
      { status: 500 }
    )
  }
}

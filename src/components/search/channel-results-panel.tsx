'use client'

import { useState } from 'react'
import { ChannelCard } from '@/components/channels/channel-card'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'

interface ChannelData {
  id: string
  name: string
  slug: string
  editorialSummary: string
  creator: { id: string; name: string; slug: string }
  platform: { id: string; name: string; displayName: string; iconUrl: string | null; baseUrl: string | null }
  tags: Array<{ id: string; name: string; slug: string; displayName: string }>
}

type FeedTab = 'newest' | 'picks'

interface ChannelResultsPanelProps {
  /** Channels for "Newest" feed (server-rendered) */
  newestChannels: ChannelData[]
  /** Channels for "Editor's Picks" feed (server-rendered) */
  editorsPicksChannels: ChannelData[]
  /** Channels from search results */
  searchChannels?: ChannelData[]
  /** Whether we are in search mode */
  isSearching: boolean
  /** Whether results were broadened via taxonomy fallback */
  broadened?: boolean
  /** Message to show when broadened */
  broadenedMessage?: string | null
  /** Whether search is loading */
  isLoading?: boolean
}

export function ChannelResultsPanel({
  newestChannels,
  editorsPicksChannels,
  searchChannels = [],
  isSearching,
  broadened = false,
  broadenedMessage = null,
  isLoading = false,
}: ChannelResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>('newest')

  if (isSearching) {
    return (
      <div className="w-full">
        {broadened && broadenedMessage && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{broadenedMessage}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">
            Searching...
          </div>
        ) : searchChannels.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {searchChannels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel as never} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            No channels found. Try a different search term.
          </div>
        )}
      </div>
    )
  }

  // Default state: Newest / Editor's Picks toggle
  const displayChannels =
    activeTab === 'newest' ? newestChannels : editorsPicksChannels

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center gap-2">
        <Button
          variant={activeTab === 'newest' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('newest')}
        >
          Newest
        </Button>
        <Button
          variant={activeTab === 'picks' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('picks')}
        >
          Editor&apos;s Picks
        </Button>
      </div>

      {displayChannels.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {displayChannels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel as never} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-muted-foreground">
          {activeTab === 'picks'
            ? "No editor's picks yet."
            : 'No channels yet.'}
        </div>
      )}
    </div>
  )
}

import { ExternalLink } from 'lucide-react'
import { PlatformIcon } from './platform-icon'
import type { getChannelBySlug } from '@/lib/db/queries/channels'

type ChannelData = NonNullable<Awaited<ReturnType<typeof getChannelBySlug>>>
type CreatorWithChannels = ChannelData['creator']

interface CrossPlatformLinksProps {
  creator: CreatorWithChannels
  currentChannelId: string
}

export function CrossPlatformLinks({
  creator,
  currentChannelId,
}: CrossPlatformLinksProps) {
  const otherChannels = creator.channels.filter(
    (c) => c.id !== currentChannelId
  )

  if (otherChannels.length === 0) return null

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Also on...</h2>
      <div className="space-y-3">
        {otherChannels.map((channel) => (
          <a
            key={channel.id}
            href={channel.platformUrl ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
          >
            <PlatformIcon
              platformName={channel.platform.displayName}
              size={20}
            />
            <div className="flex-1">
              <span className="font-medium">{channel.name}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                on {channel.platform.displayName}
              </span>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>
        ))}
      </div>
    </section>
  )
}

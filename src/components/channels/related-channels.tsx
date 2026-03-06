import Link from 'next/link'
import { PlatformIcon } from './platform-icon'
import type { getChannelBySlug } from '@/lib/db/queries/channels'

type ChannelData = NonNullable<Awaited<ReturnType<typeof getChannelBySlug>>>
type RelatedChannelData = ChannelData['relatedFrom'][number]['relatedChannel']

interface RelatedChannelsProps {
  channels: RelatedChannelData[]
}

export function RelatedChannels({ channels }: RelatedChannelsProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">
        You might also like
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => (
          <Link
            key={channel.id}
            href={`/channels/${channel.slug}`}
            className="group rounded-lg border p-4 transition-colors hover:bg-accent/50"
          >
            <div className="space-y-2">
              <h3 className="font-medium group-hover:underline">
                {channel.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                by {channel.creator.name}
              </p>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <PlatformIcon
                  platformName={channel.platform.displayName}
                  size={14}
                />
                {channel.platform.displayName}
              </div>
              {channel.channelTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {channel.channelTags.slice(0, 3).map((ct) => (
                    <span
                      key={ct.tag.id}
                      className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                    >
                      {ct.tag.displayName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

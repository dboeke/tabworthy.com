import { Badge } from '@/components/ui/badge'
import { PlatformBadge } from './platform-badge'
import { BestOfList } from './best-of-list'
import { CrossPlatformLinks } from './cross-platform-links'
import { RelatedChannels } from './related-channels'
import type { getChannelBySlug } from '@/lib/db/queries/channels'

type ChannelProfileData = NonNullable<Awaited<ReturnType<typeof getChannelBySlug>>>

interface ChannelProfileProps {
  channel: ChannelProfileData
}

export function ChannelProfile({ channel }: ChannelProfileProps) {
  const tags = channel.channelTags.map((ct) => ct.tag)
  const relatedChannels = channel.relatedFrom.map((r) => r.relatedChannel)
  const creatorOtherChannels = channel.creator.channels.filter(
    (c) => c.id !== channel.id
  )

  return (
    <article className="mx-auto max-w-3xl space-y-12 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Section */}
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {channel.name}
        </h1>

        <p className="text-lg text-muted-foreground">
          by {channel.creator.name}
        </p>

        {/* Platform badge */}
        <div className="flex flex-wrap gap-2">
          <PlatformBadge
            platformName={channel.platform.displayName}
            platformUrl={channel.platformUrl}
          />
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.displayName}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {/* Editorial "Why Watch" Section -- the centerpiece */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Why Watch</h2>
        <div className="text-lg leading-relaxed text-foreground/90">
          <p>{channel.editorialSummary}</p>
        </div>
      </section>

      {/* Best Of Section (conditional) */}
      {channel.contentHighlights.length > 0 && (
        <BestOfList highlights={channel.contentHighlights} />
      )}

      {/* Cross-platform Section (conditional) */}
      {creatorOtherChannels.length > 0 && (
        <CrossPlatformLinks
          creator={channel.creator}
          currentChannelId={channel.id}
        />
      )}

      {/* Related Channels Section (conditional) */}
      {relatedChannels.length > 0 && (
        <RelatedChannels channels={relatedChannels} />
      )}
    </article>
  )
}

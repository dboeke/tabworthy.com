import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlatformIcon } from './platform-icon'
import type { Tag, Platform, Creator } from '@/lib/db/types'

interface ChannelWithRelations {
  id: string
  name: string
  slug: string
  editorialSummary: string
  creator: Creator
  platform: Platform
  tags: Tag[]
}

interface ChannelCardProps {
  channel: ChannelWithRelations
}

export function ChannelCard({ channel }: ChannelCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base">
              <Link
                href={`/channels/${channel.slug}`}
                className="hover:text-primary transition-colors"
              >
                {channel.name}
              </Link>
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              {channel.creator.name}
            </CardDescription>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-muted-foreground">
            <PlatformIcon platformName={channel.platform.name} size={16} />
            <span className="text-xs">{channel.platform.displayName}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {channel.editorialSummary}
        </p>
      </CardContent>

      {channel.tags.length > 0 && (
        <CardFooter className="flex flex-wrap gap-1.5">
          {channel.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-xs">
              {tag.displayName}
            </Badge>
          ))}
        </CardFooter>
      )}
    </Card>
  )
}

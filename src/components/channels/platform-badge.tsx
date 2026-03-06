import { ExternalLink } from 'lucide-react'
import { PlatformIcon } from './platform-icon'

interface PlatformBadgeProps {
  platformName: string
  platformUrl: string | null
}

export function PlatformBadge({ platformName, platformUrl }: PlatformBadgeProps) {
  if (!platformUrl) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm text-muted-foreground">
        <PlatformIcon platformName={platformName} size={16} />
        {platformName}
      </span>
    )
  }

  return (
    <a
      href={platformUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <PlatformIcon platformName={platformName} size={16} />
      {platformName}
      <ExternalLink className="h-3 w-3" />
    </a>
  )
}

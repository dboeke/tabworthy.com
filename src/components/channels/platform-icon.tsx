import { Youtube, Twitch, Globe, Headphones, BookOpen, Tv } from 'lucide-react'

interface PlatformIconProps {
  platformName: string
  size?: number
  className?: string
}

const PLATFORM_ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  youtube: Youtube,
  twitch: Twitch,
  nebula: Tv,
  patreon: Headphones,
  substack: BookOpen,
}

export function PlatformIcon({ platformName, size = 16, className }: PlatformIconProps) {
  const Icon = PLATFORM_ICON_MAP[platformName.toLowerCase()] ?? Globe
  return <Icon size={size} className={className} />
}

import type { ContentHighlight } from '@/lib/db/types'
import { ExternalLink } from 'lucide-react'

interface BestOfListProps {
  highlights: ContentHighlight[]
}

export function BestOfList({ highlights }: BestOfListProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Start Here</h2>
      <ol className="space-y-4">
        {highlights.map((highlight, index) => (
          <li
            key={highlight.id}
            className="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {index + 1}
            </span>
            <div className="space-y-1">
              {highlight.url ? (
                <a
                  href={highlight.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium hover:underline"
                >
                  {highlight.title}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="font-medium">{highlight.title}</span>
              )}
              {highlight.description && (
                <p className="text-sm text-muted-foreground">
                  {highlight.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

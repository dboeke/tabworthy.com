import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

interface CategoryCardProps {
  name: string
  slug: string
  description: string | null
  channelCount: number
}

export function CategoryCard({
  name,
  slug,
  description,
  channelCount,
}: CategoryCardProps) {
  return (
    <Link href={`/categories/${slug}`} className="group block">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {name}
          </CardTitle>
          {description && (
            <CardDescription className="line-clamp-2">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {channelCount} {channelCount === 1 ? 'channel' : 'channels'}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

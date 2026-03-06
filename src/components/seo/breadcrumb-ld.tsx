import { JsonLd } from './json-ld'
import type { BreadcrumbItem } from '@/components/taxonomy/breadcrumb-nav'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://tabworthy.com'

interface BreadcrumbLdProps {
  items: BreadcrumbItem[]
}

/**
 * BreadcrumbList JSON-LD structured data. Uses the same items
 * as the visual BreadcrumbNav for consistency.
 */
export function BreadcrumbLd({ items }: BreadcrumbLdProps) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem' as const,
          position: index + 1,
          name: item.label,
          ...(item.href ? { item: `${BASE_URL}${item.href}` } : {}),
        })),
      }}
    />
  )
}

import { eq } from 'drizzle-orm'
import { db } from '../index'
import * as schema from '../schema'

/**
 * Get a channel by slug with all related data for the profile page.
 * Includes: creator (with all their channels + platforms), platform, tags,
 * content highlights, related channels, and topics with categories.
 */
export async function getChannelBySlug(slug: string) {
  const channel = await db.query.channels.findFirst({
    where: eq(schema.channels.slug, slug),
    with: {
      creator: {
        with: {
          channels: {
            with: {
              platform: true,
            },
          },
        },
      },
      platform: true,
      channelTags: {
        with: {
          tag: true,
        },
      },
      contentHighlights: {
        orderBy: (highlights, { asc }) => [asc(highlights.displayOrder)],
      },
      relatedFrom: {
        orderBy: (rel, { asc }) => [asc(rel.displayOrder)],
        with: {
          relatedChannel: {
            with: {
              creator: true,
              platform: true,
              channelTags: {
                with: {
                  tag: true,
                },
              },
            },
          },
        },
      },
      channelTopics: {
        with: {
          topic: {
            with: {
              category: true,
            },
          },
        },
      },
      channelCategories: {
        with: {
          category: true,
        },
      },
    },
  })

  return channel ?? null
}

/**
 * Get all channel slugs for generateStaticParams.
 */
export async function getAllChannelSlugs() {
  const results = await db
    .select({ slug: schema.channels.slug })
    .from(schema.channels)

  return results.map((r) => r.slug)
}

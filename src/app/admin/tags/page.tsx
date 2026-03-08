import Link from 'next/link'
import { getAdminTags } from '@/lib/db/queries/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function AdminTagsPage() {
  const tags = await getAdminTags()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
          <p className="text-sm text-muted-foreground">
            Manage tags used to label channels.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/tags/new">New Tag</Link>
        </Button>
      </div>

      {tags.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
          No tags yet. Create one to get started.
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-left font-medium">Display Name</th>
                <th className="px-4 py-3 text-right font-medium">Channels</th>
                <th className="px-4 py-3 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{tag.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tag.slug}</td>
                  <td className="px-4 py-3">{tag.displayName}</td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant="secondary">{tag.channelCount}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/tags/${tag.id}/edit`}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

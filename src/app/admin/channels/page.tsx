import Link from 'next/link'
import { getAdminChannels } from '@/lib/db/queries/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EditorsPickToggle } from '@/components/admin/editors-pick-toggle'
import { DeleteChannelButton } from '@/components/admin/delete-channel-button'

export default async function AdminChannelsPage() {
  const channels = await getAdminChannels()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Channels</h1>
          <p className="text-sm text-muted-foreground">
            {channels.length} channel{channels.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/channels/new">New Channel</Link>
        </Button>
      </div>

      {channels.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
          No channels yet. Create your first channel to get started.
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Channel</th>
                <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Creator</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Platform</th>
                <th className="px-4 py-3 text-center font-medium hidden lg:table-cell">Topics</th>
                <th className="px-4 py-3 text-center font-medium hidden lg:table-cell">Tags</th>
                <th className="px-4 py-3 text-center font-medium">Pick</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((channel) => (
                <tr key={channel.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/channels/${channel.id}/edit`}
                      className="font-medium hover:underline"
                    >
                      {channel.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{channel.slug}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                    {channel.creatorName}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant="outline">{channel.platformName}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell text-muted-foreground">
                    {channel.topicCount}
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell text-muted-foreground">
                    {channel.tagCount}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <EditorsPickToggle
                      channelId={channel.id}
                      initialValue={channel.isEditorsPick}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="xs" asChild>
                        <Link href={`/admin/channels/${channel.id}/edit`}>Edit</Link>
                      </Button>
                      <DeleteChannelButton
                        channelId={channel.id}
                        channelName={channel.name}
                      />
                    </div>
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

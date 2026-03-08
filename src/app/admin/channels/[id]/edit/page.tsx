import { notFound } from 'next/navigation'
import { getAdminChannelById, getAdminFormData } from '@/lib/db/queries/admin'
import { ChannelForm } from '@/components/admin/channel-form'

interface EditChannelPageProps {
  params: Promise<{ id: string }>
}

export default async function EditChannelPage({ params }: EditChannelPageProps) {
  const { id } = await params
  const [channel, formData] = await Promise.all([
    getAdminChannelById(id),
    getAdminFormData(),
  ])

  if (!channel) {
    notFound()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Edit Channel</h1>
        <p className="text-sm text-muted-foreground">
          Editing: {channel.name}
        </p>
      </div>
      <ChannelForm channel={channel as any} formData={formData} />
    </div>
  )
}

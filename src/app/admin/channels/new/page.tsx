import { getAdminFormData } from '@/lib/db/queries/admin'
import { ChannelForm } from '@/components/admin/channel-form'

export default async function NewChannelPage() {
  const formData = await getAdminFormData()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">New Channel</h1>
        <p className="text-sm text-muted-foreground">
          Create a new channel listing. Save is immediate publish.
        </p>
      </div>
      <ChannelForm formData={formData} />
    </div>
  )
}

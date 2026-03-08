'use client'

import { useTransition } from 'react'
import { deleteChannel } from '@/lib/actions/channels'
import { Button } from '@/components/ui/button'

interface DeleteChannelButtonProps {
  channelId: string
  channelName: string
}

export function DeleteChannelButton({ channelId, channelName }: DeleteChannelButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!window.confirm(`Delete "${channelName}"? This cannot be undone.`)) return
    startTransition(async () => {
      await deleteChannel(channelId)
    })
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      onClick={handleDelete}
      disabled={isPending}
      className="text-destructive hover:text-destructive"
    >
      {isPending ? '...' : 'Delete'}
    </Button>
  )
}

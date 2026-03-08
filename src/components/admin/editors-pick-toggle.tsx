'use client'

import { useState, useTransition } from 'react'
import { toggleEditorsPick } from '@/lib/actions/channels'

interface EditorsPickToggleProps {
  channelId: string
  initialValue: boolean
}

export function EditorsPickToggle({ channelId, initialValue }: EditorsPickToggleProps) {
  const [checked, setChecked] = useState(initialValue)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    const newValue = !checked
    setChecked(newValue)
    startTransition(async () => {
      await toggleEditorsPick(channelId, newValue)
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-primary' : 'bg-input'
      }`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`pointer-events-none block size-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

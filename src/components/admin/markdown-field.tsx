'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import dynamic from 'next/dynamic'

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[200px] rounded-md border border-input bg-muted/30 animate-pulse" />
  ),
})

interface MarkdownFieldProps {
  name: string
  label: string
  defaultValue?: string
  required?: boolean
}

export function MarkdownField({
  name,
  label,
  defaultValue = '',
  required = false,
}: MarkdownFieldProps) {
  const [value, setValue] = useState(defaultValue)

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div data-color-mode="light">
        <MDEditor
          value={value}
          onChange={(val) => setValue(val || '')}
          preview="edit"
          height={200}
        />
      </div>
      <input type="hidden" name={name} value={value} />
    </div>
  )
}

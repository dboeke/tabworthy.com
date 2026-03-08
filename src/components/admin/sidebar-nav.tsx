'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { logout } from '@/lib/actions/auth'

const navItems = [
  { label: 'Channels', href: '/admin/channels' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Topics', href: '/admin/topics' },
  { label: 'Tags', href: '/admin/tags' },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex h-full flex-col gap-1 p-4">
      <div className="mb-4">
        <Link href="/admin" className="text-lg font-bold tracking-tight">
          Tabworthy Admin
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Button
              key={item.href}
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              className="justify-start"
              asChild
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          )
        })}
      </div>

      <form action={logout}>
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
          Log out
        </Button>
      </form>
    </nav>
  )
}

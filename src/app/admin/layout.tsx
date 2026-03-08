import { getSession } from '@/lib/auth/session'
import { SidebarNav } from '@/components/admin/sidebar-nav'

export const metadata = {
  title: 'Admin',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  return (
    <>
      {/* Hide the root layout header/footer for admin routes */}
      <style>{`
        body > header, body > footer, body > main { display: none !important; }
      `}</style>

      <div className="fixed inset-0 z-[100] flex bg-background">
        {/* Sidebar - shown when authenticated */}
        {session.isLoggedIn && (
          <aside className="hidden w-60 shrink-0 border-r bg-muted/30 md:block">
            <SidebarNav />
          </aside>
        )}

        {/* Mobile top nav when authenticated */}
        {session.isLoggedIn && (
          <div className="fixed inset-x-0 top-0 z-[110] border-b bg-background/95 backdrop-blur md:hidden">
            <div className="flex h-14 items-center justify-between px-4">
              <span className="text-lg font-bold tracking-tight">Tabworthy Admin</span>
              <nav className="flex items-center gap-2">
                <a href="/admin/channels" className="text-sm text-muted-foreground hover:text-foreground">Ch</a>
                <a href="/admin/categories" className="text-sm text-muted-foreground hover:text-foreground">Cat</a>
                <a href="/admin/topics" className="text-sm text-muted-foreground hover:text-foreground">Top</a>
                <a href="/admin/tags" className="text-sm text-muted-foreground hover:text-foreground">Tags</a>
              </nav>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className={`flex-1 overflow-y-auto ${session.isLoggedIn ? 'mt-14 md:mt-0' : ''}`}>
          <div className="mx-auto max-w-5xl p-6">
            {children}
          </div>
        </main>
      </div>
    </>
  )
}

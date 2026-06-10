'use client'

import { useAuth } from '@/components/auth-provider'
import { Sidebar } from '@/components/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-svh bg-white flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const appMeta = user.app_metadata || {}
  const userMeta = user.user_metadata || {}

  return (
    <div className="min-h-svh bg-white">
      <Sidebar
        user={{
          name: (userMeta.name as string) || user.email?.split('@')[0] || 'Usuario',
          email: user.email || '',
          role: (appMeta.role as string) || 'operator',
        }}
      />
      <main className="pl-64 bg-white">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

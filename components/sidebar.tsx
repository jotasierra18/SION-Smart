'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/auth-provider'
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  CircleDot,
  Wrench,
  UserCog,
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, adminOnly: true },
  { name: 'Clientes', href: '/clientes', icon: Users, adminOnly: true },
  { name: 'Solicitudes', href: '/solicitudes', icon: FileText },
]

const adminNavigation = [
  { name: 'Usuarios', href: '/admin/usuarios', icon: UserCog },
  { name: 'Drones', href: '/admin/drones', icon: CircleDot },
  { name: 'Tipos de Servicio', href: '/admin/tipos-servicio', icon: Wrench },
]

interface SidebarProps {
  user: {
    name: string
    email: string
    role?: string
  }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [adminOpen, setAdminOpen] = useState(pathname.startsWith('/admin'))
  const isAdmin = user.role === 'admin'

  const handleSignOut = () => {
    signOut()
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center py-6 px-4 border-b border-sidebar-border">
        <Image 
          src="/images/logo.png" 
          alt="SION S-MART" 
          width={180}
          height={70}
          className="w-48 h-auto object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navigation
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            )
          })}

          {/* Admin section */}
          {isAdmin && (
            <>
              <li className="pt-4">
                <button
                  onClick={() => setAdminOpen(!adminOpen)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                  <span className="flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    Administracion
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      adminOpen && 'rotate-180'
                    )}
                  />
                </button>
              </li>
              {adminOpen &&
                adminNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 pl-11 rounded-md text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
            </>
          )}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-accent-foreground">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user.role === 'admin' ? 'Administrador' : user.role === 'operator' ? 'Operador' : 'Cliente'}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesion
        </button>
      </div>
    </aside>
  )
}

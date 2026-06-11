'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, UserCog, Mail, Shield, UserPlus, Trash2 } from 'lucide-react'
import { updateUserRole, deleteUser } from '@/app/actions/data'
import { cn } from '@/lib/utils'
import type { User } from '@/lib/db/schema'
import Link from 'next/link'

interface UsersTableProps {
  users: User[]
}

const roleColors: Record<string, string> = {
  admin: 'bg-primary/10 text-primary border-primary/30',
  operator: 'bg-chart-2/10 text-chart-2 border-chart-2/30',
  client: 'bg-muted text-muted-foreground border-border',
}

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  operator: 'Operador',
  client: 'Cliente',
}

export function UsersTable({ users: initialUsers }: UsersTableProps) {
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const filteredUsers = initialUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId)
    await updateUserRole(userId, newRole)
    setUpdating(null)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Seguro que deseas eliminar este usuario?')) return
    await deleteUser(userId)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuarios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Link href="/admin/usuarios/nuevo" className="ml-auto">
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" />
            Crear usuario
          </Button>
        </Link>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <UserCog className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {search ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Usuario</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rol Actual</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cambiar Rol</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Registrado</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {u.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      {u.email}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                      roleColors[u.role] || 'bg-muted text-muted-foreground'
                    )}>
                      <Shield className="w-3 h-3" />
                      {roleLabels[u.role] || u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Select
                      value={u.role}
                      onValueChange={(value) => handleRoleChange(u.id, value)}
                      disabled={updating === u.id}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="operator">Operador</SelectItem>
                        <SelectItem value="client">Cliente</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteUser(u.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoveHorizontal as MoreHorizontal, Pencil, Trash2, Search, Wrench, Clock, DollarSign, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react'
import { deleteServiceType } from '@/app/actions/data'
import { cn } from '@/lib/utils'
import type { ServiceType } from '@/lib/db/schema'

interface ServiceTypesTableProps {
  serviceTypes: ServiceType[]
}

export function ServiceTypesTable({ serviceTypes }: ServiceTypesTableProps) {
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)

  const filteredTypes = serviceTypes.filter(
    (type) =>
      type.name.toLowerCase().includes(search.toLowerCase()) ||
      (type.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

  const handleDelete = async (id: number) => {
    if (!confirm('Esta seguro de eliminar este tipo de servicio?')) return
    setDeleting(id)
    await deleteServiceType(id)
    setDeleting(null)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tipos de servicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredTypes.length === 0 ? (
        <div className="text-center py-12">
          <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {search ? 'No se encontraron tipos de servicio' : 'No hay tipos de servicio registrados'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Nombre
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Descripcion
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Precio Base
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Duracion Est.
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Estado
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTypes.map((type) => (
                <tr
                  key={type.id}
                  className="border-b border-border/50 hover:bg-muted/30"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {type.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">
                    {type.description || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                      {type.basePrice
                        ? `${Number(type.basePrice).toLocaleString('es-MX')}`
                        : '-'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {type.estimatedDuration
                        ? `${type.estimatedDuration} min`
                        : '-'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                        type.isActive
                          ? 'bg-success/10 text-success border-success/30'
                          : 'bg-muted text-muted-foreground border-border'
                      )}
                    >
                      {type.isActive ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {type.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/tipos-servicio/${type.id}`}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(type.id)}
                          disabled={deleting === type.id}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deleting === type.id ? 'Eliminando...' : 'Eliminar'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

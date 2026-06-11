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
import { MoreHorizontal, Pencil, Trash2, Search, CircleDot, Calendar, Wrench } from 'lucide-react'
import { deleteDrone } from '@/app/actions/data'
import { cn } from '@/lib/utils'
import type { Drone } from '@/lib/db/schema'

interface DronesTableProps {
  drones: Drone[]
}

const statusColors: Record<string, string> = {
  available: 'bg-success/10 text-success border-success/30',
  in_service: 'bg-chart-2/10 text-chart-2 border-chart-2/30',
  maintenance: 'bg-warning/10 text-warning-foreground border-warning/30',
  retired: 'bg-muted text-muted-foreground border-border',
}

const statusLabels: Record<string, string> = {
  available: 'Disponible',
  in_service: 'En Servicio',
  maintenance: 'Mantenimiento',
  retired: 'Retirado',
}

export function DronesTable({ drones }: DronesTableProps) {
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)

  const filteredDrones = drones.filter(
    (drone) =>
      drone.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      drone.model.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: number) => {
    if (!confirm('Esta seguro de eliminar este drone?')) return
    setDeleting(id)
    await deleteDrone(id)
    setDeleting(null)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar drones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredDrones.length === 0 ? (
        <div className="text-center py-12">
          <CircleDot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {search ? 'No se encontraron drones' : 'No hay drones registrados'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Numero de Serie
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Modelo
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Estado
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Ultimo Mantenimiento
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Notas
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDrones.map((drone) => (
                <tr
                  key={drone.id}
                  className="border-b border-border/50 hover:bg-muted/30"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                        <CircleDot className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground font-mono">
                        {drone.serialNumber}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {drone.model}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                        statusColors[drone.status] || 'bg-muted text-muted-foreground'
                      )}
                    >
                      {statusLabels[drone.status] || drone.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Wrench className="w-3.5 h-3.5" />
                      {drone.lastMaintenanceDate
                        ? new Date(drone.lastMaintenanceDate).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Sin registro'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">
                    {drone.notes || '-'}
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
                          <Link href={`/admin/drones/${drone.id}`}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(drone.id)}
                          disabled={deleting === drone.id}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deleting === drone.id ? 'Eliminando...' : 'Eliminar'}
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

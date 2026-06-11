'use client'

import { useState } from 'react'
import Link from 'next/link'
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
import { Search, FileText, Calendar, MapPin, Pencil, Trash2 } from 'lucide-react'
import { deleteServiceRequest, updateRequestStatus } from '@/app/actions/data'
import { cn } from '@/lib/utils'
import type { Client, ServiceType, Drone, User } from '@/lib/db/schema'

interface RequestWithJoins {
  id: number
  clientId: number
  serviceTypeId: number | null
  droneId: number | null
  assignedUserId: string | null
  status: string
  scheduledDate: Date | null
  completedDate: Date | null
  location: string | null
  coordinates: string | null
  area: number | string | null
  notes: string | null
  totalPrice: number | string | null
  createdAt: Date
  updatedAt: Date
  clientName: string | null
  serviceTypeName: string | null
  droneSerial: string | null
  assignedUserName: string | null
}

interface RequestsTableProps {
  requests: RequestWithJoins[]
  clients: Client[]
  serviceTypes: ServiceType[]
  drones: Drone[]
  users: User[]
  currentUserRole?: string
}

const statusColors: Record<string, string> = {
  pendiente_agente: 'bg-warning/10 text-warning border-warning/30',
  en_proceso: 'bg-chart-2/10 text-chart-2 border-chart-2/30',
  completado: 'bg-green-500/10 text-green-600 border-green-500/30',
  cancelado: 'bg-destructive/10 text-destructive border-destructive/30',
}

const statusLabels: Record<string, string> = {
  pendiente_agente: 'Pendiente Agente',
  en_proceso: 'En Proceso',
  completado: 'Completado',
  cancelado: 'Cancelado',
}

export function RequestsTable({ requests, currentUserRole }: RequestsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleting, setDeleting] = useState<number | null>(null)
  const [updating, setUpdating] = useState<number | null>(null)

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      (request.clientName?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (request.serviceTypeName?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (request.location?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      request.id.toString().includes(search)

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleDelete = async (id: number) => {
    if (!confirm('Esta seguro de eliminar esta solicitud?')) return
    setDeleting(id)
    await deleteServiceRequest(id)
    setDeleting(null)
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdating(id)
    await updateRequestStatus(id, newStatus)
    setUpdating(null)
  }

  const isAdmin = currentUserRole === 'admin'

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar solicitudes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pendiente_agente">Pendiente Agente</SelectItem>
            <SelectItem value="en_proceso">En Proceso</SelectItem>
            <SelectItem value="completado">Completado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {search || statusFilter !== 'all'
              ? 'No se encontraron solicitudes'
              : 'No hay solicitudes registradas'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Cliente
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Servicio
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Estado
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Fecha Programada
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Ubicacion
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Opciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-border/50 hover:bg-muted/30"
                >
                  <td className="py-3 px-4 text-sm font-medium text-foreground">
                    #{request.id.toString().padStart(4, '0')}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {request.clientName || '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {request.serviceTypeName || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                        statusColors[request.status] || 'bg-muted text-muted-foreground'
                      )}
                    >
                      {statusLabels[request.status] || request.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {request.scheduledDate
                        ? new Date(request.scheduledDate).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      {request.location || '-'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                    {!isAdmin && (
                      <Link href={`/solicitudes/${request.id}`}>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                        >
                          Atender
                        </Button>
                      </Link>
                    )}
                    {isAdmin && (
                      <Link href={`/solicitudes/${request.id}/editar`}>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="gap-2 cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                          Editar
                        </Button>
                      </Link>
                    )}
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(request.id)}
                        disabled={deleting === request.id}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
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

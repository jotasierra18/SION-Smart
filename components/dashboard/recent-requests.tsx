'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, FileText, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface RequestWithJoins {
  id: number
  clientName: string | null
  serviceTypeName: string | null
  status: string
  scheduledDate: Date | null
  prioridad: string | null
  createdAt: Date
}

interface RecentRequestsProps {
  requests: RequestWithJoins[]
}

const statusColors: Record<string, string> = {
  pendiente_agente: 'bg-warning/10 text-warning border-warning/30',
  en_proceso: 'bg-chart-2/10 text-chart-2 border-chart-2/30',
  completado: 'bg-green-500/10 text-green-600 border-green-500/30',
  cancelado: 'bg-destructive/10 text-destructive border-destructive/30',
}

const statusLabels: Record<string, string> = {
  pendiente_agente: 'Pendiente',
  en_proceso: 'En Proceso',
  completado: 'Completado',
  cancelado: 'Cancelado',
}

const priorityColors: Record<string, string> = {
  alta: 'bg-destructive/10 text-destructive',
  media: 'bg-warning/10 text-warning',
  baja: 'bg-muted text-muted-foreground',
}

export function RecentRequests({ requests }: RecentRequestsProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      search === '' ||
      request.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      request.serviceTypeName?.toLowerCase().includes(search.toLowerCase()) ||
      request.id.toString().includes(search)
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || request.prioridad === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Solicitudes Recientes</h2>
          <p className="text-sm text-muted-foreground">Ultimas solicitudes del sistema</p>
        </div>
        <Link href="/solicitudes" className="text-sm text-primary hover:underline">
          Ver todas
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, servicio o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendiente_agente">Pendiente</SelectItem>
            <SelectItem value="en_proceso">En Proceso</SelectItem>
            <SelectItem value="completado">Completado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="baja">Baja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No hay solicitudes que mostrar</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Servicio</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Prioridad</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.slice(0, 8).map((request) => (
                <tr key={request.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-foreground">
                      #{request.id.toString().padStart(4, '0')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">{request.clientName || '-'}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{request.serviceTypeName || '-'}</td>
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
                    {request.prioridad ? (
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                          priorityColors[request.prioridad] || 'bg-muted text-muted-foreground'
                        )}
                      >
                        {request.prioridad.charAt(0).toUpperCase() + request.prioridad.slice(1)}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {request.scheduledDate
                        ? new Date(request.scheduledDate).toLocaleDateString('es-CO', {
                            day: '2-digit',
                            month: 'short',
                          })
                        : new Date(request.createdAt).toLocaleDateString('es-CO', {
                            day: '2-digit',
                            month: 'short',
                          })}
                    </div>
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

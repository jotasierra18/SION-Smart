'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Search, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react'

interface Client {
  id: number
  nombreCompleto: string | null
  companyName: string | null
  email: string
  phone: string | null
  city: string | null
  totalRequests: number
  completedRequests: number
  pendingRequests: number
}

interface ClientsDashboardProps {
  clients: Client[]
  stats: {
    totalClients: number
    activeClients: number
    newClientsThisMonth: number
    topCity: string
  }
}

export function ClientsDashboard({ clients, stats }: ClientsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Clientes</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalClients}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Clientes Activos</p>
              <p className="text-2xl font-bold text-green-900">{stats.activeClients}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Nuevos este Mes</p>
              <p className="text-2xl font-bold text-purple-900">{stats.newClientsThisMonth}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-amber-600 font-medium">Ciudad Principal</p>
              <p className="text-lg font-bold text-amber-900 truncate">{stats.topCity || 'N/A'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar cliente por nombre, email o empresa..." className="pl-10" />
          </div>
          <Button variant="outline">Filtros</Button>
          <Button className="bg-blue-600 hover:bg-blue-700">+ Nuevo Cliente</Button>
        </div>
      </Card>

      {/* Clients Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-slate-50">
          <h3 className="font-semibold text-slate-900">Listado de Clientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Contacto</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Ciudad</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Solicitudes</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Estado</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No hay clientes registrados</p>
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {client.nombreCompleto || client.companyName || 'Sin nombre'}
                          </p>
                          {client.companyName && client.nombreCompleto && (
                            <p className="text-xs text-slate-500">{client.companyName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-3.5 h-3.5" />
                          {client.email}
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Phone className="w-3.5 h-3.5" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-3.5 h-3.5" />
                        {client.city || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-medium">{client.totalRequests}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-green-600">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{client.completedRequests}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-600">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{client.pendingRequests}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge 
                        variant={client.pendingRequests > 0 ? 'default' : 'secondary'}
                        className={client.pendingRequests > 0 ? 'bg-green-100 text-green-700' : ''}
                      >
                        {client.pendingRequests > 0 ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">Ver detalle</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

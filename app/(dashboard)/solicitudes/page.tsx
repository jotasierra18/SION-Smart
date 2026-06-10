'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { RequestsTable } from './requests-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function RequestsPage() {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = user?.app_metadata?.role === 'admin'

  useEffect(() => {
    if (!user) return
    async function load() {
      const { getServiceRequests, getClients, getServiceTypes, getDrones, getUsers } = await import('@/app/actions/data')
      const [requests, clients, serviceTypes, drones, users] = await Promise.all([
        getServiceRequests(),
        getClients(),
        getServiceTypes(),
        getDrones(),
        getUsers(),
      ])
      setData({ requests, clients, serviceTypes, drones, users })
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">Cargando...</div></div>
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Solicitudes de Servicio</h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? 'Gestiona las solicitudes de servicio de drones'
              : 'Atiende las solicitudes asignadas'}
          </p>
        </div>
        {isAdmin && (
          <Link href="/solicitudes/nueva">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Solicitud
            </Button>
          </Link>
        )}
      </div>

      <RequestsTable
        requests={data.requests}
        clients={data.clients}
        serviceTypes={data.serviceTypes}
        drones={data.drones}
        users={data.users}
        currentUserRole={isAdmin ? 'admin' : 'operator'}
      />
    </div>
  )
}

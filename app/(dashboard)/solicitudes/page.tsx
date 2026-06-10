import { getServiceRequests, getClients, getServiceTypes, getDrones, getUsers } from '@/app/actions/data'
import { getSession } from '@/lib/auth'
import { RequestsTable } from './requests-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function RequestsPage() {
  const [requests, clients, serviceTypes, drones, users, session] = await Promise.all([
    getServiceRequests(),
    getClients(),
    getServiceTypes(),
    getDrones(),
    getUsers(),
    getSession(),
  ])

  const currentUserRole = session?.user?.app_metadata?.role || 'operator'
  const isAdmin = currentUserRole === 'admin'

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
        requests={requests}
        clients={clients}
        serviceTypes={serviceTypes}
        drones={drones}
        users={users}
        currentUserRole={currentUserRole}
      />
    </div>
  )
}

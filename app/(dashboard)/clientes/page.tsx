import { getClients } from '@/app/actions/data'
import { ClientsTable } from './clients-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { getSession } from '@/lib/auth'

export default async function ClientsPage() {
  const clients = await getClients()
  const session = await getSession()
  const isAdmin = (session?.user as { role?: string })?.role === 'admin'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona los clientes registrados en el sistema
          </p>
        </div>
        {isAdmin && (
          <Link href="/clientes/nuevo">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </Link>
        )}
      </div>

      <ClientsTable clients={clients} />
    </div>
  )
}

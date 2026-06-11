import { getServiceTypes } from '@/app/actions/data'
import { ServiceTypesTable } from './service-types-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function ServiceTypesPage() {
  const serviceTypes = await getServiceTypes()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tipos de Servicio</h1>
          <p className="text-muted-foreground">
            Gestiona los tipos de servicio disponibles
          </p>
        </div>
        <Link href="/admin/tipos-servicio/nuevo">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Tipo
          </Button>
        </Link>
      </div>

      <ServiceTypesTable serviceTypes={serviceTypes} />
    </div>
  )
}

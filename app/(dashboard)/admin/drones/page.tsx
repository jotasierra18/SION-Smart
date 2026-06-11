import { getDrones } from '@/app/actions/data'
import { DronesTable } from './drones-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function DronesPage() {
  const drones = await getDrones()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Drones</h1>
          <p className="text-muted-foreground">
            Gestiona la flota de drones del sistema
          </p>
        </div>
        <Link href="/admin/drones/nuevo">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Drone
          </Button>
        </Link>
      </div>

      <DronesTable drones={drones} />
    </div>
  )
}

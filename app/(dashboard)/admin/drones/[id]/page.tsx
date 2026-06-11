import { getDrones } from '@/app/actions/data'
import { DroneForm } from '@/components/drone-form'
import { notFound } from 'next/navigation'

export default async function EditDronePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const drones = await getDrones()
  const drone = drones.find((d) => d.id === parseInt(id))

  if (!drone) {
    notFound()
  }

  return <DroneForm drone={drone} />
}

import { getClients, getServiceTypes, getDrones, getUsers } from '@/app/actions/data'
import { RequestForm } from '@/components/request-form'

export default async function NewRequestPage() {
  const [clients, serviceTypes, drones, users] = await Promise.all([
    getClients(),
    getServiceTypes(),
    getDrones(),
    getUsers(),
  ])

  return (
    <RequestForm
      clients={clients}
      serviceTypes={serviceTypes}
      drones={drones}
      users={users}
    />
  )
}

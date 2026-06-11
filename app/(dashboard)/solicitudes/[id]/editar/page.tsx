import { getClients, getServiceTypes, getDrones, getUsers, getServiceRequests } from '@/app/actions/data'
import { RequestForm } from '@/components/request-form'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function EditRequestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const requestId = parseInt(id)
  
  const session = await getSession()
  const isAdmin = (session?.user as { role?: string })?.role === 'admin'
  
  if (!isAdmin) {
    redirect(`/solicitudes/${id}`)
  }

  const [requests, clients, serviceTypes, drones, users] = await Promise.all([
    getServiceRequests(),
    getClients(),
    getServiceTypes(),
    getDrones(),
    getUsers(),
  ])

  const request = requests.find(r => r.id === requestId)

  if (!request) {
    notFound()
  }

  return (
    <RequestForm
      request={request}
      clients={clients}
      serviceTypes={serviceTypes}
      drones={drones}
      users={users}
    />
  )
}

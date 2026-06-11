import { getClients, getServiceTypes, getDrones, getUsers, getServiceRequests } from '@/app/actions/data'
import { RequestDetailView } from '@/components/request-detail-view'
import { notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const requestId = parseInt(id)
  
  const session = await getSession()
  const userRole = (session?.user as { role?: string })?.role || 'operator'
  const isAdmin = userRole === 'admin'

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
    <RequestDetailView
      request={request}
      clients={clients}
      serviceTypes={serviceTypes}
      drones={drones}
      users={users}
      isAdmin={isAdmin}
    />
  )
}

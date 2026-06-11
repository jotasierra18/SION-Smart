import { getClient } from '@/app/actions/data'
import { ClientForm } from '@/components/client-form'
import { notFound } from 'next/navigation'

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const client = await getClient(parseInt(id))

  if (!client) {
    notFound()
  }

  return <ClientForm client={client} />
}

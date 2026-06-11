import { getServiceTypes } from '@/app/actions/data'
import { ServiceTypeForm } from '@/components/service-type-form'
import { notFound } from 'next/navigation'

export default async function EditServiceTypePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const serviceTypes = await getServiceTypes()
  const serviceType = serviceTypes.find((st) => st.id === parseInt(id))

  if (!serviceType) {
    notFound()
  }

  return <ServiceTypeForm serviceType={serviceType} />
}

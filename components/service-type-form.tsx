'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { createServiceType, updateServiceType } from '@/app/actions/data'
import type { ServiceType } from '@/lib/db/schema'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface ServiceTypeFormProps {
  serviceType?: ServiceType
}

export function ServiceTypeForm({ serviceType }: ServiceTypeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(serviceType?.isActive ?? true)

  const isEditing = !!serviceType

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
      isActive,
    }

    try {
      if (isEditing) {
        await updateServiceType(serviceType.id, data)
      } else {
        await createServiceType(data)
      }
      router.push('/admin/tipos-servicio')
      router.refresh()
    } catch {
      setError('Ocurrio un error al guardar el tipo de servicio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/tipos-servicio">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {isEditing ? 'Editar Tipo de Servicio' : 'Nuevo Tipo de Servicio'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? 'Modifica la informacion del tipo de servicio'
              : 'Registra un nuevo tipo de servicio'}
          </p>
        </div>
      </div>

      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={serviceType?.name}
              required
              placeholder="Fumigacion Agricola"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={serviceType?.description || ''}
              placeholder="Descripcion detallada del servicio..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <Label htmlFor="isActive" className="text-base">
                Servicio Activo
              </Label>
              <p className="text-sm text-muted-foreground">
                Los servicios inactivos no apareceran al crear solicitudes
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Link href="/admin/tipos-servicio">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Tipo'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

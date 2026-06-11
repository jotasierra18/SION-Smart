'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { closeServiceRequest, updateRequestStatus } from '@/app/actions/data'
import type { Client, ServiceType, Drone, User } from '@/lib/db/schema'
import { ArrowLeft, Clock, MapPin, User as UserIcon, Calendar, Play, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Upload, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type RequestWithRelations = {
  id: number
  clientId: number
  serviceTypeId: number | null
  droneId: number | null
  assignedUserId: string | null
  status: string
  scheduledDate: Date | null
  completedDate: Date | null
  createdAt: Date
  updatedAt: Date
  departamento: string | null
  altitud: number | null
  tipoZona: string | null
  areaTotalM2: number | null
  alturaMaxima: number | null
  prioridad: string | null
  estadoOperativo: string | null
  tipoSuperficie: string | null
  horasEstimadasVuelo: number | null
  // Campos del operador
  horaInicio: Date | null
  horaFinalizacion: Date | null
  tiempoTotalVuelo: number | null
  consumoAgua: number | null
  distanciaRecorrida: number | null
  alturaMaximaRegistrada: number | null
  velocidadPromedio: number | null
  consumoBateria: number | null
  numeroCiclos: number | null
  imagenPlano: string | null
  // Relations
  client?: Client
  serviceType?: ServiceType | null
  drone?: Drone | null
  assignedUser?: User | null
  [key: string]: any
}

interface RequestDetailViewProps {
  request: RequestWithRelations | Record<string, any>
  clients: Client[]
  serviceTypes: ServiceType[]
  drones: Drone[]
  users: User[]
  isAdmin: boolean
}

type FieldErrors = Record<string, string>

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1.5 text-xs text-destructive mt-1" role="alert">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </p>
  )
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  pendiente_agente: 'Pendiente Agente',
  en_proceso: 'En Proceso',
  completado: 'Completado',
  cancelled: 'Cancelado',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  pendiente_agente: 'bg-orange-100 text-orange-800 border-orange-300',
  en_proceso: 'bg-blue-100 text-blue-800 border-blue-300',
  completado: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
}

const prioridadColors: Record<string, string> = {
  baja: 'bg-gray-100 text-gray-800',
  media: 'bg-blue-100 text-blue-800',
  alta: 'bg-orange-100 text-orange-800',
  urgente: 'bg-red-100 text-red-800',
}

export function RequestDetailView({ request, clients, serviceTypes, drones, users, isAdmin }: RequestDetailViewProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [imagenPlano, setImagenPlano] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const client = clients.find(c => c.id === request.clientId)
  const serviceType = serviceTypes.find(st => st.id === request.serviceTypeId)
  const drone = drones.find(d => d.id === request.droneId)
  const assignedUser = users.find(u => u.id === request.assignedUserId)

  const canStartWork = request.status === 'pendiente_agente'
  const canCloseWork = request.status === 'en_proceso'
  const isCompleted = request.status === 'completado'

  const handleStartWork = async () => {
    setLoading(true)
    try {
      await updateRequestStatus(request.id, 'en_proceso')
      router.refresh()
    } catch {
      setGlobalError('Error al iniciar el trabajo')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setFieldErrors({})

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setFieldErrors({ imagenPlano: data.error || 'Error al subir imagen' })
        return
      }

      setImagenPlano(data.url)
    } catch {
      setFieldErrors({ imagenPlano: 'Error al subir imagen' })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleCloseWork = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})
    setGlobalError(null)

    const formData = new FormData(e.currentTarget)
    const errors: FieldErrors = {}

    // Validaciones
    if (!formData.get('horaInicio')) errors.horaInicio = 'La hora de inicio es obligatoria'
    if (!formData.get('horaFinalizacion')) errors.horaFinalizacion = 'La hora de finalizacion es obligatoria'
    if (!formData.get('tiempoTotalVuelo')) errors.tiempoTotalVuelo = 'El tiempo total de vuelo es obligatorio'
    if (!formData.get('consumoAgua')) errors.consumoAgua = 'El consumo de agua es obligatorio'
    if (!formData.get('distanciaRecorrida')) errors.distanciaRecorrida = 'La distancia recorrida es obligatoria'
    if (!formData.get('alturaMaximaRegistrada')) errors.alturaMaximaRegistrada = 'La altura maxima es obligatoria'
    if (!formData.get('velocidadPromedio')) errors.velocidadPromedio = 'La velocidad promedio es obligatoria'
    if (!formData.get('consumoBateria')) errors.consumoBateria = 'El consumo de bateria es obligatorio'
    if (!formData.get('numeroCiclos')) errors.numeroCiclos = 'El numero de ciclos es obligatorio'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)

    const getDateTime = (dateStr: string, timeStr: string) => {
      if (!dateStr || !timeStr) return new Date()
      const [year, month, day] = dateStr.split('-').map(Number)
      const [hours, minutes] = timeStr.split(':').map(Number)
      return new Date(year, month - 1, day, hours, minutes)
    }

    const today = new Date().toISOString().split('T')[0]
    const data = {
      horaInicio: getDateTime(today, formData.get('horaInicio') as string),
      horaFinalizacion: getDateTime(today, formData.get('horaFinalizacion') as string),
      tiempoTotalVuelo: parseFloat(formData.get('tiempoTotalVuelo') as string),
      consumoAgua: parseFloat(formData.get('consumoAgua') as string),
      distanciaRecorrida: parseFloat(formData.get('distanciaRecorrida') as string),
      alturaMaximaRegistrada: parseFloat(formData.get('alturaMaximaRegistrada') as string),
      velocidadPromedio: parseFloat(formData.get('velocidadPromedio') as string),
      consumoBateria: parseFloat(formData.get('consumoBateria') as string),
      numeroCiclos: parseInt(formData.get('numeroCiclos') as string),
      imagenPlano: imagenPlano,
    }

    try {
      await closeServiceRequest(request.id, data)
      router.push('/solicitudes')
      router.refresh()
    } catch {
      setGlobalError('Error al cerrar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  const fieldClass = (key: string) =>
    cn(fieldErrors[key] && 'border-destructive ring-1 ring-destructive focus-visible:ring-destructive')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/solicitudes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-foreground">
                Solicitud #{request.id}
              </h1>
              <Badge className={cn('border', statusColors[request.status] || 'bg-gray-100')}>
                {statusLabels[request.status] || request.status}
              </Badge>
              {request.prioridad && (
                <Badge className={prioridadColors[request.prioridad] || 'bg-gray-100'}>
                  {request.prioridad.charAt(0).toUpperCase() + request.prioridad.slice(1)}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Creada el {new Date(request.createdAt).toLocaleDateString('es-CO', { 
                day: '2-digit', month: 'long', year: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {canStartWork && (
          <Button onClick={handleStartWork} disabled={loading} className="gap-2">
            <Play className="w-4 h-4" />
            {loading ? 'Iniciando...' : 'Iniciar Trabajo'}
          </Button>
        )}
      </div>

      {globalError && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {globalError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos del Cliente */}
          {isAdmin && (
            <Card className="p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Datos del Cliente
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Nombre:</span>
                  <p className="font-medium">{client?.nombreCompleto || client?.companyName || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{client?.email || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Telefono:</span>
                  <p className="font-medium">{client?.phone || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ciudad:</span>
                  <p className="font-medium">{client?.city || '-'}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Datos del Servicio - solo admin en columna principal */}
          {isAdmin && (
            <Card className="p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Datos del Servicio
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Tipo de Servicio:</span>
                  <p className="font-medium">{serviceType?.name || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Departamento:</span>
                  <p className="font-medium">{request.departamento || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo de Zona:</span>
                  <p className="font-medium">{request.tipoZona || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Area Total:</span>
                  <p className="font-medium">{request.areaTotalM2 ? `${request.areaTotalM2} m²` : '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Altura Maxima:</span>
                  <p className="font-medium">{request.alturaMaxima ? `${request.alturaMaxima} m` : '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo Superficie:</span>
                  <p className="font-medium">{request.tipoSuperficie || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Horas Estimadas:</span>
                  <p className="font-medium">{request.horasEstimadasVuelo ? `${request.horasEstimadasVuelo} h` : '-'}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Formulario de cierre (solo si esta en proceso) */}
          {canCloseWork && (
            <Card className="p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Datos de Ejecucion - Cerrar Solicitud
              </h2>
              <form onSubmit={handleCloseWork} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="horaInicio">Hora de Inicio *</Label>
                    <Input id="horaInicio" name="horaInicio" type="time" className={fieldClass('horaInicio')} />
                    <FieldError message={fieldErrors.horaInicio} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="horaFinalizacion">Hora de Finalizacion *</Label>
                    <Input id="horaFinalizacion" name="horaFinalizacion" type="time" className={fieldClass('horaFinalizacion')} />
                    <FieldError message={fieldErrors.horaFinalizacion} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="tiempoTotalVuelo">Tiempo Total de Vuelo (min) *</Label>
                    <Input id="tiempoTotalVuelo" name="tiempoTotalVuelo" type="number" step="0.1" min="0" placeholder="Ej: 45.5" className={fieldClass('tiempoTotalVuelo')} />
                    <FieldError message={fieldErrors.tiempoTotalVuelo} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="consumoAgua">Consumo de Agua (L) *</Label>
                    <Input id="consumoAgua" name="consumoAgua" type="number" step="0.1" min="0" placeholder="Ej: 150.0" className={fieldClass('consumoAgua')} />
                    <FieldError message={fieldErrors.consumoAgua} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="distanciaRecorrida">Distancia Recorrida (km) *</Label>
                    <Input id="distanciaRecorrida" name="distanciaRecorrida" type="number" step="0.01" min="0" placeholder="Ej: 2.5" className={fieldClass('distanciaRecorrida')} />
                    <FieldError message={fieldErrors.distanciaRecorrida} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="alturaMaximaRegistrada">Altura Maxima (m) *</Label>
                    <Input id="alturaMaximaRegistrada" name="alturaMaximaRegistrada" type="number" step="0.1" min="0" placeholder="Ej: 120.0" className={fieldClass('alturaMaximaRegistrada')} />
                    <FieldError message={fieldErrors.alturaMaximaRegistrada} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="velocidadPromedio">Velocidad Promedio (km/h) *</Label>
                    <Input id="velocidadPromedio" name="velocidadPromedio" type="number" step="0.1" min="0" placeholder="Ej: 25.0" className={fieldClass('velocidadPromedio')} />
                    <FieldError message={fieldErrors.velocidadPromedio} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="consumoBateria">Consumo de Bateria (%) *</Label>
                    <Input id="consumoBateria" name="consumoBateria" type="number" step="1" min="0" max="100" placeholder="Ej: 85" className={fieldClass('consumoBateria')} />
                    <FieldError message={fieldErrors.consumoBateria} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="numeroCiclos">Numero de Ciclos *</Label>
                    <Input id="numeroCiclos" name="numeroCiclos" type="number" step="1" min="1" placeholder="Ej: 3" className={fieldClass('numeroCiclos')} />
                    <FieldError message={fieldErrors.numeroCiclos} />
                  </div>
                </div>
                
                {/* Campo de imagen/plano */}
                <div className="pt-4 border-t border-border">
                  <Label htmlFor="imagenPlano" className="mb-2 block">Imagen o Plano del Edificio/Estructura</Label>
                  <div className="flex items-center gap-4">
                    <label 
                      htmlFor="imagenPlano" 
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 border border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
                        fieldErrors.imagenPlano && "border-destructive"
                      )}
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingImage ? 'Subiendo...' : 'Seleccionar archivo'}
                    </label>
                    <input 
                      id="imagenPlano" 
                      type="file" 
                      accept="image/*,.pdf" 
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    {imagenPlano && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <ImageIcon className="w-4 h-4" />
                        <span>Imagen cargada</span>
                        <a 
                          href={imagenPlano} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="underline hover:text-green-700"
                        >
                          Ver
                        </a>
                      </div>
                    )}
                  </div>
                  <FieldError message={fieldErrors.imagenPlano} />
                  <p className="text-xs text-muted-foreground mt-1">Formatos: JPG, PNG, WebP, PDF. Max: 10MB</p>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={loading} className="gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {loading ? 'Cerrando...' : 'Cerrar Solicitud'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Datos de ejecucion (si ya esta completado) */}
          {isCompleted && request.horaInicio && (
            <Card className="p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Datos de Ejecucion (Completado)
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Hora de Inicio:</span>
                  <p className="font-medium">{new Date(request.horaInicio).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Hora de Finalizacion:</span>
                  <p className="font-medium">{request.horaFinalizacion ? new Date(request.horaFinalizacion).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tiempo Total de Vuelo:</span>
                  <p className="font-medium">{request.tiempoTotalVuelo ? `${request.tiempoTotalVuelo} min` : '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Consumo de Agua:</span>
                  <p className="font-medium">{request.consumoAgua ? `${request.consumoAgua} L` : '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Distancia Recorrida:</span>
                  <p className="font-medium">{request.distanciaRecorrida ? `${request.distanciaRecorrida} km` : '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Altura Maxima:</span>
                  <p className="font-medium">{request.alturaMaximaRegistrada ? `${request.alturaMaximaRegistrada} m` : '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Velocidad Promedio:</span>
                  <p className="font-medium">{request.velocidadPromedio ? `${request.velocidadPromedio} km/h` : '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Consumo de Bateria:</span>
                  <p className="font-medium">{request.consumoBateria ? `${request.consumoBateria}%` : '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Numero de Ciclos:</span>
                  <p className="font-medium">{request.numeroCiclos || '-'}</p>
                </div>
              </div>
              {request.imagenPlano && (
                <div className="mt-4 pt-4 border-t border-border">
                  <span className="text-muted-foreground text-sm block mb-2">Imagen/Plano del Edificio:</span>
                  <a 
                    href={request.imagenPlano} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Ver imagen o plano
                  </a>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Datos del Servicio - solo operadores en sidebar */}
          {!isAdmin && (
            <Card className="p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Datos del Servicio
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Tipo de Servicio:</span>
                  <p className="font-medium">{serviceType?.name || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Departamento:</span>
                  <p className="font-medium">{request.departamento || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo de Zona:</span>
                  <p className="font-medium">{request.tipoZona || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Area Total:</span>
                  <p className="font-medium">{request.areaTotalM2 ? `${request.areaTotalM2} m²` : '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Altura Maxima:</span>
                  <p className="font-medium">{request.alturaMaxima ? `${request.alturaMaxima} m` : '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo Superficie:</span>
                  <p className="font-medium">{request.tipoSuperficie || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Horas Estimadas:</span>
                  <p className="font-medium">{request.horasEstimadasVuelo ? `${request.horasEstimadasVuelo} h` : '-'}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Asignacion - solo admin */}
          {isAdmin && (
            <Card className="p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Asignacion
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Operador Asignado:</span>
                  <p className="font-medium">{assignedUser?.name || 'Sin asignar'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Drone:</span>
                  <p className="font-medium">{drone ? `${drone.model} (${drone.serialNumber})` : 'Sin asignar'}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Acciones Admin */}
          {isAdmin && (
            <Card className="p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border">
                Acciones
              </h2>
              <div className="space-y-2">
                <Link href={`/solicitudes/${request.id}/editar`} className="block">
                  <Button variant="outline" className="w-full">
                    Editar Solicitud
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

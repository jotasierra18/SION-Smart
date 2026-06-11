'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createServiceRequest, updateServiceRequest } from '@/app/actions/data'
import type { Client, ServiceType, Drone, User, ServiceRequest } from '@/lib/db/schema'
import { ArrowLeft, Save, CircleAlert as AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface RequestFormProps {
  request?: ServiceRequest | Record<string, any>
  clients: Client[]
  serviceTypes: ServiceType[]
  drones: Drone[]
  users: User[]
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

export function RequestForm({ request, clients, serviceTypes, drones, users }: RequestFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [globalError, setGlobalError] = useState<string | null>(null)

  const isEditing = !!request

  const validate = (formData: FormData): FieldErrors => {
    const errors: FieldErrors = {}

    if (!formData.get('clientId')) {
      errors.clientId = 'Debes seleccionar un cliente'
    }
    if (!formData.get('departamento')) {
      errors.departamento = 'El departamento es obligatorio'
    }
    if (!formData.get('serviceTypeId')) {
      errors.serviceTypeId = 'Debes seleccionar un tipo de servicio'
    }
    if (!formData.get('prioridad')) {
      errors.prioridad = 'La prioridad es obligatoria'
    }
    if (!formData.get('estadoOperativo')) {
      errors.estadoOperativo = 'El estado operativo es obligatorio'
    }
    const altitud = formData.get('altitud') as string
    if (altitud && (isNaN(Number(altitud)) || Number(altitud) < 0)) {
      errors.altitud = 'La altitud debe ser un numero positivo'
    }
    const area = formData.get('areaTotalM2') as string
    if (area && (isNaN(Number(area)) || Number(area) <= 0)) {
      errors.areaTotalM2 = 'El area debe ser mayor a 0'
    }
    const altura = formData.get('alturaMaxima') as string
    if (altura && (isNaN(Number(altura)) || Number(altura) < 0)) {
      errors.alturaMaxima = 'La altura debe ser un numero positivo'
    }
    const distancia = formData.get('distanciaAeropuerto') as string
    if (distancia && (isNaN(Number(distancia)) || Number(distancia) < 0)) {
      errors.distanciaAeropuerto = 'La distancia debe ser un numero positivo'
    }
    const horas = formData.get('horasEstimadasVuelo') as string
    if (horas && (isNaN(Number(horas)) || Number(horas) <= 0)) {
      errors.horasEstimadasVuelo = 'Las horas de vuelo deben ser mayor a 0'
    }
    const numeroOperadores = formData.get('numeroOperadores') as string
    if (numeroOperadores && (isNaN(Number(numeroOperadores)) || Number(numeroOperadores) < 1)) {
      errors.numeroOperadores = 'Debe haber al menos 1 operador'
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})
    setGlobalError(null)

    const formData = new FormData(e.currentTarget)

    // Validar antes de enviar
    const errors = validate(formData)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      // Scroll al primer campo con error
      const firstKey = Object.keys(errors)[0]
      document.getElementById(firstKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setLoading(true)

    const getStr = (key: string) => (formData.get(key) as string) || undefined
    const getNum = (key: string) => {
      const v = formData.get(key) as string
      return v ? parseInt(v) : undefined
    }
    const getFloat = (key: string) => {
      const v = formData.get(key) as string
      return v ? parseFloat(v) : undefined
    }
    const getDate = (key: string) => {
      const v = formData.get(key) as string
      if (!v) return undefined
      const [year, month, day] = v.split('-').map(Number)
      return new Date(year, month - 1, day)
    }

    const data = {
      clientId: parseInt(formData.get('clientId') as string),
      serviceTypeId: getNum('serviceTypeId'),
      droneId: getNum('droneId'),
      assignedUserId: getStr('assignedUserId'),
      status: getStr('status') || 'pending',
      departamento: getStr('departamento'),
      altitud: getFloat('altitud'),
      tipoZona: getStr('tipoZona'),
      distanciaAeropuerto: getFloat('distanciaAeropuerto'),
      restriccionAerea: getStr('restriccionAerea'),
      estadoPermisoAerocivil: getStr('estadoPermisoAerocivil'),
      serviceType: getStr('serviceTypeId'),
      tipoSuperficie: getStr('tipoSuperficie'),
      areaTotalM2: getFloat('areaTotalM2'),
      alturaMaxima: getFloat('alturaMaxima'),
      cantidadNiveles: getNum('cantidadNiveles'),
      tipoSuciedad: getStr('tipoSuciedad'),
      nivelContaminacion: getStr('nivelContaminacion'),
      frecuenciaLimpieza: getStr('frecuenciaLimpieza'),
      fechaEstimada: getDate('fechaEstimada'),
      prioridad: getStr('prioridad'),
      estadoOperativo: getStr('estadoOperativo'),
      horasEstimadasVuelo: getFloat('horasEstimadasVuelo'),
      cantidadAguaRequerida: getFloat('cantidadAguaRequerida'),
      cantidadQuimico: getFloat('cantidadQuimico'),
      numeroBaterias: getNum('numeroBaterias'),
      numeroOperadores: getNum('numeroOperadores'),
      riesgoOperacional: getStr('riesgoOperacional'),
    }

    try {
      if (isEditing) {
        await updateServiceRequest(request.id, {
          ...data,
          serviceTypeId: data.serviceTypeId ?? null,
          droneId: data.droneId ?? null,
          assignedUserId: data.assignedUserId ?? null,
          fechaEstimada: data.fechaEstimada ?? null,
          cantidadNiveles: data.cantidadNiveles ?? null,
          numeroBaterias: data.numeroBaterias ?? null,
          numeroOperadores: data.numeroOperadores ?? null,
        } as any)
      } else {
        await createServiceRequest(data as any)
      }
      router.push('/solicitudes')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      if (message.includes('Solo administradores')) {
        setGlobalError('Solo los administradores pueden crear solicitudes.')
      } else {
        setGlobalError('Ocurrio un error al guardar la solicitud. Revisa los datos e intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatDateForInput = (date: Date | null | undefined) => {
    if (!date) return ''
    return new Date(date).toISOString().split('T')[0]
  }

  const availableDrones = drones.filter(d => d.status === 'available' || d.id === request?.droneId)
  const operators = users.filter(u => u.role === 'operator')

  const fieldClass = (key: string) =>
    cn(fieldErrors[key] && 'border-destructive ring-1 ring-destructive focus-visible:ring-destructive')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/solicitudes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {isEditing ? 'Editar Solicitud' : 'Nueva Solicitud'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? 'Modifica la informacion de la solicitud' : 'Registra una nueva solicitud de servicio de drones'}
          </p>
        </div>
      </div>

      {globalError && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {globalError}
        </div>
      )}

      {Object.keys(fieldErrors).length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Por favor corrige los siguientes errores:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {Object.values(fieldErrors).map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>

        {/* Cliente y Asignacion */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border">
            Cliente y Asignacion
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clientId">Cliente *</Label>
              <Select name="clientId" defaultValue={request?.clientId?.toString() || ''}>
                <SelectTrigger id="clientId" className={fieldClass('clientId')}>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.nombreCompleto || c.companyName || c.contactName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={fieldErrors.clientId} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assignedUserId">Agente Asignado</Label>
              <Select name="assignedUserId" defaultValue={request?.assignedUserId || ''}>
                <SelectTrigger id="assignedUserId">
                  <SelectValue placeholder="Seleccionar agente" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((op) => (
                    <SelectItem key={op.id} value={op.id}>
                      {op.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="droneId">Drone Asignado</Label>
              <Select name="droneId" defaultValue={request?.droneId?.toString() || ''}>
                <SelectTrigger id="droneId">
                  <SelectValue placeholder="Seleccionar drone (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {availableDrones.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.model} - {d.serialNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Ubicacion y Espacio Aereo */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border">
            Ubicacion y Espacio Aereo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="departamento">Departamento *</Label>
              <Select name="departamento" defaultValue={request?.departamento || ''}>
                <SelectTrigger id="departamento" className={fieldClass('departamento')}>
                  <SelectValue placeholder="Seleccionar departamento" />
                </SelectTrigger>
                <SelectContent>
                  {['Amazonas','Antioquia','Arauca','Atlantico','Bolivar','Boyaca','Caldas','Caqueta','Casanare','Cauca','Cesar','Choco','Cordoba','Cundinamarca','Guainia','Guaviare','Huila','La Guajira','Magdalena','Meta','Narino','Norte de Santander','Putumayo','Quindio','Risaralda','San Andres y Providencia','Santander','Sucre','Tolima','Valle del Cauca','Vaupes','Vichada'].map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={fieldErrors.departamento} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="altitud">Altitud (m.s.n.m)</Label>
              <Input id="altitud" name="altitud" type="number" step="1"
                defaultValue={request?.altitud || ''} placeholder="Ej: 2600"
                className={fieldClass('altitud')} />
              <FieldError message={fieldErrors.altitud} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tipoZona">Tipo de Zona</Label>
              <Select name="tipoZona" defaultValue={request?.tipoZona || ''}>
                <SelectTrigger id="tipoZona"><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="urbana">Urbana</SelectItem>
                  <SelectItem value="rural">Rural</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="residencial">Residencial</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="agricola">Agricola</SelectItem>
                  <SelectItem value="portuaria">Portuaria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="distanciaAeropuerto">Distancia a Aeropuerto (km)</Label>
              <Input id="distanciaAeropuerto" name="distanciaAeropuerto" type="number" step="0.1"
                defaultValue={request?.distanciaAeropuerto || ''} placeholder="Ej: 5.2"
                className={fieldClass('distanciaAeropuerto')} />
              <FieldError message={fieldErrors.distanciaAeropuerto} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="restriccionAerea">Restriccion Aerea</Label>
              <Select name="restriccionAerea" defaultValue={request?.restriccionAerea || ''}>
                <SelectTrigger id="restriccionAerea"><SelectValue placeholder="Seleccionar restriccion" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin_restriccion">Sin restriccion</SelectItem>
                  <SelectItem value="zona_controlada">Zona controlada</SelectItem>
                  <SelectItem value="zona_restringida">Zona restringida</SelectItem>
                  <SelectItem value="zona_prohibida">Zona prohibida</SelectItem>
                  <SelectItem value="espacio_clase_b">Espacio aereo Clase B</SelectItem>
                  <SelectItem value="espacio_clase_c">Espacio aereo Clase C</SelectItem>
                  <SelectItem value="espacio_clase_d">Espacio aereo Clase D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="estadoPermisoAerocivil">Estado del Permiso Aerocivil</Label>
              <Select name="estadoPermisoAerocivil" defaultValue={request?.estadoPermisoAerocivil || ''}>
                <SelectTrigger id="estadoPermisoAerocivil"><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_requerido">No requerido</SelectItem>
                  <SelectItem value="en_tramite">En tramite</SelectItem>
                  <SelectItem value="aprobado">Aprobado</SelectItem>
                  <SelectItem value="rechazado">Rechazado</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
        </Card>

        {/* Caracteristicas del Servicio */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border">
            Caracteristicas del Servicio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="serviceTypeId">Tipo de Servicio *</Label>
              <Select name="serviceTypeId" defaultValue={request?.serviceTypeId?.toString() || ''}>
                <SelectTrigger id="serviceTypeId" className={fieldClass('serviceTypeId')}>
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.filter(st => st.isActive).map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={fieldErrors.serviceTypeId} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tipoSuperficie">Tipo de Superficie</Label>
              <Select name="tipoSuperficie" defaultValue={request?.tipoSuperficie || ''}>
                <SelectTrigger id="tipoSuperficie"><SelectValue placeholder="Seleccionar superficie" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fachada_vidrio">Fachada de vidrio</SelectItem>
                  <SelectItem value="fachada_concreto">Fachada de concreto</SelectItem>
                  <SelectItem value="cubierta_metalica">Cubierta metalica</SelectItem>
                  <SelectItem value="cubierta_teja">Cubierta de teja</SelectItem>
                  <SelectItem value="panel_solar">Panel solar</SelectItem>
                  <SelectItem value="estructura_metalica">Estructura metalica</SelectItem>
                  <SelectItem value="piedra">Piedra</SelectItem>
                  <SelectItem value="mixta">Mixta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="areaTotalM2">Area Total (m²)</Label>
              <Input id="areaTotalM2" name="areaTotalM2" type="number" step="0.01"
                defaultValue={request?.areaTotalM2 || ''} placeholder="Ej: 1500.00"
                className={fieldClass('areaTotalM2')} />
              <FieldError message={fieldErrors.areaTotalM2} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="alturaMaxima">Altura Maxima (m)</Label>
              <Input id="alturaMaxima" name="alturaMaxima" type="number" step="0.1"
                defaultValue={request?.alturaMaxima || ''} placeholder="Ej: 45.0"
                className={fieldClass('alturaMaxima')} />
              <FieldError message={fieldErrors.alturaMaxima} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cantidadNiveles">Cantidad de Niveles</Label>
              <Input id="cantidadNiveles" name="cantidadNiveles" type="number" step="1" min="1"
                defaultValue={request?.cantidadNiveles || ''} placeholder="Ej: 10" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tipoSuciedad">Tipo de Suciedad</Label>
              <Select name="tipoSuciedad" defaultValue={request?.tipoSuciedad || ''}>
                <SelectTrigger id="tipoSuciedad"><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="polvo">Polvo</SelectItem>
                  <SelectItem value="grasa">Grasa</SelectItem>
                  <SelectItem value="algas_hongos">Algas / Hongos</SelectItem>
                  <SelectItem value="suciedad_ambiental">Suciedad ambiental</SelectItem>
                  <SelectItem value="residuos_industriales">Residuos industriales</SelectItem>
                  <SelectItem value="excrementos">Excrementos de aves</SelectItem>
                  <SelectItem value="mixta">Mixta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nivelContaminacion">Nivel de Contaminacion</Label>
              <Select name="nivelContaminacion" defaultValue={request?.nivelContaminacion || ''}>
                <SelectTrigger id="nivelContaminacion"><SelectValue placeholder="Seleccionar nivel" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bajo">Bajo</SelectItem>
                  <SelectItem value="medio">Medio</SelectItem>
                  <SelectItem value="alto">Alto</SelectItem>
                  <SelectItem value="critico">Critico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="frecuenciaLimpieza">Frecuencia de Limpieza</Label>
              <Select name="frecuenciaLimpieza" defaultValue={request?.frecuenciaLimpieza || ''}>
                <SelectTrigger id="frecuenciaLimpieza"><SelectValue placeholder="Seleccionar frecuencia" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unica">Unica vez</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                  <SelectItem value="bimestral">Bimestral</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="semestral">Semestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fechaEstimada">Fecha Estimada</Label>
              <Input id="fechaEstimada" name="fechaEstimada" type="date"
                defaultValue={formatDateForInput(request?.fechaEstimada)} />
            </div>

          </div>
        </Card>

        {/* Estado y Prioridad */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border">
            Estado y Prioridad
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="prioridad">Prioridad *</Label>
              <Select name="prioridad" defaultValue={request?.prioridad || ''}>
                <SelectTrigger id="prioridad" className={fieldClass('prioridad')}>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
              <FieldError message={fieldErrors.prioridad} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="estadoOperativo">Estado Operativo *</Label>
              <Select name="estadoOperativo" defaultValue={request?.estadoOperativo || ''}>
                <SelectTrigger id="estadoOperativo" className={fieldClass('estadoOperativo')}>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="programado">Programado</SelectItem>
                  <SelectItem value="en_ejecucion">En ejecucion</SelectItem>
                  <SelectItem value="pausado">Pausado</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <FieldError message={fieldErrors.estadoOperativo} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="riesgoOperacional">Riesgo Operacional</Label>
              <Select name="riesgoOperacional" defaultValue={request?.riesgoOperacional || ''}>
                <SelectTrigger id="riesgoOperacional"><SelectValue placeholder="Seleccionar riesgo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bajo">Bajo</SelectItem>
                  <SelectItem value="moderado">Moderado</SelectItem>
                  <SelectItem value="alto">Alto</SelectItem>
                  <SelectItem value="muy_alto">Muy alto</SelectItem>
                  <SelectItem value="critico">Critico</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
        </Card>

        {/* Recursos Operacionales */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border">
            Recursos Operacionales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="horasEstimadasVuelo">Horas Estimadas de Vuelo</Label>
              <Input id="horasEstimadasVuelo" name="horasEstimadasVuelo" type="number" step="0.5" min="0"
                defaultValue={request?.horasEstimadasVuelo || ''} placeholder="Ej: 4.5"
                className={fieldClass('horasEstimadasVuelo')} />
              <FieldError message={fieldErrors.horasEstimadasVuelo} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cantidadAguaRequerida">Cantidad de Agua Requerida (L)</Label>
              <Input id="cantidadAguaRequerida" name="cantidadAguaRequerida" type="number" step="0.1" min="0"
                defaultValue={request?.cantidadAguaRequerida || ''} placeholder="Ej: 200.0" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cantidadQuimico">Cantidad de Quimico (L)</Label>
              <Input id="cantidadQuimico" name="cantidadQuimico" type="number" step="0.1" min="0"
                defaultValue={request?.cantidadQuimico || ''} placeholder="Ej: 10.0" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="numeroBaterias">Numero de Baterias</Label>
              <Input id="numeroBaterias" name="numeroBaterias" type="number" step="1" min="1"
                defaultValue={request?.numeroBaterias || ''} placeholder="Ej: 4" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="numeroOperadores">Numero de Operadores</Label>
              <Input id="numeroOperadores" name="numeroOperadores" type="number" step="1" min="1"
                defaultValue={request?.numeroOperadores || ''} placeholder="Ej: 2"
                className={fieldClass('numeroOperadores')} />
              <FieldError message={fieldErrors.numeroOperadores} />
            </div>

          </div>
        </Card>

        <div className="flex justify-end gap-3 pb-6">
          <Link href="/solicitudes">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Solicitud'}
          </Button>
        </div>

      </form>
    </div>
  )
}

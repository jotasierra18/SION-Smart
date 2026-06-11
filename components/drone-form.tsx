'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createDrone, updateDrone } from '@/app/actions/data'
import type { Drone } from '@/lib/db/schema'
import { ArrowLeft, Upload, Trash2, Save } from 'lucide-react'
import Link from 'next/link'

interface DroneFormProps {
  drone?: Drone
}

export function DroneForm({ drone }: DroneFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagenDrone, setImagenDrone] = useState<string | null>(drone?.imagenDrone || null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!drone

  const formatDateForInput = (date: Date | string | null | undefined) => {
    if (!date) return ''
    return new Date(date).toISOString().split('T')[0]
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB')
      return
    }

    setUploadingImage(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al subir imagen')
        return
      }

      setImagenDrone(data.url)
    } catch {
      setError('Error al subir imagen')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setImagenDrone(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const fechaCompraStr = formData.get('fechaCompra') as string

    const data = {
      nombre: formData.get('nombre') as string,
      codigoInterno: formData.get('codigoInterno') as string,
      marca: formData.get('marca') as string,
      model: formData.get('model') as string,
      serialNumber: formData.get('serialNumber') as string,
      fechaCompra: fechaCompraStr ? new Date(fechaCompraStr) : undefined,
      status: formData.get('status') as string || 'available',
      ubicacionActual: formData.get('ubicacionActual') as string || undefined,
      imagenDrone: imagenDrone || undefined,
      // Caracteristicas tecnicas
      peso: formData.get('peso') ? parseFloat(formData.get('peso') as string) : undefined,
      velocidadMaxima: formData.get('velocidadMaxima') ? parseFloat(formData.get('velocidadMaxima') as string) : undefined,
      altitudMaxima: formData.get('altitudMaxima') ? parseFloat(formData.get('altitudMaxima') as string) : undefined,
      resistenciaViento: formData.get('resistenciaViento') as string || undefined,
      temperaturaOperativa: formData.get('temperaturaOperativa') as string || undefined,
      tiempoMaximoVuelo: formData.get('tiempoMaximoVuelo') ? parseFloat(formData.get('tiempoMaximoVuelo') as string) : undefined,
      // Sistema de limpieza
      capacidadTanque: formData.get('capacidadTanque') ? parseFloat(formData.get('capacidadTanque') as string) : undefined,
      presion: formData.get('presion') ? parseFloat(formData.get('presion') as string) : undefined,
      tipoBoquilla: formData.get('tipoBoquilla') as string || undefined,
      alcance: formData.get('alcance') ? parseFloat(formData.get('alcance') as string) : undefined,
      tipoProducto: formData.get('tipoProducto') as string || undefined,
    }

    try {
      if (isEditing) {
        await updateDrone(drone.id, {
          ...data,
          fechaCompra: data.fechaCompra ?? null,
        })
      } else {
        await createDrone(data)
      }
      router.push('/admin/drones')
      router.refresh()
    } catch {
      setError('Ocurrio un error al guardar el drone')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/drones">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {isEditing ? 'Editar Drone' : 'Nuevo Drone'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Modifica la ficha tecnica del drone' : 'Registra un nuevo drone en la flota'}
          </p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
              {imagenDrone ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={imagenDrone || "/placeholder.svg"} 
                  alt="Drone" 
                  className="w-full h-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src="/images/drone-placeholder.png" 
                  alt="Drone placeholder" 
                  className="w-16 h-16 object-contain opacity-60"
                />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Profile Picture</p>
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="text-primary border-primary hover:bg-primary/10"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingImage ? 'Subiendo...' : 'Upload Image'}
                </Button>
                {imagenDrone && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={handleRemoveImage}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Supports Only: PNG, JPEG, JPG ( Under 5MB )</p>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Informacion General */}
          <Card className="p-6 border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Informacion General</h2>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="nombre" className="text-destructive">Nombre del Dron *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  defaultValue={drone?.nombre || ''}
                  required
                  placeholder="DJI Matrice 30 - DRN-001"
                  className="bg-muted/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="codigoInterno" className="text-destructive">Codigo Interno *</Label>
                  <Input
                    id="codigoInterno"
                    name="codigoInterno"
                    defaultValue={drone?.codigoInterno || ''}
                    required
                    placeholder="DRN001"
                    className="bg-muted/50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="marca" className="text-destructive">Marca *</Label>
                  <Input
                    id="marca"
                    name="marca"
                    defaultValue={drone?.marca || ''}
                    required
                    placeholder="DJI"
                    className="bg-muted/50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="model" className="text-destructive">Modelo *</Label>
                <Input
                  id="model"
                  name="model"
                  defaultValue={drone?.model || ''}
                  required
                  placeholder="Matrice 30"
                  className="bg-muted/50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="serialNumber" className="text-destructive">Numero de Serie *</Label>
                <Input
                  id="serialNumber"
                  name="serialNumber"
                  defaultValue={drone?.serialNumber || ''}
                  required
                  placeholder="1584A4D6A8"
                  className="bg-muted/50 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fechaCompra">Fecha de Compra</Label>
                  <Input
                    id="fechaCompra"
                    name="fechaCompra"
                    type="date"
                    defaultValue={formatDateForInput(drone?.fechaCompra)}
                    className="bg-muted/50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="status" className="text-destructive">Estado *</Label>
                  <Select name="status" defaultValue={drone?.status || 'available'}>
                    <SelectTrigger id="status" className="bg-muted/50">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Disponible
                        </span>
                      </SelectItem>
                      <SelectItem value="in_service">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          En Servicio
                        </span>
                      </SelectItem>
                      <SelectItem value="maintenance">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                          Mantenimiento
                        </span>
                      </SelectItem>
                      <SelectItem value="retired">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                          Retirado
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="ubicacionActual">Ubicacion Actual</Label>
                <Input
                  id="ubicacionActual"
                  name="ubicacionActual"
                  defaultValue={drone?.ubicacionActual || ''}
                  placeholder="Bodega Coveñas"
                  className="bg-muted/50"
                />
              </div>
            </div>
          </Card>

          {/* Caracteristicas tecnicas */}
          <Card className="p-6 border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Caracteristicas tecnicas:</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="peso" className="text-destructive">Peso *</Label>
                  <Input
                    id="peso"
                    name="peso"
                    defaultValue={drone?.peso || ''}
                    placeholder="ej. 9.7 kg"
                    className="bg-muted/50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="velocidadMaxima" className="text-destructive">Velocidad maxima *</Label>
                  <Input
                    id="velocidadMaxima"
                    name="velocidadMaxima"
                    defaultValue={drone?.velocidadMaxima || ''}
                    placeholder="ej. 23 m/s"
                    className="bg-muted/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="altitudMaxima" className="text-destructive">Altitud Maxima *</Label>
                  <Input
                    id="altitudMaxima"
                    name="altitudMaxima"
                    defaultValue={drone?.altitudMaxima || ''}
                    placeholder="ej. 7000 m"
                    className="bg-muted/50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="resistenciaViento" className="text-destructive">Resistencia al viento *</Label>
                  <Input
                    id="resistenciaViento"
                    name="resistenciaViento"
                    defaultValue={drone?.resistenciaViento || ''}
                    placeholder="ej. 15 m/s"
                    className="bg-muted/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="temperaturaOperativa" className="text-destructive">Temperatura Operativa *</Label>
                  <Input
                    id="temperaturaOperativa"
                    name="temperaturaOperativa"
                    defaultValue={drone?.temperaturaOperativa || ''}
                    placeholder="ej. -20° a 50°C"
                    className="bg-muted/50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="tiempoMaximoVuelo" className="text-destructive">Tiempo Maximo de Vuelo *</Label>
                  <Input
                    id="tiempoMaximoVuelo"
                    name="tiempoMaximoVuelo"
                    defaultValue={drone?.tiempoMaximoVuelo || ''}
                    placeholder="ej. 41 min"
                    className="bg-muted/50"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Sistema de Limpieza */}
          <Card className="p-6 border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Sistema de Limpieza:</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="capacidadTanque" className="text-destructive">Capacidad del tanque *</Label>
                  <Input
                    id="capacidadTanque"
                    name="capacidadTanque"
                    defaultValue={drone?.capacidadTanque || ''}
                    placeholder="ej. 40 L"
                    className="bg-muted/50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="presion" className="text-destructive">Presion *</Label>
                  <Input
                    id="presion"
                    name="presion"
                    defaultValue={drone?.presion || ''}
                    placeholder="ej. 4.5 bar"
                    className="bg-muted/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="tipoBoquilla" className="text-destructive">tipo de Boquilla *</Label>
                  <Input
                    id="tipoBoquilla"
                    name="tipoBoquilla"
                    defaultValue={drone?.tipoBoquilla || ''}
                    placeholder="ej. Cono hueco"
                    className="bg-muted/50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="alcance" className="text-destructive">Alcance *</Label>
                  <Input
                    id="alcance"
                    name="alcance"
                    defaultValue={drone?.alcance || ''}
                    placeholder="ej. 9 m"
                    className="bg-muted/50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="tipoProducto" className="text-destructive">Tipo de Producto *</Label>
                <Input
                  id="tipoProducto"
                  name="tipoProducto"
                  defaultValue={drone?.tipoProducto || ''}
                  placeholder="ej. Agua, detergente biodegradable"
                  className="bg-muted/50"
                />
              </div>
            </div>
          </Card>

          {error && (
            <p className="text-sm text-destructive" role="alert">{error}</p>
          )}

          {/* Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/admin/drones">
              <Button type="button" variant="outline" className="px-8">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="px-8">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Drone'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

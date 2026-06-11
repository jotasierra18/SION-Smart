'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClientRecord, updateClient } from '@/app/actions/data'
import type { Client } from '@/lib/db/schema'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface ClientFormProps {
  client?: Client
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [tipoCliente, setTipoCliente] = useState(client?.tipoCliente || 'natural')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    const data = {
      tipoCliente,
      // Persona Natural
      idInterno: formData.get('idInterno') as string,
      tipoDocumento: formData.get('tipoDocumento') as string,
      numeroDocumento: formData.get('numeroDocumento') as string,
      nombreCompleto: formData.get('nombreCompleto') as string,
      phone: formData.get('phone') as string,
      whatsapp: formData.get('whatsapp') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      departamento: formData.get('departamento') as string,
      pais: formData.get('pais') as string,
      rutPersonal: formData.get('rutPersonal') as string,
      // Persona Juridica
      razonSocial: formData.get('razonSocial') as string,
      nit: formData.get('nit') as string,
      representanteLegal: formData.get('representanteLegal') as string,
      cargoContacto: formData.get('cargoContacto') as string,
      correoCorporativo: formData.get('correoCorporativo') as string,
      telefonoCorporativo: formData.get('telefonoCorporativo') as string,
      direccionFacturacion: formData.get('direccionFacturacion') as string,
      regimenTributario: formData.get('regimenTributario') as string,
      rutEmpresa: formData.get('rutEmpresa') as string,
      // Informacion Comercial
      canalAdquisicion: formData.get('canalAdquisicion') as string,
      asesorComercial: formData.get('asesorComercial') as string,
      estadoCliente: formData.get('estadoCliente') as string,
      observaciones: formData.get('observaciones') as string,
      // Legacy fields
      companyName: tipoCliente === 'juridica' 
        ? (formData.get('razonSocial') as string) || 'N/A'
        : (formData.get('nombreCompleto') as string) || 'N/A',
      contactName: tipoCliente === 'juridica'
        ? (formData.get('representanteLegal') as string) || 'N/A'
        : (formData.get('nombreCompleto') as string) || 'N/A',
    }

    startTransition(async () => {
      try {
        if (client) {
          await updateClient(client.id, data)
        } else {
          await createClientRecord(data)
        }
        router.push('/clientes')
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al guardar')
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clientes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {client ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h1>
          <p className="text-muted-foreground">
            {client
              ? 'Modifica la informacion del cliente'
              : 'Registra un nuevo cliente en el sistema'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Tipo de Cliente */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Tipo de Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={tipoCliente === 'natural' ? 'default' : 'outline'}
                onClick={() => setTipoCliente('natural')}
                className="flex-1"
              >
                Persona Natural
              </Button>
              <Button
                type="button"
                variant={tipoCliente === 'juridica' ? 'default' : 'outline'}
                onClick={() => setTipoCliente('juridica')}
                className="flex-1"
              >
                Persona Juridica
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Persona Natural */}
        {tipoCliente === 'natural' && (
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Datos Personales</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idInterno">ID Interno</Label>
                <Input
                  id="idInterno"
                  name="idInterno"
                  defaultValue={client?.idInterno || ''}
                  placeholder="ID-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
                <Select name="tipoDocumento" defaultValue={client?.tipoDocumento || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cc">Cedula de Ciudadania</SelectItem>
                    <SelectItem value="ce">Cedula de Extranjeria</SelectItem>
                    <SelectItem value="pasaporte">Pasaporte</SelectItem>
                    <SelectItem value="ti">Tarjeta de Identidad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroDocumento">Numero de Documento</Label>
                <Input
                  id="numeroDocumento"
                  name="numeroDocumento"
                  defaultValue={client?.numeroDocumento || ''}
                  placeholder="123456789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombreCompleto">Nombre Completo *</Label>
                <Input
                  id="nombreCompleto"
                  name="nombreCompleto"
                  defaultValue={client?.nombreCompleto || ''}
                  placeholder="Juan Perez"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={client?.phone || ''}
                  placeholder="+57 300 123 4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  defaultValue={client?.whatsapp || ''}
                  placeholder="+57 300 123 4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electronico *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={client?.email || ''}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Direccion</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={client?.address || ''}
                  placeholder="Calle 123 #45-67"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={client?.city || ''}
                  placeholder="Bogota"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento</Label>
                <Select name="departamento" defaultValue={client?.departamento || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amazonas">Amazonas</SelectItem>
                    <SelectItem value="antioquia">Antioquia</SelectItem>
                    <SelectItem value="arauca">Arauca</SelectItem>
                    <SelectItem value="atlantico">Atlantico</SelectItem>
                    <SelectItem value="bolivar">Bolivar</SelectItem>
                    <SelectItem value="boyaca">Boyaca</SelectItem>
                    <SelectItem value="caldas">Caldas</SelectItem>
                    <SelectItem value="caqueta">Caqueta</SelectItem>
                    <SelectItem value="casanare">Casanare</SelectItem>
                    <SelectItem value="cauca">Cauca</SelectItem>
                    <SelectItem value="cesar">Cesar</SelectItem>
                    <SelectItem value="choco">Choco</SelectItem>
                    <SelectItem value="cordoba">Cordoba</SelectItem>
                    <SelectItem value="cundinamarca">Cundinamarca</SelectItem>
                    <SelectItem value="guainia">Guainia</SelectItem>
                    <SelectItem value="guaviare">Guaviare</SelectItem>
                    <SelectItem value="huila">Huila</SelectItem>
                    <SelectItem value="la_guajira">La Guajira</SelectItem>
                    <SelectItem value="magdalena">Magdalena</SelectItem>
                    <SelectItem value="meta">Meta</SelectItem>
                    <SelectItem value="narino">Narino</SelectItem>
                    <SelectItem value="norte_santander">Norte de Santander</SelectItem>
                    <SelectItem value="putumayo">Putumayo</SelectItem>
                    <SelectItem value="quindio">Quindio</SelectItem>
                    <SelectItem value="risaralda">Risaralda</SelectItem>
                    <SelectItem value="san_andres">San Andres y Providencia</SelectItem>
                    <SelectItem value="santander">Santander</SelectItem>
                    <SelectItem value="sucre">Sucre</SelectItem>
                    <SelectItem value="tolima">Tolima</SelectItem>
                    <SelectItem value="valle_cauca">Valle del Cauca</SelectItem>
                    <SelectItem value="vaupes">Vaupes</SelectItem>
                    <SelectItem value="vichada">Vichada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pais">Pais</Label>
                <Select name="pais" defaultValue={client?.pais || 'colombia'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="colombia">Colombia</SelectItem>
                    <SelectItem value="ecuador">Ecuador</SelectItem>
                    <SelectItem value="peru">Peru</SelectItem>
                    <SelectItem value="venezuela">Venezuela</SelectItem>
                    <SelectItem value="panama">Panama</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rutPersonal">Adjuntar RUT (URL)</Label>
                <Input
                  id="rutPersonal"
                  name="rutPersonal"
                  defaultValue={client?.rutPersonal || ''}
                  placeholder="URL del documento"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Persona Juridica */}
        {tipoCliente === 'juridica' && (
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Datos Empresariales</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="razonSocial">Razon Social *</Label>
                <Input
                  id="razonSocial"
                  name="razonSocial"
                  defaultValue={client?.razonSocial || ''}
                  placeholder="Empresa S.A.S."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nit">NIT *</Label>
                <Input
                  id="nit"
                  name="nit"
                  defaultValue={client?.nit || ''}
                  placeholder="900123456-7"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="representanteLegal">Representante Legal</Label>
                <Input
                  id="representanteLegal"
                  name="representanteLegal"
                  defaultValue={client?.representanteLegal || ''}
                  placeholder="Nombre del representante"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargoContacto">Cargo del Contacto</Label>
                <Input
                  id="cargoContacto"
                  name="cargoContacto"
                  defaultValue={client?.cargoContacto || ''}
                  placeholder="Gerente, Director, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="correoCorporativo">Correo Corporativo</Label>
                <Input
                  id="correoCorporativo"
                  name="correoCorporativo"
                  type="email"
                  defaultValue={client?.correoCorporativo || ''}
                  placeholder="contacto@empresa.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electronico *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={client?.email || ''}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefonoCorporativo">Telefono Corporativo</Label>
                <Input
                  id="telefonoCorporativo"
                  name="telefonoCorporativo"
                  type="tel"
                  defaultValue={client?.telefonoCorporativo || ''}
                  placeholder="+57 1 234 5678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccionFacturacion">Direccion de Facturacion</Label>
                <Input
                  id="direccionFacturacion"
                  name="direccionFacturacion"
                  defaultValue={client?.direccionFacturacion || ''}
                  placeholder="Calle 123 #45-67"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regimenTributario">Regimen Tributario</Label>
                <Select name="regimenTributario" defaultValue={client?.regimenTributario || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simplificado">Regimen Simplificado</SelectItem>
                    <SelectItem value="comun">Regimen Comun</SelectItem>
                    <SelectItem value="gran_contribuyente">Gran Contribuyente</SelectItem>
                    <SelectItem value="no_responsable_iva">No Responsable de IVA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rutEmpresa">Adjuntar RUT (URL)</Label>
                <Input
                  id="rutEmpresa"
                  name="rutEmpresa"
                  defaultValue={client?.rutEmpresa || ''}
                  placeholder="URL del documento"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informacion Comercial */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Informacion Comercial</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaRegistro">Fecha de Registro</Label>
              <Input
                id="fechaRegistro"
                name="fechaRegistro"
                type="date"
                defaultValue={client?.fechaRegistro ? new Date(client.fechaRegistro).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="canalAdquisicion">Canal de Adquisicion</Label>
              <Select name="canalAdquisicion" defaultValue={client?.canalAdquisicion || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="referido">Referido</SelectItem>
                  <SelectItem value="redes_sociales">Redes Sociales</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="publicidad">Publicidad</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                  <SelectItem value="llamada_fria">Llamada en Frio</SelectItem>
                  <SelectItem value="sitio_web">Sitio Web</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asesorComercial">Asesor Comercial Asignado</Label>
              <Input
                id="asesorComercial"
                name="asesorComercial"
                defaultValue={client?.asesorComercial || ''}
                placeholder="Nombre del asesor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estadoCliente">Estado del Cliente</Label>
              <Select name="estadoCliente" defaultValue={client?.estadoCliente || 'activo'}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="prospecto">Prospecto</SelectItem>
                  <SelectItem value="suspendido">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                name="observaciones"
                defaultValue={client?.observaciones || ''}
                placeholder="Notas adicionales sobre el cliente..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Link href="/clientes">
            <Button type="button" variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isPending}>
            <Save className="w-4 h-4 mr-2" />
            {isPending ? 'Guardando...' : client ? 'Guardar Cambios' : 'Crear Cliente'}
          </Button>
        </div>
      </form>
    </div>
  )
}

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
import { createUser } from '@/app/actions/data'
import { ArrowLeft, Save, CircleAlert as AlertCircle, User, Shield, Stethoscope } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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

export function UserForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('operator')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [globalError, setGlobalError] = useState<string | null>(null)

  const validate = (formData: FormData): FieldErrors => {
    const errors: FieldErrors = {}
    if (!formData.get('name')) errors.name = 'El nombre es obligatorio'
    if (!formData.get('email')) errors.email = 'El correo es obligatorio'
    const email = formData.get('email') as string
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Ingresa un correo valido'
    }
    const password = formData.get('password') as string
    if (!password) errors.password = 'La contrasena es obligatoria'
    if (password && password.length < 8) errors.password = 'Minimo 8 caracteres'
    const confirm = formData.get('confirmPassword') as string
    if (confirm !== password) errors.confirmPassword = 'Las contrasenas no coinciden'
    if (!formData.get('role')) errors.role = 'El rol es obligatorio'
    if (role === 'operator') {
      if (!formData.get('identificacion')) errors.identificacion = 'La identificacion es obligatoria'
      const horas = formData.get('horasExperiencia') as string
      if (horas && isNaN(Number(horas))) errors.horasExperiencia = 'Debe ser un numero valido'
      if (horas && Number(horas) > 99999) errors.horasExperiencia = 'Maximo 99,999 horas'
      if (horas && Number(horas) < 0) errors.horasExperiencia = 'Las horas no pueden ser negativas'
    }
    return errors
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})
    setGlobalError(null)

    const formData = new FormData(e.currentTarget)
    const errors = validate(formData)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      document.getElementById(Object.keys(errors)[0])?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setLoading(true)
    try {
      const vigenciaStr = formData.get('vigenciaMedica') as string
      const [y, m, d] = vigenciaStr ? vigenciaStr.split('-').map(Number) : []

      await createUser({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        role: formData.get('role') as string,
        identificacion: (formData.get('identificacion') as string) || undefined,
        certificacion: (formData.get('certificacion') as string) || undefined,
        horasExperiencia: formData.get('horasExperiencia') ? parseFloat(formData.get('horasExperiencia') as string) : undefined,
        vigenciaMedica: vigenciaStr ? new Date(y, m - 1, d) : undefined,
      })
      router.push('/admin/usuarios')
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('use') || msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('exists')) {
        setFieldErrors({ email: 'Este correo ya esta registrado' })
      } else if (msg.toLowerCase().includes('overflow') || msg.toLowerCase().includes('numeric')) {
        setFieldErrors({ horasExperiencia: 'El valor de horas es demasiado grande' })
      } else {
        setGlobalError('Ocurrio un error al crear el usuario: ' + msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const fieldClass = (key: string) =>
    cn(fieldErrors[key] && 'border-destructive ring-1 ring-destructive')

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/usuarios">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Nuevo Usuario</h1>
          <p className="text-sm text-muted-foreground">Crea un nuevo usuario en el sistema</p>
        </div>
      </div>

      {globalError && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>

        {/* Datos de acceso */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <User className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Datos de Acceso</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input id="name" name="name" placeholder="Nombre del usuario" className={fieldClass('name')} />
              <FieldError message={fieldErrors.name} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">Rol *</Label>
              <Select name="role" value={role} onValueChange={setRole}>
                <SelectTrigger id="role" className={fieldClass('role')}>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="operator">Operador</SelectItem>
                  <SelectItem value="client">Cliente</SelectItem>
                </SelectContent>
              </Select>
              <FieldError message={fieldErrors.role} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Correo electronico *</Label>
            <Input id="email" name="email" type="email" placeholder="correo@ejemplo.com" className={fieldClass('email')} />
            <FieldError message={fieldErrors.email} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Contrasena *</Label>
              <Input id="password" name="password" type="password" placeholder="Minimo 8 caracteres" className={fieldClass('password')} />
              <FieldError message={fieldErrors.password} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirmar contrasena *</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repite la contrasena" className={fieldClass('confirmPassword')} />
              <FieldError message={fieldErrors.confirmPassword} />
            </div>
          </div>
        </Card>

        {/* Datos del Operador - solo visible si rol = operator */}
        {role === 'operator' && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Shield className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Datos del Operador</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="identificacion">Identificacion *</Label>
                <Input id="identificacion" name="identificacion" placeholder="Numero de cedula o documento" className={fieldClass('identificacion')} />
                <FieldError message={fieldErrors.identificacion} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="certificacion">Certificacion</Label>
                <Input id="certificacion" name="certificacion" placeholder="Ej: Piloto RPAs Aerocivil" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="horasExperiencia">Horas de Experiencia</Label>
                <Input id="horasExperiencia" name="horasExperiencia" type="number" step="0.5" min="0" max="99999" placeholder="Ej: 150.5" className={fieldClass('horasExperiencia')} />
                <FieldError message={fieldErrors.horasExperiencia} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="vigenciaMedica">
                  <span className="flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5" />
                    Vigencia Medica
                  </span>
                </Label>
                <Input id="vigenciaMedica" name="vigenciaMedica" type="date" />
              </div>
            </div>
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Link href="/admin/usuarios">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Creando...' : 'Crear Usuario'}
          </Button>
        </div>

      </form>
    </div>
  )
}

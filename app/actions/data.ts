'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {}
        },
      },
    }
  )
}

export async function signIn(email: string, password: string) {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true, user: data.user }
}

export async function signOut() {
  const supabase = await getSupabaseServerClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
}

async function getUserId() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')
  return user.id
}

async function getUserWithRole() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')
  return { id: user.id, role: (user.app_metadata?.role as string) || 'operator' }
}

async function requireAdmin() {
  const { role } = await getUserWithRole()
  if (role !== 'admin') throw new Error('Solo administradores pueden realizar esta accion')
}

export async function getSession() {
  const supabase = await getSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Helper to get admin client
async function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )
}

// Dashboard stats
export async function getDashboardStats() {
  await getUserId()
  const supabase = await getSupabaseServerClient()

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  // Get monthly stats
  const { data: monthlyStats } = await supabase
    .from('service_requests')
    .select('status, createdAt')
    .gte('createdAt', sixMonthsAgo.toISOString())

  // Get total counts
  const { count: totalRequests } = await supabase
    .from('service_requests')
    .select('*', { count: 'exact', head: true })

  const { count: pendingRequests } = await supabase
    .from('service_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: activeDrones } = await supabase
    .from('drones')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'available')

  const { count: totalClients } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })

  // Calculate monthly data
  const monthlyData = new Map()
  if (monthlyStats) {
    monthlyStats.forEach((req: any) => {
      const month = new Date(req.createdAt).toISOString().slice(0, 7)
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { month, pending: 0, in_progress: 0, completed: 0 })
      }
      const data = monthlyData.get(month)
      if (req.status === 'pending') data.pending++
      else if (req.status === 'in_progress') data.in_progress++
      else if (req.status === 'completed') data.completed++
    })
  }

  return {
    totalRequests: totalRequests || 0,
    pendingRequests: pendingRequests || 0,
    activeDrones: activeDrones || 0,
    totalClients: totalClients || 0,
    monthlyStats: Array.from(monthlyData.values()).sort((a: any, b: any) => a.month.localeCompare(b.month)),
  }
}

// Clients
export async function getClients() {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('createdAt', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getClientById(id: number) {
  // Alias for compatibility - defined after function

  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// Alias for backward compatibility
export const getClient = getClientById

export async function createClientRecord(data: {
  companyName: string
  contactName: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  notes?: string
}) {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { data: result, error } = await supabase
    .from('clients')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  revalidatePath('/clientes')
  return result
}

export async function updateClient(id: number, data: Partial<{
  companyName: string
  contactName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  notes: string
}>) {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { data: result, error } = await supabase
    .from('clients')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  revalidatePath('/clientes')
  return result
}

export async function deleteClient(id: number) {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
  if (error) throw error
  revalidatePath('/clientes')
}

// Service Types requests
export async function getServiceRequests() {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('service_requests')
    .select(`
      *,
      clients:clientId (nombreCompleto, companyName),
      service_types:serviceTypeId (name),
      drones:droneId (serialNumber),
      user:assignedUserId (name)
    `)
    .order('createdAt', { ascending: false })
  if (error) throw error

  // Transform the joined data
  return (data || []).map((req: any) => ({
    ...req,
    clientName: req.clients?.nombreCompleto || req.clients?.companyName || null,
    serviceTypeName: req.service_types?.name || null,
    droneSerial: req.drones?.serialNumber || null,
    assignedUserName: req.user?.name || null,
  }))
}

export async function getServiceRequestById(id: number) {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('service_requests')
    .select(`
      *,
      clients:clientId (*),
      service_types:serviceTypeId (*),
      drones:droneId (*),
      user:assignedUserId (*)
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createServiceRequest(data: {
  clientId: number
  serviceTypeId?: number
  droneId?: number
  assignedUserId?: string
  status?: string
  scheduledDate?: Date
  location?: string
  coordinates?: string
  area?: number
  notes?: string
  totalPrice?: number
  departamento?: string
  altitud?: number
  tipoZona?: string
  distanciaAeropuerto?: number
  restriccionAerea?: string
  estadoPermisoAerocivil?: string
  tipoSuperficie?: string
  areaTotalM2?: number
  alturaMaxima?: number
  cantidadNiveles?: number
  tipoSuciedad?: string
  nivelContaminacion?: string
  frecuenciaLimpieza?: string
  fechaEstimada?: Date
  prioridad?: string
  estadoOperativo?: string
  horasEstimadasVuelo?: number
  cantidadAguaRequerida?: number
  cantidadQuimico?: number
  numeroBaterias?: number
  numeroOperadores?: number
  riesgoOperacional?: string
}) {
  await requireAdmin()
  const supabase = await getSupabaseServerClient()
  const { data: result, error } = await supabase
    .from('service_requests')
    .insert({ ...data, status: 'pendiente_agente' })
    .select()
    .single()
  if (error) throw error
  revalidatePath('/solicitudes')
  return result
}

export async function updateServiceRequest(id: number, data: Partial<{
  clientId: number
  serviceTypeId: number
  droneId: number
  assignedUserId: string
  status: string
  scheduledDate: Date
  location: string
  coordinates: string
  area: number
  notes: string
  totalPrice: number
}>) {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { data: result, error } = await supabase
    .from('service_requests')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  revalidatePath('/solicitudes')
  return result
}

export async function updateRequestStatus(id: number, status: string) {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { data: result, error } = await supabase
    .from('service_requests')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  revalidatePath('/solicitudes')
  return result
}

export async function deleteServiceRequest(id: number) {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase
    .from('service_requests')
    .delete()
    .eq('id', id)
  if (error) throw error
  revalidatePath('/solicitudes')
}

export async function closeServiceRequest(id: number, data: {
  horaInicio: Date
  horaFinalizacion: Date
  tiempoTotalVuelo: number
  consumoAgua: number
  distanciaRecorrida: number
  alturaMaximaRegistrada: number
  velocidadPromedio: number
  consumoBateria: number
  numeroCiclos: number
  imagenPlano: string | null
}) {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { data: result, error } = await supabase
    .from('service_requests')
    .update({
      ...data,
      status: 'completed',
      completedDate: new Date(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  revalidatePath('/solicitudes')
  return result
}

// Drones
export async function getDrones() {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('drones')
    .select('*')
    .order('createdAt', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getDroneById(id: number) {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('drones')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createDrone(data: {
  nombre?: string
  codigoInterno?: string
  marca?: string
  model: string
  serialNumber: string
  fechaCompra?: Date
  status?: string
  ubicacionActual?: string
  imagenDrone?: string
  peso?: number
  velocidadMaxima?: number
  altitudMaxima?: number
  resistenciaViento?: string
  temperaturaOperativa?: string
  tiempoMaximoVuelo?: number
  capacidadTanque?: number
  presion?: number
  tipoBoquilla?: string
  alcance?: number
  tipoProducto?: string
  capacidadBaterias?: string
  notes?: string
}) {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { data: result, error } = await supabase
    .from('drones')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  revalidatePath('/admin/drones')
  return result
}

export async function updateDrone(id: number, data: Partial<{
  nombre: string
 igoInterno: string
  marca: string
  model: string
  serialNumber: string
  fechaCompra: Date
  status: string
  ubicacionActual: string
  imagenDrone: string
  peso: number
  velocidadMaxima: number
  altitudMaxima: number
  resistenciaViento: string
  temperaturaOperativa: string
  tiempoMaximoVuelo: number
  capacidadTanque: number
  presion: number
  tipoBoquilla: string
  alcance: number
  tipoProducto: string
  capacidadBaterias: string
  notes: string
}>) {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { data: result, error } = await supabase
    .from('drones')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  revalidatePath('/admin/drones')
  return result
}

export async function deleteDrone(id: number) {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase
    .from('drones')
    .delete()
    .eq('id', id)
  if (error) throw error
  revalidatePath('/admin/drones')
}

// Service Types types
export async function getServiceTypes() {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('service_types')
    .select('*')
    .order('createdAt', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getServiceTypeById(id: number) {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('service_types')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createServiceType(data: {
  name: string
  description?: string
  basePrice?: number
  estimatedDuration?: number
  isActive?: boolean
}) {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { data: result, error } = await supabase
    .from('service_types')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  revalidatePath('/admin/tipos-servicio')
  return result
}

export async function updateServiceType(id: number, data: Partial<{
  name: string
  description: string
  basePrice: number
  estimatedDuration: number
  isActive: boolean
}>) {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { data: result, error } = await supabase
    .from('service_types')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  revalidatePath('/admin/tipos-servicio')
  return result
}

export async function deleteServiceType(id: number) {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase
    .from('service_types')
    .delete()
    .eq('id', id)
  if (error) throw error
  revalidatePath('/admin/tipos-servicio')
}

// Users (admin only)
export async function getUsers() {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .order('createdAt', { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateUserRole(userId: string, role: string) {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { data: result, error } = await supabase
    .from('user')
    .update({ role })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  revalidatePath('/admin/usuarios')
  return result
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  role: string
  identificacion?: string
  certificacion?: string
  horasExperiencia?: number
  vigenciaMedica?: Date
}) {
  await getUserId()
  const adminClient = await getAdminClient()

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      name: data.name,
      role: data.role,
    },
  })

  if (authError) {
    throw new Error(authError.message)
  }

  if (authData.user?.id) {
    const supabase = await getSupabaseServerClient()
    await supabase
      .from('user')
      .update({
        role: data.role,
        identificacion: data.identificacion,
        certificacion: data.certificacion,
        horasExperiencia: data.horasExperiencia,
        vigenciaMedica: data.vigenciaMedica,
      })
      .eq('id', authData.user.id)
  }

  revalidatePath('/admin/usuarios')
  return { user: authData.user }
}

export async function deleteUser(userId: string) {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase
    .from('user')
    .delete()
    .eq('id', userId)
  if (error) throw error
  revalidatePath('/admin/usuarios')
}

// Dashboard Clients Stats
export async function getClientsWithStats() {
  await getUserId()
  const supabase = await getSupabaseServerClient()

  const { data: clients, error } = await supabase
    .from('clients')
    .select(`
      *,
      service_requests:service_requests (id, status)
    `)
    .order('createdAt', { ascending: false })

  if (error) throw error

  return (clients || []).map((client: any) => {
    const requests = client.service_requests || []
    const completedRequests = requests.filter((r: any) => r.status === 'completed').length
    const totalFlightHours = completedRequests * 2 // Simplified calculation

    return {
      ...client,
      completedRequests,
      totalFlightHours,
    }
  })
}

// Activity feed
export async function getActivityFeed() {
  await getUserId()
  const supabase = await getSupabaseServerClient()

  const { data: requests, error } = await supabase
    .from('service_requests')
    .select(`
      *,
      clients:clientId (companyName, nombreCompleto),
      service_types:serviceTypeId (name)
    `)
    .order('createdAt', { ascending: false })
    .limit(10)

  if (error) throw error

  return (requests || []).map((req: any) => ({
    id: req.id,
    type: req.status === 'completed' ? 'completed' : req.status === 'in_progress' ? 'in_progress' : 'new',
    description: req.status === 'completed'
      ? `Servicio completado para ${req.clients?.companyName || req.clients?.nombreCompleto || 'Cliente'}`
      : req.status === 'in_progress'
        ? `Servicio en progreso para ${req.clients?.companyName || req.clients?.nombreCompleto || 'Cliente'}`
        : `Nueva solicitud de ${req.clients?.companyName || req.clients?.nombreCompleto || 'Cliente'}`,
    date: req.createdAt,
    clientName: req.clients?.companyName || req.clients?.nombreCompleto || 'Cliente',
    serviceType: req.service_types?.name || 'Servicio',
    status: req.status,
  }))
}

// Drone usage stats
export async function getDroneUsageStats() {
  await getUserId()
  const supabase = await getSupabaseServerClient()

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data: requests, error } = await supabase
    .from('service_requests')
    .select('createdAt, status')
    .gte('createdAt', sixMonthsAgo.toISOString())

  if (error) throw error

  const monthlyData = new Map()
  if (requests) {
    requests.forEach((req: any) => {
      const month = new Date(req.createdAt).toISOString().slice(0, 7)
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { month, flights: 0, hours: 0 })
      }
      const data = monthlyData.get(month)
      data.flights++
      data.hours += 2 // Simplified
    })
  }

  return Array.from(monthlyData.values()).sort((a: any, b: any) => a.month.localeCompare(b.month))
}

export async function getActiveRequest() {
  await getUserId()
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('service_requests')
    .select(`
      *,
      clients:clientId (nombreCompleto, companyName),
      service_types:serviceTypeId (name),
      drones:droneId (nombre, serialNumber, codigoInterno),
      user:assignedUserId (name)
    `)
    .eq('status', 'en_proceso')
    .order('updatedAt', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getClientStats() {
  await getUserId()
  const supabase = await getSupabaseServerClient()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [
    { count: totalClients },
    { count: activeClients },
    { count: newClientsThisMonth },
    { data: cityCounts },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'activo'),
    supabase.from('clients').select('*', { count: 'exact', head: true }).gte('createdAt', startOfMonth.toISOString()),
    supabase.from('clients').select('city').not('city', 'is', null),
  ])

  const cityMap: Record<string, number> = {}
  ;(cityCounts || []).forEach((c: any) => {
    if (c.city) cityMap[c.city] = (cityMap[c.city] || 0) + 1
  })
  const topCity = Object.entries(cityMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

  return {
    totalClients: totalClients || 0,
    activeClients: activeClients || 0,
    newClientsThisMonth: newClientsThisMonth || 0,
    topCity,
  }
}

export async function getOperatorPerformance() {
  await getUserId()
  const supabase = await getSupabaseServerClient()

  const { data: operators, error } = await supabase
    .from('user')
    .select('id, name, role')
    .eq('role', 'operator')
    .order('createdAt', { ascending: false })

  if (error) throw error

  const operatorList = operators || []
  if (operatorList.length === 0) return []

  const { data: assignments } = await supabase
    .from('service_requests')
    .select('assignedUserId, status')
    .in('assignedUserId', operatorList.map((op: any) => op.id))

  const taskMap: Record<string, { total: number; completed: number }> = {}
  ;(assignments || []).forEach((req: any) => {
    if (!taskMap[req.assignedUserId]) taskMap[req.assignedUserId] = { total: 0, completed: 0 }
    taskMap[req.assignedUserId].total++
    if (req.status === 'completed') taskMap[req.assignedUserId].completed++
  })

  return operatorList.map((op: any) => {
    const tasks = taskMap[op.id] || { total: 0, completed: 0 }
    const efficiency = tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0
    return {
      id: op.id,
      name: op.name,
      completedTasks: tasks.completed,
      efficiency,
    }
  })
}

export async function getMonthlyStats() {
  await getUserId()
  const supabase = await getSupabaseServerClient()

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data: requests, error } = await supabase
    .from('service_requests')
    .select('createdAt, status, totalPrice')
    .gte('createdAt', sixMonthsAgo.toISOString())

  if (error) throw error

  const monthlyData = new Map<string, { month: string; solicitudes: number; completadas: number; ingresos: number }>()
  if (requests) {
    requests.forEach((req: any) => {
      const date = new Date(req.createdAt)
      const monthKey = date.toISOString().slice(0, 7)
      const monthLabel = date.toLocaleString('es-CO', { month: 'short', year: '2-digit' })
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { month: monthLabel, solicitudes: 0, completadas: 0, ingresos: 0 })
      }
      const entry = monthlyData.get(monthKey)!
      entry.solicitudes++
      if (req.status === 'completed') {
        entry.completadas++
        entry.ingresos += req.totalPrice || 0
      }
    })
  }

  return Array.from(monthlyData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v)
}

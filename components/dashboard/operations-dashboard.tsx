'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Battery, Gauge, Wind, Droplets, Thermometer, MapPin, Clock, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Wifi, Satellite, Play, Pause, Hop as Home, Flag, CircleAlert as AlertCircle, Users, Camera, Video, FileText, Search as SearchIcon, Radio } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import Image from 'next/image'
import Link from 'next/link'

interface ActiveRequest {
  id: number
  location: string | null
  areaTotalM2: number | null
  horaInicio: string | null
  clients: { nombreCompleto: string | null; companyName: string | null } | null
  service_types: { name: string } | null
  drones: { nombre: string | null; serialNumber: string; codigoInterno: string | null } | null
  user: { name: string } | null
}

interface OperationsDashboardProps {
  stats: {
    totalRequests: number
    pendingRequests: number
    completedRequests: number
    inProgressRequests: number
    totalClients: number
    totalDrones: number
    availableDrones: number
    inServiceDrones: number
    maintenanceDrones: number
  }
  activeRequest: ActiveRequest | null
}

const systemStatus = [
  { name: 'Motores', status: 'ok' },
  { name: 'GPS', status: 'ok' },
  { name: 'IMU', status: 'ok' },
  { name: 'Compas', status: 'ok' },
  { name: 'Bomba de Agua', status: 'ok' },
  { name: 'Sistema de Aspersion', status: 'ok' },
  { name: 'Camara', status: 'ok' },
  { name: 'Transmision de Video', status: 'ok' },
]

const telemetry = {
  battery: 78,
  altitude: 12.5,
  speed: 8.6,
  windSpeed: 12,
  waterFlow: 5.2,
  pressure: 45,
  tankLevel: 62,
  tankCapacity: 100,
}

const alerts = [
  { type: 'warning', message: 'Advertencia de viento', detail: 'Velocidad del viento alta (12 km/h)', time: '07:45 AM' },
  { type: 'info', message: 'Nivel de agua bajo', detail: 'Tanque al 62% de capacidad', time: '07:47 AM' },
]

const events = [
  { time: '07:30 AM', event: 'Mision iniciada' },
  { time: '07:31 AM', event: 'Despegue automatico' },
  { time: '07:32 AM', event: 'Inicio de limpieza - Sector Norte' },
  { time: '07:45 AM', event: 'Advertencia de viento activada' },
]

export function OperationsDashboard({ stats, activeRequest }: OperationsDashboardProps) {
  if (!activeRequest) {
    return (
      <div className="space-y-4">
        {/* Fleet Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-blue-100 text-sm">Drones Disponibles</p>
                <p className="text-3xl font-bold">{stats.availableDrones}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <p className="text-amber-100 text-sm">En Servicio</p>
                <p className="text-3xl font-bold">{stats.inServiceDrones}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 bg-gradient-to-br from-slate-500 to-slate-600 text-white border-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-100 text-sm">En Mantenimiento</p>
                <p className="text-3xl font-bold">{stats.maintenanceDrones}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* No active mission */}
        <Card className="p-16 text-center border-dashed">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
              <Radio className="w-10 h-10 text-slate-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-700">Sin misiones activas</h3>
              <p className="text-slate-500 mt-1">No hay operaciones en curso en este momento.</p>
            </div>
            <div className="flex gap-3 mt-2">
              <Link href="/solicitudes">
                <Button variant="outline">Ver Solicitudes</Button>
              </Link>
              <Link href="/solicitudes/nueva">
                <Button>Nueva Solicitud</Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Pending requests indicator */}
        {stats.pendingRequests > 0 && (
          <Card className="p-4 border-amber-200 bg-amber-50">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-medium text-amber-800">
                  {stats.pendingRequests} solicitud{stats.pendingRequests !== 1 ? 'es' : ''} pendiente{stats.pendingRequests !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-amber-600">Requieren asignacion de operador y dron para iniciar</p>
              </div>
              <Link href="/solicitudes" className="ml-auto">
                <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                  Gestionar
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    )
  }

  const clientName = activeRequest.clients?.nombreCompleto || activeRequest.clients?.companyName || 'Cliente'
  const serviceName = activeRequest.service_types?.name || 'Servicio'
  const droneName = activeRequest.drones?.nombre || activeRequest.drones?.codigoInterno || activeRequest.drones?.serialNumber || 'Dron'
  const operatorName = activeRequest.user?.name || 'Operador'
  const location = activeRequest.location || 'Sin ubicacion'
  const areaTotal = activeRequest.areaTotalM2 || 2350
  const missionProgress = 70
  const areaCompleted = Math.round(areaTotal * (missionProgress / 100))
  const areaPending = areaTotal - areaCompleted

  const startTime = activeRequest.horaInicio
    ? new Date(activeRequest.horaInicio).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    : '07:30 AM'

  return (
    <div className="space-y-4">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between bg-card rounded-lg p-3 border border-border">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Operacion en Tiempo Real</h1>
            <p className="text-sm text-muted-foreground">{serviceName}</p>
          </div>
          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
            EN VUELO
          </span>
          <Link href={`/solicitudes/${activeRequest.id}`}>
            <Button size="sm" variant="outline" className="text-xs h-7">
              Ver solicitud #{activeRequest.id.toString().padStart(4, '0')}
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-muted-foreground">Conexion Dron</span>
            <span className="text-green-400 font-medium">99%</span>
          </div>
          <div className="flex items-center gap-2">
            <Satellite className="w-4 h-4 text-green-400" />
            <span className="text-muted-foreground">GPS</span>
            <span className="text-foreground font-medium">18 Satelites</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Tiempo de Mision</span>
            <span className="text-foreground font-medium">00:18:42</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Column - Camera & Map */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          {/* Live Camera */}
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-foreground">CAMARA EN VIVO</span>
                <span className="text-xs text-muted-foreground">1080p 30fps</span>
              </div>
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                REC
              </span>
            </div>
            <div className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden">
              <Image
                src="/images/drone-live.png"
                alt="Vista de drone en accion"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-white/80">
                <span>ISO 100</span>
                <span>|</span>
                <span>Shutter 1/1000</span>
                <span>|</span>
                <span>EV 0.0</span>
              </div>
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                <Button size="sm" variant="secondary" className="bg-black/50 text-white border-0 text-xs h-7">
                  Zoom 1.0X
                </Button>
                <Button size="sm" variant="secondary" className="bg-black/50 text-white border-0 text-xs h-7">
                  IR
                </Button>
                <Button size="sm" variant="secondary" className="bg-black/50 text-white border-0 text-xs h-7">
                  Wide
                </Button>
              </div>
            </div>
          </Card>

          {/* General Status */}
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-400">Operacion Normal</p>
                <p className="text-xs text-muted-foreground">Todos los sistemas funcionan correctamente</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <div>
                <p className="text-sm font-medium text-foreground">{droneName}</p>
                <p className="text-xs text-muted-foreground">SN: {activeRequest.drones?.serialNumber}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Center Column - Telemetry & Systems */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Telemetry Cards */}
          <Card className="p-4 bg-card border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">TELEMETRIA EN TIEMPO REAL</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Battery className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-muted-foreground">Bateria</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{telemetry.battery}<span className="text-sm text-muted-foreground">%</span></p>
                <p className="text-xs text-muted-foreground">Tiempo restante: 18 min</p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Altitud</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{telemetry.altitude}<span className="text-sm text-muted-foreground"> m</span></p>
                <p className="text-xs text-muted-foreground">AGL</p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Wind className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Velocidad</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{telemetry.speed}<span className="text-sm text-muted-foreground"> m/s</span></p>
                <p className="text-xs text-muted-foreground">Viento: {telemetry.windSpeed} km/h</p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-muted-foreground">Flujo de Agua</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{telemetry.waterFlow}<span className="text-sm text-muted-foreground"> L/min</span></p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 bg-secondary/50 rounded-lg flex items-center gap-3">
                <Thermometer className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Presion</p>
                  <p className="text-lg font-bold text-foreground">{telemetry.pressure} <span className="text-xs text-muted-foreground">PSI</span></p>
                </div>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg flex items-center gap-3">
                <Droplets className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Tanque</p>
                  <p className="text-lg font-bold text-foreground">{telemetry.tankLevel}<span className="text-xs text-muted-foreground">%</span></p>
                  <p className="text-xs text-muted-foreground">{telemetry.tankLevel} L / {telemetry.tankCapacity} L</p>
                </div>
              </div>
            </div>
          </Card>

          {/* System Status */}
          <Card className="p-4 bg-card border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">Estado de Sistemas</h3>
            <div className="grid grid-cols-2 gap-2">
              {systemStatus.map((system) => (
                <div key={system.name} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs text-muted-foreground">{system.name}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Mission Progress */}
          <Card className="p-4 bg-card border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">PROGRESO DE MISION</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="none" className="text-secondary" />
                  <circle
                    cx="40" cy="40" r="35"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-primary"
                    strokeDasharray={`${missionProgress * 2.2} 220`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-foreground">{missionProgress}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Area Total</span>
                  <span className="font-medium text-foreground">{areaTotal.toLocaleString()} m²</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completado</span>
                  <span className="font-medium text-green-400">{areaCompleted.toLocaleString()} m²</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pendiente</span>
                  <span className="font-medium text-foreground">{areaPending.toLocaleString()} m²</span>
                </div>
                <Progress value={missionProgress} className="h-2" />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Mission Info & Alerts */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          {/* Mission Info */}
          <Card className="p-4 bg-card border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">INFORMACION DE MISION</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Servicio</span>
                <span className="text-foreground text-right">{serviceName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Cliente</span>
                <span className="text-foreground text-right">{clientName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Ubicacion</span>
                <span className="text-foreground text-right">{location}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Area Programada</span>
                <span className="text-foreground text-right">{areaTotal.toLocaleString()} m²</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Inicio de Mision</span>
                <span className="text-foreground text-right">{startTime}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Operador</span>
                <span className="text-foreground text-right">{operatorName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Dron</span>
                <span className="text-foreground text-right">{droneName}</span>
              </div>
            </div>
          </Card>

          {/* Real-time Summary */}
          <Card className="p-4 bg-card border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">RESUMEN EN TIEMPO REAL</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-muted-foreground">Area Completada</span>
                </div>
                <span className="text-sm font-medium text-foreground">{areaCompleted.toLocaleString()} m²</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Lineas Completadas</span>
                </div>
                <span className="text-sm font-medium text-foreground">28 / 40</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Tiempo Transcurrido</span>
                </div>
                <span className="text-sm font-medium text-foreground">00:18:42</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-muted-foreground">Agua Utilizada</span>
                </div>
                <span className="text-sm font-medium text-foreground">580 L</span>
              </div>
            </div>
          </Card>

          {/* Alerts */}
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">ALERTAS ACTIVAS</h3>
              <Button variant="link" className="text-xs text-primary p-0 h-auto">Ver todas</Button>
            </div>
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-2 bg-secondary/30 rounded-lg">
                  {alert.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground truncate">{alert.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Quick Controls */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="p-4 bg-card border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">CONTROLES RAPIDOS</h3>
            <div className="grid grid-cols-5 gap-2">
              <Button variant="outline" className="flex flex-col items-center gap-1 h-auto py-3 border-border hover:bg-secondary">
                <Pause className="w-5 h-5" />
                <span className="text-xs">Pausar</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center gap-1 h-auto py-3 border-border hover:bg-secondary">
                <Play className="w-5 h-5" />
                <span className="text-xs">Retomar</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center gap-1 h-auto py-3 border-border hover:bg-secondary">
                <Home className="w-5 h-5" />
                <span className="text-xs">Home</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center gap-1 h-auto py-3 border-border hover:bg-secondary">
                <Flag className="w-5 h-5" />
                <span className="text-xs">Marcar</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center gap-1 h-auto py-3 border-red-500/50 text-red-400 hover:bg-red-500/10">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-xs">RTH</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Event Log */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">REGISTRO DE EVENTOS</h3>
              <Button variant="link" className="text-xs text-primary p-0 h-auto">Ver historial completo</Button>
            </div>
            <div className="space-y-2">
              {events.map((event, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <span className="text-xs text-muted-foreground w-16">{event.time}</span>
                  <span className="text-foreground">{event.event}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Documentation */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">DOCUMENTACION EN VIVO</h3>
              <Button variant="link" className="text-xs text-primary p-0 h-auto">Ver galeria</Button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <div className="w-10 h-10 bg-secondary/50 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <p className="text-lg font-bold text-foreground">245</p>
                <p className="text-xs text-muted-foreground">Fotos</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-secondary/50 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <Video className="w-5 h-5 text-primary" />
                </div>
                <p className="text-lg font-bold text-foreground">12</p>
                <p className="text-xs text-muted-foreground">Videos</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-secondary/50 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <Flag className="w-5 h-5 text-primary" />
                </div>
                <p className="text-lg font-bold text-foreground">3</p>
                <p className="text-xs text-muted-foreground">Puntos</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-secondary/50 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <SearchIcon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-lg font-bold text-primary">En progreso</p>
                <p className="text-xs text-muted-foreground">Inspecciones</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Team Communication */}
      <Card className="p-4 bg-card border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">COMUNICACION EQUIPO</h3>
        <div className="flex items-center gap-6">
          {operatorName && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{operatorName}</p>
                <p className="text-xs text-green-400">En linea</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

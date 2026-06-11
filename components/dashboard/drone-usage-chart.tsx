'use client'

import { Card } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { CheckCircle, Wrench, Clock, CircleDot } from 'lucide-react'

interface DroneUsage {
  droneId: number
  serialNumber: string
  model: string
  status: string
  totalRequests: number
  completedRequests: number
  totalHours: string
}

interface DroneUsageChartProps {
  droneUsage: DroneUsage[]
  stats: {
    availableDrones: number
    inServiceDrones: number
    maintenanceDrones: number
    totalDrones: number
  }
}

const BAR_COLORS = [
  '#3b82f6', // azul
  '#10b981', // verde
  '#f59e0b', // amarillo
  '#ef4444', // rojo
  '#8b5cf6', // morado
  '#ec4899', // rosa
]

const PIE_COLORS = [
  '#10b981', // verde - disponible
  '#3b82f6', // azul - en servicio
  '#f59e0b', // amarillo - mantenimiento
  '#94a3b8', // gris - retirado
]

const chartConfig = {
  completedRequests: {
    label: 'Servicios Completados',
    color: '#3b82f6',
  },
}

export function DroneUsageChart({ droneUsage, stats }: DroneUsageChartProps) {
  // Datos para el grafico de barras de uso de drones
  const barData = droneUsage.slice(0, 6).map((drone) => ({
    name: drone.serialNumber.slice(-6),
    completedRequests: drone.completedRequests,
    totalHours: parseFloat(drone.totalHours) || 0,
    model: drone.model,
  }))

  // Datos para el grafico de pie de estado de drones
  const pieData = [
    { name: 'Disponibles', value: stats.availableDrones, color: PIE_COLORS[0] },
    { name: 'En Servicio', value: stats.inServiceDrones, color: PIE_COLORS[1] },
    { name: 'Mantenimiento', value: stats.maintenanceDrones, color: PIE_COLORS[2] },
  ].filter(item => item.value > 0)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Resumen de Uso de Drones</h2>
          <p className="text-sm text-muted-foreground">Rendimiento y disponibilidad de la flota</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafico de barras - Servicios por drone */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Servicios por Drone</h3>
          {barData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart data={barData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11 }} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11 }} 
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="completedRequests" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                >
                  {barData.map((_, index) => (
                    <Cell key={`bar-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground">
              No hay datos de uso
            </div>
          )}
        </div>

        {/* Grafico de pie - Estado de drones */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Estado de la Flota</h3>
          {pieData.length > 0 ? (
            <div className="h-[220px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground">
              No hay drones registrados
            </div>
          )}
        </div>
      </div>

      {/* Lista de drones con estadisticas */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Detalle por Drone</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {droneUsage.slice(0, 6).map((drone, index) => (
            <div 
              key={drone.droneId} 
              className="flex items-center gap-3 p-3 rounded-lg border hover:shadow-sm transition-all"
              style={{ borderLeftColor: BAR_COLORS[index % BAR_COLORS.length], borderLeftWidth: 4 }}
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: BAR_COLORS[index % BAR_COLORS.length] + '20' }}
              >
                {drone.status === 'maintenance' ? (
                  <Wrench className="w-5 h-5" style={{ color: BAR_COLORS[index % BAR_COLORS.length] }} />
                ) : drone.status === 'in_service' ? (
                  <Clock className="w-5 h-5" style={{ color: BAR_COLORS[index % BAR_COLORS.length] }} />
                ) : (
                  <CircleDot className="w-5 h-5" style={{ color: BAR_COLORS[index % BAR_COLORS.length] }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{drone.serialNumber}</p>
                <p className="text-xs text-muted-foreground">{drone.model}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: BAR_COLORS[index % BAR_COLORS.length] }}>{drone.completedRequests}</p>
                <p className="text-xs text-muted-foreground">servicios</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

'use client'

import { Card } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react'

interface MonthlyStats {
  month: string
  count: number
  status: string
}

interface ActivityChartProps {
  monthlyStats: MonthlyStats[]
}

const chartConfig = {
  completado: {
    label: 'Completados',
    color: 'hsl(var(--chart-2))',
  },
  en_proceso: {
    label: 'En Proceso',
    color: 'hsl(var(--chart-4))',
  },
  pendiente_agente: {
    label: 'Pendientes',
    color: 'hsl(var(--warning))',
  },
  cancelado: {
    label: 'Cancelados',
    color: 'hsl(var(--destructive))',
  },
}

const monthNames: Record<string, string> = {
  '01': 'Ene',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Abr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Ago',
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dic',
}

export function ActivityChart({ monthlyStats }: ActivityChartProps) {
  // Procesar datos para el grafico
  const monthsMap = new Map<string, { month: string; completado: number; en_proceso: number; pendiente_agente: number; cancelado: number }>()

  monthlyStats.forEach((stat) => {
    if (!monthsMap.has(stat.month)) {
      monthsMap.set(stat.month, {
        month: stat.month,
        completado: 0,
        en_proceso: 0,
        pendiente_agente: 0,
        cancelado: 0,
      })
    }
    const entry = monthsMap.get(stat.month)!
    if (stat.status === 'completado') entry.completado = stat.count
    else if (stat.status === 'en_proceso') entry.en_proceso = stat.count
    else if (stat.status === 'pendiente_agente') entry.pendiente_agente = stat.count
    else if (stat.status === 'cancelado') entry.cancelado = stat.count
  })

  const chartData = Array.from(monthsMap.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((item) => ({
      ...item,
      monthLabel: monthNames[item.month.split('-')[1]] || item.month,
    }))

  // Calcular totales
  const totals = {
    completado: monthlyStats.filter(s => s.status === 'completado').reduce((sum, s) => sum + s.count, 0),
    en_proceso: monthlyStats.filter(s => s.status === 'en_proceso').reduce((sum, s) => sum + s.count, 0),
    pendiente_agente: monthlyStats.filter(s => s.status === 'pendiente_agente').reduce((sum, s) => sum + s.count, 0),
    cancelado: monthlyStats.filter(s => s.status === 'cancelado').reduce((sum, s) => sum + s.count, 0),
  }

  const summaryCards = [
    { 
      label: 'Completados', 
      value: totals.completado, 
      icon: CheckCircle, 
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10'
    },
    { 
      label: 'En Proceso', 
      value: totals.en_proceso, 
      icon: Clock, 
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10'
    },
    { 
      label: 'Pendientes', 
      value: totals.pendiente_agente, 
      icon: TrendingUp, 
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    { 
      label: 'Cancelados', 
      value: totals.cancelado, 
      icon: XCircle, 
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    },
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Resumen de Actividades</h2>
          <p className="text-sm text-muted-foreground">Tendencia de solicitudes en los ultimos 6 meses</p>
        </div>
      </div>

      {/* Resumen de totales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {summaryCards.map((card) => (
          <div key={card.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.bgColor}`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grafico de area */}
      {chartData.length > 0 ? (
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCompletado" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorEnProceso" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="monthLabel" 
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
            <Area 
              type="monotone" 
              dataKey="completado" 
              stroke="hsl(var(--chart-2))" 
              fillOpacity={1} 
              fill="url(#colorCompletado)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="en_proceso" 
              stroke="hsl(var(--chart-4))" 
              fillOpacity={1} 
              fill="url(#colorEnProceso)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
          No hay datos de actividad para mostrar
        </div>
      )}
    </Card>
  )
}

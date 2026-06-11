'use client'

import { Card } from '@/components/ui/card'
import { 
  Briefcase, 
  Search, 
  Sparkles, 
  Clock, 
  Plane,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardsProps {
  stats: {
    totalRequests: number
    completedRequests: number
    totalFlightHours: number
    availableDrones: number
    totalDrones: number
    inProgressRequests: number
    serviceTypeCounts: Array<{ serviceTypeName: string | null; count: number }>
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  // Calcular inspecciones y limpiezas desde serviceTypeCounts
  const inspecciones = stats.serviceTypeCounts.find(
    s => s.serviceTypeName?.toLowerCase().includes('inspecc')
  )?.count || 0
  const limpiezas = stats.serviceTypeCounts.find(
    s => s.serviceTypeName?.toLowerCase().includes('limpieza')
  )?.count || 0

  const cards = [
    {
      title: 'Proyectos Activos',
      value: stats.inProgressRequests,
      icon: Briefcase,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Inspecciones Realizadas',
      value: inspecciones,
      icon: Search,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Limpiezas Completadas',
      value: limpiezas,
      icon: Sparkles,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
      trend: '+15%',
      trendUp: true,
    },
    {
      title: 'Horas de Vuelo',
      value: stats.totalFlightHours.toFixed(1),
      icon: Clock,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
      suffix: 'hrs',
      trend: '+5%',
      trendUp: true,
    },
    {
      title: 'Drones Operativos',
      value: `${stats.availableDrones}/${stats.totalDrones}`,
      icon: Plane,
      color: 'text-chart-5',
      bgColor: 'bg-chart-5/10',
      trend: 'Disponibles',
      trendUp: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', card.bgColor)}>
              <card.icon className={cn('w-5 h-5', card.color)} />
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-green-500">{card.trend}</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-foreground">
              {card.value}
              {card.suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{card.suffix}</span>}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{card.title}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}

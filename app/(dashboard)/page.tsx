'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    async function loadData() {
      try {
        const { getDashboardStats, getClientsWithStats, getClientStats, getOperatorPerformance, getMonthlyStats, getActiveRequest } = await import('@/app/actions/data')
        const [statsData, clients, clientStats, operatorPerformance, monthlyData, activeRequest] = await Promise.all([
          getDashboardStats(),
          getClientsWithStats(),
          getClientStats(),
          getOperatorPerformance(),
          getMonthlyStats(),
          getActiveRequest(),
        ])
        setStats({ stats: statsData, clients, clientStats, operatorPerformance, monthlyData, activeRequest })
      } catch (e: any) {
        setError(e.message)
      }
    }
    loadData()
  }, [user])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">Cargando...</div></div>
  }

  if (!user) return null

  const isAdmin = user.app_metadata?.role === 'admin'

  if (!isAdmin) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Panel de Operaciones</h1>
        <p className="text-muted-foreground">Navega a Solicitudes para ver tus tareas asignadas.</p>
      </div>
    )
  }

  if (!stats) {
    return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">Cargando datos...</div></div>
  }

  if (error) {
    return <div className="text-destructive">Error: {error}</div>
  }

  return (
    <DashboardTabs
      stats={stats.stats}
      clients={stats.clients}
      clientStats={stats.clientStats}
      operatorPerformance={stats.operatorPerformance}
      monthlyData={stats.monthlyData}
      activeRequest={stats.activeRequest}
    />
  )
}

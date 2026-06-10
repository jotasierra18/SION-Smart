'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs'

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = user?.app_metadata?.role === 'admin'

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false)
      return
    }

    async function loadData() {
      const { getDashboardStats, getClientsWithStats, getClientStats, getOperatorPerformance, getMonthlyStats, getActiveRequest } = await import('@/app/actions/data')
      const [stats, clients, clientStats, operatorPerformance, monthlyData, activeRequest] = await Promise.all([
        getDashboardStats(),
        getClientsWithStats(),
        getClientStats(),
        getOperatorPerformance(),
        getMonthlyStats(),
        getActiveRequest(),
      ])
      setData({ stats, clients, clientStats, operatorPerformance, monthlyData, activeRequest })
      setLoading(false)
    }
    loadData()
  }, [user, isAdmin])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">Cargando datos...</div></div>
  }

  if (!isAdmin) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Panel de Operaciones</h1>
        <p className="text-muted-foreground">Navega a Solicitudes para ver tus tareas asignadas.</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <DashboardTabs
      stats={data.stats}
      clients={data.clients}
      clientStats={data.clientStats}
      operatorPerformance={data.operatorPerformance}
      monthlyData={data.monthlyData}
      activeRequest={data.activeRequest}
    />
  )
}
